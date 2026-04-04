"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shield,
  Check,
  Minus,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import SignalTable from "@/components/SignalTable";
import { useSimulation } from "@/hooks/useSimulation";
import { MOCK_STATE } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type FilterType = "all" | "allowed" | "optional" | "disallowed" | "used" | "violations";

export default function SignalsPage() {
  const { state, setState } = useSimulation();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!state) setState(MOCK_STATE);
  }, [state, setState]);

  if (!state) return null;

  const allSignals = state.signals ?? [];

  const filteredSignals = allSignals.filter((sig) => {
    switch (filter) {
      case "allowed":
        return sig.status === "allowed";
      case "optional":
        return sig.status === "optional";
      case "disallowed":
        return sig.status === "disallowed";
      case "used":
        return sig.used;
      case "violations":
        return sig.status === "disallowed" && sig.used;
      default:
        return true;
    }
  });

  const violations = allSignals.filter((s) => s.status === "disallowed" && s.used);
  const usedCount = allSignals.filter((s) => s.used).length;

  const filters: { key: FilterType; label: string; count: number; icon: React.ElementType; color?: string }[] = [
    { key: "all", label: "All", count: allSignals.length, icon: Radio },
    { key: "allowed", label: "Allowed", count: allSignals.filter((s) => s.status === "allowed").length, icon: CheckCircle2, color: "text-success" },
    { key: "optional", label: "Optional", count: allSignals.filter((s) => s.status === "optional").length, icon: AlertCircle, color: "text-warning" },
    { key: "disallowed", label: "Disallowed", count: allSignals.filter((s) => s.status === "disallowed").length, icon: XCircle, color: "text-destructive" },
    { key: "used", label: "Used", count: usedCount, icon: Check, color: "text-primary" },
    { key: "violations", label: "Violations", count: violations.length, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <div className="h-16" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-4 lg:p-6"
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Radio className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Signals</h1>
              </div>
              <p className="text-muted-foreground">Privacy & data signal audit</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/simulation")}
              className="btn btn-outline btn-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Simulation
            </motion.button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Signals", value: allSignals.length, color: "text-foreground" },
              { label: "Currently Used", value: usedCount, color: "text-primary" },
              { label: "Consent Required", value: allSignals.filter((s) => s.requires_consent).length, color: "text-warning" },
              { label: "Violations", value: violations.length, color: violations.length > 0 ? "text-destructive" : "text-success" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-base p-4"
              >
                <p className="section-label mb-1">{stat.label}</p>
                <p className={cn("text-3xl font-bold tabular-nums", stat.color)}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Violation alert */}
          <AnimatePresence>
            {violations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl p-4 mb-6 flex items-start gap-3 bg-destructive/5 border border-destructive/20"
              >
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-destructive mb-1">Policy Violations Detected</p>
                  <p className="text-sm text-muted-foreground">
                    {violations.map((v) => v.name.replace(/_/g, " ")).join(", ")}{" "}
                    {violations.length === 1 ? "is" : "are"} disallowed but currently in use.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {filters.map((f) => {
              const Icon = f.icon;
              const isActive = filter === f.key;

              return (
                <motion.button
                  key={f.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border",
                    isActive
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? f.color || "text-primary" : "")} />
                  {f.label}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-xs font-bold",
                    isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  )}>
                    {f.count}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base overflow-hidden"
          >
            <SignalTable signals={filteredSignals} />
            {filteredSignals.length === 0 && (
              <div className="text-center py-12">
                <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No signals match this filter.</p>
              </div>
            )}
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 card-base p-5"
          >
            <p className="section-label mb-4">Legend</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">Allowed signal</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-warning" />
                </div>
                <span className="text-sm text-muted-foreground">Consent required</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">Signal is in use</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                  <Minus className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Signal not used</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground">Policy violation (disallowed but used)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Policy compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
