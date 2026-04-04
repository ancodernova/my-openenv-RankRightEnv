"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Radio, 
  Lightbulb,
  Loader2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  step: number;
  done: boolean;
  stepping: boolean;
  onStep: () => void;
  onFinalize: () => void;
}

export default function StepControls({ step, done, stepping, onStep, onFinalize }: Props) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left side - Step info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="section-label">Current Step</p>
                <motion.p
                  key={step}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-foreground tabular-nums"
                >
                  {step}
                </motion.p>
              </div>
            </div>
            
            {done && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="badge badge-warning"
              >
                Episode Complete
              </motion.span>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick nav buttons */}
            <div className="hidden md:flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/signals")}
                className="btn btn-ghost btn-sm"
              >
                <Radio className="w-4 h-4" />
                Signals
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/metrics")}
                className="btn btn-ghost btn-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Metrics
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/explain")}
                className="btn btn-ghost btn-sm"
              >
                <Lightbulb className="w-4 h-4" />
                Explain
              </motion.button>
            </div>

            <div className="w-px h-8 bg-border hidden md:block" />

            {/* Main action buttons */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStep}
              disabled={stepping || done}
              className={cn(
                "btn btn-primary btn-md min-w-[140px]",
                (stepping || done) && "opacity-50 cursor-not-allowed"
              )}
            >
              {stepping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Stepping...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Next Step
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onFinalize}
              disabled={stepping}
              className={cn(
                "btn btn-md bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-lg",
                stepping && "opacity-50 cursor-not-allowed"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              Finalize
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
