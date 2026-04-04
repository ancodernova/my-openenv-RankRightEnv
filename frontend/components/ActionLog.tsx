"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, ArrowRight } from "lucide-react";
import { ActionLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  log: ActionLogEntry[];
  maxItems?: number;
}

export default function ActionLog({ log, maxItems = 6 }: Props) {
  const entries = [...log].reverse().slice(0, maxItems);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-muted-foreground" />
        <p className="section-label">Action Log</p>
      </div>
      
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
        <AnimatePresence>
          {entries.map((entry, idx) => {
            const isLatest = idx === 0;
            const rewardColor = entry.reward > 0.7 ? "text-success" : entry.reward > 0.4 ? "text-warning" : "text-destructive";
            
            return (
              <motion.div
                key={`${entry.step}-${idx}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "rounded-lg px-3 py-2.5 border transition-all",
                  isLatest 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-secondary/50 border-transparent"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={cn(
                      "text-xs font-mono shrink-0 w-6 h-6 rounded flex items-center justify-center",
                      isLatest ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {entry.step}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      {entry.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {entry.timestamp && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {entry.timestamp}
                      </span>
                    )}
                    <span className={cn("text-sm font-bold tabular-nums", rewardColor)}>
                      {entry.reward.toFixed(2)}
                    </span>
                  </div>
                </div>
                {entry.details && (
                  <p className="text-xs text-muted-foreground mt-1.5 truncate pl-8">
                    {entry.details}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {entries.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No actions yet
          </div>
        )}
      </div>
    </div>
  );
}
