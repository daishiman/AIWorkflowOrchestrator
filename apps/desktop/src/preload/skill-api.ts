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
import { invokeWithTimeout } from "./ipc-utils";
import type {
  SkillStreamMessage,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
  RemoveResult,
  Skill,
  SkillName,
} from "@repo/shared/types/skill";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
  SkillMetadata,
  ImportedSkill,
  SafetyGateResult,
} from "@repo/shared";
import type {
  ShareTarget,
  ShareDestination,
  ShareResult,
  ShareImportResult,
  ShareExportResult,
  ShareValidateSourceResult,
  ScheduledSkill,
  DocGenerationRequest,
  GeneratedDoc,
  DocTemplate,
  SkillUsageEvent,
  SkillStatistics,
  AnalyticsSummary,
  AnalyticsPeriod,
  UsageTrend,
  SkillForkOptions,
  SkillForkResult,
} from "@repo/shared";
import type {
  SkillChainDefinition,
  SkillChainResult,
} from "@repo/shared/types/skill-chain";
import type {
  SkillAnalysis,
  Suggestion,
  ImprovementResult,
  ImprovementOptions,
  PromptEvaluation,
} from "@repo/shared/types/skill-improver";
import type { OperationResult } from "@repo/shared/types/skill";
import type { BackupInfo, SkillFileTreeNode } from "./types";
import type { SkillCreationContext } from "@repo/shared/types/skillCreator";
import type {
  DebugSessionState,
  Breakpoint,
  DebugEvent,
  DebugStartRequest,
  DebugCommandRequest,
  DebugBreakpointAddRequest,
  DebugBreakpointRemoveRequest,
  DebugInspectRequest,
  DebugEvaluateRequest,
  DebugEvaluateResponse,
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
   */
  abort: (executionId: string) => Promise<void>;

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

  // === Skill Management API ===

  /**
   * 利用可能なスキル一覧を取得
   * @returns スキルメタデータ配列
   */
  list: () => Promise<SkillMetadata[]>;

  /**
   * インポート済みスキル一覧を取得
   * @returns インポート済みスキル配列
   */
  getImported: () => Promise<ImportedSkill[]>;

  /**
   * スキルを再スキャン
   * @returns 再スキャン後の利用可能なスキル一覧
   */
  rescan: () => Promise<SkillMetadata[]>;

  /**
   * スキルをインポート
   * @param skillName - スキル名
   * @returns インポート済みスキル情報
   */
  import: (skillName: SkillName) => Promise<ImportedSkill>;

  /**
   * スキルを削除
   * @param skillName - スキル名
   */
  remove: (skillName: SkillName) => Promise<RemoveResult>;

  /**
   * スキル詳細を取得する（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001）
   * @param skillId - スキルID（非空文字列必須）
   * @returns スキル詳細オブジェクト（見つからない場合は reject）
   * @throws {{ code: "VALIDATION_ERROR" }} skillId が不正な場合
   */
  getDetail: (skillId: string) => Promise<Skill>;

  /**
   * スキルを更新する（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001）
   * @param skillName - スキル名（非空文字列必須、P45準拠）
   * @param updates - 更新内容（非null オブジェクト必須）
   * @throws {{ code: "VALIDATION_ERROR" }} 引数が不正な場合
   */
  update: (
    skillName: string,
    updates: Record<string, unknown>,
  ) => Promise<void>;

  /**
   * 完了イベントを購読
   * @param callback - 完了時のコールバック
   * @returns クリーンアップ関数
   */
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;

  /**
   * エラーイベントを購読
   * @param callback - エラー時のコールバック
   * @returns クリーンアップ関数
   */
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;

  // === Skill File Operations (TASK-9A-B) ===

  /** スキルファイルを読み込む */
  readFile: (skillName: string, relativePath: string) => Promise<string>;
  /** スキルファイルに書き込む */
  writeFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ) => Promise<void>;
  /** 新規ファイルを作成する */
  createFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ) => Promise<void>;
  /** ファイルを削除する */
  deleteFile: (skillName: string, relativePath: string) => Promise<void>;
  /** バックアップ一覧を取得する */
  listBackups: (skillName: string) => Promise<BackupInfo[]>;
  /** バックアップからファイルを復元する */
  restoreBackup: (skillName: string, backupPath: string) => Promise<void>;
  /** スキルのファイルツリーを取得する (UT-UI-05A-GETFILETREE-001) */
  getFileTree: (skillName: string) => Promise<SkillFileTreeNode[]>;

  // === Skill Share Operations (TASK-9F) ===

  /** 外部ソースからスキルをインポートする */
  importFromSource: (
    source: ShareTarget,
  ) => Promise<ShareResult<ShareImportResult>>;
  /** スキルをエクスポートする */
  exportSkill: (
    skillName: string,
    destination: ShareDestination,
  ) => Promise<ShareResult<ShareExportResult>>;
  /** ソースの有効性を検証する */
  validateSource: (
    source: ShareTarget,
  ) => Promise<ShareResult<ShareValidateSourceResult>>;

  // === Skill Docs Operations (TASK-9I) ===

  /** ドキュメントを生成する */
  docsGenerate: (request: DocGenerationRequest) => Promise<GeneratedDoc>;
  /** ドキュメントのプレビューを生成する */
  docsPreview: (
    skillName: string,
    template?: DocTemplate,
  ) => Promise<GeneratedDoc>;
  /** ドキュメントをファイルにエクスポートする */
  docsExport: (doc: GeneratedDoc, outputPath: string) => Promise<void>;
  /** 利用可能なテンプレート一覧を取得する */
  docsTemplates: () => Promise<DocTemplate[]>;

  // === Skill Analytics Operations (TASK-9J) ===

  /** 利用イベントを記録する */
  analyticsRecord: (
    event: Omit<SkillUsageEvent, "id" | "timestamp"> & { timestamp?: string },
  ) => Promise<SkillUsageEvent>;
  /** スキル統計情報を取得する */
  analyticsStatistics: (
    skillName: string,
    period?: { start: string; end: string },
  ) => Promise<SkillStatistics>;
  /** 全体サマリーを取得する */
  analyticsSummary: () => Promise<AnalyticsSummary>;
  /** 利用トレンドを取得する */
  analyticsTrend: (
    period: AnalyticsPeriod,
    skillName?: string,
  ) => Promise<UsageTrend>;
  /** データをエクスポートする */
  analyticsExport: (
    format: "json" | "csv",
    period?: { start: string; end: string },
  ) => Promise<string>;

  // === Skill Fork Operations (TASK-9E) ===

  /**
   * 既存スキルをフォークして新スキルを作成する
   * @param options フォークオプション
   * @returns フォーク結果
   */
  forkSkill: (options: SkillForkOptions) => Promise<SkillForkResult>;

  // === Skill Chain Operations (TASK-UI-05B / TASK-9D) ===

  /** チェーン一覧を取得する */
  chainList: () => Promise<SkillChainDefinition[]>;
  /** チェーンを取得する */
  chainGet: (chainId: string) => Promise<SkillChainDefinition>;
  /** チェーンを保存する（新規作成・更新兼用） */
  chainSave: (chain: SkillChainDefinition) => Promise<SkillChainDefinition>;
  /** チェーンを削除する */
  chainDelete: (chainId: string) => Promise<void>;
  /** チェーンを実行する */
  chainExecute: (chainId: string) => Promise<SkillChainResult>;

  // === Skill Schedule Operations (TASK-9G) ===

  /** スケジュール一覧を取得する */
  scheduleList: () => Promise<ScheduledSkill[]>;
  /** スケジュールを追加する */
  scheduleAdd: (
    input: Omit<ScheduledSkill, "id" | "runHistory">,
  ) => Promise<ScheduledSkill>;
  /** スケジュールを更新する */
  scheduleUpdate: (
    id: string,
    updates: Partial<ScheduledSkill>,
  ) => Promise<void>;
  /** スケジュールを削除する */
  scheduleDelete: (id: string) => Promise<void>;
  /** スケジュールの有効/無効を切り替える */
  scheduleToggle: (id: string) => Promise<ScheduledSkill | undefined>;

  // === Skill Create Wizard API (TASK-10A-C) ===

  /**
   * スキルをウィザード経由で作成する
   * @param params - 作成パラメータ（説明・オプション・コンテキスト）
   * @returns 作成結果（パスを含む）
   */
  create: (params: {
    description: string;
    options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    };
    context?: SkillCreationContext;
  }) => Promise<{ path: string }>;

  // === Skill Analysis & Improvement API (TASK-10A-B) ===

  /**
   * スキルを分析する
   * @param skillName - 分析対象のスキル名
   * @returns 分析結果
   */
  analyze: (skillName: string) => Promise<SkillAnalysis>;

  /**
   * プロンプトを評価して採点する (TASK-SKILL-LIFECYCLE-04)
   * @param prompt - 評価対象のプロンプト文字列
   * @returns 評価結果（スコア・ブレークダウン・フィードバック）
   */
  evaluatePrompt: (
    prompt: string,
  ) => Promise<OperationResult<PromptEvaluation>>;

  /**
   * 選択した改善提案を適用する
   * @param skillName - スキル名
   * @param suggestions - 適用する提案リスト
   * @returns 改善結果
   */
  applyImprovements: (
    skillName: string,
    suggestions: Suggestion[],
  ) => Promise<ImprovementResult>;

  /**
   * 全自動改善を実行する
   * @param skillName - スキル名
   * @returns 改善結果
   */
  autoImprove: (skillName: string) => Promise<ImprovementResult>;

  // === SafetyGate API (UT-06-003-PRELOAD-API-IMPL) ===

  /**
   * スキルの安全性を評価する
   * @param skillName - 評価対象のスキル名
   * @returns 安全性評価結果（ラップ形式）
   */
  evaluateSafety: (skillName: string) => Promise<{
    success: boolean;
    data?: SafetyGateResult;
    error?: { code: string; message: string };
  }>;

  // === Skill Debug API (TASK-9H) ===

  /** デバッグセッション管理 */
  debug: {
    /** デバッグセッションを開始 */
    startSession: (request: DebugStartRequest) => Promise<DebugSessionState>;
    /** デバッグコマンドを実行 */
    executeCommand: (request: DebugCommandRequest) => Promise<void>;
    /** ブレークポイントを追加 */
    addBreakpoint: (request: DebugBreakpointAddRequest) => Promise<Breakpoint>;
    /** ブレークポイントを削除 */
    removeBreakpoint: (request: DebugBreakpointRemoveRequest) => Promise<void>;
    /** 変数をインスペクション */
    inspectVariable: (request: DebugInspectRequest) => Promise<unknown>;
    /** 式を評価 */
    evaluateExpression: (
      request: DebugEvaluateRequest,
    ) => Promise<DebugEvaluateResponse>;
    /** デバッグイベントを購読 */
    onDebugEvent: (callback: (event: DebugEvent) => void) => () => void;
  };
}

