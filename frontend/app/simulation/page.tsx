"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSimulation } from "@/hooks/useSimulation";
import NavBar from "@/components/NavBar";
import SimulationHeader from "@/components/SimulationHeader";
import UserPanel from "@/components/UserPanel";
import PolicyPanel from "@/components/PolicyPanel";
import FeedPanel from "@/components/FeedPanel";
import AgentPanel from "@/components/AgentPanel";
import { MOCK_STATE } from "@/lib/mockData";

export default function SimulationPage() {
  const { state, setState, stepping, step, refresh } = useSimulation();
  const router = useRouter();

  useEffect(() => {
    if (!state) {
      setState(MOCK_STATE);
    }
  }, [state, setState]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStep = useCallback(async () => {
    await step();
  }, [step]);

  const handleFinalize = useCallback(() => {
    router.push("/metrics");
  }, [router]);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading simulation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16">
      
      {/* Navbar (fixed) */}
      <NavBar />

      {/* Header */}
      <SimulationHeader
        task={state.task || "medium"}
        step={state.step}
        reward={state.reward}
        done={state.done}
        violations={state.violations}
        stepping={stepping}
        onStep={handleStep}
        onFinalize={handleFinalize}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-4 lg:p-6"
      >
        <div className="max-w-7xl mx-auto w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-4 lg:gap-6">
            
            {/* LEFT */}
            <div className="flex flex-col gap-4">
              <UserPanel user={state.user} />
              <PolicyPanel policy={state.policy} />
            </div>

            {/* CENTER */}
            <div>
              <FeedPanel feed={state.feed} />
            </div>

            {/* RIGHT */}
            <div>
              <AgentPanel agent={state.agent} currentStep={state.step} />
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}