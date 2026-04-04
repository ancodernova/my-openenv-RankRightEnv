"use client";

import { motion } from "framer-motion";
import { 
  Layers, 
  Trophy, 
  AlertTriangle, 
  CheckCircle2,
  Play,
  Loader2,
  Radio,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  task: string;
  step: number;
  reward: number;
  done: boolean;
  violations?: string[];
  stepping?: boolean;
  onStep?: () => void;
  onFinalize?: () => void;
}

export default function SimulationHeader({ 
  task, 
  step, 
  reward, 
  done, 
  violations,
  stepping,
  onStep,
  onFinalize
}: Props) {
  const hasViolations = (violations?.length ?? 0) > 0;

  const taskConfig = {
    easy: { gradient: "from-emerald-500 to-green-400", text: "text-emerald-500", bg: "bg-emerald-500/10" },
    medium: { gradient: "from-amber-500 to-yellow-400", text: "text-amber-500", bg: "bg-amber-500/10" },
    hard: { gradient: "from-rose-500 to-red-400", text: "text-rose-500", bg: "bg-rose-500/10" },
  };

  const config = taskConfig[task as keyof typeof taskConfig] || taskConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left side - Task and Step */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_2px_hsl(var(--success)/0.5)]"
              />
              <Radio className="w-4 h-4 text-success" />
              <span className="text-xs font-bold text-success uppercase tracking-wide">
                Live
              </span>
            </div>

            <div className="w-px h-8 bg-border hidden sm:block" />

            {/* Task badge */}
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <Layers className={cn("w-4 h-4", config.text)} />
              </div>
              <div>
                <p className="section-label">Task</p>
                <p className={cn("font-bold uppercase text-sm", config.text)}>
                  {task || "N/A"}
                </p>
              </div>
            </div>

            <div className="w-px h-8 bg-border hidden sm:block" />

            {/* Step counter */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="section-label">Step</p>
                <motion.p
                  key={step}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-foreground text-sm tabular-nums"
                >
                  {step}
                </motion.p>
              </div>
            </div>

            <div className="w-px h-8 bg-border hidden sm:block" />

            {/* Reward */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                reward > 0.7 ? "bg-success/10" : reward > 0.4 ? "bg-warning/10" : "bg-destructive/10"
              )}>
                <Trophy className={cn(
                  "w-4 h-4",
                  reward > 0.7 ? "text-success" : reward > 0.4 ? "text-warning" : "text-destructive"
                )} />
              </div>
              <div>
                <p className="section-label">Reward</p>
                <motion.p
                  key={reward}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "font-bold text-sm tabular-nums",
                    reward > 0.7 ? "text-success" : reward > 0.4 ? "text-warning" : "text-destructive"
                  )}
                >
                  {(reward ?? 0).toFixed(3)}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Right side - Status and Actions */}
          <div className="flex items-center gap-3">
            {hasViolations && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </motion.div>
                <span className="text-xs font-semibold text-destructive">
                  {violations!.length} Violation{violations!.length > 1 ? "s" : ""}
                </span>
              </motion.div>
            )}

            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20"
              >
                <CheckCircle2 className="w-4 h-4 text-warning" />
                <span className="text-xs font-bold text-warning">
                  Complete
                </span>
              </motion.div>
            )}

            {/* Action buttons */}
            {onStep && onFinalize && (
              <>
                <div className="w-px h-8 bg-border hidden sm:block" />
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStep}
                  disabled={stepping || done}
                  className={cn(
                    "btn btn-primary btn-sm",
                    (stepping || done) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {stepping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Stepping...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span className="hidden sm:inline">Next Step</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onFinalize}
                  disabled={stepping}
                  className={cn(
                    "btn btn-sm bg-success text-success-foreground hover:bg-success/90 shadow-md",
                    stepping && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Finalize</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
