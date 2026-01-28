/**
 * @file setupSkillListeners - スキルIPCイベントリスナー設定
 * @description Main ProcessからのIPCイベントをSkillSliceに接続
 * @feature skill-import-agent-system
 */

import { useAppStore } from "./index";

/**
 * スキル関連のIPCイベントリスナーを設定
 * @returns クリーンアップ関数（リスナー解除用）
 */
export function setupSkillListeners(): () => void {
  // APIが利用可能かチェック
  if (typeof window === "undefined" || !window.electronAPI?.skill) {
    console.warn("Skill API not available, skipping listener setup");
    return () => {};
  }

  const store = useAppStore.getState();

  // ストリーミングメッセージのリスナー
  // TODO: TASK-7D で型定義を統一 (skill.ts と skill-execution.ts の SkillStreamMessage 型競合)
  const unsubStream = window.electronAPI.skill.onStream(
    store._handleStreamMessage as (message: unknown) => void,
  );

  // 完了イベントのリスナー
  const unsubComplete = window.electronAPI.skill.onComplete(({ executionId }) =>
    store._handleComplete(executionId),
  );

  // エラーイベントのリスナー
  const unsubError = window.electronAPI.skill.onError(
    ({ executionId, error }) => store._handleError(executionId, error),
  );

  // 権限リクエストイベントのリスナー
  const unsubPermission = window.electronAPI.skill.onPermissionRequest(
    store._handlePermissionRequest,
  );

  // クリーンアップ関数を返す
  return () => {
    unsubStream();
    unsubComplete();
    unsubError();
    unsubPermission();
  };
}
