"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { currentPeriod } from "@/lib/format";

interface UiStore {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      selectedPeriod: currentPeriod(),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "harcama-analiz-ui" },
  ),
);
