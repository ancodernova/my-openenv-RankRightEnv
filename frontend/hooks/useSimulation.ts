"use client";
import { useState, useCallback, useEffect } from "react";
import { SimulationState, TaskDifficulty } from "@/lib/types";
import { resetSimulation, stepSimulation, getState } from "@/lib/api";

const STORAGE_KEY = "rankright_simulation_state";

export function useSimulation() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepping, setStepping] = useState(false);

  // Persist state to sessionStorage
  useEffect(() => {
    if (state) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state]);

  // Rehydrate from sessionStorage on mount
  useEffect(() => {
    if (!state) {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          setState(JSON.parse(stored));
        }
      } catch {}
    }
  }, []);

  const reset = useCallback(async (task: TaskDifficulty) => {
    setLoading(true);
    setError(null);
    try {
      const newState = await resetSimulation(task);
      setState(newState);
      return newState;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const step = useCallback(async (action?: Record<string, unknown>) => {
    if (!state || state.done) return null;
    setStepping(true);
    setError(null);
    try {
      const newState = await stepSimulation(action);
      setState(newState);
      return newState;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to step");
      return null;
    } finally {
      setStepping(false);
    }
  }, [state]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const newState = await getState();
      setState(newState);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch state");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setState(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { state, setState, loading, error, stepping, reset, step, refresh, clear };
}
