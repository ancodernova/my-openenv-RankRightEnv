from pydantic import BaseModel, Field
from typing import List, Dict, Literal, Optional


# -------------------------------
# SIGNAL MODEL
# -------------------------------
class Signal(BaseModel):
    name: str
    status: Literal["allowed", "optional", "restricted", "disallowed"]
    requires_consent: bool
    utility: Optional[float] = 0.0
    cost: float = 0.0
    noise: float = 0.0


# -------------------------------
# CONTENT ITEM
# -------------------------------
class ContentItem(BaseModel):
    id: str
    topics: List[str]
    quality: float = Field(ge=0.0, le=1.0)
    novelty: float = Field(ge=0.0, le=1.0)
    risk: float = Field(ge=0.0, le=1.0)


# -------------------------------
# USER PROFILE
# -------------------------------
class UserProfile(BaseModel):
    interests: List[str]
    fatigue: float = Field(ge=0.0, le=1.0)
    safety_sensitivity: float = Field(ge=0.0, le=1.0)
    diversity_preference: float = Field(ge=0.0, le=1.0)


# -------------------------------
# POLICY CONSTRAINTS
# -------------------------------
class PolicyConstraints(BaseModel):
    diversity_min: float
    max_risk: float
    disallowed_signals: List[str]


# -------------------------------
# HIDDEN GROUND TRUTH (IMPORTANT)
# -------------------------------
class HiddenTruth(BaseModel):
    optimal_signals: List[str]
    forbidden_signals: List[str]
    ideal_topics: List[str]
    ideal_diversity: float
    max_safe_risk: float
    expected_engagement: float


# -------------------------------
# OBSERVATION (AGENT INPUT)
# -------------------------------
class Observation(BaseModel):
    task_id: str
    step_count: int

    user_summary: Dict
    available_signals: List[Signal]
    active_signals: List[str]

    candidates: List[ContentItem]

    policy_constraints: Dict


# -------------------------------
# ACTION (AGENT OUTPUT)
# -------------------------------
class Action(BaseModel):
    action_type: Literal[
        "activate_signals",
        "deactivate_signals",
        "set_weights",
        "rank",
        "rerank",
        "finalize"
    ]
    params: Dict


# -------------------------------
# ENV STATE (INTERNAL)
# -------------------------------
class EnvState(BaseModel):
    task_id: str
    step_count: int

    user: UserProfile

    candidates: List[ContentItem]
    feed: List[ContentItem]

    available_signals: List[Signal]
    active_signals: List[str]

    weights: Dict[str, float]

    policy_constraints: PolicyConstraints
    hidden_truth: HiddenTruth
    previous_topics: List[str] = []
    engagement: float = 0.0
    diversity: float = 0.0
    violations: int = 0
    policy_penalty: float = 0.0

    done: bool = False


# -------------------------------
# STEP RESULT
# -------------------------------
class StepResult(BaseModel):
    observation: Observation
    reward: float
    done: bool
    info: Dict