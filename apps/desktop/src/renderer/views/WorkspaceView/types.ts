export type StreamingErrorAction = "SETTINGS" | "RETRY" | null;

export interface StreamingErrorState {
  /** エラーコード（例: "API_KEY_MISSING", "NETWORK_ERROR"） */
  code: string;
  /** ユーザー向け日本語エラーメッセージ */
  message: string;
  /** リトライ可能かどうか */
  retryable: boolean;
  /** UIに表示するアクション種別 */
  action: StreamingErrorAction;
  /** RATE_LIMIT時などの追加ヒントテキスト */
  hint?: string;
}
