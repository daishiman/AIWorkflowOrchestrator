import { describe, it, expect, beforeEach } from "vitest";
import { createDashboardSlice, type DashboardSlice } from "./dashboardSlice";
import type { DashboardStats, ActivityItem } from "../types";

describe("dashboardSlice", () => {
  let store: DashboardSlice;
  let mockSet: (
    fn:
      | ((state: DashboardSlice) => Partial<DashboardSlice>)
      | Partial<DashboardSlice>,
  ) => void;

  beforeEach(() => {
    const state: Partial<DashboardSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<DashboardSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createDashboardSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  const mockStats: DashboardStats = {
    totalDocs: 100,
    ragIndexed: 80,
    pending: 20,
    storageUsed: 500,
    storageTotal: 1000,
  };

  const mockActivity: ActivityItem = {
    id: "activity-1",
    message: "File uploaded",
    time: "2024-01-15T10:00:00",
    type: "success",
  };

  describe("初期状態", () => {
    it("dashboardStatsがデフォルト値である", () => {
      expect(store.dashboardStats).toEqual({
        totalDocs: 0,
        ragIndexed: 0,
        pending: 0,
        storageUsed: 0,
        storageTotal: 1000,
      });
    });

    it("activityFeedが空配列である", () => {
      expect(store.activityFeed).toEqual([]);
    });

    it("isLoadingがfalseである", () => {
      expect(store.isLoading).toBe(false);
    });
  });

  describe("setDashboardStats", () => {
    it("統計情報を設定する", () => {
      store.setDashboardStats(mockStats);
      expect(store.dashboardStats).toEqual(mockStats);
    });

    it("部分的な更新で全体を置き換える", () => {
      store.setDashboardStats(mockStats);
      store.setDashboardStats({
        ...mockStats,
        totalDocs: 150,
      });
      expect(store.dashboardStats.totalDocs).toBe(150);
    });
  });

  describe("setActivityFeed", () => {
    it("アクティビティフィードを設定する", () => {
      const activities = [mockActivity];
      store.setActivityFeed(activities);
      expect(store.activityFeed).toEqual(activities);
    });

    it("空配列を設定できる", () => {
      store.setActivityFeed([mockActivity]);
      store.setActivityFeed([]);
      expect(store.activityFeed).toEqual([]);
    });
  });

  describe("addActivity", () => {
    it("アクティビティを先頭に追加する", () => {
      const activity1 = { ...mockActivity, id: "1" };
      const activity2 = { ...mockActivity, id: "2" };
      store.addActivity(activity1);
      store.addActivity(activity2);
      expect(store.activityFeed[0].id).toBe("2");
      expect(store.activityFeed[1].id).toBe("1");
    });

    it("50件を超えると古いものを削除する", () => {
      // 51件追加
      for (let i = 0; i < 51; i++) {
        store.addActivity({ ...mockActivity, id: `activity-${i}` });
      }
      expect(store.activityFeed).toHaveLength(50);
      // 最初に追加したものは削除されている
      expect(
        store.activityFeed.find((a) => a.id === "activity-0"),
      ).toBeUndefined();
      // 最後に追加したものは存在する
      expect(store.activityFeed[0].id).toBe("activity-50");
    });
  });

  describe("setIsLoading", () => {
    it("ローディング状態をtrueに設定する", () => {
      store.setIsLoading(true);
      expect(store.isLoading).toBe(true);
    });

    it("ローディング状態をfalseに設定する", () => {
      store.setIsLoading(true);
      store.setIsLoading(false);
      expect(store.isLoading).toBe(false);
    });
  });
});
