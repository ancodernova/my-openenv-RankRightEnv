from typing import List
from collections import Counter

from app.models import EnvState, ContentItem


# -------------------------------
# MAIN RANKING FUNCTION
# -------------------------------
def rank_content(state: EnvState) -> EnvState:
    candidates = state.candidates
    weights = state.weights
    user = state.user

    # fallback safety
    if not candidates:
        state.feed = []
        return state

    # -------------------------------
    # SCORE EACH ITEM
    # -------------------------------
    scored_items = []

    for item in candidates:
        score = _compute_score(item, state, weights)
        scored_items.append((item, score))

    # -------------------------------
    # SORT BY SCORE
    # -------------------------------
    scored_items.sort(key=lambda x: x[1], reverse=True)

    ranked_items = [item for item, _ in scored_items]

    # -------------------------------
    # APPLY DIVERSITY CONTROL
    # -------------------------------
    diversified = _apply_diversity(ranked_items, user.diversity_preference)

    # -------------------------------
    # APPLY SAFETY FILTER
    # -------------------------------
    safe_feed = _apply_safety(diversified, state)

    # limit feed size
    state.feed = safe_feed[:5]

    return state


# -------------------------------
# SCORE FUNCTION
# -------------------------------
def _compute_score(item: ContentItem, state: EnvState, weights: dict) -> float:
    relevance = 1.0 if item.topics[0] in state.user.interests else 0.3
    novelty = item.novelty
    safety = 1 - item.risk

    score = (
        weights["relevance"] * relevance
        + weights["diversity"] * novelty
        + weights["safety"] * safety
    )

    return round(score, 4)


# -------------------------------
# DIVERSITY LOGIC
# -------------------------------
def _apply_diversity(items: List[ContentItem], diversity_pref: float) -> List[ContentItem]:
    if not items:
        return items

    diversified = []
    seen_topics = set()

    for item in items:
        topic = item.topics[0]

        # encourage new topics
        if topic not in seen_topics:
            diversified.append(item)
            seen_topics.add(topic)

        # allow some repetition based on preference
        elif len(diversified) < int(len(items) * diversity_pref):
            diversified.append(item)

    # fallback if too few items selected
    if len(diversified) < 3:
        diversified = items[:]

    return diversified


# -------------------------------
# SAFETY FILTER
# -------------------------------
def _apply_safety(items: List[ContentItem], state: EnvState) -> List[ContentItem]:
    max_risk = state.policy_constraints.max_risk

    safe_items = [item for item in items if item.risk <= max_risk]

    # fallback: if everything filtered out
    if not safe_items:
        safe_items = sorted(items, key=lambda x: x.risk)[:3]

    return safe_items