/**
 * workspace-chat-edit 機能の型定義
 *
 * @description ワークスペースファイルをチャットで編集する機能のドメインモデル
 */

// ========================================
// Value Objects
// ========================================

/**
 * テキスト選択範囲
 */
export interface TextSelection {
  /** 開始行（1始まり） */
  startLine: number;
  /** 開始列（1始まり） */
  startColumn: number;
  /** 終了行（1始まり） */
  endLine: number;
  /** 終了列（1始まり） */
  endColumn: number;
  /** 選択されたテキスト */
  selectedText: string;
}

/**
 * 差分の塊
 */
export type DiffHunkType = "add" | "remove" | "modify";

export interface DiffHunk {
  /** 差分タイプ */
  type: DiffHunkType;
  /** 開始行（元ファイル） */
  originalStartLine: number;
  /** 終了行（元ファイル） */
  originalEndLine: number;
  /** 開始行（新ファイル） */
  newStartLine: number;
  /** 終了行（新ファイル） */
  newEndLine: number;
  /** 元の行 */
  originalLines: string[];
  /** 新しい行 */
  newLines: string[];
}

// ========================================
// Entities
// ========================================

/**
 * 添付ファイルコンテキスト
 */
export interface FileContext {
  /** ユニークID（UUID v4） */
  id: string;
  /** ファイルの絶対パス */
  filePath: string;
  /** ファイル名（表示用） */
  fileName: string;
  /** ファイル内容（テキスト） */
  content: string;
  /** 選択範囲（オプション） */
  selection?: TextSelection;
  /** プログラミング言語（拡張子から検出） */
  language: string;
  /** 添付日時 */
  addedAt: Date;
  /** ファイルサイズ（バイト） */
  fileSize: number;
}

/**
 * 編集コマンド種別
 */
export type EditCommandType =
  | "continue" // 続きを書く
  | "refactor" // リファクタリング
  | "generate-test" // テスト生成
  | "add-comment" // コメント追加
  | "custom"; // カスタム指示

/**
 * 編集コマンドオプション
 */
export interface EditCommandOptions {
  /** 言語指定（テスト生成時） */
  testFramework?: string;
  /** コメントスタイル（JSDoc, 単行等） */
  commentStyle?: "jsdoc" | "inline" | "block";
  /** リファクタリングの観点 */
  refactorFocus?: "readability" | "performance" | "type-safety";
}

/**
 * 編集コマンド
 */
export interface EditCommand {
  /** コマンド種別 */
  type: EditCommandType;
  /** 対象FileContextのID */
  targetContextId: string;
  /** カスタム指示（typeがcustomの場合） */
  instruction?: string;
  /** 追加のオプション */
  options?: EditCommandOptions;
}

/**
 * 生成結果ステータス
 */
export type GeneratedResultStatus = "pending" | "approved" | "rejected";

/**
 * LLMメタ情報
 */
export interface LLMMetadata {
  /** 使用したモデル */
  model: string;
  /** 使用したトークン数 */
  tokensUsed: number;
  /** 生成時間（ms） */
  generationTimeMs: number;
}

/**
 * LLM生成結果
 */
export interface GeneratedResult {
  /** ユニークID（UUID v4） */
  id: string;
  /** 関連FileContextのID */
  contextId: string;
  /** 元のコンテンツ */
  originalContent: string;
  /** 生成されたコンテンツ */
  generatedContent: string;
  /** 差分情報 */
  diffHunks: DiffHunk[];
  /** ステータス */
  status: GeneratedResultStatus;
  /** 作成日時 */
  createdAt: Date;
  /** 適用先ファイルパス */
  targetFilePath: string;
  /** 使用したコマンド */
  command: EditCommand;
  /** LLMのメタ情報 */
  llmMetadata?: LLMMetadata;
}

/**
 * 適用サマリー
 */
export interface ApplySummary {
  /** 追加行数 */
  linesAdded: number;
  /** 削除行数 */
  linesRemoved: number;
  /** 変更行数 */
  linesModified: number;
}

/**
 * 適用結果
 */
export interface ApplyResult {
  /** 成功/失敗 */
  success: boolean;
  /** 適用先ファイルパス */
  filePath: string;
  /** 適用日時 */
  appliedAt: Date;
  /** バックアップファイルパス（作成した場合） */
  backupPath?: string;
  /** エラーメッセージ */
  error?: string;
  /** 適用した差分のサマリー */
  summary?: ApplySummary;
}

// ========================================
// IPC Types
// ========================================

/**
 * ファイル読み取りエラー
 */
export interface FileReadError {
  code: "FILE_NOT_FOUND" | "PERMISSION_DENIED" | "READ_ERROR" | "TOO_LARGE";
  message: string;
}

