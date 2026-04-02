"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Play,
  Zap,
  Shield,
  BarChart3,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Lock,
  Target,
} from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { TaskDifficulty } from "@/lib/types";
import { cn } from "@/lib/utils";

const TASK_INFO = {
  easy: {
    label: "Easy",
    desc: "Relaxed policy constraints. Most signals allowed. Ideal for exploring the environment.",
    icon: Sparkles,
    gradient: "from-emerald-500 to-green-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-500",
  },
  medium: {
    label: "Medium",
    desc: "Balanced constraints. Optional signals require consent. Diversity threshold enforced.",
    icon: Target,
    gradient: "from-amber-500 to-yellow-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-500",
  },
  hard: {
    label: "Hard",
    desc: "Strict policy. Many disallowed signals. High safety and diversity requirements.",
    icon: Lock,
    gradient: "from-rose-500 to-red-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-500",
  },
};

const FEATURES = [
  {
    icon: Shield,
    title: "Policy Compliance",
    desc: "Real-time policy violation detection",
  },
  {
    icon: BarChart3,
    title: "Reward Tracking",
    desc: "Multi-objective reward visualization",
  },
  {
    icon: Zap,
    title: "AI Agent Actions",
    desc: "Step-by-step decision analysis",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-6 right-6 z-50 p-3 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-primary" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

function FloatingOrb({ delay = 0, size = "lg", position = "top-left" }: { delay?: number; size?: "sm" | "md" | "lg"; position?: string }) {
  const sizes = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
  };

  const positions: Record<string, string> = {
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.1, 0.2, 0.1],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "absolute rounded-full blur-3xl pointer-events-none",
        sizes[size],
        positions[position],
        "bg-gradient-to-br from-primary/30 to-primary/10 dark:from-primary/20 dark:to-primary/5"
      )}
    />
  );
}

export default function LandingPage() {
  const [task, setTask] = useState<TaskDifficulty>("medium");
  const { reset, loading } = useSimulation();
  const router = useRouter();

  async function handleStart() {
    await reset(task);
    router.push("/simulation");
  }

  const info = TASK_INFO[task];
  const IconComponent = info.icon;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <ThemeToggle />

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb delay={0} size="lg" position="top-left" />
        <FloatingOrb delay={2} size="md" position="bottom-right" />
        <FloatingOrb delay={4} size="sm" position="top-right" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl relative z-10"
      >
        {/* Logo and title */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/25 mb-6"
          >
            <span className="text-4xl font-bold text-white">R</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-foreground">RankRight</span>
            <span className="gradient-text">Env</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            AI Governance Simulation Platform for testing ranking algorithms with policy compliance
          </p>
        </motion.div>

        {/* Features row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="card-base p-4 text-center hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Task selector card */}
        <motion.div variants={itemVariants} className="card-base p-6 mb-6">
          <p className="section-label mb-4">Select Task Difficulty</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {(Object.entries(TASK_INFO) as [TaskDifficulty, typeof info][]).map(
              ([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = task === key;

                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTask(key)}
                    className={cn(
                      "relative rounded-xl p-4 text-left transition-all duration-300 border-2",
                      isSelected
                        ? cn(cfg.bg, cfg.border, "shadow-lg")
                        : "bg-secondary/50 border-transparent hover:bg-secondary"
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="taskIndicator"
                        className="absolute inset-0 rounded-xl border-2 border-current opacity-50"
                        style={{ borderColor: "currentColor" }}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "w-6 h-6 mb-2",
                        isSelected ? cfg.text : "text-muted-foreground"
                      )}
                    />
                    <p
                      className={cn(
                        "font-bold text-sm",
                        isSelected ? cfg.text : "text-foreground"
                      )}
                    >
                      {cfg.label}
                    </p>
                  </motion.button>
                );
              }
            )}
          </div>

          {/* Task description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={task}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "rounded-lg p-4 mb-6 border",
                info.bg,
                info.border
              )}
            >
              <div className="flex items-start gap-3">
                <IconComponent className={cn("w-5 h-5 mt-0.5 shrink-0", info.text)} />
                <p className="text-sm text-foreground/80">{info.desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleStart}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3",
              "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25",
              "hover:shadow-xl hover:shadow-primary/30",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Initializing Environment...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Simulation
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>


      </motion.div>
    </main>
  );
}
