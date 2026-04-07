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
import { invokeWithTimeout } from "./ipc-utils";
import type {
  SkillCreatorMode,
  CreateSkillOptions,
  ExecuteTasksOptions,
  ExecutionReport,
  ExternalApiConnectionConfig,
  SkillCreatorExecutePlanAck,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorImproveSuggestion,
  RuntimeSkillCreatorPlanResponse,
  SkillCreatorUserInputSubmission,
  SkillCreatorWorkflowUiSnapshot,
  SkillOutputReadyPayload,
  RuntimeSkillCreatorReverifyResponse,
  RuntimeSkillCreatorVerifyDetailResponse,
  ApplyImprovementResult,
  SkillCreatorSessionListItem,
  SkillCreatorSessionResumeResult,
  LLMAdapterStatusPayload,
} from "@repo/shared/types";
import type { AuthMode } from "@repo/shared/types/auth-mode";

/**
 * IPC結果型
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

type ApprovalRequestPayload = {
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
};

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
   * Runtime plan: スキル仕様から実行計画を生成する
   */
  planSkill: (
    prompt: string,
    authMode?: AuthMode,
    apiKey?: string | null,
  ) => Promise<IpcResult<RuntimeSkillCreatorPlanResponse>>;

  /**
   * Runtime execute: 計画に基づいてスキルを実行する
   */
  executePlan: (
    planId: string,
    skillSpec: string,
    authMode?: AuthMode,
    apiKey?: string | null,
  ) => Promise<IpcResult<SkillCreatorExecutePlanAck>>;

  /**
   * workflow snapshot を取得する
   */
  getWorkflowState: (
    planId: string,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;

  /**
   * Runtime adapter status: 現在の LLMAdapter 状態を取得する
   */
  getAdapterStatus: () => Promise<IpcResult<LLMAdapterStatusPayload>>;

  /**
   * workflow question に対する user input を送信する
   */
  submitUserInput: (
    submission: SkillCreatorUserInputSubmission,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;

  /**
   * External API 設定を current session に送信する
   */
  configureExternalApi: (
    config: ExternalApiConnectionConfig,
  ) => Promise<IpcResult<unknown>>;

  /**
   * workflow snapshot change event を購読する
   */
  onWorkflowStateChanged: (
    callback: (
      snapshot: SkillCreatorWorkflowUiSnapshot | null,
      errorMessage?: string,
    ) => void,
  ) => () => void;

  /**
   * Runtime adapter status change event を購読する
   */
  onAdapterStatusChanged: (
    callback: (payload: LLMAdapterStatusPayload) => void,
  ) => () => void;

  /**
   * skill-creator:output-ready イベントを購読する
   */
  onOutputReady: (
    callback: (payload: SkillOutputReadyPayload) => void,
  ) => () => void;

  /**
   * 既存スキルの上書き保存を承認する
   */
  confirmOverwrite: (
    payload: SkillOutputReadyPayload,
  ) => Promise<IpcResult<unknown>>;

  /**
   * 保存済みスキルを開く
   */
  openSkill: (savedPath: string) => Promise<IpcResult<unknown>>;

  /**
   * Runtime improve: フィードバックに基づいてスキルを改善する
   */
  improveSkillWithFeedback: (
    skillName: string,
    feedback: string,
    authMode?: AuthMode,
    apiKey?: string | null,
  ) => Promise<IpcResult<RuntimeSkillCreatorImproveResponse>>;

  /**
   * Runtime apply-improvement: 改善提案を選択的に適用する
   */
  applyRuntimeImprovement: (
    skillName: string,
    suggestions: RuntimeSkillCreatorImproveSuggestion[],
  ) => Promise<IpcResult<ApplyImprovementResult>>;

  /**
   * Runtime verify detail: 現在の verify surface を取得する
   */
  getVerifyDetail: (
    planId: string,
  ) => Promise<IpcResult<RuntimeSkillCreatorVerifyDetailResponse>>;

  /**
   * Runtime reverify: verify loop を再要求する
   */
  reverifyWorkflow: (
    planId: string,
  ) => Promise<IpcResult<RuntimeSkillCreatorReverifyResponse>>;

  /**
   * SDK 生メッセージを lane 正規化イベントに変換する (TASK-RT-06)
   * @param messages - SDK 生メッセージの配列
   * @returns 正規化済み SkillCreatorSdkEvent の配列
   */
  normalizeSdkMessages: (
    messages: unknown[],
  ) => Promise<IpcResult<import("@repo/shared/types").SkillCreatorSdkEvent[]>>;

  /**
   * Governance 状態を取得する (TASK-P0-09)
   * @returns 現在の governance phase、policy、直近 audit events、denials
   */
  getGovernanceState: () => Promise<
    IpcResult<import("@repo/shared/types").SkillCreatorGovernanceState>
  >;

  /**
   * スキルを改善する
   * @param skillName - スキル名
   * @param options - 改善オプション
   * @returns 改善結果
   */
  improveSkill: (
    skillName: string,
    options?: { autoApply?: boolean },
  ) => Promise<IpcResult<unknown>>;

  /**
   * スキルをフォークする
   * @param sourceName - 元スキル名
   * @param newName - 新スキル名
   * @param options - フォークオプション
   * @returns フォーク結果
   */
  forkSkill: (
    sourceName: string,
    newName: string,
    options?: Record<string, boolean>,
  ) => Promise<IpcResult<string>>;

  /**
   * スキルを共有する
   * @param skillName - スキル名
   * @param format - エクスポートフォーマット
   * @returns 共有結果
   */
  shareSkill: (skillName: string, format: string) => Promise<IpcResult<string>>;

  /**
   * スキルスケジュールを設定する
   * @param skillName - スキル名
   * @param schedule - スケジュール設定
   * @returns 設定結果
   */
  scheduleSkill: (
    skillName: string,
    schedule: object,
  ) => Promise<IpcResult<void>>;

  /**
   * スキルをデバッグする
   * @param skillName - スキル名
   * @param options - デバッグオプション
   * @returns デバッグ結果
   */
  debugSkill: (
    skillName: string,
    options?: { verbose?: boolean; breakpoints?: string[] },
  ) => Promise<IpcResult<unknown>>;

  /**
   * スキルのドキュメントを生成する
   * @param skillName - スキル名
   * @param format - ドキュメントフォーマット
   * @param sections - 対象セクション
   * @returns 生成されたドキュメント
   */
  generateDocs: (
    skillName: string,
    format?: string,
    sections?: string[],
  ) => Promise<IpcResult<string>>;

  /**
   * スキルの使用統計を取得する
   * @param skillName - スキル名（未指定時は全体統計）
   * @param period - 期間（デフォルト: "7d"）
   * @returns 統計データ
   */
  getStats: (
    skillName?: string,
    period?: string,
  ) => Promise<IpcResult<unknown>>;

  /**
   * 進捗通知を受信するコールバックを登録する
   * @param callback - 進捗通知受信時のコールバック関数
   * @returns クリーンアップ関数（リスナー解除用）
   */
  onProgress: (
    callback: (progress: SkillCreatorProgress) => void,
  ) => () => void;

  // --- TASK-P0-08: Session Resume API ---

  /**
   * 未完了セッション一覧を取得する
   */
  listSessions: () => Promise<IpcResult<SkillCreatorSessionListItem[]>>;

  /**
   * セッションを復元して workflow snapshot を返す
   */
  resumeSession: (
    checkpointId: string,
  ) => Promise<SkillCreatorSessionResumeResult>;

  /**
   * セッション詳細スナップショットを取得する
   */
  getSessionDetail: (
    checkpointId: string,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;

  /**
   * セッションを削除する
   */
  deleteSession: (checkpointId: string) => Promise<void>;

  /**
   * 期限切れセッションを一括削除する
   */
  cleanupExpiredSessions: () => Promise<number>;

  // --- TASK-SDK-07: Governance bundle - shared contract 再利用 ---

  /**
   * Shared approval channel 経由で承認応答を送信する (AC-4: enforcement)
   */
  respondToApproval: (
    sessionId: string,
    operationId: string,
    action: "approve" | "reject",
  ) => Promise<IpcResult<unknown>>;

  /**
   * Shared disclosure channel 経由で AI 利用情報を取得する (AC-4: 説明責務)
   */
  getDisclosureInfo: () => Promise<IpcResult<unknown>>;

  // --- TASK-SDK-07: approval:request surface 追加 ---
  /**
   * approval:request channel 経由で承認リクエストを受信する (AC-1: push 購読)
   */
  onApprovalRequest: (
    callback: (payload: ApprovalRequestPayload) => void,
  ) => () => void;
}

/**
 * safeInvoke - 許可されたチャンネルのみ invoke を実行（タイムアウト付き）
 */
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}

type SkillCreatorExecutePlanTransportResponse =
  | SkillCreatorExecutePlanAck
  | IpcResult<never>;

function isSkillCreatorExecutePlanAck(
  value: unknown,
): value is SkillCreatorExecutePlanAck {
  return (
    !!value &&
    typeof value === "object" &&
    "accepted" in value &&
    (value as { accepted: unknown }).accepted === true &&
    "planId" in value &&
    typeof (value as { planId: unknown }).planId === "string"
  );
}

function isIpcErrorResponse(value: unknown): value is IpcResult<never> {
  return (
    !!value &&
    typeof value === "object" &&
    "success" in value &&
    (value as { success: unknown }).success === false &&
    "error" in value &&
    typeof (value as { error: unknown }).error === "string"
  );
}

/**
 * safeOn - 許可されたチャンネルのみリスナーを登録
 */
function safeOn<T, R extends unknown[] = []>(
  channel: string,
  callback: (data: T, ...rest: R) => void,
): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }

  const listener = (_event: IpcRendererEvent, data: T, ...rest: R) => {
    callback(data, ...rest);
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

  planSkill: (
    prompt: string,
    authMode?: AuthMode,
    apiKey?: string | null,
  ): Promise<IpcResult<RuntimeSkillCreatorPlanResponse>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_PLAN, { prompt, authMode, apiKey }),

  executePlan: (
    planId: string,
    skillSpec: string,
    authMode?: AuthMode,
    apiKey?: string | null,
  ): Promise<IpcResult<SkillCreatorExecutePlanAck>> =>
    safeInvoke<SkillCreatorExecutePlanTransportResponse>(
      IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
      {
        planId,
        skillSpec,
        authMode,
        apiKey,
      },
    ).then((response) => {
      if (isSkillCreatorExecutePlanAck(response)) {
        return { success: true, data: response };
      }
      if (isIpcErrorResponse(response)) {
        return response;
      }
      return {
        success: false,
        error: "計画実行の受理に失敗しました",
      };
    }),

  getWorkflowState: (
    planId: string,
  ): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE, { planId }),

  getAdapterStatus: (): Promise<IpcResult<LLMAdapterStatusPayload>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS),

  submitUserInput: (
    submission: SkillCreatorUserInputSubmission,
  ): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT, submission),

  configureExternalApi: (
    config: ExternalApiConnectionConfig,
  ): Promise<IpcResult<unknown>> =>
    safeInvoke(IPC_CHANNELS.CONFIGURE_API, config),

  onWorkflowStateChanged: (
    callback: (
      snapshot: SkillCreatorWorkflowUiSnapshot | null,
      errorMessage?: string,
    ) => void,
  ): (() => void) =>
    safeOn<SkillCreatorWorkflowUiSnapshot | null, [string?]>(
      IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      callback,
    ),

  onAdapterStatusChanged: (
    callback: (payload: LLMAdapterStatusPayload) => void,
  ): (() => void) =>
    safeOn<LLMAdapterStatusPayload>(
      IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
      callback,
    ),

  onOutputReady: (
    callback: (payload: SkillOutputReadyPayload) => void,
  ): (() => void) =>
    safeOn<SkillOutputReadyPayload>(
      IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY,
      callback,
    ),

  confirmOverwrite: (
    payload: SkillOutputReadyPayload,
  ): Promise<IpcResult<unknown>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED, payload),

  openSkill: (savedPath: string): Promise<IpcResult<unknown>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_OPEN_SKILL, { savedPath }),

  improveSkillWithFeedback: (
    skillName: string,
    feedback: string,
    authMode?: AuthMode,
    apiKey?: string | null,
  ): Promise<IpcResult<RuntimeSkillCreatorImproveResponse>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL, {
      skillName,
      feedback,
      authMode,
      apiKey,
    }),

  applyRuntimeImprovement: (
    skillName: string,
    suggestions: RuntimeSkillCreatorImproveSuggestion[],
  ): Promise<IpcResult<ApplyImprovementResult>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT, {
      skillName,
      suggestions,
    }),

  getVerifyDetail: (
    planId: string,
  ): Promise<IpcResult<RuntimeSkillCreatorVerifyDetailResponse>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL, {
      planId,
    }),

  reverifyWorkflow: (
    planId: string,
  ): Promise<IpcResult<RuntimeSkillCreatorReverifyResponse>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW, {
      planId,
    }),

  normalizeSdkMessages: (
    messages: unknown[],
  ): Promise<IpcResult<import("@repo/shared/types").SkillCreatorSdkEvent[]>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_NORMALIZE_SDK_MESSAGES, {
      messages,
    }),

  getGovernanceState: (): Promise<
    IpcResult<import("@repo/shared/types").SkillCreatorGovernanceState>
  > => safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE),

  improveSkill: (
    skillName: string,
    options?: { autoApply?: boolean },
  ): Promise<IpcResult<unknown>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_IMPROVE, { skillName, ...options }),

  forkSkill: (
    sourceName: string,
    newName: string,
    options?: Record<string, boolean>,
  ): Promise<IpcResult<string>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_FORK, {
      sourceName,
      newName,
      options,
    }),

  shareSkill: (skillName: string, format: string): Promise<IpcResult<string>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_SHARE, { skillName, format }),

  scheduleSkill: (
    skillName: string,
    schedule: object,
  ): Promise<IpcResult<void>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_SCHEDULE, { skillName, schedule }),

  debugSkill: (
    skillName: string,
    options?: { verbose?: boolean; breakpoints?: string[] },
  ): Promise<IpcResult<unknown>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DEBUG, { skillName, options }),

  generateDocs: (
    skillName: string,
    format?: string,
    sections?: string[],
  ): Promise<IpcResult<string>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GENERATE_DOCS, {
      skillName,
      format,
      sections,
    }),

  getStats: (
    skillName?: string,
    period?: string,
  ): Promise<IpcResult<unknown>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_STATS, { skillName, period }),

  onProgress: (
    callback: (progress: SkillCreatorProgress) => void,
  ): (() => void) =>
    safeOn<SkillCreatorProgress>(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback),

  // --- TASK-P0-08: Session Resume API ---

  listSessions: (): Promise<IpcResult<SkillCreatorSessionListItem[]>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS),

  resumeSession: (
    checkpointId: string,
  ): Promise<SkillCreatorSessionResumeResult> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION, { checkpointId }),

  getSessionDetail: (
    checkpointId: string,
  ): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL, { checkpointId }),

  deleteSession: (checkpointId: string): Promise<void> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION, { checkpointId }),

  cleanupExpiredSessions: (): Promise<number> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS),

  // --- TASK-SDK-07: Governance bundle - shared contract 再利用 ---

  respondToApproval: (
    sessionId: string,
    operationId: string,
    action: "approve" | "reject",
  ): Promise<IpcResult<unknown>> =>
    safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, {
      sessionId,
      operationId,
      action,
    }),

  getDisclosureInfo: (): Promise<IpcResult<unknown>> =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO),

  // --- TASK-SDK-07: approval:request surface 追加 ---
  onApprovalRequest: (
    callback: (payload: ApprovalRequestPayload) => void,
  ): (() => void) =>
    safeOn<ApprovalRequestPayload>(IPC_CHANNELS.APPROVAL_REQUEST, callback),
};
