import { SimulationState, TaskDifficulty } from "./types";
import { MOCK_STATE, generateStepUpdate } from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

let mockStateCache: SimulationState = { ...MOCK_STATE };

// -------------------------------
// FETCH WITH TIMEOUT & CORS
// -------------------------------
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: "cors",
      credentials: "include",
    });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// -------------------------------
// RESET
// -------------------------------
export async function resetSimulation(
  task: TaskDifficulty
): Promise<SimulationState> {
  if (USE_MOCK) {
    console.log("[API] Using mock data for reset");
    mockStateCache = { ...MOCK_STATE, task, step: 0, done: false };
    return mockStateCache;
  }

  try {
    console.log(`[API] POST /reset with task_id="${task}"`);
    const res = await fetchWithTimeout(`${API_BASE}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: task }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("[API] /reset success", data);
    return normalizeState(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[API] /reset failed:", errorMsg);
    mockStateCache = { ...MOCK_STATE, task, step: 0, done: false };
    return mockStateCache;
  }
}

// -------------------------------
// STEP
// -------------------------------
export async function stepSimulation(
  action_type: string = "rank",
  params: Record<string, unknown> = {}
): Promise<SimulationState> {
  if (USE_MOCK) {
    const update = generateStepUpdate(mockStateCache);
    mockStateCache = { ...mockStateCache, ...update };
    return mockStateCache;
  }

  try {
    // Build request payload matching backend Action model
    const requestPayload = {
      action: {
        action_type: action_type,
        params: params
      }
    };
    
    console.log("[API] POST /step with action:", requestPayload);
    
    const res = await fetchWithTimeout(`${API_BASE}/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("[API] /step success", data);
    return normalizeState(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[API] /step failed:", errorMsg);
    const update = generateStepUpdate(mockStateCache);
    mockStateCache = { ...mockStateCache, ...update };
    return mockStateCache;
  }
}

// -------------------------------
// GET STATE
// -------------------------------
export async function getState(): Promise<SimulationState> {
  if (USE_MOCK) {
    return mockStateCache;
  }

  try {
    console.log("[API] GET /state");
    const res = await fetchWithTimeout(`${API_BASE}/state`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("[API] /state success", data);
    return normalizeState(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[API] /state failed:", errorMsg);
    return mockStateCache;
  }
}

// -------------------------------
// NORMALIZE RESPONSE
// Handles 3 different response formats:
// 1. /reset response: { observation: {...} }
// 2. /step response: { observation: {...}, reward: number, done: boolean, info: {} }
// 3. /state response: { task_id, step_count, user, candidates, feed, ... }
// -------------------------------
function normalizeState(data: any): SimulationState {
  // Determine response format
  const isObservationFormat = !!data.observation;
  const obs = data.observation || data;

  // Extract user state (handle both user_summary and user formats)
  const userSummary = obs.user_summary || obs.user || {};
  const user: SimulationState['user'] = {
    interests: userSummary.interests || [],
    fatigue: typeof userSummary.fatigue === 'number' ? userSummary.fatigue : 0,
    diversity_tolerance: (userSummary.diversity_preference ?? userSummary.diversity_preference) || 0.5,
    engagement_history: userSummary.engagement_history || [],
    session_length: userSummary.session_length || 0,
  };

  // Extract available signals and active signals
  const availableSignals = obs.available_signals || [];
  const activeSignals = obs.active_signals || [];
  
  const signals: SimulationState['signals'] = availableSignals.map((sig: any) => ({
    name: sig.name || "",
    status: (sig.status || "allowed") as "allowed" | "optional" | "disallowed",
    requires_consent: sig.requires_consent || false,
    used: activeSignals.includes(sig.name),
    value: sig.utility ?? sig.value ?? null,
    description: sig.description || "",
  }));

  // Build policy constraints
  const policyConstraints = obs.policy_constraints || {};
  const allowedSignals = signals.filter(s => s.status === 'allowed').map(s => s.name);
  const optionalSignals = signals.filter(s => s.status === 'optional').map(s => s.name);
  const disallowedSignals = signals.filter(s => s.status === 'disallowed').map(s => s.name);

  const policy: SimulationState['policy'] = {
    allowed_signals: allowedSignals,
    optional_signals: optionalSignals,
    disallowed_signals: [
      ...disallowedSignals,
      ...(policyConstraints.disallowed_signals || []),
    ],
    max_items: policyConstraints.max_items || 10,
    diversity_threshold: policyConstraints.diversity_min || 0.3,
  };

  // Build agent state
  const weights = obs.weights || { relevance: 0.5, diversity: 0.3, safety: 0.2 };
  const agent: SimulationState['agent'] = {
    selected_signals: activeSignals,
    ranking_weights: weights,
    action_log: obs.action_log || [],
    current_action: (data.done || obs.done) ? "finalized" : "waiting_for_action",
    confidence: obs.confidence || 0.8,
  };

  // Extract feed (handle candidates as alternate name)
  const feedData = obs.feed || obs.candidates || [];
  const feed: SimulationState['feed'] = feedData.map((item: any) => ({
    id: item.id || "",
    topic: item.topic || item.title || "",
    score: item.quality ?? item.score ?? 0,
    risk_level: (item.risk || item.risk_level || "low") as "low" | "medium" | "high",
    category: item.category || (item.topics ? item.topics[0] : ""),
    engagement_score: item.engagement_score || 0,
    safety_score: item.safety_score || 0,
    diversity_score: item.diversity_score || 0,
    rank: item.rank || 0,
  }));

  // Build reward breakdown
  const rewardBreakdown: SimulationState['reward_breakdown'] = {
    total: data.reward ?? obs.engagement ?? 0,
    engagement: obs.engagement ?? data.reward ?? 0,
    diversity: obs.diversity ?? 0,
    safety: obs.policy_penalty ? 1 - obs.policy_penalty : 0.8,
    policy_compliance: obs.policy_penalty ? 1 - obs.policy_penalty : 0.8,
  };

  return {
    step: obs.step_count ?? data.step ?? 0,
    done: data.done ?? obs.done ?? false,
    task: obs.task_id ?? data.task ?? "medium",
    reward: data.reward ?? obs.engagement ?? 0,
    reward_breakdown: rewardBreakdown,
    user,
    policy,
    signals,
    feed,
    agent,
    violations: data.violations || obs.violations || data.info?.violations || [],
    explanation: data.explanation || [],
  };
}