# 実装ガイド: ChatView エラーサイレント握りつぶし修正

## Part 1: 概念説明（中学生レベル）

### なぜ必要か

AIチャットでメッセージを送信すると、時々 AI からの返事が来ないことがありました。でも画面には何も表示されず、「なんで返事がこないんだろう？」とユーザーは困っていました。

たとえば、宿題を先生に渡したのに「受け取れませんでした」とも「ここが足りません」とも言われないと、直しようがありません。今回の修正は、その「理由が見えない」をなくすために必要でした。

### 何をするか

「お手紙が届きませんでした。理由はこれです」というお知らせを画面に出すようにしました。

- AIが使えない → 「AI機能が利用できません」
- ネットワークエラー → 「メッセージの送信に失敗しました」
- APIキー未設定 → 「APIキーが設定されていません」

このお知らせは：

- 5秒経つと自動的に消えます
- ×ボタンで手動で消せます
- 次のメッセージを送ると前のお知らせは消えます

### なぜこの方法にしたの？

お知らせ（エラーバナー）をメッセージ入力欄のすぐ上に出すことで、ユーザーが「何かおかしい」とすぐ気づけるようにしました。赤い色で目立たせていますが、Appleのデザインガイドに従った落ち着いた赤色です。

---

## Part 2: 技術者向け詳細

### 対象ファイル

| ファイル                                              | 変更内容                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts` | `chatError` state、`clearChatError`、`callLLMAPI` の error 伝搬     |
| `apps/desktop/src/renderer/store/index.ts`            | `useChatError` / `useClearChatError` 個別セレクタ                   |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`  | `ERROR_MESSAGES`、`getErrorMessage`、エラーバナー JSX、5 秒タイマー |

### TypeScript の型定義

```ts
export type ChatErrorCode =
  | "AI_UNAVAILABLE"
  | "API_CALL_FAILED"
  | "API_KEY_MISSING"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface ChatSlice {
  chatError: string | null;
  clearChatError: () => void;
}

export interface CallLLMResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  AI_UNAVAILABLE: "AI機能が利用できません",
  API_CALL_FAILED: "メッセージの送信に失敗しました",
  API_KEY_MISSING: "APIキーが設定されていません",
  NETWORK_ERROR: "ネットワーク接続を確認してください",
  UNKNOWN_ERROR: "予期しないエラーが発生しました",
};
```

### API / CLI シグネチャ

- `async function callLLMAPI(...): Promise<CallLLMResult>`
- `function getErrorMessage(code: string): string`
- `function clearChatError(): void`
- `pnpm --filter @repo/desktop dev` で UI を起動し、手動で TC-11-01 〜 TC-11-05 を確認する

### 使用例

```ts
const response = await callLLMAPI(
  message,
  systemPrompt,
  ragEnabled,
  providerId,
  modelId,
);

if (response.success && response.message) {
  appendAIMessage(response.message);
} else {
  set({
    chatError: response.error ?? "UNKNOWN_ERROR",
    isSending: false,
  });
}
```

### エラーハンドリング

- `window.electronAPI` が存在しない場合は `AI_UNAVAILABLE` にフォールバックする。
- `response.error` が文字列でない場合は `UNKNOWN_ERROR` に変換する。
- `chatError` は送信開始時に必ずクリアし、古いバナーが残らないようにする。
- バナー表示後は 5 秒で `clearChatError()` を呼び、タイマーは `useEffect` の cleanup で解放する。

### エッジケース

- `response.error` がオブジェクト型でも `typeof` ガードで落とす。
- `clearChatError` を null 状態で呼んでも冪等に振る舞う。
- 手動クローズ直後に再送信しても、前回のエラーが再表示されない。
- ダークテーマでは systemRed の別トークンを使っても、視認性とコントラストを維持する。

### 設定可能なパラメータと定数

| 項目                  | 値               | 用途                      |
| --------------------- | ---------------- | ------------------------- |
| `ERROR_AUTO_CLEAR_MS` | `5000`           | 自動消去の待機時間        |
| `ERROR_BANNER_ROLE`   | `alert`          | スクリーンリーダー通知    |
| `ERROR_CLOSE_LABEL`   | `エラーを閉じる` | 閉じるボタンの aria-label |
| `ERROR_MESSAGES`      | Record           | エラーコード → 文言の辞書 |

### 検証結果

- `chatSlice.test.ts`: 57 テスト全 PASS（chatError 関連 11件）
- `ChatView.test.tsx`: 37 テスト全 PASS（エラーバナー関連 14件）
- TypeCheck: エラーなし
- ESLint: エラーなし
