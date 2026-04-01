from app.models import EnvState


# -------------------------------
# MAIN USER SIMULATION
# -------------------------------
def simulate_user(state: EnvState) -> EnvState:
    """
    Simulates user interaction with feed
    Updates:
    - engagement
    - diversity
    - fatigue
    """

    if not state.feed:
        state.engagement = 0.0
        state.diversity = 0.0
        return state

    engagement = 0.0
    fatigue = state.user.fatigue
    topics_seen = []

    for item in state.feed:
        topic = item.topics[0]
        topics_seen.append(topic)

        # -------------------------------
        # RELEVANCE (INTEREST MATCH)
        # -------------------------------
        if topic in state.user.interests:
            engagement += item.quality * 0.4
        else:
            engagement += item.quality * 0.1
            fatigue += 0.05

        # -------------------------------
        # SAFETY IMPACT
        # -------------------------------
        if item.risk > state.user.safety_sensitivity:
            engagement -= 0.3
            fatigue += 0.1

    # -------------------------------
    # DIVERSITY CALCULATION
    # -------------------------------
    unique_topics = len(set(topics_seen))
    diversity_score = unique_topics / len(topics_seen)

    # -------------------------------
    # FATIGUE CONTROL
    # -------------------------------
    fatigue = min(fatigue, 1.0)

    # -------------------------------
    # ALIGN WITH HIDDEN TRUTH (IMPORTANT)
    # -------------------------------
    engagement = _align_with_hidden_truth(state, engagement, topics_seen)

    # -------------------------------
    # FINAL STATE UPDATE
    # -------------------------------
    state.engagement = round(max(0.0, engagement), 3)
    state.diversity = round(diversity_score, 3)
    state.user.fatigue = round(fatigue, 3)

    return state


# -------------------------------
# HIDDEN TRUTH ADJUSTMENT
# -------------------------------
def _align_with_hidden_truth(state: EnvState, engagement: float, topics_seen: list) -> float:
    """
    Adjust engagement based on hidden ground truth
    """

    truth = state.hidden_truth

    # -------------------------------
    # IDEAL TOPICS BOOST
    # -------------------------------
    ideal_matches = sum(1 for t in topics_seen if t in truth.ideal_topics)

    if ideal_matches > 0:
        engagement += 0.2 * (ideal_matches / len(topics_seen))

    # -------------------------------
    # AVOID BAD TOPICS
    # -------------------------------
    avoid_topics = getattr(truth, "avoid_topics", [])

    for t in topics_seen:
        if t in avoid_topics:
            engagement -= 0.2

    # -------------------------------
    # EXPECTED ENGAGEMENT NORMALIZATION
    # -------------------------------
    target = truth.expected_engagement

    if engagement > target:
        engagement = (engagement + target) / 2

    return engagement