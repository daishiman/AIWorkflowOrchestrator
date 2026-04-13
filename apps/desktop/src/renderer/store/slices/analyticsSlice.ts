/**
 * analyticsSlice - renderer-side スキル実行ライフサイクル計装
 *
 * UT-W3-ANALYTICS-STORE-INTEGRATION-001
 *
 * スキル実行の開始・完了・エラーを analyticsAdapter へ直接送信する
 * action-only の Zustand slice。state は保持しない。
 *
 * 依存方向: analyticsSlice → analyticsAdapter → IPC → Main プロセス
 * 循環依存禁止: trackEvent を import しない
 */
import { create } from "zustand";
import { getAnalyticsAdapter } from "../../utils/analyticsAdapter";
import type { SkillAnalyticsEvent } from "@repo/shared";

// =============================================================================
// 型定義
// =============================================================================

interface AnalyticsActions {
  /** スキル実行開始を analyticsAdapter へ送信する */
  trackSkillStart: (skillId: string) => void;
  /** スキル実行完了を analyticsAdapter へ送信する */
  trackSkillComplete: (skillId: string, duration: number) => void;
  /** スキル実行エラーを analyticsAdapter へ送信する */
  trackSkillError: (skillId: string, error: string | Error) => void;
}

/** analyticsSlice の型（state なし、action のみ） */
type AnalyticsSlice = AnalyticsActions;

// =============================================================================
// ヘルパー関数
// =============================================================================

/** ISO 8601 形式のタイムスタンプを生成する */
function nowISO(): string {
  return new Date().toISOString();
}

/** Error オブジェクトまたは文字列からエラーメッセージを取得する */
function toErrorMessage(error: string | Error): string {
  return error instanceof Error ? error.message : error;
}

/** SkillAnalyticsEvent を analyticsAdapter 送信用の record に変換する */
function toAnalyticsPayload(
  event: SkillAnalyticsEvent,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: event.type,
    skillId: event.skillId,
    timestamp: event.timestamp,
  };

  if (event.duration !== undefined) {
    payload.duration = event.duration;
  }

  if (event.error !== undefined) {
    payload.error = event.error;
  }

  return payload;
}

/** analyticsAdapter へ安全に送信する */
function sendSkillAnalyticsEvent(
  eventName: "skill_start" | "skill_complete" | "skill_error",
  event: SkillAnalyticsEvent,
): void {
  try {
    getAnalyticsAdapter().send(eventName, toAnalyticsPayload(event));
  } catch {
    // analyticsAdapter の送信失敗は UI を壊さない
  }
}

// =============================================================================
// Zustand store
// =============================================================================

/**
 * useAnalyticsStore - renderer-side スキル実行ライフサイクル計装ストア
 *
 * @example
 * const { trackSkillStart } = useAnalyticsStore.getState();
 * trackSkillStart("my-skill-id");
 */
export const useAnalyticsStore = create<AnalyticsSlice>()(() => ({
  trackSkillStart(skillId: string): void {
    const event: SkillAnalyticsEvent = {
      type: "start",
      skillId,
      timestamp: nowISO(),
    };
    sendSkillAnalyticsEvent("skill_start", event);
  },

  trackSkillComplete(skillId: string, duration: number): void {
    const event: SkillAnalyticsEvent = {
      type: "complete",
      skillId,
      timestamp: nowISO(),
      duration,
    };
    sendSkillAnalyticsEvent("skill_complete", event);
  },

  trackSkillError(skillId: string, error: string | Error): void {
    const event: SkillAnalyticsEvent = {
      type: "error",
      skillId,
      timestamp: nowISO(),
      error: toErrorMessage(error),
    };
    sendSkillAnalyticsEvent("skill_error", event);
  },
}));
