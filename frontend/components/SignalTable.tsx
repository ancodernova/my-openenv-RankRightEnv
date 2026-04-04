"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, XCircle, AlertTriangle, Check, Minus } from "lucide-react";
import { Signal } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  signals: Signal[];
  compact?: boolean;
}

function StatusBadge({ status }: { status: Signal["status"] }) {
  const config = {
    allowed: { 
      icon: CheckCircle2, 
      text: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
      label: "Allowed" 
    },
    optional: { 
      icon: AlertCircle, 
      text: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
      label: "Optional" 
    },
    disallowed: { 
      icon: XCircle, 
      text: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      label: "Blocked" 
    },
  };

  const c = config[status] || config.allowed;
  const Icon = c.icon;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border", c.bg, c.border)}>
      <Icon className={cn("w-3 h-3", c.text)} />
      <span className={cn("text-xs font-semibold", c.text)}>{c.label}</span>
    </div>
  );
}

export default function SignalTable({ signals, compact = false }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 section-label font-semibold">Signal</th>
            <th className="text-left py-3 px-4 section-label font-semibold">Status</th>
            <th className="text-center py-3 px-4 section-label font-semibold">Consent</th>
            <th className="text-center py-3 px-4 section-label font-semibold">Used</th>
            {!compact && <th className="text-left py-3 px-4 section-label font-semibold">Value</th>}
          </tr>
        </thead>
        <tbody>
          {signals.map((sig, idx) => {
            const isViolation = sig.status === "disallowed" && sig.used;
            
            return (
              <motion.tr
                key={sig.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  isViolation ? "bg-destructive/5" : "hover:bg-secondary/50"
                )}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {isViolation && (
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <span className={cn(
                      "font-medium",
                      isViolation ? "text-destructive" : 
                      sig.status === "disallowed" ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {sig.name.replace(/_/g, " ")}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={sig.status} />
                </td>
                <td className="py-3 px-4 text-center">
                  {sig.requires_consent ? (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-warning/10">
                      <AlertCircle className="w-4 h-4 text-warning" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary">
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {sig.used ? (
                    <div className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full",
                      isViolation ? "bg-destructive/10" : "bg-success/10"
                    )}>
                      <Check className={cn(
                        "w-4 h-4",
                        isViolation ? "text-destructive" : "text-success"
                      )} />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary">
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </td>
                {!compact && (
                  <td className="py-3 px-4 text-muted-foreground font-mono text-sm">
                    {sig.value !== null && sig.value !== undefined
                      ? <span>{String(sig.value)}</span>
                      : <span className="italic">null</span>}
                  </td>
                )}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
