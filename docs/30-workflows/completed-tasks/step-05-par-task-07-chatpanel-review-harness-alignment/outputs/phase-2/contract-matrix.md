# Phase 2: 契約マトリクス

> タスクID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
> 作成日: 2026-03-23

## 1. State Contract（状態契約）

### 1.1 ChatPanel 状態ユニオン

| 状態      | chatPanelStatus 値 | resolvedCapability | UI コンポーネント                  | CTA                    |
| --------- | ------------------ | ------------------ | ---------------------------------- | ---------------------- |
| idle      | `"idle"`           | any                | ChatMessageList（空）              | ComposerArea（有効）   |
| ready     | `"ready"`          | `"integrated"`     | ChatMessageList                    | ComposerArea（有効）   |
| streaming | `"streaming"`      | `"integrated"`     | ChatMessageList + StreamingMessage | ComposerArea（cancel） |
| completed | `"completed"`      | `"integrated"`     | ChatMessageList                    | ComposerArea（有効）   |
| cancelled | `"cancelled"`      | `"integrated"`     | ChatMessageList                    | ComposerArea（有効）   |
| error     | `"error"`          | `"integrated"`     | ChatMessageList + ErrorGuidance    | ComposerArea（retry）  |
| blocked   | `"blocked"`        | `"guidance-only"`  | ErrorGuidance                      | 設定画面遷移ボタン     |
| handoff   | `"handoff"`        | `"terminal-only"`  | HandoffBlock                       | terminal 起動ボタン    |

### 1.2 状態遷移禁止ルール

| from → to           | 禁止理由                                            |
| ------------------- | --------------------------------------------------- |
| blocked → streaming | provider/model 未選択のまま streaming 開始は禁止    |
| handoff → streaming | terminal-only capability では streaming 不可        |
| streaming → idle    | streaming 中に状態リセットは禁止（cancel 経由必須） |

## 2. Action Contract（アクション契約）

### 2.1 ChatPanel アクション一覧

| アクション               | トリガー                         | 実装パターン                                                    | no-op 許容 | 現状      |
| ------------------------ | -------------------------------- | --------------------------------------------------------------- | ---------- | --------- |
| handleSendMessage        | ComposerArea submit              | `streamingActions.startStream()`                                | 不可       | 実装済み  |
| handleNavigateToSettings | ErrorGuidance CTA click          | `useAppStore.getState().setCurrentView("settings")`             | 不可       | 実装済み  |
| cancelStream             | ComposerArea cancel / Escape key | `streamingActions.cancelStream()`                               | 不可       | 実装済み  |
| handleImportRequest      | SkillSelector import             | `setImportDialogSkill(skill)`                                   | 不可       | 実装済み  |
| fetchSkills              | mount effect                     | `useAppStore.getState().fetchSkills()`                          | 不可       | 実装済み  |
| onTerminalSwitch         | RuntimeBanner terminal CTA       | **要実装**: `useAppStore.getState().setCurrentView("terminal")` | 不可       | **no-op** |
| onSelectProvider         | LLMSelectorPanel select          | **要実装**: `useAppStore.getState().setSelectedProviderId(id)`  | 不可       | **no-op** |
| onSelectModel            | LLMSelectorPanel select          | **要実装**: `useAppStore.getState().setSelectedModelId(id)`     | 不可       | **no-op** |
| onOpenTerminal           | HandoffBlock terminal CTA        | **要実装**: `window.electronAPI.system.openTerminal()`          | 不可       | **no-op** |

### 2.2 No-op 排除計画

| GAP-ID | 現状コード                    | 修正後コード                              | 修正方針                      |
| ------ | ----------------------------- | ----------------------------------------- | ----------------------------- |
| GAP-01 | `onTerminalSwitch={() => {}}` | `onTerminalSwitch={handleTerminalSwitch}` | Store action で view 遷移     |
| GAP-02 | `onSelectProvider={() => {}}` | `onSelectProvider={handleSelectProvider}` | Store action で provider 更新 |
| GAP-03 | `onSelectModel={() => {}}`    | `onSelectModel={handleSelectModel}`       | Store action で model 更新    |
| GAP-04 | `onOpenTerminal={() => {}}`   | `onOpenTerminal={handleOpenTerminal}`     | IPC call で terminal 起動     |

