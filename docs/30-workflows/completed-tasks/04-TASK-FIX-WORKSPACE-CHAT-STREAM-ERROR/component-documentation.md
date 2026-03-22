# StreamingErrorDisplay コンポーネントドキュメント

## 概要

Workspace Chat のストリーミング失敗を、`streamingError` を primary contract として表示するコンポーネント。`errorMessage` は legacy fallback に限定する。

## ファイルパス

`apps/desktop/src/renderer/views/WorkspaceView/components/StreamingErrorDisplay.tsx`

## Props

```typescript
interface StreamingErrorDisplayProps {
  error: StreamingErrorState;
  onDismiss: () => void;
  onRetry: () => Promise<void>;
  onOpenSettings: () => void;
  isRetrying?: boolean; // default: false
}
```

## 使用例

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

## 挙動

| action       | 表示内容                                                |
| ------------ | ------------------------------------------------------- |
| `"SETTINGS"` | エラーメッセージ + 「設定を開く」ボタン                 |
| `"RETRY"`    | エラーメッセージ + 「再試行」ボタン + 必要に応じて hint |
| `null`       | エラーメッセージのみ                                    |

## 契約

- `WorkspaceChatPanel` は `streamingError` を優先して描画する。
- `errorMessage` は `StreamingErrorDisplay` ではなく `WorkspaceChatInput` 側の legacy fallback として扱う。
- `dismissStreamingError()` は structured state と fallback を同時に消去する。
- `retryLastMessage()` は retryable かつ last user message がある場合のみ動作する。

## スタイル（Apple HIG準拠）

| 要素     | ライトモード           | ダークモード           |
| -------- | ---------------------- | ---------------------- |
| 背景     | `rgba(255,59,48,0.08)` | `rgba(255,69,58,0.12)` |
| テキスト | `#FF3B30`              | `#FF453A`              |
| ボタン   | `#007AFF`              | `#0A84FF`              |
| ボーダー | `#C6C6C8`              | `#38383A`              |
| 角丸     | `8px`                  | `8px`                  |

## アクセシビリティ

- `role="alert"` + `aria-live="assertive"` を付与する。
- 全ボタンに適切なラベルを付与する。
- キーボードだけでも `Settings` / `Retry` / dismiss を操作できる。
