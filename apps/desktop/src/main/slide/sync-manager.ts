/**
 * 同期マネージャー
 * structure.mdとindex.html間の同期状態を管理する
 * @module main/slide/sync-manager
 */

import type { SyncStatus } from "@repo/shared";
import { checkDependency, bothFilesExist } from "@repo/shared";
import { createSkillExecutor, SkillExecutor } from "./skill-executor";

/**
 * 同期マネージャーインターフェース
 */
export interface SyncManager {
  /** 同期状態を取得する */
  getStatus(projectPath: string): Promise<SyncStatus>;
  /** 手動同期を実行する */
  sync(projectPath: string): Promise<void>;
  /** 自動同期を有効/無効にする */
  setAutoSync(enabled: boolean): void;
  /** 自動同期が有効かどうか */
  isAutoSyncEnabled(): boolean;
  /** 進捗コールバックを登録 */
  onProgress(callback: (progress: number) => void): void;
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
      // html生成スキルを実行して同期
      const result = await skillExecutor.execute("html", projectPath);
      if (!result.success) {
        throw new Error(result.error ?? "Sync failed");
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

    cancel() {
      skillExecutor.cancel();
    },
  };
};
