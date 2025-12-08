import { StateCreator } from "zustand";
import type { UserProfile } from "../types";

export interface SettingsSlice {
  // State
  userProfile: UserProfile;
  apiKey: string;
  autoSyncEnabled: boolean;

  // Actions
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setApiKey: (key: string) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
}

const defaultProfile: UserProfile = {
  name: "ユーザー",
  email: "",
  avatar: "",
  plan: "free",
};

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  // Initial state
  userProfile: defaultProfile,
  apiKey: "",
  autoSyncEnabled: true,

  // Actions
  setUserProfile: (profile) => {
    set({ userProfile: profile });
  },

  updateUserProfile: (updates) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...updates },
    }));
  },

  setApiKey: (key) => {
    set({ apiKey: key });
  },

  setAutoSyncEnabled: (enabled) => {
    set({ autoSyncEnabled: enabled });
  },
});
