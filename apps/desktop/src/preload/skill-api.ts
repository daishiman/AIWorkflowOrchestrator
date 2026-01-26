/**
 * Skill API - Preload から Renderer に公開する skillAPI
 *
 * TASK-3-2: SkillExecutor IPC Integration
 *
 * @module @repo/desktop/preload/skill-api
 */

import { ipcRenderer, IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_ON_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
} from "./channels";
import type {
  SkillStreamMessage,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
} from "@repo/shared/types/skill-execution";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

/**
 * SkillAPI - Skill 実行関連の Preload API インターフェース
 */
export interface SkillAPI {
  /**
   * スキルを実行する
   * @param request - 実行リクエスト
   * @returns 実行レスポンス（executionId を含む）
   */
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;

  /**
   * ストリームメッセージを受信するコールバックを登録する
   * @param callback - メッセージ受信時のコールバック関数
   * @returns クリーンアップ関数（リスナー解除用）
   */
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;

  /**
   * 実行中のスキルを中断する
   * @param executionId - 中断対象の実行ID
   * @returns 中断成功の場合 true
   */
  abort: (executionId: string) => Promise<boolean>;

  /**
   * 実行状態を取得する
   * @param executionId - 実行ID
   * @returns 実行情報（見つからない場合 null）
   */
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // === Permission API (TASK-3-1-D + TASK-4-2) ===

  /**
   * 権限確認リクエストを購読する
   * @param callback - リクエスト受信時のコールバック関数
   * @returns クリーンアップ関数（購読解除用）
   */
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;

  /**
   * 権限確認応答を送信する
   * @param response - 権限確認応答
   * @returns 送信結果
   */
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}

/**
 * safeInvoke - 許可されたチャンネルのみ invoke を実行
 */
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

/**
 * safeOn - 許可されたチャンネルのみリスナーを登録
 */
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }

  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };

  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

/**
 * skillAPI - Skill 実行関連の Preload API 実装
 */
export const skillAPI: SkillAPI = {
  execute: (request: SkillExecutionRequest): Promise<SkillExecutionResponse> =>
    safeInvoke(IPC_CHANNELS.SKILL_EXECUTE, request),

  onStream: (callback: (message: SkillStreamMessage) => void): (() => void) =>
    safeOn<SkillStreamMessage>(IPC_CHANNELS.SKILL_STREAM, callback),

  abort: (executionId: string): Promise<boolean> =>
    safeInvoke(IPC_CHANNELS.SKILL_ABORT, executionId),

  getExecutionStatus: (executionId: string): Promise<ExecutionInfo | null> =>
    safeInvoke(IPC_CHANNELS.SKILL_GET_STATUS, executionId),

  // === Permission API (TASK-3-1-D + TASK-4-2) ===

  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ): (() => void) =>
    safeOn<SkillPermissionRequest>(
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      callback,
    ),

  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ): Promise<{ success: boolean }> =>
    safeInvoke(IPC_CHANNELS.SKILL_PERMISSION_RESPONSE, response),
};
