"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lightbulb,
  ArrowLeft,
  Zap,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Brain,
  TrendingUp,
  Sliders,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { useSimulation } from "@/hooks/useSimulation";
import { MOCK_STATE } from "@/lib/mockData";
import { StepExplanation } from "@/lib/types";
import { cn } from "@/lib/utils";

function PolicyBadge({ check }: { check: StepExplanation["policy_check"] }) {
  const config = {
    pass: { icon: CheckCircle2, text: "text-success", bg: "bg-success/10", border: "border-success/20", label: "Pass" },
    warn: { icon: AlertTriangle, text: "text-warning", bg: "bg-warning/10", border: "border-warning/20", label: "Warn" },
    fail: { icon: XCircle, text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", label: "Fail" },
  };
  const c = config[check];
  const Icon = c.icon;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border", c.bg, c.border)}>
      <Icon className={cn("w-3 h-3", c.text)} />
      <span className={cn("text-xs font-semibold", c.text)}>{c.label}</span>
    </div>
  );
}

function ExplainCard({ entry, index }: { entry: StepExplanation; index: number }) {
  const deltaColor = entry.reward_delta > 0.1 ? "text-success" : entry.reward_delta > 0 ? "text-warning" : "text-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-base p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{entry.step}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{entry.action.replace(/_/g, " ")}</p>
            <div className="flex items-center gap-2 mt-1">
              <PolicyBadge check={entry.policy_check} />
              <span className="text-xs text-muted-foreground">policy check</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="section-label">Reward Delta</p>
          <p className={cn("text-xl font-bold tabular-nums", deltaColor)}>
            {entry.reward_delta > 0 ? "+" : ""}{(entry.reward_delta * 100).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Reasoning */}
      <div className="rounded-xl p-4 bg-secondary/50 border border-border mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary" />
          <p className="section-label text-primary">Agent Reasoning</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{entry.reasoning}</p>
      </div>

      {/* Signals used */}
      {entry.signals_used && entry.signals_used.length > 0 && (
        <div>
          <p className="section-label mb-2">Signals Used</p>
          <div className="flex flex-wrap gap-2">
            {entry.signals_used.map((sig) => (
              <span key={sig} className="badge badge-success">
                {sig.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
      {entry.signals_used && entry.signals_used.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No signals used in this step</p>
      )}
    </motion.div>
  );
}

export default function ExplainPage() {
  const { state, setState } = useSimulation();
  const router = useRouter();

  useEffect(() => {
    if (!state) setState(MOCK_STATE);
  }, [state, setState]);

  if (!state) return null;

  const explanations = state.explanation ?? [];
  const actionLog = state.agent?.action_log ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <div className="h-16" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-4 lg:p-6"
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Step Explainer</h1>
              </div>
              <p className="text-muted-foreground">
                What the agent did and why
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/simulation")}
              className="btn btn-outline btn-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Simulation
            </motion.button>
          </div>

          {/* Summary stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-5 mb-6"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <p className="section-label">Total Steps</p>
                </div>
                <p className="text-3xl font-bold text-primary">{state.step}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-success" />
                  <p className="section-label">Final Reward</p>
                </div>
                <p className="text-3xl font-bold text-success">{(state.reward * 100).toFixed(1)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <p className="section-label">Violations</p>
                </div>
                <p className={cn(
                  "text-3xl font-bold",
                  (state.violations?.length ?? 0) > 0 ? "text-destructive" : "text-success"
                )}>
                  {state.violations?.length ?? 0}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-warning" />
                  <p className="section-label">Status</p>
                </div>
                <p className={cn("text-lg font-bold", state.done ? "text-warning" : "text-success")}>
                  {state.done ? "Complete" : "Running"}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Step cards */}
            <div className="flex flex-col gap-4">
              <p className="section-label">Step-by-Step Breakdown</p>
              {explanations.length > 0 ? (
                explanations.map((entry, i) => (
                  <ExplainCard key={entry.step} entry={entry} index={i} />
                ))
              ) : (
                actionLog.slice(0, 8).map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-base p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{entry.step}</span>
                        </div>
                        <span className="font-medium text-foreground">
                          {entry.action.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className={cn(
                        "text-lg font-bold tabular-nums",
                        entry.reward > 0.7 ? "text-success" : entry.reward > 0.4 ? "text-warning" : "text-destructive"
                      )}>
                        {entry.reward.toFixed(3)}
                      </span>
                    </div>
                    {entry.details && (
                      <p className="text-sm text-muted-foreground mt-2 ml-11">{entry.details}</p>
                    )}
                  </motion.div>
                ))
              )}

              {explanations.length === 0 && actionLog.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card-base p-8 text-center"
                >
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No explanation data. Run more steps.</p>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Reward progression */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-base p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="font-bold text-foreground">Reward Progression</p>
                </div>
                <div className="space-y-2">
                  {actionLog.map((entry, i) => {
                    const prev = i > 0 ? actionLog[i - 1].reward : 0;
                    const delta = entry.reward - prev;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground w-6">S{entry.step}</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(entry.reward * 100)}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                            className="h-full rounded-full bg-primary"
                          />
                        </div>
                        <span className={cn(
                          "text-xs font-bold tabular-nums w-10 text-right",
                          delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {delta > 0 ? "+" : ""}{(delta * 100).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Final weights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-base p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sliders className="w-4 h-4 text-primary" />
                  <p className="font-bold text-foreground">Final Ranking Weights</p>
                </div>
                <div className="space-y-3">
                  {Object.entries(state.agent?.ranking_weights ?? {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-20 capitalize truncate">{key}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.round(val * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-primary tabular-nums w-10 text-right">
                        {Math.round(val * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
