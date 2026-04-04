"use client";

import { motion } from "framer-motion";
import { User, Battery, Shuffle, Clock, TrendingUp } from "lucide-react";
import { UserState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  user: UserState;
}

function ProgressBar({ 
  value, 
  variant = "primary" 
}: { 
  value: number; 
  variant?: "primary" | "success" | "warning" | "destructive"; 
}) {
  const variants = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };

  return (
    <div className="progress-bar">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(value * 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("progress-fill", variants[variant])}
      />
    </div>
  );
}

export default function UserPanel({ user }: Props) {
  const fatigueVariant = user.fatigue > 0.7 ? "destructive" : user.fatigue > 0.4 ? "warning" : "success";
  const diversityVariant = user.diversity_tolerance > 0.6 ? "success" : user.diversity_tolerance > 0.3 ? "warning" : "destructive";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="card-base p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-foreground">User State</h3>
        </div>
        <span className="badge badge-success">Active</span>
      </div>

      {/* Interests */}
      <div className="mb-5">
        <p className="section-label mb-3">Interests</p>
        <div className="flex flex-wrap gap-2">
          {(user.interests || []).map((interest, idx) => (
            <motion.span
              key={interest}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-foreground"
            >
              {interest}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Fatigue */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Battery className={cn(
              "w-4 h-4",
              fatigueVariant === "success" ? "text-success" : fatigueVariant === "warning" ? "text-warning" : "text-destructive"
            )} />
            <p className="section-label">Fatigue</p>
          </div>
          <span className={cn(
            "text-sm font-bold tabular-nums",
            fatigueVariant === "success" ? "text-success" : fatigueVariant === "warning" ? "text-warning" : "text-destructive"
          )}>
            {Math.round((user.fatigue || 0) * 100)}%
          </span>
        </div>
        <ProgressBar value={user.fatigue || 0} variant={fatigueVariant} />
        <p className="text-xs text-muted-foreground mt-2">
          {(user.fatigue || 0) > 0.7
            ? "High fatigue - reduce content intensity"
            : (user.fatigue || 0) > 0.4
            ? "Moderate fatigue"
            : "User is fresh"}
        </p>
      </div>

      {/* Diversity Tolerance */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Shuffle className={cn(
              "w-4 h-4",
              diversityVariant === "success" ? "text-success" : diversityVariant === "warning" ? "text-warning" : "text-destructive"
            )} />
            <p className="section-label">Diversity Tolerance</p>
          </div>
          <span className={cn(
            "text-sm font-bold tabular-nums",
            diversityVariant === "success" ? "text-success" : diversityVariant === "warning" ? "text-warning" : "text-destructive"
          )}>
            {Math.round((user.diversity_tolerance || 0) * 100)}%
          </span>
        </div>
        <ProgressBar value={user.diversity_tolerance || 0} variant={diversityVariant} />
      </div>

      {/* Session Info */}
      {user.session_length !== undefined && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="section-label">Session Length</span>
            </div>
            <span className="text-sm font-bold text-primary tabular-nums">
              {user.session_length} min
            </span>
          </div>
        </div>
      )}

      {/* Engagement sparkline */}
      {user.engagement_history && user.engagement_history.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="section-label">Engagement History</p>
          </div>
          <div className="flex items-end gap-1 h-12 p-2 rounded-lg bg-secondary">
            {user.engagement_history.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(8, Math.round(v * 100))}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex-1 bg-primary/60 rounded-sm"
                style={{ minHeight: 4 }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
