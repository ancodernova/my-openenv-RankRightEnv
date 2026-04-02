"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, Target, Shield, Users } from "lucide-react";
import { RewardBreakdown } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  reward: number;
  breakdown?: RewardBreakdown;
  step: number;
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string; 
  value: number;
  icon: React.ElementType;
}) {
  const pct = Math.round(value * 100);
  const color = value > 0.7 ? "text-success" : value > 0.4 ? "text-warning" : "text-destructive";
  const bgColor = value > 0.7 ? "bg-success/10" : value > 0.4 ? "bg-warning/10" : "bg-destructive/10";
  const borderColor = value > 0.7 ? "border-success/20" : value > 0.4 ? "border-warning/20" : "border-destructive/20";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-xl p-4 border", bgColor, borderColor)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", color)} />
          <span className="section-label">{label}</span>
        </div>
        <span className={cn("text-lg font-bold tabular-nums", color)}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", 
            value > 0.7 ? "bg-success" : value > 0.4 ? "bg-warning" : "bg-destructive"
          )}
        />
      </div>
    </motion.div>
  );
}

export default function RewardPanel({ reward, breakdown, step }: Props) {
  const history = breakdown?.history || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-foreground">Reward Tracker</h3>
        </div>
        <span className="text-sm font-mono text-muted-foreground">Step {step}</span>
      </div>

      {/* Total reward hero */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="rounded-xl p-6 text-center bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/20 mb-5"
      >
        <p className="section-label mb-2">Total Reward</p>
        <motion.p
          key={reward}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-5xl font-bold text-primary tabular-nums"
        >
          {(reward * 100).toFixed(1)}
        </motion.p>
        <p className="text-sm text-muted-foreground mt-1">out of 100</p>
      </motion.div>

      {/* Sparkline */}
      {history.length > 1 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <p className="section-label">Reward History</p>
          </div>
          <div className="flex items-end gap-1 h-16 p-3 rounded-xl bg-secondary">
            {history.map((v, i) => {
              const isLast = i === history.length - 1;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(8, Math.round(v * 100))}%` }}
                  transition={{ delay: i * 0.03, duration: 0.5 }}
                  className={cn(
                    "flex-1 rounded-sm transition-colors",
                    isLast ? "bg-primary" : "bg-primary/40"
                  )}
                  style={{ minHeight: 4 }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown */}
      {breakdown && (
        <div className="space-y-3">
          <MetricCard label="Engagement" value={breakdown.engagement} icon={Users} />
          <MetricCard label="Diversity" value={breakdown.diversity} icon={Target} />
          <MetricCard label="Safety" value={breakdown.safety} icon={Shield} />
          <MetricCard label="Policy Compliance" value={breakdown.policy_compliance} icon={Shield} />
        </div>
      )}
    </motion.div>
  );
}
