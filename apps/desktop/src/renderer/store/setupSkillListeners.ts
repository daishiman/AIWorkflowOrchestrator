/**
 * @file setupSkillListeners - スキル関連IPCリスナーのセットアップ
 * @description Zustand storeに対してスキル関連IPCイベントのリスナーを登録する
 * @feature TASK-FIX-6-1-STATE-CENTRALIZATION
 * @see phase-5-implementation.md Task 5-4
 */

import type { StoreApi } from "zustand";
import type { AgentSlice } from "./slices/agentSlice";
import type { SkillStreamMessage, SkillPermissionRequest } from "@repo/shared";
import { useAppStore } from "./index";

/**
 * スキル関連IPCリスナーを設定（StoreApi版）
 *
 * @param store Zustandストアインスタンス
 * @returns クリーンアップ関数
 *
 * @example
 * ```typescript
 * // ストアインスタンスを渡してリスナーを設定
 * const cleanup = setupSkillListenersWithStore(useAppStore);
 *
 * // アプリ終了時にクリーンアップ
 * cleanup();
 * ```
 */
export function setupSkillListenersWithStore(
  store: StoreApi<AgentSlice>,
): () => void {
  // SSRや非Electron環境では何もしない
  if (typeof window === "undefined" || !window.electronAPI?.skill) {
    return () => {};
  }

  const { getState } = store;

  // ストリーミングメッセージリスナー
  const unsubStream = window.electronAPI.skill.onStream?.(
    (msg: SkillStreamMessage) => {
      getState()._handleStreamMessage(msg);
    },
  );

  // 完了リスナー
  const unsubComplete = window.electronAPI.skill.onComplete?.(
    (data: { executionId: string }) => {
      getState()._handleComplete(data.executionId);
    },
  );

  // エラーリスナー
  const unsubError = window.electronAPI.skill.onError?.(
    (data: { executionId: string; error: string }) => {
      getState()._handleError(data.executionId, data.error);
    },
  );

  // 権限リクエストリスナー
  const unsubPermission = window.electronAPI.skill.onPermissionRequest?.(
    (req: SkillPermissionRequest) => {
      getState()._handlePermissionRequest(req);
    },
  );

  // クリーンアップ関数を返す
  return () => {
    unsubStream?.();
    unsubComplete?.();
    unsubError?.();
    unsubPermission?.();
  };
}

/**
 * スキル関連のIPCイベントリスナーを設定
 * @returns クリーンアップ関数（リスナー解除用）
 * @deprecated setupSkillListenersWithStore を使用してください
 */
export function setupSkillListeners(): () => void {
  // APIが利用可能かチェック
  if (typeof window === "undefined" || !window.electronAPI?.skill) {
    return () => {};
  }

  const store = useAppStore.getState();

  // ストリーミングメッセージのリスナー
  const unsubStream = window.electronAPI.skill.onStream?.(
    store._handleStreamMessage as (message: unknown) => void,
  );

  // 完了イベントのリスナー
  const unsubComplete = window.electronAPI.skill.onComplete?.(
    ({ executionId }) => store._handleComplete(executionId),
  );

  // エラーイベントのリスナー
  const unsubError = window.electronAPI.skill.onError?.(
    ({ executionId, error }) => store._handleError(executionId, error),
  );

  // 権限リクエストイベントのリスナー
  const unsubPermission = window.electronAPI.skill.onPermissionRequest?.(
    store._handlePermissionRequest,
  );

  // クリーンアップ関数を返す
  return () => {
    unsubStream?.();
    unsubComplete?.();
    unsubError?.();
    unsubPermission?.();
  };
}
