# ChatPanel 構造分析レポート

## 分析日: 2026-01-30

## 現状

ChatPanel.tsx は `apps/desktop/src/renderer/components/chat/` ディレクトリに **存在しない**。新規作成が必要。

### 既存ファイル構成

| ファイル                            | 説明                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| StreamingMessage.tsx                | LLMストリーミングレスポンス表示コンポーネント（82行） |
| **tests**/StreamingMessage.test.tsx | StreamingMessage テスト（162テスト）                  |

### StreamingMessage.tsx 分析

- **Props**: `content: string`, `isStreaming: boolean`, `showCursor?: boolean`, `onCancel?: () => void`, `className?: string`
- **パターン**: `memo` + `forwardRef` でラップ
- **アクセシビリティ**: `role="status"`, `aria-live="polite"`, `aria-busy={isStreaming}`
- **スタイリング**: `cn()` ユーティリティ使用、Tailwind CSS クラス
- **data-testid**: `streaming-message`, `streaming-cursor`, `cancel-button`

### ストア依存

ChatPanel は未作成のため依存なし。新規作成時に useAppStore から以下を取得する必要がある:

- skillSlice の状態: `selectedSkillName`, `streamingMessages`, `isExecuting`, `skillExecutionStatus`, `pendingPermission`
- skillSlice のアクション: `fetchSkills`, `abortExecution`

### ヘッダー構成

既存の ModelSelector の配置位置は ChatPanel 未作成のため不明。設計フェーズで決定する。

## 結論

ChatPanel.tsx は完全新規作成。StreamingMessage.tsx のパターン（memo、ARIA、data-testid）を踏襲する。
