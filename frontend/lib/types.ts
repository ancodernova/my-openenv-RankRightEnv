export interface UserState {
  interests: string[];
  fatigue: number;
  diversity_tolerance: number;
  engagement_history?: number[];
  session_length?: number;
}

export interface Signal {
  name: string;
  status: "allowed" | "optional" | "disallowed";
  requires_consent: boolean;
  used: boolean;
  value?: number | string | null;
  description?: string;
}

export interface PolicyConstraints {
  allowed_signals: string[];
  optional_signals: string[];
  disallowed_signals: string[];
  max_items?: number;
  diversity_threshold?: number;
}

export interface ContentItem {
  id: string | number;
  topic: string;
  score: number;
  risk_level: "low" | "medium" | "high";
  category?: string;
  engagement_score?: number;
  safety_score?: number;
  diversity_score?: number;
  rank?: number;
}

export interface AgentDecision {
  selected_signals: string[];
  ranking_weights: Record<string, number>;
  action_log: ActionLogEntry[];
  current_action?: string;
  confidence?: number;
}

export interface ActionLogEntry {
  step: number;
  action: string;
  reward: number;
  timestamp?: string;
  details?: string;
}

export interface RewardBreakdown {
  total: number;
  engagement: number;
  diversity: number;
  safety: number;
  policy_compliance: number;
  history?: number[];
}

export interface SimulationState {
  user: UserState;
  signals: Signal[];
  feed: ContentItem[];
  agent: AgentDecision;
  reward: number;
  reward_breakdown?: RewardBreakdown;
  policy: PolicyConstraints;
  step: number;
  done: boolean;
  task?: string;
  violations?: string[];
  explanation?: StepExplanation[];
}

export interface StepExplanation {
  step: number;
  action: string;
  reasoning: string;
  reward_delta: number;
  signals_used: string[];
  policy_check: "pass" | "warn" | "fail";
}

export type TaskDifficulty = "easy" | "medium" | "hard";
