from operator import truth

from app.models import EnvState


# -------------------------------
# MAIN REWARD FUNCTION
# -------------------------------
def compute_reward(state: EnvState) -> float:
    reward = 0.0

    # -------------------------------
    # ENGAGEMENT REWARD
    # -------------------------------
    reward += _engagement_reward(state)

    # -------------------------------
    # DIVERSITY REWARD
    # -------------------------------
    reward += _diversity_reward(state)

    # -------------------------------
    # SAFETY REWARD
    # -------------------------------
    reward += _safety_reward(state)

    # -------------------------------
    # POLICY PENALTY
    # -------------------------------
    reward -= state.policy_penalty

    # -------------------------------
    # SIGNAL SELECTION REWARD
    # -------------------------------
    reward += _signal_reward(state)

    # -------------------------------
    # FATIGUE PENALTY
    # -------------------------------
    reward -= _fatigue_penalty(state)

    # normalize reward
    return round(reward, 3)


# -------------------------------
# ENGAGEMENT
# -------------------------------
def _engagement_reward(state: EnvState) -> float:
    engagement = state.engagement

    # normalized (0–1 range expected)
    return engagement * 0.5


# -------------------------------
# DIVERSITY
# -------------------------------
def _diversity_reward(state: EnvState) -> float:
    diversity = state.diversity
    ideal = state.hidden_truth.ideal_diversity

    # reward closeness to ideal diversity
    diff = abs(diversity - ideal)

    return max(0, 0.3 - diff)


# -------------------------------
# SAFETY
# -------------------------------
def _safety_reward(state: EnvState) -> float:
    max_safe = state.hidden_truth.max_safe_risk

    safe_items = [item for item in state.feed if item.risk <= max_safe]

    if not state.feed:
        return 0

    safety_ratio = len(safe_items) / len(state.feed)

    return safety_ratio * 0.3


# -------------------------------
# SIGNAL USAGE
# -------------------------------
def _signal_reward(state):
    reward = 0.0
    truth = state.hidden_truth
    missing = set(truth.optimal_signals) - set(state.active_signals)
    reward -= 0.05 * len(missing)

    signal_map = {s.name: s for s in state.available_signals}

    for signal in state.active_signals:

        if signal in truth.optimal_signals:
            reward += 0.05

        # cost penalty
        if signal in signal_map:
            reward -= signal_map[signal].cost

        # forbidden signals
        if signal in truth.forbidden_signals:
            reward -= 0.5

    return reward


# -------------------------------
# FATIGUE
# -------------------------------
def _fatigue_penalty(state: EnvState) -> float:
    fatigue = state.user.fatigue

    return fatigue * 0.3