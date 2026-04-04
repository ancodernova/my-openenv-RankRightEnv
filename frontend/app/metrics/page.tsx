"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  ArrowLeft,
  Trophy,
  Users,
  Target,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Radio,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import RewardPanel from "@/components/RewardPanel";
import { useSimulation } from "@/hooks/useSimulation";
import { MOCK_STATE } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function RadialScore({
  value,
  label,
  icon: Icon,
  color,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  const pct = Math.round(value * 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 mb-1" style={{ color }} />
          <span className="text-2xl font-bold" style={{ color }}>
            {pct}
          </span>
        </div>
      </div>
      <span className="section-label text-center">{label}</span>
    </motion.div>
  );
}

function ViolationList({ violations }: { violations: string[] }) {
  if (violations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 flex items-center gap-3 bg-success/5 border border-success/20"
      >
        <CheckCircle2 className="w-5 h-5 text-success" />
        <p className="text-sm font-medium text-success">No policy violations detected</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {violations.map((v, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl p-4 flex items-start gap-3 bg-destructive/5 border border-destructive/20"
        >
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-destructive">{v}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function MetricsPage() {
  const { state, setState } = useSimulation();
  const router = useRouter();

  useEffect(() => {
    if (!state) setState(MOCK_STATE);
  }, [state, setState]);

  if (!state) return null;

  const bd = state.reward_breakdown;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <div className="h-16" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-4 lg:p-6"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Metrics Dashboard</h1>
              </div>
              <p className="text-muted-foreground">
                Step {state.step} | Task:{" "}
                <span className="font-semibold text-primary capitalize">{state.task}</span>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/simulation")}
              className="btn btn-outline btn-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Simulation
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Main metrics */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Radial scores */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-base p-6"
              >
                <p className="section-label mb-6">Score Breakdown</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <RadialScore
                    value={state.reward}
                    label="Total Reward"
                    icon={Trophy}
                    color="hsl(var(--primary))"
                  />
                  <RadialScore
                    value={bd?.engagement ?? 0}
                    label="Engagement"
                    icon={Users}
                    color="hsl(var(--success))"
                  />
                  <RadialScore
                    value={bd?.diversity ?? 0}
                    label="Diversity"
                    icon={Target}
                    color="hsl(var(--warning))"
                  />
                  <RadialScore
                    value={bd?.safety ?? 0}
                    label="Safety"
                    icon={Shield}
                    color="hsl(var(--success))"
                  />
                </div>
              </motion.div>

              {/* Policy Compliance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-base p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="section-label">Policy Compliance</p>
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      (bd?.policy_compliance ?? 0) > 0.7
                        ? "text-success"
                        : (bd?.policy_compliance ?? 0) > 0.4
                        ? "text-warning"
                        : "text-destructive"
                    )}
                  >
                    {Math.round((bd?.policy_compliance ?? 0) * 100)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-secondary mb-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((bd?.policy_compliance ?? 0) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      (bd?.policy_compliance ?? 0) > 0.7
                        ? "bg-success"
                        : (bd?.policy_compliance ?? 0) > 0.4
                        ? "bg-warning"
                        : "bg-destructive"
                    )}
                  />
                </div>
                <p className="section-label mb-3">Violation Audit</p>
                <ViolationList violations={state.violations ?? []} />
              </motion.div>

              {/* Feed Risk Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-base p-6"
              >
                <p className="section-label mb-4">Feed Risk Distribution</p>
                <div className="grid grid-cols-3 gap-4">
                  {(["low", "medium", "high"] as const).map((level, idx) => {
                    const count = state.feed.filter((f) => f.risk_level === level).length;
                    const pct =
                      state.feed.length > 0 ? Math.round((count / state.feed.length) * 100) : 0;
                    const config = {
                      low: {
                        icon: ShieldCheck,
                        color: "text-success",
                        bg: "bg-success/10",
                        border: "border-success/20",
                        label: "Low Risk",
                      },
                      medium: {
                        icon: ShieldAlert,
                        color: "text-warning",
                        bg: "bg-warning/10",
                        border: "border-warning/20",
                        label: "Med Risk",
                      },
                      high: {
                        icon: ShieldX,
                        color: "text-destructive",
                        bg: "bg-destructive/10",
                        border: "border-destructive/20",
                        label: "High Risk",
                      },
                    };
                    const c = config[level];
                    const Icon = c.icon;

                    return (
                      <motion.div
                        key={level}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn("rounded-xl p-4 text-center border", c.bg, c.border)}
                      >
                        <Icon className={cn("w-6 h-6 mx-auto mb-2", c.color)} />
                        <p className={cn("text-3xl font-bold", c.color)}>{count}</p>
                        <p className={cn("section-label mt-1", c.color)}>{c.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{pct}% of feed</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right: Reward panel + Signal summary */}
            <div className="flex flex-col gap-6">
              <RewardPanel reward={state.reward} breakdown={state.reward_breakdown} step={state.step} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-base p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-4 h-4 text-primary" />
                  <p className="font-bold text-foreground">Signal Usage</p>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: "Used",
                      count: state.signals.filter((s) => s.used).length,
                      color: "text-success",
                      bg: "bg-success/10",
                    },
                    {
                      label: "Available",
                      count: state.signals.filter((s) => !s.used && s.status !== "disallowed")
                        .length,
                      color: "text-muted-foreground",
                      bg: "bg-secondary",
                    },
                    {
                      label: "Disallowed",
                      count: state.signals.filter((s) => s.status === "disallowed").length,
                      color: "text-destructive",
                      bg: "bg-destructive/10",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="section-label">{row.label}</span>
                      <span className={cn("text-lg font-bold tabular-nums", row.color)}>
                        {row.count}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
