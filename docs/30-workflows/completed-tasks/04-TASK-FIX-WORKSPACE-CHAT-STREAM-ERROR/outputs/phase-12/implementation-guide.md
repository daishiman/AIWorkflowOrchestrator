# WorkspaceChat ストリーミングエラーUX改善 - 実装ガイド

## Part 1: 中学生でもわかる概念説明

### エラーって何のこと？

AIとチャットしているとき、うまくいかないことがあります。たとえば：

- **お店のレジで支払い方法が登録されていない**（= APIキーがない）
- **電話が繋がらない**（= ネットワークエラー）
- **お店が混みすぎていて注文を断られた**（= レート制限）

このような「うまくいかなかった理由」のことを「エラーコード」といいます。

### なぜ必要か

エラーが起きたときに何も案内がないと、ユーザーは「何が悪かったか」だけでなく「次に何をすればいいか」も分からなくなります。だから、`streamingError` にまとめて、すぐに次の行動へつなげる必要があります。

### 何が変わるか

**改善前**: エラーが起きても、画面のどこに何を出せばいいかがばらばらでした。`errorMessage` だけが出る場所もあれば、何も出ない場所もありました。

**改善後**: `streamingError` という「今見せるべきエラー情報」を1つにまとめて、エラーの種類に応じて「次に何をすべきか」を示すボタンを表示します。

- APIキーがないエラー → 「設定を開く」ボタンで設定画面に案内
- ネットワークエラー → 「再試行」ボタンで同じメッセージを再送
- レート制限 → 「しばらく待ってから再試行してください」のヒント + 「再試行」ボタン

これは、迷子になった人に「次の角を右に曲がってください」と道案内するようなイメージです。

### 3つの主要な部品

1. **エラー種別判定 (`mapLLMErrorToStreamingError`)**: エラーコードを見て「このエラーはどんなアクションが必要か」を判断する辞書のような関数
2. **エラー表示コンポーネント (`StreamingErrorDisplay`)**: 判断結果を画面に見せる部品。メッセージ・ヒント・ボタンを表示する
3. **状態管理 (`useWorkspaceChatController` の拡張)**: `streamingError` を持ち、`errorMessage` は古い表示のための予備に回す仕組み

---

## Part 2: 開発者向け実装詳細

### アーキテクチャ概要

```
LLM API（Main Process）
    | onStreamError IPC
useWorkspaceChatController（Renderer）
    | mapLLMErrorToStreamingError
    | setStreamingError(state)
WorkspaceChatPanel
    | streamingError prop
StreamingErrorDisplay（UI）
    | onDismiss / onRetry / onOpenSettings callbacks
```

IPC層は変更なし。`onStreamError` コールバックの受信後、Renderer 側のみで `streamingError` を作成・保持・描画した。

### 新規実装ファイル

| ファイル                               | 責務                                                  |
| -------------------------------------- | ----------------------------------------------------- |
| `hooks/mapLLMErrorToStreamingError.ts` | エラーコード -> `StreamingErrorState` の純粋変換関数  |
| `components/StreamingErrorDisplay.tsx` | エラー表示UIコンポーネント（Apple HIG準拠）           |
| `types.ts`                             | `StreamingErrorState` / `StreamingErrorAction` 型定義 |

### 既存ファイルの変更

| ファイル                              | 変更内容                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `hooks/useWorkspaceChatController.ts` | `streamingError` state 追加、`retryLastMessage` / `dismissStreamingError` 追加、`sendMessageCore` 抽出 |
| `WorkspaceChatPanel.tsx`              | `StreamingErrorDisplay` の統合、`streamingError` 優先表示、`handleOpenSettings` 追加                   |

### 型定義

```typescript
export type StreamingErrorAction = "SETTINGS" | "RETRY" | null;

export interface StreamingErrorState {
  code: string;
  message: string;
  retryable: boolean;
  action: StreamingErrorAction;
  hint?: string;
}

export function mapLLMErrorToStreamingError(
  error: unknown,
): StreamingErrorState | null;
```

### APIシグネチャ

```typescript
function mapLLMErrorToStreamingError(
  error: unknown,
): StreamingErrorState | null;

interface StreamingErrorDisplayProps {
  error: StreamingErrorState;
  onDismiss: () => void;
  onRetry: () => Promise<void>;
  onOpenSettings: () => void;
  isRetrying?: boolean;
}

type WorkspaceChatController = {
  streamingError: StreamingErrorState | null;
  retryLastMessage: () => Promise<void>;
  dismissStreamingError: () => void;
};
```

### 使用例

```tsx
{
  controller.streamingError ? (
    <StreamingErrorDisplay
      error={controller.streamingError}
      onDismiss={controller.dismissStreamingError}
      onRetry={controller.retryLastMessage}
      onOpenSettings={handleOpenSettings}
      isRetrying={controller.isSending}
    />
  ) : null;
}
```

### エラーコード別アクション

| エラーコード     | アクション       | retryable |
| ---------------- | ---------------- | --------- |
| API_KEY_MISSING  | SETTINGS         | false     |
| MODEL_NOT_FOUND  | SETTINGS         | false     |
| NETWORK_ERROR    | RETRY            | true      |
| TIMEOUT          | RETRY            | true      |
| RATE_LIMIT       | RETRY (hint付き) | true      |
| VALIDATION_ERROR | なし             | false     |
| その他           | なし             | false     |

### 後方互換性

既存の `errorMessage: string | null` は維持するが、これは legacy fallback としてのみ使う。`streamingError` が primary contract であり、`WorkspaceChatPanel` は structured error がある場合そちらを優先する。

### エラーハンドリング

- `dismissStreamingError()` は structured error と fallback を同時にクリアする。
- `retryLastMessage()` は retryable で last user message がある場合だけ実行する。
- `WorkspaceChatPanel` は `streamingError` があるときだけ `StreamingErrorDisplay` を出し、`errorMessage` は inline fallback に限定する。

### エッジケース

- `streamingError` が `null` のときはバナーを描画しない。
- retryable でないエラーは `RETRY` ではなく `SETTINGS` または表示のみになる。
- `lastUserMessageRef` がない場合は retry を無効化する。

### 設定可能なパラメータと定数

| 項目                            | 値                      |
| ------------------------------- | ----------------------- |
| `StreamingErrorAction.SETTINGS` | 設定画面へ遷移          |
| `StreamingErrorAction.RETRY`    | 再試行を案内            |
| `errorMessage`                  | legacy fallback 表示    |
| `hint`                          | RATE_LIMIT 時の補足文言 |

### 設計上の重要な判断

1. **sendMessageCore の抽出**: `sendMessage` は `input` state を直接使用していたため、リトライ用に `sendMessageCore(content, addToMessages)` として内部ロジックを切り出した。`sendMessage` と `retryLastMessage` の両方から呼び出す。
2. **Settings 遷移**: `useSetCurrentView` -> `setCurrentView("settings")` の既存パターンを流用。`StreamingErrorDisplay` の SETTINGS アクションからそのまま開く。
3. **リトライ時のメッセージ非追加**: `retryLastMessage` は `addToMessages: false` で呼び出し、チャット履歴に同じメッセージを重複追加しない。
4. **エラー消去**: `dismissStreamingError()` は structured state と legacy fallback の両方をクリアして、二重表示を防ぐ。
