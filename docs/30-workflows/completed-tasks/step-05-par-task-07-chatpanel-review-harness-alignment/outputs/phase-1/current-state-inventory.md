# Phase 1: 現状棚卸しインベントリ

> タスクID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
> 作成日: 2026-03-23

## 1. コードパス棚卸し

### 1.1 ChatPanel.tsx（メインコンポーネント）

| 項目         | 値                                                                                   |
| ------------ | ------------------------------------------------------------------------------------ |
| パス         | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                            |
| 行数         | 283 行                                                                               |
| 直近コミット | `cb305081d` feat(chat): チャットパネル実チャット配線とドキュメント整理を完了 (#1337) |
| 関連タスク   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001                                                  |

#### 状態機械（実装済み）

```
idle → ready → streaming → completed / cancelled / error
blocked: provider/model 未選択 or API key 未設定
handoff: terminal surface のみ利用可能
```

#### Store セレクタ（P31 対策: 個別セレクタ使用）

| セレクタ             | 型                      | 用途                   |
| -------------------- | ----------------------- | ---------------------- |
| `chatPanelStatus`    | string                  | 8 状態ユニオン         |
| `resolvedCapability` | AccessCapability        | runtime capability     |
| `chatMessages`       | ChatMessage[]           | メッセージ履歴         |
| `chatInput`          | string                  | 入力テキスト           |
| `selectedProviderId` | string \| null          | LLM プロバイダー       |
| `selectedModelId`    | string \| null          | LLM モデル             |
| `providers`          | Provider[]              | プロバイダー一覧       |
| `handoffGuidance`    | HandoffGuidance \| null | handoff 時のガイダンス |

#### Placeholder / No-op 調査

| 箇所                          | ステータス | 詳細                                            |
| ----------------------------- | ---------- | ----------------------------------------------- |
| model-selector-slot           | 置換済み   | `LLMSelectorPanel` + `RuntimeBanner` に置換     |
| message-list-slot             | 置換済み   | `ChatMessageList` に置換                        |
| chat-input-slot               | 置換済み   | `ComposerArea` に置換                           |
| `onTerminalSwitch={() => {}}` | no-op 残存 | RuntimeBanner の terminal 切替コールバック      |
| `onSelectProvider={() => {}}` | no-op 残存 | LLMSelectorPanel のプロバイダー選択コールバック |
| `onSelectModel={() => {}}`    | no-op 残存 | LLMSelectorPanel のモデル選択コールバック       |
| `onOpenTerminal={() => {}}`   | no-op 残存 | HandoffBlock の terminal 起動コールバック       |

### 1.2 子コンポーネント一覧（12 個）

| コンポーネント       | ファイル                 | 責務                       | 実装状況 |
| -------------------- | ------------------------ | -------------------------- | -------- |
| RuntimeBanner        | RuntimeBanner.tsx        | runtime capability 表示    | 実装済み |
| LLMSelectorPanel     | LLMSelectorPanel.tsx     | Provider/Model 選択        | 実装済み |
| SkillSelector        | SkillSelector.tsx        | スキル選択                 | 実装済み |
| SkillManagementPanel | SkillManagementPanel.tsx | スキル管理                 | 実装済み |
| ChatMessageList      | ChatMessageList.tsx      | メッセージ履歴表示         | 実装済み |
| ChatMessage          | ChatMessage.tsx          | 単一メッセージ表示         | 実装済み |
| StreamingMessage     | StreamingMessage.tsx     | ストリーミング表示         | 実装済み |
| ComposerArea         | ComposerArea.tsx         | 入力エリア                 | 実装済み |
| ComposerInput        | ComposerInput.tsx        | テキスト入力               | 実装済み |
| SendButton           | SendButton.tsx           | 送信ボタン                 | 実装済み |
| ErrorGuidance        | ErrorGuidance.tsx        | blocked / error ガイダンス | 実装済み |
| HandoffBlock         | HandoffBlock.tsx         | handoff ガイダンス         | 実装済み |

### 1.3 useStreamingChat.ts（カスタムフック）

| 項目           | 値                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| パス           | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                                |
| 行数           | 179 行                                                                                               |
| IPC 依存       | `window.electronAPI.llm.streamChat`, `onStreamChunk`, `onStreamEnd`, `onStreamError`, `cancelStream` |
| バリデーション | `LLMChatRequestSchema.parse(request)` で Zod スキーマ検証                                            |

### 1.4 テストファイル一覧（7 ファイル）

| テストファイル                      | 対象                     | 状況 |
| ----------------------------------- | ------------------------ | ---- |
| ChatPanel.test.tsx                  | 基本機能                 | PASS |
| ChatPanel.chat-wiring.test.tsx      | チャットメッセージフロー | PASS |
| ChatPanel.skill-management.test.tsx | スキル統合               | PASS |
| ChatPanel.settings-sync.test.tsx    | 設定同期                 | PASS |
| ChatPanel.edge-cases.test.tsx       | エッジケース             | PASS |
| ChatPanel.accessibility.test.tsx    | a11y                     | PASS |
| StreamingMessage.test.tsx           | ストリーミング表示       | PASS |

## 2. ドキュメント棚卸し

### 2.1 関連仕様書

| 仕様書                   | パス                                                                 | ChatPanel 関連セクション                                               |
| ------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ui-ux-panels.md          | `.claude/skills/aiworkflow-requirements/references/`                 | ChatPanel 統合パターン（TASK-7D, TASK-IMP-CHATPANEL-REAL-AI-CHAT-001） |
| ui-ux-agent-execution.md | `.claude/skills/aiworkflow-requirements/references/`                 | ChatPanel 統合 UI フロー                                               |
| ui-ux-realization.md     | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/` | Surface 別 UI/UX 定義                                                  |
| 親パック index.md        | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/` | Task07 依存順・lane 分離方針                                           |

### 2.2 Open GAP 一覧

| GAP-ID | 内容                                | 影響                                         | 検出元            |
| ------ | ----------------------------------- | -------------------------------------------- | ----------------- |
| GAP-01 | `onTerminalSwitch={() => {}}` no-op | terminal 切替が無効                          | ChatPanel.tsx:176 |
| GAP-02 | `onSelectProvider={() => {}}` no-op | プロバイダー選択が無効                       | ChatPanel.tsx:182 |
| GAP-03 | `onSelectModel={() => {}}` no-op    | モデル選択が無効                             | ChatPanel.tsx:183 |
| GAP-04 | `onOpenTerminal={() => {}}` no-op   | terminal 起動が無効                          | ChatPanel.tsx:225 |
| GAP-05 | role 明文化なし                     | ChatPanel が mainline / harness どちらか不明 | JSDoc / 仕様書    |
| GAP-06 | mainline vs harness 差分表なし      | 責務境界が曖昧                               | ui-ux-panels.md   |

### 2.3 既存 MINOR 未タスク（scope 外）

| 未タスク | 内容                                     | scope                                                |
| -------- | ---------------------------------------- | ---------------------------------------------------- |
| MINOR-1  | handleSendMessage ストリーミング中ガード | scope 外（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 後続） |
| MINOR-2  | chatSlice streaming テスト不足           | scope 外（同上）                                     |
