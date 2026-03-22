import type { StreamingErrorState } from "../types";

type LLMError = { code?: string; message: string };

export function mapLLMErrorToStreamingError(
  error: LLMError,
): StreamingErrorState {
  const code = error.code ?? "UNKNOWN";

  switch (code) {
    case "API_KEY_MISSING":
      return {
        code,
        message: "APIキーが設定されていません。",
        retryable: false,
        action: "SETTINGS",
      };
    case "MODEL_NOT_FOUND":
      return {
        code,
        message:
          "指定されたモデルが見つかりません。Settings でモデルを再選択してください。",
        retryable: false,
        action: "SETTINGS",
      };
    case "NETWORK_ERROR":
      return {
        code,
        message: "ネットワークエラーが発生しました。",
        retryable: true,
        action: "RETRY",
      };
    case "TIMEOUT":
      return {
        code,
        message: "リクエストがタイムアウトしました。",
        retryable: true,
        action: "RETRY",
      };
    case "RATE_LIMIT":
      return {
        code,
        message: "API のレート制限に達しました。",
        retryable: true,
        action: "RETRY",
        hint: "しばらく待ってから再試行してください。",
      };
    case "VALIDATION_ERROR":
      return {
        code,
        message: `リクエストの検証に失敗しました: ${error.message}`,
        retryable: false,
        action: null,
      };
    default:
      return {
        code,
        message: `AI応答に失敗しました: ${error.message}`,
        retryable: false,
        action: null,
      };
  }
}
