# Phase 5: 変更ファイル一覧

## タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001

## 変更ファイル（13ファイル）

### プロダクションコード（3ファイル）

| ファイル                                                  | 変更種別 | 変更内容                                                        |
| --------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`     | 拡張     | ChatPanelStatus/AccessCapability型、新規ステート/アクション追加 |
| `apps/desktop/src/renderer/store/index.ts`                | 拡張     | 個別セレクタ9個追加（P31/P48準拠）                              |
| `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` | 全面書換 | 3 placeholder 置換、useStreamingChat 接続                       |

### コンポーネントスタブ（10ファイル - 新規作成）

| ファイル                                                                   | 種別     |
| -------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/chat/RuntimeBanner.tsx`              | atom     |
| `apps/desktop/src/renderer/components/chat/ChatMessage.tsx`                | atom     |
| `apps/desktop/src/renderer/components/chat/ChatMessageList.tsx`            | molecule |
| `apps/desktop/src/renderer/components/chat/ErrorGuidance.tsx`              | molecule |
| `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`               | molecule |
| `apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx` | atom     |
| `apps/desktop/src/renderer/components/chat/ComposerInput.tsx`              | atom     |
| `apps/desktop/src/renderer/components/chat/SendButton.tsx`                 | atom     |
| `apps/desktop/src/renderer/components/chat/ComposerArea.tsx`               | molecule |
| `apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx`           | molecule |

### テストファイル（4ファイル - モック修正）

| ファイル                                        | 変更内容                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `__tests__/ChatPanel.chat-wiring.test.tsx`      | ストア状態拡張、SkillManagementPanel モック追加、cancel-stream-button 重複対応    |
| `__tests__/ChatPanel.settings-sync.test.tsx`    | useStreamingChat `{state,actions}` 構造、ErrorGuidance props修正、blocked状態対応 |
| `__tests__/ChatPanel.accessibility.test.tsx`    | 欠落モック追加、D-04 blocked対応、D-10 セレクタ修正                               |
| `__tests__/ChatPanel.test.tsx`                  | 新コンポーネントモック追加、ストア状態拡張                                        |
| `__tests__/ChatPanel.skill-management.test.tsx` | 新コンポーネントモック追加、message-list-slot→mock-chat-message-list              |
