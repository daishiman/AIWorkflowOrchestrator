import { StateCreator } from "zustand";
import type { DashboardStats, ActivityItem } from "../types";

export interface DashboardSlice {
  // State
  dashboardStats: DashboardStats;
  activityFeed: ActivityItem[];
  isLoading: boolean;

  // Actions
  setDashboardStats: (stats: DashboardStats) => void;
  setActivityFeed: (activities: ActivityItem[]) => void;
  addActivity: (activity: ActivityItem) => void;
  setIsLoading: (loading: boolean) => void;
}

const defaultStats: DashboardStats = {
  totalDocs: 0,
  ragIndexed: 0,
  pending: 0,
  storageUsed: 0,
  storageTotal: 1000,
};

export const createDashboardSlice: StateCreator<
  DashboardSlice,
  [],
  [],
  DashboardSlice
> = (set) => ({
  // Initial state
  dashboardStats: defaultStats,
  activityFeed: [],
  isLoading: false,

  // Actions
  setDashboardStats: (stats) => {
    set({ dashboardStats: stats });
  },

  setActivityFeed: (activities) => {
    set({ activityFeed: activities });
  },

  addActivity: (activity) => {
    set((state) => ({
      activityFeed: [activity, ...state.activityFeed].slice(0, 50),
    }));
  },

  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },
});
