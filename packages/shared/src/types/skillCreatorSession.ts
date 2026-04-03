/**
 * SkillCreator SDK Session Bridge 型定義
 * TASK-SDK-SC-01: SDK Session Bridge
 *
 * SDKセッションライフサイクルと UserInput ブリッジの型を定義する。
 */

// ============================================
// セッション状態型
// ============================================

/**
 * セッション状態
 * - running: SDK query() 実行中
 * - awaiting-input: UserInput ツールコール待ち（ユーザー回答待機）
 * - completed: セッション正常終了
 * - error: セッションエラー終了
 */
export type SessionStatus =
  | "running"
  | "awaiting-input"
  | "completed"
  | "error";

// ============================================
// UserInput 型
// ============================================

/**
 * UserInput の種別（5種）
 * - single_select: 単一選択（ラジオボタン）
 * - multi_select: 複数選択（チェックボックス）
 * - free_text: 自由入力（テキストフィールド）
 * - secret: パスワード入力（マスク表示）
 * - confirm: 確認（はい/いいえ）
 */
export type UserInputType =
  | "single_select"
  | "multi_select"
  | "free_text"
  | "secret"
  | "confirm";

/**
 * UserInput の選択肢
 */
export interface UserInputOption {
  value: string;
  label: string;
  description?: string;
  preview?: string;
}

/**
 * UserInput 質問（SDK → IpcBridge → Renderer に転送される）
 */
export interface UserInputQuestion {
  /** ツールコールID（回答の紐付けに使用） */
  toolCallId: string;
  /** 入力種別 */
  type: UserInputType;
  /** 質問テキスト */
  question: string;
  /** 選択肢（single_select / multi_select 時） */
  options?: UserInputOption[];
  /** プレースホルダー（free_text / secret 時） */
  placeholder?: string;
}

/**
 * UserInput 回答（Renderer → IpcBridge → SdkSession に注入される）
 */
export interface UserInputAnswer {
  /** ツールコールID（質問との紐付け） */
  toolCallId: string;
  /**
   * 回答値
   * - string: free_text / secret / single_select
   * - string[]: multi_select
   * - boolean: confirm
   */
  value: string | string[] | boolean;
}

/**
 * SDK Session 開始リクエスト
 */
export interface SkillCreatorSessionStartRequest {
  request: string;
  sessionId?: string;
}

/**
 * SDK Session 完了イベント
 */
export interface SkillCreatorSessionCompleteEvent {
  result: string;
}

/**
 * SDK Session エラーイベント
 */
export interface SkillCreatorSessionErrorEvent {
  error: string;
}

// ============================================
// セッション状態インターフェース
// ============================================

/**
 * SDKセッション状態
 * SkillCreatorSdkSession が管理する内部状態
 */
export interface ISkillCreatorSessionState {
  /** セッションID */
  sessionId: string;
  /** セッション状態 */
  status: SessionStatus;
  /** 現在の質問（awaiting-input 状態時のみ設定） */
  currentQuestion?: UserInputQuestion;
  /** セッション結果（completed 状態時のみ設定） */
  result?: string;
  /** エラーメッセージ（error 状態時のみ設定） */
  error?: string;
  /** セッション開始時刻 */
  startedAt: Date;
  /** 最終更新時刻 */
  updatedAt: Date;
}
