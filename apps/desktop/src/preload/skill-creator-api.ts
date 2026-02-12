/**
 * Skill Creator API - Preload から Renderer に公開する skillCreatorAPI
 *
 * TASK-9B-H: SkillCreatorService IPC Integration
 *
 * @module @repo/desktop/preload/skill-creator-api
 */

import { ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_ON_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
} from "./channels";
import type {
  SkillCreatorMode,
  CreateSkillOptions,
  ExecuteTasksOptions,
  ExecutionReport,
} from "@repo/shared/types";

/**
 * IPC結果型
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 進捗通知データ型
 */
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
}

/**
 * SkillCreatorAPI - スキル作成関連のPreload APIインターフェース
 */
export interface SkillCreatorAPI {
  /**
   * リクエストからモードを判定する
   * @param request - ユーザーリクエスト文字列
   * @returns モード判定結果
   */
  detectMode: (request: string) => Promise<IpcResult<SkillCreatorMode>>;

  /**
   * スキルを作成する
   * @param options - スキル作成オプション
   * @returns 作成されたスキルディレクトリパス
   */
  createSkill: (options: CreateSkillOptions) => Promise<IpcResult<string>>;

  /**
   * タスクを実行する
   * @param options - タスク実行オプション
   * @returns 実行レポート
   */
  executeTasks: (
    options: ExecuteTasksOptions,
  ) => Promise<IpcResult<ExecutionReport>>;

  /**
   * スキルを検証する
   * @param skillDir - スキルディレクトリパス
   * @returns 検証結果
   */
  validateSkill: (skillDir: string) => Promise<IpcResult<boolean>>;

  /**
   * データをスキーマで検証する
   * @param schemaName - スキーマ名
   * @param data - 検証対象データ
   * @returns 検証結果
   */
  validateSchema: (
    schemaName: string,
    data: unknown,
  ) => Promise<IpcResult<boolean>>;

  /**
   * 進捗通知を受信するコールバックを登録する
   * @param callback - 進捗通知受信時のコールバック関数
   * @returns クリーンアップ関数（リスナー解除用）
   */
  onProgress: (
    callback: (progress: SkillCreatorProgress) => void,
  ) => () => void;
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
 * skillCreatorAPI - スキル作成関連のPreload API実装
 */
export const skillCreatorAPI: SkillCreatorAPI = {
  detectMode: (request: string): Promise<IpcResult<SkillCreatorMode>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE, { request }),

  createSkill: (options: CreateSkillOptions): Promise<IpcResult<string>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CREATE, options),

  executeTasks: (
    options: ExecuteTasksOptions,
  ): Promise<IpcResult<ExecutionReport>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS, options),

  validateSkill: (skillDir: string): Promise<IpcResult<boolean>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE, { skillDir }),

  validateSchema: (
    schemaName: string,
    data: unknown,
  ): Promise<IpcResult<boolean>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA, {
      schemaName,
      data,
    }),

  onProgress: (
    callback: (progress: SkillCreatorProgress) => void,
  ): (() => void) =>
    safeOn<SkillCreatorProgress>(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback),
};
