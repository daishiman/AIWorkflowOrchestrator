# ChatPanel Real Chat Wiring - Code Research Report

## 調査日: 2026-03-17

## 1. ChatPanel.tsx

**パス**: `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` (161行)

### Placeholder 箇所

| 行番号 | data-testid           | 現在の実装状態     | 説明                   |
| ------ | --------------------- | ------------------ | ---------------------- |
| L95    | `model-selector-slot` | 空 div placeholder | ModelSelector が未接続 |
| L124   | `message-list-slot`   | 空 div placeholder | MessageList が未接続   |
| L141   | `chat-input-slot`     | 空 div placeholder | ChatInput が未接続     |

### 既存 State / Props

**Props** (`ChatPanelProps`):

- `onImportRequest?: (skill: SkillMetadata) => void` - スキルインポート要求コールバック

**Store State** (useAppStore 経由):

- `selectedSkillName` - 選択中スキル名
- `streamingMessages` - ストリーミングメッセージ配列
- `isExecuting` (useIsSkillExecuting) - スキル実行中フラグ
- `skillExecutionStatus` - スキル実行ステータス
- `fetchSkills` - スキル一覧取得アクション

**Local State**:

- `importDialogSkill: SkillMetadata | null` - インポートダイアログ対象スキル
- `showSkillManagement: boolean` - スキル管理パネル表示フラグ

### IPC 接続状態

- **未接続**: ChatPanel は IPC を直接呼んでいない。AI チャット送信、ストリーミング、メッセージ表示は全て placeholder のまま
- スキル系のみ Store 経由で間接接続（fetchSkills, isExecuting 等）

### 欠落している要素（Task07 で必要）

- RuntimeBanner（capability 表示）
- ChatMessageList（メッセージ一覧）
- ComposerInput + SendButton（入力・送信）
- HandoffBlock（terminal handoff）
- ErrorGuidance（エラー表示）
- PersistentTerminalLauncher（terminal 常設ボタン）
- useStreamingChat hook の接続
- StreamingMessage コンポーネントの接続
- Access Capability 判定ロジック

---

## 2. useStreamingChat.ts

**パス**: `apps/desktop/src/renderer/hooks/useStreamingChat.ts` (179行)

### Hook 契約

```typescript
function useStreamingChat(): {
  state: UseStreamingChatState;
  actions: UseStreamingChatActions;
};
```

**State**:

- `isStreaming: boolean`
- `content: string` (streamingContent)
- `error: { code: string; message: string; retryable: boolean } | null`

**Actions**:

- `startStream(request: LLMChatRequestInput): Promise<void>`
- `cancelStream(): Promise<void>`

### IPC 接続状態

- **接続済み**: `window.electronAPI.llm` 経由で以下の IPC チャンネルに接続:
  - `llm.streamChat(parsedRequest)` -> invoke -> Main の `LLM_STREAM_CHAT`
  - `llm.cancelStream(requestId)` -> invoke -> Main の `LLM_STREAM_CANCEL`
  - `llm.onStreamChunk(callback)` -> listen -> Main の `LLM_STREAM_CHUNK`
  - `llm.onStreamEnd(callback)` -> listen -> Main の `LLM_STREAM_END`
  - `llm.onStreamError(callback)` -> listen -> Main の `LLM_STREAM_ERROR`

### Store 依存

- `useStore()` から直接取得（useAppStore ではない点に注意）:
  - `isStreaming`, `streamingContent`, `currentStreamId`, `streamingError`
  - `startStreaming`, `appendStreamChunk`, `endStreaming`, `cancelStreaming`, `setStreamingError`

### LLMChatRequestInput の必須フィールド

- `providerId`, `modelId`, `messages[]`, `stream: true`
- `LLMChatRequestSchema.parse(request)` で Zod バリデーション

### ChatPanel との接続状態

- **未接続**: ChatPanel は useStreamingChat を import/使用していない

