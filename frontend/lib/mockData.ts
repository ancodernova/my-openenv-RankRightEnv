import { SimulationState } from "./types";

export const MOCK_STATE: SimulationState = {
  step: 0,
  done: false,
  task: "medium",
  reward: 0.72,
  reward_breakdown: {
    total: 0.72,
    engagement: 0.85,
    diversity: 0.68,
    safety: 0.91,
    policy_compliance: 0.76,
    history: [0.4, 0.52, 0.61, 0.68, 0.72],
  },
  user: {
    interests: ["technology", "science", "politics", "health", "gaming"],
    fatigue: 0.3,
    diversity_tolerance: 0.7,
    engagement_history: [0.6, 0.7, 0.8, 0.65, 0.75],
    session_length: 12,
  },
  policy: {
    allowed_signals: ["click_history", "watch_time", "explicit_feedback", "topic_preferences"],
    optional_signals: ["location_coarse", "device_type", "time_of_day"],
    disallowed_signals: ["demographic_data", "health_data", "financial_data", "location_precise"],
    max_items: 10,
    diversity_threshold: 0.6,
  },
  signals: [
    { name: "click_history", status: "allowed", requires_consent: false, used: true, value: 142 },
    { name: "watch_time", status: "allowed", requires_consent: false, used: true, value: "4h 23m" },
    { name: "explicit_feedback", status: "allowed", requires_consent: false, used: false, value: null },
    { name: "topic_preferences", status: "allowed", requires_consent: false, used: true, value: "tech, science" },
    { name: "location_coarse", status: "optional", requires_consent: true, used: false, value: null },
    { name: "device_type", status: "optional", requires_consent: false, used: true, value: "mobile" },
    { name: "time_of_day", status: "optional", requires_consent: false, used: true, value: "evening" },
    { name: "demographic_data", status: "disallowed", requires_consent: true, used: false, value: null },
    { name: "health_data", status: "disallowed", requires_consent: true, used: false, value: null },
    { name: "financial_data", status: "disallowed", requires_consent: true, used: false, value: null },
    { name: "location_precise", status: "disallowed", requires_consent: true, used: false, value: null },
  ],
  feed: [
    { id: 1, topic: "Quantum Computing Breakthrough", score: 0.94, risk_level: "low", category: "Technology", engagement_score: 0.92, safety_score: 0.99, diversity_score: 0.8, rank: 1 },
    { id: 2, topic: "Climate Policy Debate", score: 0.88, risk_level: "medium", category: "Politics", engagement_score: 0.85, safety_score: 0.78, diversity_score: 0.9, rank: 2 },
    { id: 3, topic: "AI Safety Regulations", score: 0.86, risk_level: "low", category: "Technology", engagement_score: 0.88, safety_score: 0.95, diversity_score: 0.75, rank: 3 },
    { id: 4, topic: "Gene Editing Ethics", score: 0.81, risk_level: "medium", category: "Science", engagement_score: 0.79, safety_score: 0.82, diversity_score: 0.88, rank: 4 },
    { id: 5, topic: "Cryptocurrency Volatility", score: 0.74, risk_level: "high", category: "Finance", engagement_score: 0.72, safety_score: 0.65, diversity_score: 0.6, rank: 5 },
    { id: 6, topic: "Space Exploration Updates", score: 0.88, risk_level: "low", category: "Science", engagement_score: 0.87, safety_score: 0.98, diversity_score: 0.82, rank: 6 },
    { id: 7, topic: "Mental Health Awareness", score: 0.77, risk_level: "low", category: "Health", engagement_score: 0.75, safety_score: 0.96, diversity_score: 0.85, rank: 7 },
    { id: 8, topic: "Open Source AI Models", score: 0.82, risk_level: "low", category: "Technology", engagement_score: 0.84, safety_score: 0.93, diversity_score: 0.7, rank: 8 },
  ],
  agent: {
    selected_signals: ["click_history", "watch_time", "topic_preferences", "device_type", "time_of_day"],
    ranking_weights: {
      engagement: 0.4,
      diversity: 0.25,
      safety: 0.2,
      recency: 0.15,
    },
    confidence: 0.84,
    current_action: "rank_by_engagement_diversity_blend",
    action_log: [
      { step: 0, action: "initialize_environment", reward: 0.0, timestamp: "10:00:01", details: "Environment reset with medium difficulty" },
      { step: 1, action: "select_signals", reward: 0.12, timestamp: "10:00:02", details: "Selected 5 allowed/optional signals" },
      { step: 2, action: "rank_by_engagement", reward: 0.34, timestamp: "10:00:03", details: "Pure engagement ranking applied" },
      { step: 3, action: "apply_diversity_boost", reward: 0.52, timestamp: "10:00:04", details: "Diversity threshold enforcement" },
      { step: 4, action: "safety_filter", reward: 0.61, timestamp: "10:00:05", details: "High-risk content deprioritized" },
      { step: 5, action: "rank_by_engagement_diversity_blend", reward: 0.72, timestamp: "10:00:06", details: "Blend weights optimized for policy compliance" },
    ],
  },
  violations: [],
  explanation: [
    { step: 1, action: "select_signals", reasoning: "Agent selected signals with lowest privacy cost that still provide strong engagement signal.", reward_delta: 0.12, signals_used: ["click_history", "watch_time"], policy_check: "pass" },
    { step: 2, action: "rank_by_engagement", reasoning: "Initial ranking maximizes predicted click-through rate using topic preferences.", reward_delta: 0.22, signals_used: ["click_history", "topic_preferences"], policy_check: "pass" },
    { step: 3, action: "apply_diversity_boost", reasoning: "Diversity score below threshold. Agent re-weighted to include more varied categories.", reward_delta: 0.18, signals_used: ["topic_preferences"], policy_check: "warn" },
    { step: 4, action: "safety_filter", reasoning: "Two items had high risk scores. Agent moved them lower to comply with safety policy.", reward_delta: 0.09, signals_used: [], policy_check: "pass" },
    { step: 5, action: "rank_by_engagement_diversity_blend", reasoning: "Final blend achieves 0.72 total reward — policy compliant with good diversity and engagement.", reward_delta: 0.11, signals_used: ["click_history", "watch_time", "device_type"], policy_check: "pass" },
  ],
};

