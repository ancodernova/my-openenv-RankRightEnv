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
        score = _compute_score(item, state)
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
def _compute_score(item, state):
    """
    Compute item score considering relevance, novelty, quality, and safety.
    Deterministic scoring (removed random noise for consistent results).
    Also considers sensational content avoidance for hard scenarios.
    """
    # Relevance: match with user interests
    relevance = 1.0 if item.topics[0] in state.user.interests else 0.3
    
    # Quality factor
    quality = item.quality
    
    # Novelty factor
    novelty = item.novelty
    
    # Safety: inverse of risk (higher is safer)
    safety = 1.0 - item.risk
    
    # Policy compliance: penalize items exceeding max_risk
    max_risk = state.policy_constraints.max_risk
    policy_penalty = 0.0
    
    if item.risk > max_risk:
        # Significant penalty for risky content
        policy_penalty = 0.5 + (item.risk - max_risk)
    
    # Check for max_sensational_ratio constraint (hard scenario)
    max_sensational = getattr(state.policy_constraints, "max_sensational_ratio", None)
    if max_sensational is not None and max_sensational < 1.0:
        # Penalize sensational content in hard scenario
        if item.topics[0] == "sensational":
            policy_penalty += 0.4
    
    # Combine scores using weights
    score = (
        state.weights["relevance"] * relevance * quality +
        state.weights["diversity"] * novelty * 0.8 +
        state.weights["safety"] * safety -
        policy_penalty
    )
    
    return score

# -------------------------------
# DIVERSITY LOGIC
# -------------------------------
def _apply_diversity(items: List[ContentItem], diversity_pref: float) -> List[ContentItem]:
    """
    Apply diversity by interleaving topics to ensure variety.
    Uses a smarter selection to maximize topic coverage.
    """
    if not items:
        return items

    diversified = []
    seen_topics = {}  # topic -> count
    
    # First pass: add one item per unique topic
    for item in items:
        topic = item.topics[0]
        if topic not in seen_topics:
            diversified.append(item)
            seen_topics[topic] = 1
    
    # Second pass: add remaining items based on diversity preference
    # Higher diversity_pref = prefer items from less-seen topics
    for item in items:
        if item in diversified:
            continue
            
        topic = item.topics[0]
        topic_count = seen_topics.get(topic, 0)
        
        # Allow repetition if we need more items
        max_per_topic = max(1, int(3 * (1 - diversity_pref)))
        if topic_count < max_per_topic:
            diversified.append(item)
            seen_topics[topic] = topic_count + 1
    
    # Ensure minimum feed size
    if len(diversified) < 3 and len(items) >= 3:
        diversified = items[:max(3, len(diversified))]

    return diversified


# -------------------------------
# SAFETY FILTER
# -------------------------------
def _apply_safety(items: List[ContentItem], state: EnvState) -> List[ContentItem]:
    """
    Filter items by safety, prioritizing items within policy limits.
    Improved to better handle edge cases.
    """
    max_risk = state.policy_constraints.max_risk
    
    # Separate safe and risky items
    safe_items = [item for item in items if item.risk <= max_risk]
    risky_items = [item for item in items if item.risk > max_risk]
    
    # Sort risky items by risk (ascending) for fallback
    risky_items.sort(key=lambda x: x.risk)
    
    # Always prefer safe items
    if len(safe_items) >= 3:
        return safe_items
    
    # If not enough safe items, add least risky items
    result = safe_items.copy()
    for item in risky_items:
        if len(result) >= 3:
            break
        result.append(item)
    
    return result if result else items[:3]