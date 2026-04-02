"use client";

import { motion } from "framer-motion";
import { Radio, Check, X } from "lucide-react";
import { Signal } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  signals: Signal[];
  activeSignals: string[];
  onToggleSignal: (signalName: string, activate: boolean) => void;
}

export default function SignalsPanel({ signals, activeSignals, onToggleSignal }: Props) {
  const allowedSignals = signals.filter(s => s.status === 'allowed' || s.status === 'optional');
  const disallowedSignals = signals.filter(s => s.status === 'disallowed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Radio className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Signal Controls</h3>
      </div>

      <div className="space-y-4">
        {/* Allowed/Optional Signals */}
        <div>
          <p className="section-label mb-3">Available Signals</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allowedSignals.map((signal, idx) => {
              const isActive = activeSignals.includes(signal.name);
              return (
                <motion.div
                  key={signal.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    isActive
                      ? "bg-success/10 border-success/20"
                      : "bg-secondary/50 border-border hover:bg-secondary"
                  )}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">
                      {signal.name.replace(/_/g, " ")}
                    </p>
                    {signal.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {signal.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onToggleSignal(signal.name, !isActive)}
                    className={cn(
                      "ml-3 p-2 rounded-md transition-colors",
                      isActive
                        ? "bg-success text-success-foreground hover:bg-success/90"
                        : "bg-secondary text-muted-foreground hover:bg-muted-foreground/20"
                    )}
                  >
                    {isActive ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Disallowed Signals (read-only) */}
        {disallowedSignals.length > 0 && (
          <div>
            <p className="section-label mb-3">Blocked Signals</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {disallowedSignals.map((signal, idx) => (
                <motion.div
                  key={signal.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-muted-foreground">
                      {signal.name.replace(/_/g, " ")}
                    </p>
                    {signal.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {signal.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-3 p-2 rounded-md bg-destructive/10">
                    <X className="w-4 h-4 text-destructive" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}