---

## 3. StreamingMessage.tsx

**パス**: `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx` (83行)

### コンポーネント契約

```typescript
interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  showCursor?: boolean; // default: true
  onCancel?: () => void;
  className?: string;
}
```

### 機能

- ストリーミング中コンテンツを `whitespace-pre-wrap` で表示
- ストリーミング中はパルスアニメーションカーソル表示
- キャンセルボタン表示（`onCancel` 提供時）
- `aria-live="polite"`, `aria-busy={isStreaming}` でアクセシビリティ対応
- `memo` + `forwardRef` でパフォーマンス最適化

### ChatPanel との接続状態

- **未接続**: ChatPanel は StreamingMessage を import/使用していない
- ChatPanel は SkillStreamingView のみ使用中（スキル実行時のみ表示）

---

## 4. Main IPC: AI_CHAT ハンドラ (aiHandlers.ts)

**パス**: `apps/desktop/src/main/ipc/aiHandlers.ts` (234行)

### AI_CHAT ハンドラ (L69-180)

**リクエスト型** (`AIChatRequest`):

- `message: string`
- `conversationId?: string`
- `systemPrompt?: string`
- `providerId?: string`
- `modelId?: string`
- `ragEnabled?: boolean`

**レスポンス型** (`AIChatResponse`):

- `{ success: true, data: { message, conversationId, ragSources? } }`
- `{ success: false, error: string }`

### Provider/Model 解決ロジック

1. `request.providerId` + `request.modelId` が明示指定されていれば使用
2. 未指定の場合は `getSelectedLLMConfig()` で Main Process の選択設定を使用
3. 未選択の場合はエラー返却（P62: DEFAULT_CONFIG への暗黙 fallback 禁止に準拠）

### Selected Config の取得

- `getSelectedLLMConfig()` は `llmConfigProvider` モジュールから import
- `setSelectedLLMConfig()` は `registerLLMHandlers` 内の `LLM_SET_SELECTED_CONFIG` ハンドラ経由で設定

---

## 5. Main IPC: LLM ストリーミングハンドラ (handlers/llm.ts)

**パス**: `apps/desktop/src/main/handlers/llm.ts` (442行)

### 登録チャンネル

| チャンネル                | ハンドラ                  | 用途                     |
| ------------------------- | ------------------------- | ------------------------ |
| `LLM_GET_PROVIDERS`       | `handleGetProviders`      | プロバイダー一覧取得     |
| `LLM_SET_SELECTED_CONFIG` | `handleSetSelectedConfig` | 選択設定保存             |
| `LLM_CHECK_HEALTH`        | `handleCheckHealth`       | ヘルスチェック           |
| `LLM_SEND_CHAT`           | `handleSendChat`          | 非ストリーミングチャット |
| `LLM_STREAM_CHAT`         | `handleStreamChat`        | ストリーミングチャット   |
| `LLM_STREAM_CANCEL`       | `handleStreamCancel`      | ストリームキャンセル     |

### ストリーミングフロー (handleStreamChat)

1. `randomUUID()` で requestId 生成
2. `AbortController` 作成、`activeStreams` Map に保存
3. バリデーション（messages 存在、provider 判定、API key 確認）
4. `LLMAdapterFactory.getAdapter(providerId)` でアダプタ取得
5. `adapter.streamChat(request, abortController.signal)` で AsyncIterable 取得
6. `for await` でチャンクを `LLM_STREAM_CHUNK` 経由で Renderer に送信
7. 完了時 `LLM_STREAM_END`、エラー時 `LLM_STREAM_ERROR` を送信
8. `safeSend` で `event.sender.isDestroyed()` チェック

### Provider 設定

- OpenAI, Anthropic, Google, xAI の 4 プロバイダー
- `SecureStorage.getApiKey(providerId)` で API キー取得
- API キー不在時は `API_KEY_MISSING` エラーを即座に返却

---