## 3. Ownership Contract（所有権契約）

### 3.1 ファイル所有権

| ファイル             | 所有タスク         | 変更可否                   |
| -------------------- | ------------------ | -------------------------- |
| ChatPanel.tsx        | Task07（本タスク） | 修正可                     |
| RuntimeBanner.tsx    | Task07             | 参照のみ（Props 型は確認） |
| LLMSelectorPanel.tsx | 別タスク           | 参照のみ                   |
| HandoffBlock.tsx     | Task05             | 参照のみ                   |
| ErrorGuidance.tsx    | Task04             | 参照のみ                   |
| ComposerArea.tsx     | Task07             | 参照のみ                   |
| useStreamingChat.ts  | 別タスク           | 変更不可                   |
| chatSlice            | 別タスク           | 変更不可                   |

### 3.2 Props 境界

| 子コンポーネント | 必須 Props                                                                                         | ChatPanel からの供給方法    |
| ---------------- | -------------------------------------------------------------------------------------------------- | --------------------------- |
| RuntimeBanner    | `capability`, `onTerminalSwitch`                                                                   | Store selector + handler    |
| LLMSelectorPanel | `providers`, `selectedProviderId`, `selectedModelId`, `onSelectProvider`, `onSelectModel`          | Store selector + handler    |
| ChatMessageList  | `messages`, `isStreaming`, `streamingContent`, `onCancelStream`, `error`                           | Store selector + hook state |
| ComposerArea     | `value`, `onChange`, `onSubmit`, `canSubmit`, `isStreaming`, `onCancel`, `disabled`, `placeholder` | Store selector + handler    |
| ErrorGuidance    | `code`, `message`, `retryable`, `onNavigateToSettings`                                             | computed + handler          |
| HandoffBlock     | `guidance`, `onOpenTerminal`                                                                       | Store selector + handler    |

## 4. DTO Contract（データ転送オブジェクト契約）

### 4.1 ChatPanel ↔ Store のデータフロー

| 方向          | データ             | 型                        | 用途             |
| ------------- | ------------------ | ------------------------- | ---------------- |
| Store → Panel | chatPanelStatus    | `ChatPanelStatus`         | 状態判定         |
| Store → Panel | resolvedCapability | `AccessCapability`        | capability 判定  |
| Store → Panel | chatMessages       | `ChatMessage[]`           | メッセージ表示   |
| Store → Panel | chatInput          | `string`                  | 入力値           |
| Store → Panel | selectedProviderId | `string \| null`          | blocked 判定     |
| Store → Panel | selectedModelId    | `string \| null`          | blocked 判定     |
| Store → Panel | providers          | `Provider[]`              | プロバイダー一覧 |
| Store → Panel | handoffGuidance    | `HandoffGuidance \| null` | handoff 表示     |
| Panel → Store | setChatInput       | `(input: string) => void` | 入力更新         |
| Panel → Store | setCurrentView     | `(view: string) => void`  | 画面遷移         |

### 4.2 ChatPanel ↔ IPC のデータフロー

| 方向         | チャンネル          | データ              | 用途               |
| ------------ | ------------------- | ------------------- | ------------------ |
| Panel → Main | `llm:stream-chat`   | `LLMChatRequest`    | ストリーミング開始 |
| Main → Panel | `llm:stream-chunk`  | `LLMStreamChunk`    | チャンク受信       |
| Main → Panel | `llm:stream-end`    | void                | ストリーミング完了 |
| Main → Panel | `llm:stream-error`  | `LLMError`          | エラー通知         |
| Panel → Main | `llm:cancel-stream` | `string` (streamId) | キャンセル         |
