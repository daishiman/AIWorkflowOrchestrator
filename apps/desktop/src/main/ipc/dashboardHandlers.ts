import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  DashboardGetStatsResponse,
  DashboardGetActivityRequest,
  DashboardGetActivityResponse,
  DashboardStats,
  ActivityItem,
} from "../../preload/types";

// Mock data - replace with real implementation
const mockStats: DashboardStats = {
  totalDocs: 1247,
  ragIndexed: 892,
  pending: 45,
  storageUsed: 12800,
  storageTotal: 51200,
};

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    message: "新しいドキュメントが追加されました",
    time: "2分前",
    type: "success",
  },
  {
    id: "2",
    message: "RAGインデックスが更新されました",
    time: "5分前",
    type: "info",
  },
  {
    id: "3",
    message: "ファイル同期が完了しました",
    time: "10分前",
    type: "success",
  },
  {
    id: "4",
    message: "ストレージ使用量が80%を超えました",
    time: "1時間前",
    type: "warning",
  },
  {
    id: "5",
    message: "バックアップが正常に完了しました",
    time: "2時間前",
    type: "success",
  },
];

export function registerDashboardHandlers(): void {
  // Get dashboard stats
  ipcMain.handle(
    IPC_CHANNELS.DASHBOARD_GET_STATS,
    async (): Promise<DashboardGetStatsResponse> => {
      try {
        // TODO: Replace with real data fetching
        return { success: true, data: mockStats };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Get activity feed
  ipcMain.handle(
    IPC_CHANNELS.DASHBOARD_GET_ACTIVITY,
    async (
      _event,
      request: DashboardGetActivityRequest,
    ): Promise<DashboardGetActivityResponse> => {
      try {
        const limit = request.limit || 10;
        const activities = mockActivities.slice(0, limit);
        return { success: true, data: activities };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}
