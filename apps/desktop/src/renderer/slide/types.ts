/**
 * Slide UI 型定義
 * @module renderer/slide/types
 */

import type { SyncStatus } from "@repo/shared";

/** UI 表示状態（SyncStatus とは独立した UI レイヤーの状態） */
export type SlideUIStatus = "synced" | "running" | "degraded" | "guidance";

/** ガイダンスバリアント */
export type GuidanceVariant = "guidance" | "degraded";

/** ガイダンス手順 */
export interface GuidanceStep {
  label: string;
  description: string;
}

/**
 * SlideUIStatus 導出ロジック
 * 優先順位: guidance > degraded > running > synced
 */
export function deriveSlideUIStatus(
  syncStatus: SyncStatus,
  isExecuting: boolean,
  hasHandoff: boolean,
  error: string | null,
): SlideUIStatus {
  if (hasHandoff) return "guidance";
  if (error !== null || syncStatus === "error") return "degraded";
  if (isExecuting || syncStatus === "syncing") return "running";
  return "synced";
}
