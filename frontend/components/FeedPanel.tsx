"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutList,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingUp,
  Hash,
} from "lucide-react";
import { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  feed: ContentItem[];
}

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const config = {
    low: {
      icon: ShieldCheck,
      text: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
      label: "Low",
    },
    medium: {
      icon: ShieldAlert,
      text: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
      label: "Med",
    },
    high: {
      icon: ShieldX,
      text: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      label: "High",
    },
  };

  const c = config[level] || config.low;
  const Icon = c.icon;

  return (
    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md border", c.bg, c.border)}>
      <Icon className={cn("w-3 h-3", c.text)} />
      <span className={cn("text-xs font-semibold", c.text)}>{c.label}</span>
    </div>
  );
}

function ScoreBar({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-8 text-right">
        {Math.round(value * 100)}
      </span>
    </div>
  );
}

export default function FeedPanel({ feed }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-base p-5 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutList className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-foreground">Recommended Feed</h3>
        </div>
        <span className="badge badge-muted">{feed.length} items</span>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col gap-3 overflow-y-auto min-h-0">
        <AnimatePresence>
          {feed.map((item, idx) => (
            <motion.div
              key={item.id ?? idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="rounded-xl p-4 bg-secondary/50 border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                    <Hash className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {item.topic}
                    </p>
                    {item.category && (
                      <span className="text-xs text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
                <RiskBadge level={item.risk_level} />
              </div>

              <div className="space-y-2">
                <ScoreBar value={item.score} color="hsl(var(--primary))" label="Score" />
                {item.engagement_score !== undefined && (
                  <ScoreBar value={item.engagement_score} color="hsl(var(--success))" label="Engage" />
                )}
                {item.safety_score !== undefined && (
                  <ScoreBar
                    value={item.safety_score}
                    color={
                      item.safety_score > 0.7
                        ? "hsl(var(--success))"
                        : item.safety_score > 0.4
                        ? "hsl(var(--warning))"
                        : "hsl(var(--destructive))"
                    }
                    label="Safety"
                  />
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  Rank #{item.rank ?? idx + 1}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  {Math.round(item.score * 100)}pts
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {feed.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <LayoutList className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              No feed items yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Start the simulation to generate content
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}