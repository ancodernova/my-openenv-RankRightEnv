from app.models import EnvState


# -------------------------------
# MAIN GRADER FUNCTION
# -------------------------------
def grade(state: EnvState) -> float:
    """
    Returns final score between 0 and 1
    """

    score = 0.0

    # -------------------------------
    # ENGAGEMENT SCORE
    # -------------------------------
    score += _grade_engagement(state)

    # -------------------------------
    # DIVERSITY SCORE
    # -------------------------------
    score += _grade_diversity(state)

    # -------------------------------
    # SAFETY SCORE
    # -------------------------------
    score += _grade_safety(state)

    # -------------------------------
    # POLICY COMPLIANCE
    # -------------------------------
    score += _grade_policy(state)

    # -------------------------------
    # SIGNAL USAGE
    # -------------------------------
    score += _grade_signals(state)

    # -------------------------------
    # FINAL NORMALIZATION
    # -------------------------------
    return round(min(score, 1.0), 3)


# -------------------------------
# ENGAGEMENT
# -------------------------------
def _grade_engagement(state: EnvState) -> float:
    target = state.hidden_truth.expected_engagement
    actual = state.engagement

    if target == 0:
        return 0

    ratio = min(actual / target, 1.0)

    return ratio * 0.3


# -------------------------------
# DIVERSITY
# -------------------------------
def _grade_diversity(state: EnvState) -> float:
    ideal = state.hidden_truth.ideal_diversity
    actual = state.diversity

    diff = abs(actual - ideal)

    return max(0, 0.2 - diff)


# -------------------------------
# SAFETY
# -------------------------------
def _grade_safety(state: EnvState) -> float:
    max_safe = state.hidden_truth.max_safe_risk

    if not state.feed:
        return 0

    safe_items = [item for item in state.feed if item.risk <= max_safe]

    ratio = len(safe_items) / len(state.feed)

    return ratio * 0.2


# -------------------------------
# POLICY
# -------------------------------
def _grade_policy(state: EnvState) -> float:
    if state.violations == 0:
        return 0.2

    # heavy penalty for violations
    return max(0, 0.2 - (state.violations * 0.05))


# -------------------------------
# SIGNAL USAGE
# -------------------------------
def _grade_signals(state: EnvState) -> float:
    truth = state.hidden_truth
    score = 0.0

    # reward correct signals
    correct = sum(1 for s in state.active_signals if s in truth.optimal_signals)
    total_optimal = len(truth.optimal_signals)

    if total_optimal > 0:
        score += (correct / total_optimal) * 0.05

    # penalize forbidden signals
    forbidden_used = any(s in truth.forbidden_signals for s in state.active_signals)
    if forbidden_used:
        score -= 0.1

    # penalize restricted signals
    restricted = getattr(truth, "restricted_should_not_be_used", [])
    restricted_used = any(s in restricted for s in state.active_signals)
    if restricted_used:
        score -= 0.05

    return score