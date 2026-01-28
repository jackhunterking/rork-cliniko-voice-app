/**
 * Settings Store
 * Zustand store for app settings including Medical mode toggle
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  /** Medical mode enables PII redaction in transcription */
  medicalModeEnabled: boolean;
  
  /** Toggle medical mode */
  toggleMedicalMode: () => void;
  
  /** Set medical mode explicitly */
  setMedicalMode: (enabled: boolean) => void;
  
  /** Reset all settings to defaults */
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  medicalModeEnabled: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      toggleMedicalMode: () => {
        set((state) => ({
          medicalModeEnabled: !state.medicalModeEnabled,
        }));
      },

      setMedicalMode: (enabled: boolean) => {
        set({ medicalModeEnabled: enabled });
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'cliniko-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        medicalModeEnabled: state.medicalModeEnabled,
      }),
    }
  )
);
