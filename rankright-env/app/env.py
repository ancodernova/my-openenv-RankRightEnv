from typing import Dict, Tuple

from app.models import Observation, Action
from app.scenario_loader import load_scenario

from app.ranking import rank_content
from app.policy import check_policy
from app.user_simulator import simulate_user
from app.reward import compute_reward


class RankRightEnv:
    def __init__(self):
        self.state = None

    # -------------------------------
    # RESET ENVIRONMENT
    # -------------------------------
    def reset(self, task_id: str) -> Dict:
        """
        Initializes environment using scenario
        """
        self.state = load_scenario(task_id)
        return self._get_observation()

    # -------------------------------
    # STEP FUNCTION
    # -------------------------------
    def step(self, action_dict: Dict) -> Tuple[Dict, float, bool, Dict]:
        """
        Executes one step in environment
        """

        if self.state is None:
            raise ValueError("Environment not initialized. Call reset() first.")

        # Validate action
        try:
            action = Action(**action_dict)
        except Exception as e:
            raise ValueError(f"Invalid action format: {str(e)}")

        # Increase step count
        self.state.step_count += 1

        # -------------------------------
        # APPLY ACTION
        # -------------------------------
        self._apply_action(action)

        # ONLY simulate AFTER ranking (important fix)
        if self.state.feed:
            self.state = check_policy(self.state)
            self.state = simulate_user(self.state)

        # -------------------------------
        # COMPUTE REWARD
        # -------------------------------
        reward = compute_reward(self.state)

        # -------------------------------
        # CHECK TERMINATION
        # -------------------------------
        done = self._check_done(action)

        self.state.done = done

        return self._get_observation(), reward, done, {}

    # -------------------------------
    # APPLY ACTION LOGIC
    # -------------------------------
    def _apply_action(self, action: Action):
        atype = action.action_type
        params = action.params

        # ACTIVATE SIGNALS
        if atype == "activate_signals":
            signals = params.get("signals", [])
            self._activate_signals(signals)

        # DEACTIVATE SIGNALS
        elif atype == "deactivate_signals":
            signals = params.get("signals", [])
            self._deactivate_signals(signals)

        # SET WEIGHTS
        elif atype == "set_weights":
            weights = params.get("weights", {})
            self._set_weights(weights)

        # RANK CONTENT
        elif atype in ["rank", "rerank"]:
            self.state = rank_content(self.state)

        # FINALIZE
        elif atype == "finalize":
            self.state.done = True

        else:
            raise ValueError(f"Unknown action type: {atype}")

    # -------------------------------
    # SIGNAL MANAGEMENT
    # -------------------------------
    def _activate_signals(self, signals):
        allowed_signals = {s.name: s for s in self.state.available_signals}

        valid_signals = []

        for s in signals:
            if s in allowed_signals:
                # ❌ skip disallowed signals
                if allowed_signals[s].status == "disallowed":
                    continue
                valid_signals.append(s)

        self.state.active_signals = list(set(valid_signals))

    def _deactivate_signals(self, signals):
        self.state.active_signals = [
            s for s in self.state.active_signals if s not in signals
        ]

    # -------------------------------
    # WEIGHT MANAGEMENT
    # -------------------------------
    def _set_weights(self, weights):
        default = self.state.weights

        for key in ["relevance", "diversity", "safety"]:
            if key in weights:
                val = weights[key]

                # clamp values between 0 and 1
                if not isinstance(val, (int, float)):
                    continue

                self.state.weights[key] = max(0.0, min(1.0, val))

    # -------------------------------
    # CHECK DONE
    # -------------------------------
    def _check_done(self, action: Action) -> bool:
        if action.action_type == "finalize":
            return True

        # max steps safeguard
        if self.state.step_count >= 4:
            return True

        return False

    # -------------------------------
    # OBSERVATION BUILDER
    # -------------------------------
    def _get_observation(self) -> Dict:
        """
        Converts internal state to agent-visible observation
        """

        return Observation(
            task_id=self.state.task_id,
            step_count=self.state.step_count,

            user_summary={
                "interests": self.state.user.interests,
                "fatigue": self.state.user.fatigue,
                "safety_sensitivity": self.state.user.safety_sensitivity,
                "diversity_preference": self.state.user.diversity_preference
            },

            available_signals=self.state.available_signals,
            active_signals=self.state.active_signals,

            candidates=self.state.candidates,

            policy_constraints={
                "diversity_min": self.state.policy_constraints.diversity_min,
                "max_risk": self.state.policy_constraints.max_risk,
                "disallowed_signals": self.state.policy_constraints.disallowed_signals
            }
        ).dict()

    # -------------------------------
    # GET FULL STATE (DEBUG / GRADER)
    # -------------------------------
    def get_state(self):
        return self.state