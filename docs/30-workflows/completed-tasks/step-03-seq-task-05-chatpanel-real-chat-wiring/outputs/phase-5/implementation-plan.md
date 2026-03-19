# Phase 5: 実装計画

## タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001

## ステータス: completed

## 実装順序（6段階）

### Step 1: chatSlice 拡張

- `ChatPanelStatus` 型定義（8状態）
- `AccessCapability` 型定義（4値）
- 新規ステート: `chatPanelStatus`, `resolvedCapability`, `currentConversationId`
- 新規アクション: `setChatPanelStatus`, `setResolvedCapability`, `setCurrentConversationId`, `resetChat`
- ストリーミングアクション: `startStreaming`, `appendStreamChunk`, `endStreaming`, `cancelStreaming`, `setStreamingError`

### Step 2: Store セレクタ追加（P31/P48 準拠）

- 個別セレクタ9個追加: `useChatPanelStatus`, `useSetChatPanelStatus`, `useResolvedCapability`, `useSetResolvedCapability`, `useCurrentConversationId`, `useSetCurrentConversationId`, `useChatMessagesShallow`, `useAddChatMessage`, `useResetChat`
- `useChatMessagesShallow` は `useShallow` ラップ（P48対策）

### Step 3: コンポーネントスタブ作成（10ファイル）

- RuntimeBanner, ChatMessage, ChatMessageList, ErrorGuidance, HandoffBlock, PersistentTerminalLauncher, ComposerInput, SendButton, ComposerArea, LLMSelectorPanel
- 各コンポーネントは TypeScript インターフェース + 最小実装

### Step 4: ChatPanel.tsx 全面書き換え

- 3つの placeholder スロット置換
- `useStreamingChat` フック接続
- 状態機械に基づく条件レンダリング
- Ref パターンによる cleanup 安全化

### Step 5: テストモック修正（TDD Green）

- `useStreamingChat` モック: `{ state, actions }` 構造に統一
- ストア状態: 欠落フィールド追加（`resolvedCapability`, `chatInput`, `setChatInput`, `providers`, `handoffGuidance`）
- ErrorGuidance props: `code`, `message`, `retryable`, `onNavigateToSettings`
- blocked/handoff 状態での ComposerArea 非表示対応

### Step 6: 既存テスト互換性維持（26テスト）

- ChatPanel.test.tsx (15テスト): 新コンポーネントモック追加、ストア状態拡張
- ChatPanel.skill-management.test.tsx (17テスト): `message-list-slot` → `mock-chat-message-list` 置換

## P31/P48 対策

| パターン | 対策                                           |
| -------- | ---------------------------------------------- |
| P31      | 個別セレクタ使用、合成Hook回避                 |
| P48      | `useChatMessagesShallow` に `useShallow` 適用  |
| P62      | DEFAULT_CONFIG fallback 禁止、明示的エラー表示 |
| P39      | fireEvent のみ使用                             |
| P60      | IPC wrapper 形式準拠                           |

## テスト結果

- 全114テスト PASS
  - ChatPanel.chat-wiring.test.tsx: 32テスト
  - ChatPanel.settings-sync.test.tsx: 8テスト
  - ChatPanel.accessibility.test.tsx: 11テスト
  - ChatPanel.test.tsx: 15テスト
  - ChatPanel.skill-management.test.tsx: 17テスト
  - StreamingMessage.test.tsx: 31テスト