export function generateStepUpdate(currentState: SimulationState): Partial<SimulationState> {
  const newStep = currentState.step + 1;
  const rewardDelta = (Math.random() * 0.1 - 0.03);
  const newReward = Math.max(0, Math.min(1, currentState.reward + rewardDelta));

  const actions = [
    "rank_by_engagement_diversity_blend",
    "apply_safety_filter",
    "select_signals",
    "boost_diversity",
    "penalize_fatigue",
    "reweight_topics",
  ];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];

  const newEntry = {
    step: newStep,
    action: randomAction,
    reward: parseFloat(newReward.toFixed(3)),
    timestamp: new Date().toLocaleTimeString(),
    details: `Step ${newStep}: ${randomAction.replace(/_/g, " ")} executed`,
  };

  const shuffledFeed = [...currentState.feed]
    .map(item => ({
      ...item,
      score: parseFloat(Math.max(0, Math.min(1, item.score + (Math.random() * 0.1 - 0.05))).toFixed(2)),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const prevHistory = currentState.reward_breakdown?.history || [];

  return {
    step: newStep,
    reward: newReward,
    reward_breakdown: {
      total: newReward,
      engagement: parseFloat(Math.max(0, Math.min(1, (currentState.reward_breakdown?.engagement || 0.8) + (Math.random() * 0.06 - 0.03))).toFixed(2)),
      diversity: parseFloat(Math.max(0, Math.min(1, (currentState.reward_breakdown?.diversity || 0.6) + (Math.random() * 0.08 - 0.04))).toFixed(2)),
      safety: parseFloat(Math.max(0, Math.min(1, (currentState.reward_breakdown?.safety || 0.9) + (Math.random() * 0.04 - 0.02))).toFixed(2)),
      policy_compliance: parseFloat(Math.max(0, Math.min(1, (currentState.reward_breakdown?.policy_compliance || 0.75) + (Math.random() * 0.06 - 0.03))).toFixed(2)),
      history: [...prevHistory.slice(-9), parseFloat(newReward.toFixed(2))],
    },
    feed: shuffledFeed,
    agent: {
      ...currentState.agent,
      current_action: randomAction,
      confidence: parseFloat(Math.max(0.5, Math.min(1, (currentState.agent.confidence || 0.8) + (Math.random() * 0.06 - 0.03))).toFixed(2)),
      action_log: [...currentState.agent.action_log, newEntry],
    },
    done: newStep >= 20,
  };
}
