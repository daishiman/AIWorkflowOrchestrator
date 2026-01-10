/**
 * 同期マネージャー
 * structure.mdとindex.html間の同期状態を管理する
 * @module main/slide/sync-manager
 */

import type { SyncStatus, SkillExecutionResult } from "@repo/shared";
import { checkDependency, bothFilesExist } from "@repo/shared";
import { createSkillExecutor, SkillExecutor } from "./skill-executor";

/**
 * 同期方向
 */
export type SyncDirection = "forward" | "reverse";

/**
 * 同期ステータスイベントペイロード
 */
export interface SyncStatusEvent {
  status: SyncStatus | "syncing";
  direction: SyncDirection;
  projectPath?: string;
  timestamp: number;
}

/**
 * 逆同期結果
 */
export interface ReverseSyncResult extends SkillExecutionResult {
  changes?: Array<{
    type: "modify" | "add" | "delete";
    section: string;
    before?: string;
    after?: string;
  }>;
}

/**
 * 同期マネージャーインターフェース
 */
export interface SyncManager {
  /** 同期状態を取得する */
  getStatus(projectPath: string): Promise<SyncStatus>;
  /** 手動同期を実行する（順方向: structure.md → index.html） */
  sync(projectPath: string): Promise<void>;
  /** 逆同期を実行する（逆方向: index.html → structure.md） */
  reverseSync(projectPath: string): Promise<ReverseSyncResult>;
  /** 自動同期を有効/無効にする */
  setAutoSync(enabled: boolean): void;
  /** 自動同期が有効かどうか */
  isAutoSyncEnabled(): boolean;
  /** 進捗コールバックを登録 */
  onProgress(callback: (progress: number) => void): void;
  /** ステータス変更コールバックを登録 */
  onStatusChange(callback: (status: SyncStatusEvent) => void): void;
  /** キャンセルする */
  cancel(): void;
}

/**
 * 同期マネージャーを作成する
 * @param executor オプションのスキル実行器（テスト用）
 * @returns SyncManagerインスタンス
 */
export const createSyncManager = (executor?: SkillExecutor): SyncManager => {
  let autoSyncEnabled = true;
  const skillExecutor = executor ?? createSkillExecutor();
  const statusCallbacks: Array<(status: SyncStatusEvent) => void> = [];

  /**
   * ステータス変更を通知する
   */
  const emitStatusChange = (
    status: SyncStatus | "syncing",
    direction: SyncDirection,
    projectPath?: string,
  ): void => {
    const event: SyncStatusEvent = {
      status,
      direction,
      projectPath,
      timestamp: Date.now(),
    };
    statusCallbacks.forEach((cb) => cb(event));
  };

  return {
    async getStatus(projectPath) {
      const structurePath = `${projectPath}/structure.md`;
      const htmlPath = `${projectPath}/index.html`;

      // 両方のファイルが存在するかチェック
      const filesExist = await bothFilesExist(structurePath, htmlPath);
      if (!filesExist) {
        return "error";
      }

      // 依存関係をチェック
      const inSync = await checkDependency(structurePath, htmlPath);
      return inSync ? "synced" : "out-of-sync";
    },

    async sync(projectPath) {
      // ステータスを通知
      emitStatusChange("syncing", "forward", projectPath);

      try {
        // html生成スキルを実行して同期
        const result = await skillExecutor.execute("html", projectPath);
        if (!result.success) {
          emitStatusChange("error", "forward", projectPath);
          throw new Error(result.error ?? "Sync failed");
        }

        emitStatusChange("synced", "forward", projectPath);
      } catch (error) {
        emitStatusChange("error", "forward", projectPath);
        throw error;
      }
    },

    async reverseSync(projectPath): Promise<ReverseSyncResult> {
      // ステータスを通知
      emitStatusChange("syncing", "reverse", projectPath);

      try {
        // modifier skillを実行して逆同期
        const result = await skillExecutor.execute("modifier", projectPath);

        if (!result.success) {
          emitStatusChange("error", "reverse", projectPath);
          throw new Error(result.error ?? "Reverse sync failed");
        }

        emitStatusChange("synced", "reverse", projectPath);

        // 結果を型変換して返す
        return result as ReverseSyncResult;
      } catch (error) {
        emitStatusChange("error", "reverse", projectPath);
        throw error;
      }
    },

    setAutoSync(enabled) {
      autoSyncEnabled = enabled;
    },

    isAutoSyncEnabled() {
      return autoSyncEnabled;
    },

    onProgress(callback) {
      skillExecutor.onProgress(callback);
    },

    onStatusChange(callback) {
      statusCallbacks.push(callback);
    },

    cancel() {
      skillExecutor.cancel();
    },
  };
};
