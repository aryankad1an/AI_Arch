import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string) => void;
  clearApiKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      geminiApiKey: null,
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      clearApiKey: () => set({ geminiApiKey: null }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