/**
 * IpcResult<T> - Main Process IPC ハンドラのレスポンスラッパー型
 *
 * skillHandlers.ts のハンドラは以下の形式でレスポンスを返す:
 * - 成功: { success: true, data: T }
 * - 失敗: { success: false, error: string, errorCode?: string, retryable?: boolean }
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
}

/**
 * safeInvoke - 許可されたチャンネルのみ invoke を実行（タイムアウト付き）
 */
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}

/**
 * safeInvokeUnwrap - IPC レスポンスラッパーを展開して data フィールドを返す
 *
 * Main Process の IPC ハンドラが { success: true, data: T } 形式で返す
 * レスポンスを展開し、T を直接返す。
 * { success: false, error: string } の場合は Error をスローする。
 *
 * @param channel - IPC チャンネル名
 * @param args - IPC 引数
 * @returns data フィールドの値（型 T）
 * @throws Error - success が false の場合、または IPC 通信エラーの場合
 */
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    const error = new Error(result.error || `IPC call failed: ${channel}`);
    if (typeof result.errorCode === "string") {
      (error as Error & { code?: string }).code = result.errorCode;
    }
    if (typeof result.retryable === "boolean") {
      (error as Error & { retryable?: boolean }).retryable = result.retryable;
    }
    throw error;
  }
  return result.data as T;
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
    safeInvokeUnwrap(IPC_CHANNELS.SKILL_EXECUTE, request),

  onStream: (callback: (message: SkillStreamMessage) => void): (() => void) =>
    safeOn<SkillStreamMessage>(IPC_CHANNELS.SKILL_STREAM, callback),

  abort: (executionId: string): Promise<void> =>
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

  // === Skill Management API ===

  list: (): Promise<SkillMetadata[]> =>
    safeInvokeUnwrap(IPC_CHANNELS.SKILL_LIST),

  getImported: (): Promise<ImportedSkill[]> =>
    safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_IMPORTED),

  rescan: (): Promise<SkillMetadata[]> =>
    safeInvokeUnwrap(IPC_CHANNELS.SKILL_SCAN),

  import: (skillName: SkillName): Promise<ImportedSkill> =>
    safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),

  remove: (skillName: SkillName): Promise<RemoveResult> =>
    safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName),

  // === Skill Detail & Update Operations (TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001) ===

  getDetail: (skillId: string): Promise<Skill> => {
    // P42準拠 3段バリデーション（Preload層での早期拒否）
    if (
      typeof skillId !== "string" ||
      skillId === "" ||
      skillId.trim() === ""
    ) {
      return Promise.reject({
        code: "VALIDATION_ERROR",
        message: "skillId must be a non-empty string",
      });
    }
    return safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId });
  },

  update: (
    skillName: string,
    updates: Record<string, unknown>,
  ): Promise<void> => {
    // P42準拠 3段バリデーション（Preload層での早期拒否）
    if (
      typeof skillName !== "string" ||
      skillName === "" ||
      skillName.trim() === ""
    ) {
      return Promise.reject({
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      });
    }
    if (
      updates === null ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      return Promise.reject({
        code: "VALIDATION_ERROR",
        message: "updates must be a non-null object",
      });
    }
    return safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, {
      skillName,
      updates,
    });
  },

  onComplete: (
    callback: (data: { executionId: string }) => void,
  ): (() => void) =>
    safeOn<{ executionId: string }>(IPC_CHANNELS.SKILL_COMPLETE, callback),

  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ): (() => void) =>
    safeOn<{ executionId: string; error: string }>(
      IPC_CHANNELS.SKILL_ERROR,
      callback,
    ),

  // === Skill File Operations (TASK-9A-B) ===

  readFile: (skillName: string, relativePath: string): Promise<string> =>
    safeInvokeUnwrap<string>(IPC_CHANNELS.SKILL_READ_FILE, {
      skillName,
      relativePath,
    }),

  writeFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ): Promise<void> =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_WRITE_FILE, {
      skillName,
      relativePath,
      content,
    }),

  createFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ): Promise<void> =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_CREATE_FILE, {
      skillName,
      relativePath,
      content,
    }),

  deleteFile: (skillName: string, relativePath: string): Promise<void> =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DELETE_FILE, {
      skillName,
      relativePath,
    }),

  listBackups: (skillName: string): Promise<BackupInfo[]> =>
    safeInvokeUnwrap<BackupInfo[]>(IPC_CHANNELS.SKILL_LIST_BACKUPS, {
      skillName,
    }),

  restoreBackup: (skillName: string, backupPath: string): Promise<void> =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_RESTORE_BACKUP, {
      skillName,
      backupPath,
    }),

  getFileTree: (skillName: string): Promise<SkillFileTreeNode[]> =>
    safeInvokeUnwrap<SkillFileTreeNode[]>(IPC_CHANNELS.SKILL_GET_FILE_TREE, {
      skillName,
    }),

  // === Skill Share Operations (TASK-9F) ===

  importFromSource: (
    source: ShareTarget,
  ): Promise<ShareResult<ShareImportResult>> =>
    safeInvoke(IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE, source),

  exportSkill: (
    skillName: string,
    destination: ShareDestination,
  ): Promise<ShareResult<ShareExportResult>> =>
    safeInvoke(IPC_CHANNELS.SKILL_EXPORT, { skillName, destination }),

  validateSource: (
    source: ShareTarget,
  ): Promise<ShareResult<ShareValidateSourceResult>> =>
    safeInvoke(IPC_CHANNELS.SKILL_VALIDATE_SOURCE, source),

  // === Skill Docs Operations (TASK-9I) ===

  docsGenerate: (request: DocGenerationRequest): Promise<GeneratedDoc> =>
    safeInvokeUnwrap<GeneratedDoc>(IPC_CHANNELS.SKILL_DOCS_GENERATE, request),

  docsPreview: (
    skillName: string,
    template?: DocTemplate,
  ): Promise<GeneratedDoc> =>
    safeInvokeUnwrap<GeneratedDoc>(IPC_CHANNELS.SKILL_DOCS_PREVIEW, {
      skillName,
      template,
    }),

  docsExport: (doc: GeneratedDoc, outputPath: string): Promise<void> =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DOCS_EXPORT, {
      doc,
      outputPath,
    }),

  docsTemplates: (): Promise<DocTemplate[]> =>
    safeInvokeUnwrap<DocTemplate[]>(IPC_CHANNELS.SKILL_DOCS_TEMPLATES),

  // === Skill Analytics Operations (TASK-9J) ===

  analyticsRecord: (
    event: Omit<SkillUsageEvent, "id" | "timestamp"> & { timestamp?: string },
  ): Promise<SkillUsageEvent> =>
    safeInvokeUnwrap<SkillUsageEvent>(
      IPC_CHANNELS.SKILL_ANALYTICS_RECORD,
      event,
    ),

  analyticsStatistics: (
    skillName: string,
    period?: { start: string; end: string },
  ): Promise<SkillStatistics> =>
    safeInvokeUnwrap<SkillStatistics>(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS, {
      skillName,
      period,
    }),

  analyticsSummary: (): Promise<AnalyticsSummary> =>
    safeInvokeUnwrap<AnalyticsSummary>(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY),

  analyticsTrend: (
    period: AnalyticsPeriod,
    skillName?: string,
  ): Promise<UsageTrend> =>
    safeInvokeUnwrap<UsageTrend>(IPC_CHANNELS.SKILL_ANALYTICS_TREND, {
      period,
      skillName,
    }),

  analyticsExport: (
    format: "json" | "csv",
    period?: { start: string; end: string },
  ): Promise<string> =>
    safeInvokeUnwrap<string>(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT, {
      format,
      period,
    }),

  // === Skill Fork Operations (TASK-9E) ===

  forkSkill: (options: SkillForkOptions): Promise<SkillForkResult> =>
    safeInvokeUnwrap<SkillForkResult>(IPC_CHANNELS.SKILL_FORK, options),

  // === Skill Chain Operations (TASK-UI-05B / TASK-9D) ===

  chainList: (): Promise<SkillChainDefinition[]> =>
    safeInvokeUnwrap<SkillChainDefinition[]>(IPC_CHANNELS.SKILL_CHAIN_LIST),

  chainGet: (chainId: string): Promise<SkillChainDefinition> =>
    safeInvokeUnwrap<SkillChainDefinition>(IPC_CHANNELS.SKILL_CHAIN_GET, {
      chainId,
    }),

  chainSave: (chain: SkillChainDefinition): Promise<SkillChainDefinition> =>
    safeInvokeUnwrap<SkillChainDefinition>(
      IPC_CHANNELS.SKILL_CHAIN_SAVE,
      chain,
    ),

  chainDelete: (chainId: string): Promise<void> =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_CHAIN_DELETE, { chainId }),

  chainExecute: (chainId: string): Promise<SkillChainResult> =>
    safeInvokeUnwrap<SkillChainResult>(IPC_CHANNELS.SKILL_CHAIN_EXECUTE, {
      chainId,
    }),

  // === Skill Schedule Operations (TASK-9G) ===

  scheduleList: (): Promise<ScheduledSkill[]> =>
    safeInvokeUnwrap<ScheduledSkill[]>(IPC_CHANNELS.SKILL_SCHEDULE_LIST),

  scheduleAdd: (
    input: Omit<ScheduledSkill, "id" | "runHistory">,
  ): Promise<ScheduledSkill> =>
    safeInvokeUnwrap<ScheduledSkill>(IPC_CHANNELS.SKILL_SCHEDULE_ADD, input),

  scheduleUpdate: (
    id: string,
    updates: Partial<ScheduledSkill>,
  ): Promise<void> =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE, {
      id,
      updates,
    }),

  scheduleDelete: (id: string): Promise<void> =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_DELETE, { id }),

  scheduleToggle: (id: string): Promise<ScheduledSkill | undefined> =>
    safeInvokeUnwrap<ScheduledSkill | undefined>(
      IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
      { id },
    ),

  // === Skill Create Wizard API (TASK-10A-C) ===

  create: (params: {
    description: string;
    options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    };
    context?: SkillCreationContext;
  }): Promise<{ path: string }> =>
    safeInvoke(
      IPC_CHANNELS.SKILL_CREATE,
      params.description,
      params.options,
      params.context,
    ),

  // === Skill Analysis & Improvement API (TASK-10A-B) ===

  analyze: (skillName: string): Promise<SkillAnalysis> =>
    safeInvokeUnwrap<SkillAnalysis>(IPC_CHANNELS.SKILL_ANALYZE, { skillName }),

  evaluatePrompt: (
    prompt: string,
  ): Promise<OperationResult<PromptEvaluation>> =>
    safeInvoke<OperationResult<PromptEvaluation>>(
      IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE,
      { prompt },
    ),

  applyImprovements: (
    skillName: string,
    suggestions: Suggestion[],
  ): Promise<ImprovementResult> =>
    safeInvokeUnwrap<ImprovementResult>(IPC_CHANNELS.SKILL_IMPROVE, {
      skillName,
      analysis: { suggestions } as SkillAnalysis,
    }),

  autoImprove: (skillName: string): Promise<ImprovementResult> =>
    safeInvokeUnwrap<ImprovementResult>(IPC_CHANNELS.SKILL_IMPROVE, {
      skillName,
      analysis: {} as SkillAnalysis,
      options: { autoFix: true } as ImprovementOptions,
    }),

  // === SafetyGate API (UT-06-003-PRELOAD-API-IMPL) ===

  evaluateSafety: (skillName: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_EVALUATE_SAFETY, skillName),

  // === Skill Debug API (TASK-9H) ===

  debug: {
    startSession: (request: DebugStartRequest): Promise<DebugSessionState> =>
      safeInvokeUnwrap<DebugSessionState>(
        IPC_CHANNELS.SKILL_DEBUG_START,
        request,
      ),

    executeCommand: (request: DebugCommandRequest): Promise<void> =>
      safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DEBUG_COMMAND, request),

    addBreakpoint: (request: DebugBreakpointAddRequest): Promise<Breakpoint> =>
      safeInvokeUnwrap<Breakpoint>(
        IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD,
        request,
      ),

    removeBreakpoint: (request: DebugBreakpointRemoveRequest): Promise<void> =>
      safeInvokeUnwrap<void>(
        IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE,
        request,
      ),

    inspectVariable: (request: DebugInspectRequest): Promise<unknown> =>
      safeInvokeUnwrap<unknown>(IPC_CHANNELS.SKILL_DEBUG_INSPECT, request),

    evaluateExpression: (
      request: DebugEvaluateRequest,
    ): Promise<DebugEvaluateResponse> =>
      safeInvokeUnwrap<DebugEvaluateResponse>(
        IPC_CHANNELS.SKILL_DEBUG_EVALUATE,
        request,
      ),

    onDebugEvent: (callback: (event: DebugEvent) => void): (() => void) =>
      safeOn<DebugEvent>(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback),
  },
};
