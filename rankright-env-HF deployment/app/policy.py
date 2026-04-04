from app.models import EnvState


# -------------------------------
# MAIN POLICY CHECK
# -------------------------------
def check_policy(state: EnvState) -> EnvState:
    violations = 0
    penalty = 0.0

    # -------------------------------
    # SIGNAL VIOLATIONS
    # -------------------------------
    v_count, v_penalty = _check_signal_violations(state)
    violations += v_count
    penalty += v_penalty

    # -------------------------------
    # CONTENT SAFETY VIOLATIONS
    # -------------------------------
    v_count, v_penalty = _check_risk_violations(state)
    violations += v_count
    penalty += v_penalty

    # -------------------------------
    # DIVERSITY VIOLATIONS
    # -------------------------------
    v_count, v_penalty = _check_diversity_violations(state)
    violations += v_count
    penalty += v_penalty

    # -------------------------------
    # SENSATIONAL OVEREXPOSURE
    # -------------------------------
    v_count, v_penalty = _check_sensational_violation(state)
    violations += v_count
    penalty += v_penalty

    # -------------------------------
    # RESTRICTED SIGNAL USAGE
    # -------------------------------
    v_count, v_penalty = _check_restricted_signals(state)
    violations += v_count
    penalty += v_penalty

    # update state
    state.violations = violations
    state.policy_penalty = round(penalty, 3)

    return state


# -------------------------------
# SIGNAL CHECK
# -------------------------------
def _check_signal_violations(state: EnvState):
    violations = 0
    penalty = 0.0

    disallowed = state.policy_constraints.disallowed_signals

    for signal in state.active_signals:
        if signal in disallowed:
            violations += 1
            penalty += 0.5

    return violations, penalty


# -------------------------------
# RESTRICTED SIGNAL CHECK
# -------------------------------
def _check_restricted_signals(state: EnvState):
    violations = 0
    penalty = 0.0

    restricted = getattr(state.policy_constraints, "restricted_signals", [])

    for signal in state.active_signals:
        if signal in restricted:
            violations += 1
            penalty += 0.4

    return violations, penalty


# -------------------------------
# RISK CHECK
# -------------------------------
def _check_risk_violations(state: EnvState):
    violations = 0
    penalty = 0.0

    max_risk = state.policy_constraints.max_risk

    for item in state.feed:
        if item.risk > max_risk:
            violations += 1
            penalty += 0.2

    return violations, penalty


# -------------------------------
# DIVERSITY CHECK
# -------------------------------
def _check_diversity_violations(state: EnvState):
    violations = 0
    penalty = 0.0

    if not state.feed:
        return violations, penalty

    topics = [item.topics[0] for item in state.feed]
    unique_topics = len(set(topics))
    diversity_score = unique_topics / len(topics)

    if diversity_score < state.policy_constraints.diversity_min:
        violations += 1
        penalty += 0.3

    return violations, penalty


# -------------------------------
# SENSATIONAL CONTENT CHECK
# -------------------------------
def _check_sensational_violation(state: EnvState):
    violations = 0
    penalty = 0.0

    max_ratio = getattr(state.policy_constraints, "max_sensational_ratio", None)

    if max_ratio is None:
        return violations, penalty

    sensational_items = [
        item for item in state.feed if item.topics[0] == "sensational"
    ]

    if len(state.feed) == 0:
        return violations, penalty

    ratio = len(sensational_items) / len(state.feed)

    if ratio > max_ratio:
        violations += 1
        penalty += 0.4

    return violations, penalty