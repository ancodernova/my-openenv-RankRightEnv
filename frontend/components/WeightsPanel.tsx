"use client";

import { motion } from "framer-motion";
import { Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  weights: Record<string, number>;
  onWeightChange: (key: string, value: number) => void;
}

export default function WeightsPanel({ weights, onWeightChange }: Props) {
  const weightKeys = Object.keys(weights);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sliders className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Ranking Weights</h3>
      </div>

      <div className="space-y-4">
        {weightKeys.map((key, idx) => {
          const value = weights[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {Math.round(value * 100)}%
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value}
                  onChange={(e) => onWeightChange(key, parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--primary));
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--primary));
        }
      `}</style>
    </motion.div>
  );
}