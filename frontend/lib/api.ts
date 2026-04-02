import { SimulationState, TaskDifficulty } from "./types";
import { MOCK_STATE, generateStepUpdate } from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

let mockStateCache: SimulationState = { ...MOCK_STATE };

// -------------------------------
// FETCH WITH TIMEOUT
// -------------------------------
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 3000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
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
    mockStateCache = { ...MOCK_STATE, task, step: 0, done: false };
    return mockStateCache;
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      // ✅ FIXED: backend expects task_id
      body: JSON.stringify({ task_id: task }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return normalizeState(data);
  } catch (err) {
    console.warn("[API] /reset failed, using mock data:", err);
    mockStateCache = { ...MOCK_STATE, task, step: 0, done: false };
    return mockStateCache;
  }
}

// -------------------------------
// STEP
// -------------------------------
export async function stepSimulation(
  action?: Record<string, unknown>
): Promise<SimulationState> {
  if (USE_MOCK) {
    const update = generateStepUpdate(mockStateCache);
    mockStateCache = { ...mockStateCache, ...update };
    return mockStateCache;
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      // ✅ FIXED: backend expects { action: {...} }
      body: JSON.stringify({ action: action || {} }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return normalizeState(data);
  } catch (err) {
    console.warn("[API] /step failed, using mock step:", err);
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
    const res = await fetchWithTimeout(`${API_BASE}/state`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return normalizeState(data);
  } catch (err) {
    console.warn("[API] /state failed, using mock state:", err);
    return mockStateCache;
  }
}

// -------------------------------
// NORMALIZE RESPONSE
// -------------------------------
function normalizeState(data: any): SimulationState {
  // Extract observation
  const obs = data.observation || {};

  // Build user state from user_summary
  const userSummary = obs.user_summary || {};
  const user: SimulationState['user'] = {
    interests: userSummary.interests || [],
    fatigue: userSummary.fatigue || 0,
    diversity_tolerance: userSummary.diversity_preference || 0.5,
    engagement_history: [],
    session_length: 0,
  };

  // Build signals from available_signals, marking used based on active_signals
  const activeSignals = obs.active_signals || [];
  const signals: SimulationState['signals'] = (obs.available_signals || []).map((sig: any) => ({
    name: sig.name,
    status: sig.status,
    requires_consent: sig.requires_consent,
    used: activeSignals.includes(sig.name),
    value: sig.utility || null,
    description: sig.description || "",
  }));

  // Build policy from policy_constraints and signals
  const policyConstraints = obs.policy_constraints || {};
  const allowedSignals = signals.filter(s => s.status === 'allowed').map(s => s.name);
  const optionalSignals = signals.filter(s => s.status === 'optional').map(s => s.name);
  const disallowedSignals = signals.filter(s => s.status === 'disallowed').map(s => s.name);

  const policy: SimulationState['policy'] = {
    allowed_signals: allowedSignals,
    optional_signals: optionalSignals,
    disallowed_signals: [...disallowedSignals, ...(policyConstraints.disallowed_signals || [])],
    max_items: 10, // default
    diversity_threshold: policyConstraints.diversity_min || 0.5,
  };

  // Build agent state
  const agent: SimulationState['agent'] = {
    selected_signals: activeSignals,
    ranking_weights: {
      relevance: 0.5,
      diversity: 0.3,
      safety: 0.2,
    }, // default weights
    action_log: [],
    current_action: data.done ? "finalized" : "waiting_for_action",
    confidence: 0.8,
  };

  // Feed: use candidates initially, or feed if available
  const feed = obs.feed || obs.candidates || [];

  return {
    step: obs.step_count ?? 0,
    done: data.done ?? false,
    task: obs.task_id ?? "medium",
    reward: data.reward ?? 0,
    user,
    policy,
    signals,
    feed,
    agent,
    violations: data.info?.violations || [],
    explanation: [],
  };
}