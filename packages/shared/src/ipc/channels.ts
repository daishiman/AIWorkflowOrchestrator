/**
 * Electron IPC チャネル定数
 *
 * レンダラープロセスとメインプロセス間の通信チャネルを定義する。
 * 文字列リテラルの代わりに定数を使用することで、Typoによるランタイムエラーを防止する。
 *
 * @see apps/desktop/electron/preload/index.ts
 * @see apps/desktop/electron/main/ipc-handler.ts
 */

/**
 * チャット履歴エクスポート関連のIPCチャネル
 */
export const CHAT_EXPORT_CHANNELS = {
  /**
   * セッション履歴をMarkdown/JSON形式でエクスポート
   */
  EXPORT_SESSION: "chat:exportSession",

  /**
   * エクスポートプレビュー情報の取得
   * （推定ファイルサイズ、メッセージ数など）
   */
  PREVIEW_EXPORT: "chat:previewExport",
} as const;

/**
 * ファイルシステム操作関連のIPCチャネル
 */
export const FILE_SYSTEM_CHANNELS = {
  /**
   * ファイル保存ダイアログの表示
   */
  SHOW_SAVE_DIALOG: "dialog:showSaveDialog",

  /**
   * ファイル書き込み
   */
  WRITE_FILE: "fs:writeFile",

  /**
   * ファイル読み取り（必要に応じて実装）
   */
  READ_FILE: "fs:readFile",
} as const;

/**
 * スキル実行関連のIPCチャネル
 */
export const SKILL_CHANNELS = {
  /**
   * スキル一覧取得
   */
  SKILL_LIST: "skill:list",

  /**
   * スキルインポート
   */
  SKILL_IMPORT: "skill:import",

  /**
   * スキル削除
   */
  SKILL_REMOVE: "skill:remove",

  /**
   * スキル詳細取得
   */
  SKILL_GET_DETAIL: "skill:get-detail",

  /**
   * スキル更新
   */
  SKILL_UPDATE: "skill:update",

  /**
   * スキル実行
   */
  SKILL_EXECUTE: "skill:execute",

  /**
   * スキル実行中断
   */
  SKILL_ABORT: "skill:abort",

  /**
   * スキルストリーム
   */
  SKILL_STREAM: "skill:stream",

  /**
   * 権限リクエスト（Main → Renderer）
   */
  SKILL_PERMISSION_REQUEST: "skill:permission:request",

  /**
   * 権限応答（Renderer → Main）
   */
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",

  // Skill file operations (TASK-9A-B)
  /** スキルファイル読み込み */
  SKILL_READ_FILE: "skill:readFile",
  /** スキルファイル書き込み */
  SKILL_WRITE_FILE: "skill:writeFile",
  /** スキルファイル新規作成 */
  SKILL_CREATE_FILE: "skill:createFile",
  /** スキルファイル削除 */
  SKILL_DELETE_FILE: "skill:deleteFile",
  /** スキルバックアップ一覧 */
  SKILL_LIST_BACKUPS: "skill:listBackups",
  /** スキルバックアップ復元 */
  SKILL_RESTORE_BACKUP: "skill:restoreBackup",
} as const;

/**
 * 通知関連のIPCチャネル
 */
export const NOTIFICATION_CHANNELS = {
  NOTIFICATION_GET_HISTORY: "notification:get-history",
  NOTIFICATION_MARK_READ: "notification:mark-read",
  NOTIFICATION_MARK_ALL_READ: "notification:mark-all-read",
  NOTIFICATION_DELETE: "notification:delete",
  NOTIFICATION_CLEAR: "notification:clear",
  NOTIFICATION_NEW: "notification:new",
} as const;

/**
 * 履歴検索関連のIPCチャネル
 */
export const HISTORY_SEARCH_CHANNELS = {
  HISTORY_SEARCH: "history:search",
  HISTORY_GET_STATS: "history:get-stats",
} as const;

