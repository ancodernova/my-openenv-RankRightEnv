"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles, Signal, Sliders, Gauge } from "lucide-react";
import { AgentDecision } from "@/lib/types";
import ActionLog from "./ActionLog";
import { cn } from "@/lib/utils";

interface Props {
  agent: AgentDecision;
  currentStep: number;
}

export default function AgentPanel({ agent, currentStep }: Props) {
  const weights = agent.ranking_weights || {};
  const maxWeight = Math.max(...Object.values(weights), 0.001);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="card-base p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-foreground">Agent Decisions</h3>
        </div>
        {agent.confidence !== undefined && (
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-success" />
            <span className="text-sm font-bold text-success tabular-nums">
              {Math.round(agent.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Current Action */}
      {agent.current_action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-4 mb-5 bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="section-label text-primary">Current Action</p>
          </div>
          <p className="font-semibold text-foreground">
            {agent.current_action.replace(/_/g, " ")}
          </p>
        </motion.div>
      )}

      {/* Selected Signals */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Signal className="w-4 h-4 text-muted-foreground" />
          <p className="section-label">Selected Signals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(agent.selected_signals || []).map((sig, idx) => (
            <motion.span
              key={sig}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="badge badge-success"
            >
              {sig.replace(/_/g, " ")}
            </motion.span>
          ))}
          {(agent.selected_signals || []).length === 0 && (
            <span className="text-sm text-muted-foreground italic">None selected</span>
          )}
        </div>
      </div>

      {/* Ranking Weights */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-muted-foreground" />
          <p className="section-label">Ranking Weights</p>
        </div>
        <div className="space-y-3">
          {Object.entries(weights).map(([key, value], idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm text-muted-foreground w-24 capitalize truncate">
                {key}
              </span>
              <div className="flex-1 h-2 rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((value / maxWeight) * 100)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400"
                />
              </div>
              <span className="text-sm font-bold text-primary tabular-nums w-12 text-right">
                {Math.round(value * 100)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Log */}
      <div className="pt-4 border-t border-border">
        <ActionLog log={agent.action_log || []} />
      </div>
    </motion.div>
  );
}
