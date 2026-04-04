import json
import os
from typing import Dict

from app.models import (
    EnvState,
    UserProfile,
    ContentItem,
    Signal,
    PolicyConstraints,
    HiddenTruth
)


SCENARIO_DIR = os.path.join(os.path.dirname(__file__), "scenarios")


# -------------------------------
# SAFE JSON LOAD
# -------------------------------
def load_json_file(file_path: str) -> Dict:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Scenario file not found: {file_path}")

    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format in {file_path}: {str(e)}")


# -------------------------------
# VALIDATE REQUIRED KEYS
# -------------------------------
def validate_keys(data: Dict):
    required_keys = [
        "task_id",
        "user_profile",
        "candidate_pool",
        "available_signals",
        "policy_constraints",
        "hidden_truth"
    ]

    for key in required_keys:
        if key not in data:
            raise ValueError(f"Missing required key: {key}")


# -------------------------------
# PARSE USER
# -------------------------------
def parse_user(data: Dict) -> UserProfile:
    return UserProfile(**data)


# -------------------------------
# PARSE CONTENT
# -------------------------------
def parse_candidates(data: list) -> list:
    candidates = []
    for item in data:
        try:
            candidates.append(ContentItem(**item))
        except Exception as e:
            raise ValueError(f"Invalid candidate item: {item}, error: {str(e)}")
    return candidates


# -------------------------------
# PARSE SIGNALS
# -------------------------------
def parse_signals(data: list) -> list:
    signals = []
    for item in data:
        try:
            signals.append(Signal(**item))
        except Exception as e:
            raise ValueError(f"Invalid signal: {item}, error: {str(e)}")
    return signals


# -------------------------------
# PARSE POLICY
# -------------------------------
def parse_policy(data: Dict) -> PolicyConstraints:
    return PolicyConstraints(**data)


# -------------------------------
# PARSE HIDDEN TRUTH
# -------------------------------
def parse_hidden_truth(data: Dict) -> HiddenTruth:
    return HiddenTruth(**data)


# -------------------------------
# MAIN SCENARIO LOADER
# -------------------------------
def load_scenario(task_id: str) -> EnvState:
    file_path = os.path.join(SCENARIO_DIR, f"{task_id}.json")

    data = load_json_file(file_path)

    # validate structure
    validate_keys(data)

    # parse components
    user = parse_user(data["user_profile"])
    candidates = parse_candidates(data["candidate_pool"])
    signals = parse_signals(data["available_signals"])
    policy = parse_policy(data["policy_constraints"])
    hidden_truth = parse_hidden_truth(data["hidden_truth"])

    # initialize environment state
    state = EnvState(
        task_id=data["task_id"],
        step_count=0,
        user=user,
        candidates=candidates,
        feed=[],
        available_signals=signals,
        active_signals=[],
        weights={
            "relevance": 0.5,
            "diversity": 0.2,
            "safety": 0.3
        },
        policy_constraints=policy,
        hidden_truth=hidden_truth,
        engagement=0.0,
        diversity=0.0,
        violations=0,
        policy_penalty=0.0,
        done=False
    )

    return state