/**
 * 承認フロー関連のIPCチャネル
 */
export const APPROVAL_CHANNELS = {
  APPROVAL_RESPOND: "approval:respond",
  APPROVAL_REQUEST: "approval:request",
} as const;

/**
 * 実行情報開示関連のIPCチャネル
 */
export const EXECUTION_CHANNELS = {
  EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
  EXECUTION_GET_TERMINAL_LOG: "execution:get-terminal-log",
  EXECUTION_GET_COPY_COMMAND: "execution:get-copy-command",
} as const;

/**
 * スキルチャネル型
 */
export type SkillChannel = (typeof SKILL_CHANNELS)[keyof typeof SKILL_CHANNELS];

/**
 * スキルクリエイター SDK セッションブリッジ関連のIPCチャネル
 * TASK-SDK-SC-01: SDK Session Bridge
 */
export const SKILL_CREATOR_SESSION_CHANNELS = {
  /** Renderer → Main: セッション開始リクエスト */
  START_SESSION: "skill-creator:start-session",
  /** Main → Renderer: UserInput質問イベント */
  QUESTION_RECEIVED: "skill-creator:question-received",
  /** Renderer → Main: ユーザー回答送信 */
  ANSWER: "skill-creator:answer",
  /** Main → Renderer: セッション完了通知 */
  SESSION_COMPLETE: "skill-creator:session-complete",
  /** Main → Renderer: セッションエラー通知 */
  SESSION_ERROR: "skill-creator:session-error",
  /** Main → Renderer: 外部API設定要求（ExternalApiConfigForm 表示トリガー） */
  EXTERNAL_API_CONFIG_REQUIRED: "skill-creator:external-api-config-required",
} as const;

/**
 * スキルクリエイター 外部API連携のIPCチャネル
 * TASK-SDK-SC-03: External API Support
 */
export const SKILL_CREATOR_EXTERNAL_API_CHANNELS = {
  /** Renderer → Main: 外部API設定を送信 */
  CONFIGURE_API: "skill-creator:configure-api",
  /** Main → Renderer: API設定確認応答 */
  API_CONFIGURED: "skill-creator:api-configured",
  /** Main → Renderer: API接続テスト結果 */
  API_TEST_RESULT: "skill-creator:api-test-result",
} as const;

/**
 * スキルクリエイター runtime 系のIPCチャネル
 * preload の直書きを廃止し、shared を正本とする。
 * @see apps/desktop/src/preload/channels.ts
 */
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_CANCEL: "skill-creator:cancel",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;

/**
 * スキルクリエイター 出力統合のIPCチャネル
 * TASK-SDK-SC-04: Skill Output Integration
 */
export const SKILL_CREATOR_OUTPUT_READY = "skill-creator:output-ready" as const;
export const SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED =
  "skill-creator:output-overwrite-approved" as const;
export const SKILL_CREATOR_OPEN_SKILL = "skill-creator:open-skill" as const;
export const SKILL_CREATOR_VERIFY = "skill-creator:verify" as const;

/**
 * すべてのIPCチャネル定数
 */
export const IPC_CHANNELS = {
  ...CHAT_EXPORT_CHANNELS,
  ...FILE_SYSTEM_CHANNELS,
  ...SKILL_CHANNELS,
  ...SKILL_CREATOR_SESSION_CHANNELS,
  ...SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  ...SKILL_CREATOR_RUNTIME_CHANNELS,
  SKILL_CREATOR_OUTPUT_READY,
  SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
  SKILL_CREATOR_OPEN_SKILL,
  SKILL_CREATOR_VERIFY,
  ...NOTIFICATION_CHANNELS,
  ...HISTORY_SEARCH_CHANNELS,
  ...APPROVAL_CHANNELS,
  ...EXECUTION_CHANNELS,
} as const;

/**
 * IPCチャネル型（型安全性確保）
 */
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