## 6. buildMessages.ts

**パス**: `apps/desktop/src/main/utils/buildMessages.ts` (36行)

### 関数契約

```typescript
function buildMessages(
  userMessage: string,
  systemPrompt?: string,
): LLMMessage[];
```

- systemPrompt が非空なら `{ role: "system", content: systemPrompt.trim() }` を先頭に追加
- `{ role: "user", content: userMessage }` を追加
- AI_CHAT ハンドラで使用中

---

## 7. 既存テスト

### ChatPanel.test.tsx (313行, 12テスト)

**テストカテゴリ**:

- 基本レンダリング (3): SkillSelector 表示、PermissionDialog 表示、構造確認
- SkillStreamingView 表示制御 (3): 実行中表示、アイドル非表示、未選択非表示
- fetchSkills 初期化 (1): マウント時呼び出し
- エッジケース (2): 初期状態レンダリング、fetchSkills エラー
- アクセシビリティ (2): toolbar role、aria-label
- SkillImportDialog 統合 (4): ref 経由表示、コールバック、ダイアログ閉じ、初期非表示

### ChatPanel.skill-management.test.tsx (375行, 14テスト)

**テストカテゴリ**:

- TC-CP-01: スキル管理ボタン表示 (4)
- TC-CP-02: スキル管理パネル表示切替 (5)
- TC-CP-03: スキル実行中の無効化 (3)
- G3: ChatPanel 結線テスト (4): toggle、排他表示、executing guard、テスト間分離

### テストカバレッジ状況

- スキル統合関連: 良好にカバー
- **AI チャット機能: テスト無し**（placeholder のため）
- useStreamingChat 接続: テスト無し
- StreamingMessage 接続: テスト無し
- RuntimeBanner / HandoffBlock: テスト無し

### StreamingMessage.test.tsx (別ファイル存在)

`apps/desktop/src/renderer/components/chat/__tests__/StreamingMessage.test.tsx` が存在する（今回は未読）

---

## 8. 親ワークフローでの位置づけ

### Task07 の定義 (index.md)

- **タスクID**: `TASK-IMP-CHATPANEL-REAL-AI-CHAT-001`
- **ディレクトリ**: `tasks/step-03-seq-task-05-chatpanel-real-chat-wiring`
- **責務**: ChatPanel の API runtime 統合と terminal fallback UX
- **通称**: Task07

### 依存関係

| 依存先         | 依存理由                                                          |
| -------------- | ----------------------------------------------------------------- |
| Task02 Phase 2 | ChatPanel が terminal launcher / guidance を参照するため          |
| Task06 Phase 2 | ChatPanel が main authority（Settings/access card）を参照するため |

### 実行順序

- **Step 03 直列タスク**: Task02 と Task06 の Phase 2 完了後に着手
- Task08 (Workspace Chat Panel) と並列可能だが、Task07 は直列優先

### Codepath 所有 (index.md)

- `ChatPanel.tsx` / `useStreamingChat.ts` が Task07 所有

### 関心ごとの分離 (index.md)

- **Task07**: API chat、empty/error/loading、terminal fallback

### Surface 別 UI/UX 定義 (ui-ux-realization.md)

| 項目          | 値                                                |
| ------------- | ------------------------------------------------- |
| 主ジョブ      | 単発チャットを行う                                |
| 主要 UI       | message list + composer + capability banner       |
| Primary CTA   | 送信する                                          |
| Secondary CTA | terminal handoff を開く                           |
| 主要状態      | empty / streaming / cancelled / handoff / blocked |

### ChatPanel 画面構成図 (ui-ux-diagrams.md)

```text
+------------------------------------------------------------------+
| Runtime Banner                                      [Terminal]   |
+------------------------------------------------------------------+
| Message List                                                     |
| - empty state                                                    |
| - streaming message                                              |
| - error guidance                                                 |
+------------------------------------------------------------------+
| Composer: input | send | terminal handoff                        |
+------------------------------------------------------------------+
| Terminal Dock (bottom sheet / side dock)                         |
| Share Actions: 選択範囲を送る / 直近出力を添付                   |
+------------------------------------------------------------------+
```

