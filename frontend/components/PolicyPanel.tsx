"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle2, AlertCircle, XCircle, Settings } from "lucide-react";
import { PolicyConstraints } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  policy: PolicyConstraints;
}

function SignalList({ 
  signals, 
  type 
}: { 
  signals: string[]; 
  type: "allowed" | "optional" | "disallowed"; 
}) {
  const config = {
    allowed: {
      icon: CheckCircle2,
      iconColor: "text-success",
      bg: "bg-success/5",
      border: "border-success/20",
      label: "Allowed",
      labelColor: "text-success",
    },
    optional: {
      icon: AlertCircle,
      iconColor: "text-warning",
      bg: "bg-warning/5",
      border: "border-warning/20",
      label: "Optional",
      labelColor: "text-warning",
    },
    disallowed: {
      icon: XCircle,
      iconColor: "text-destructive",
      bg: "bg-destructive/5",
      border: "border-destructive/20",
      label: "Disallowed",
      labelColor: "text-destructive",
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl p-4 border", c.bg, c.border)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", c.iconColor)} />
          <span className={cn("text-sm font-semibold", c.labelColor)}>
            {c.label}
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
          {signals.length}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {signals.map((sig, idx) => (
          <motion.div
            key={sig}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="flex items-center gap-2"
          >
            <div className={cn("w-1.5 h-1.5 rounded-full", c.iconColor.replace("text-", "bg-"))} />
            <span className="text-sm text-muted-foreground">
              {sig.replace(/_/g, " ")}
            </span>
          </motion.div>
        ))}
        {signals.length === 0 && (
          <span className="text-sm italic text-muted-foreground">None</span>
        )}
      </div>
    </motion.div>
  );
}

export default function PolicyPanel({ policy }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card-base p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-foreground">Policy Constraints</h3>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
          v1.0
        </span>
      </div>

      <div className="space-y-3">
        <SignalList signals={policy.allowed_signals || []} type="allowed" />
        <SignalList signals={policy.optional_signals || []} type="optional" />
        <SignalList signals={policy.disallowed_signals || []} type="disallowed" />
      </div>

      {(policy.max_items || policy.diversity_threshold) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-border space-y-3"
        >
          {policy.max_items && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="section-label">Max Feed Items</span>
              </div>
              <span className="font-bold text-foreground">{policy.max_items}</span>
            </div>
          )}
          {policy.diversity_threshold && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="section-label">Diversity Threshold</span>
              </div>
              <span className="font-bold text-primary">
                {Math.round(policy.diversity_threshold * 100)}%
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