/**
 * ファイル読み取り結果
 */
export interface FileReadResult {
  success: boolean;
  content?: string;
  language?: string;
  fileSize?: number;
  error?: FileReadError;
}

/**
 * ファイル書き込みオプション
 */
export interface FileWriteOptions {
  /** バックアップを作成するか */
  createBackup?: boolean;
  /** エンコーディング（デフォルト: utf-8） */
  encoding?: string;
}

/**
 * ファイル書き込みエラー
 */
export interface FileWriteError {
  code: "PERMISSION_DENIED" | "WRITE_ERROR" | "INVALID_PATH";
  message: string;
}

/**
 * ファイル書き込み結果
 */
export interface FileWriteResult {
  success: boolean;
  backupPath?: string;
  error?: FileWriteError;
}

/**
 * ファイルコンテキスト入力（IPC用）
 */
export interface FileContextInput {
  filePath: string;
  content: string;
  selection?: TextSelection;
  language: string;
}

/**
 * 送信オプション
 */
export interface SendOptions {
  /** 使用するモデルID */
  modelId?: string;
  /** ストリーミング有効化 */
  stream?: boolean;
  /** 最大トークン数 */
  maxTokens?: number;
}

/**
 * コンテキスト付き送信リクエスト
 */
export interface SendWithContextRequest {
  /** 添付するファイルコンテキスト */
  contexts: FileContextInput[];
  /** 編集コマンド */
  command: EditCommand;
  /** ユーザーメッセージ */
  message: string;
  /** オプション */
  options?: SendOptions;
}

/**
 * 送信エラー
 */
export interface SendError {
  code:
    | "CONTEXT_TOO_LARGE"
    | "LLM_ERROR"
    | "TIMEOUT"
    | "RATE_LIMIT"
    | "INVALID_COMMAND";
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
}

/**
 * コンテキスト付き送信レスポンス
 */
export interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: SendError;
}

/**
 * ストリーミング出力イベント
 */
export interface StreamOutputEvent {
  /** イベントタイプ */
  type: "content" | "done" | "error";
  /** コンテンツ（typeがcontentの場合） */
  content?: string;
  /** 完了フラグ（typeがdoneの場合） */
  done?: boolean;
  /** エラー情報（typeがerrorの場合） */
  error?: {
    code: string;
    message: string;
  };
}

// ========================================
// Store Types
// ========================================

/**
 * chatEditSlice 状態
 */
export interface ChatEditState {
  /** 添付されたファイルコンテキスト一覧 */
  fileContexts: FileContext[];
  /** 現在アクティブなコンテキストID */
  activeContextId: string | null;
  /** LLM生成結果一覧 */
  generatedResults: GeneratedResult[];
  /** 現在表示中の結果ID */
  currentResultId: string | null;
  /** ローディング中 */
  isLoading: boolean;
  /** 差分プレビュー表示中 */
  isDiffPreviewOpen: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** ドラッグ中フラグ */
  isDragging: boolean;
}

/**
 * chatEditSlice アクション
 */
export interface ChatEditActions {
  /** ファイルコンテキストを追加 */
  addFileContext: (context: Omit<FileContext, "id" | "addedAt">) => void;
  /** ファイルコンテキストを削除 */
  removeFileContext: (id: string) => void;
  /** 全コンテキストをクリア */
  clearAllContexts: () => void;
  /** アクティブコンテキストを設定 */
  setActiveContext: (id: string | null) => void;
  /** 生成結果を設定 */
  setGeneratedResult: (result: GeneratedResult) => void;
  /** 結果を承認 */
  approveResult: (resultId: string) => Promise<ApplyResult>;
  /** 結果を却下 */
  rejectResult: (resultId: string) => void;
  /** 結果をクリア */
  clearResults: () => void;
  /** 差分プレビューを開く */
  openDiffPreview: (resultId: string) => void;
  /** 差分プレビューを閉じる */
  closeDiffPreview: () => void;
  /** ローディング状態を設定 */
  setLoading: (loading: boolean) => void;
  /** エラーを設定 */
  setError: (error: string | null) => void;
  /** ドラッグ状態を設定 */
  setDragging: (dragging: boolean) => void;
  /** 状態をリセット */
  reset: () => void;
}

/**
 * chatEditSlice 型
 */
export type ChatEditSlice = ChatEditState & ChatEditActions;

// ========================================
// Constants
// ========================================

/** ファイルコンテキスト最大数 */
export const MAX_FILE_CONTEXTS = 10;

/** ファイルサイズ上限（バイト） */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** コンテキスト合計サイズ上限（バイト） */
export const MAX_CONTEXT_SIZE = 100 * 1024; // 100KB