### ChatPanel 状態遷移 (ui-ux-diagrams.md)

```
[*] --> Empty
Empty --> Ready: capability ok
Empty --> Blocked: no capability
Ready --> Streaming: send
Ready --> TerminalDockOpen: terminal button
Streaming --> Cancelled: cancel
Streaming --> Completed: done
Ready --> Handoff: terminal-handoff
```

### 必要マイコンポーネント (ui-ux-diagrams.md)

- RuntimeBanner
- ChatMessageList
- StreamingMessage (既存)
- ComposerInput
- SendButton
- HandoffBlock
- ErrorGuidance
- PersistentTerminalLauncher
- TerminalDock
- ComposerAttachmentChip
- TranscriptProvenanceLabel

### Screenshot 契約 (ui-ux-realization.md)

- **UX-03**: ChatPanel - empty / streaming / terminal handoff

---

## 9. 設計監査結論との整合 (design-audit-matrix.md)

- `subscription/api-key toggle` ではなく `access matrix` が正しい抽象
- ChatPanel は integrated runtime chat と terminal fallback を**分離**して扱う
- silent fallback 禁止: capability 不足時は guidance block を表示し、見かけ成功にしない
- runtime 判定は Main Process、表示は Renderer で固定

---

## 10. GAP 分析サマリ

### 現状 vs 目標

| 領域             | 現状                                | 目標                                            | GAP  |
| ---------------- | ----------------------------------- | ----------------------------------------------- | ---- |
| メッセージ表示   | placeholder (`message-list-slot`)   | ChatMessageList + StreamingMessage              | 大   |
| 入力・送信       | placeholder (`chat-input-slot`)     | ComposerInput + SendButton + useStreamingChat   | 大   |
| Capability 判定  | なし                                | Access Capability Resolver 参照                 | 大   |
| Runtime Banner   | なし                                | RuntimeBanner (integrated-api / terminal)       | 大   |
| Terminal Handoff | なし                                | HandoffBlock + PersistentTerminalLauncher       | 大   |
| エラー表示       | なし                                | ErrorGuidance (capability / network / API key)  | 大   |
| 状態管理         | スキル系のみ                        | empty/ready/streaming/cancelled/handoff/blocked | 大   |
| Model Selector   | placeholder (`model-selector-slot`) | Task06 の selected config 参照                  | 中   |
| スキル統合       | 接続済み                            | 維持                                            | なし |
| テスト           | スキル系のみ                        | AI chat 全状態カバー                            | 大   |

### 既存資産の活用

- **useStreamingChat**: 完全に実装済み。ChatPanel に接続するだけで streaming 機能が使える
- **StreamingMessage**: 完全に実装済み。useStreamingChat.state を props に渡すだけ
- **buildMessages**: 完全に実装済み。Main Process 側で使用中
- **AI_CHAT / LLM_STREAM_CHAT**: Main Process 側ハンドラは完全に実装済み
- **aiHandlers.ts の provider 解決ロジック**: getSelectedLLMConfig() への fallback が実装済み（P62準拠）

### 注意点

1. useStreamingChat は `useStore()` を使用しているが、ChatPanel は `useAppStore()` を使用している。Store 統一の確認が必要
2. AI_CHAT (aiHandlers.ts) は非ストリーミング、LLM_STREAM_CHAT (handlers/llm.ts) はストリーミング。ChatPanel はどちらを主経路にするか設計で決定が必要
3. Task06 (Main Chat/Settings) の Phase 2 で access capability card と selected config の契約が固まる必要がある
4. Task02 (Claude Code Terminal Surface) の Phase 2 で terminal launcher / handoff の契約が固まる必要がある
