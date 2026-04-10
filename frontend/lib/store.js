import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePerFinStore = create(
  persist(
    (set) => ({
      profile: null,
      analysis: null,
      setProfile: (p) => set({ profile: p }),
      setAnalysis: (a) => set({ analysis: a }),
      reset: () => set({ profile: null, analysis: null }),
    }),
    {
      name: 'perfin-storage',
    }
  )
);
