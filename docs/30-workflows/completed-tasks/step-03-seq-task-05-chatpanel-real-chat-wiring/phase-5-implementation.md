# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 5                                   |
| Phase名    | 実装                                |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 4（テスト作成）               |
| 後続Phase  | Phase 6（テスト拡充）               |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 更新日     | 2026-03-17                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

Phase 4 で定義した TDD Red テストを Green にするため、ChatPanel の 3 箇所の placeholder を実コンポーネントに置換し、useStreamingChat hook の接続、8 状態の条件レンダリング、RuntimeBanner/ErrorGuidance/HandoffBlock の新規実装、アクセシビリティ属性の追加を段階的に実施する。

## 設計方針

- Phase 2 の設計成果物（状態機械、コンポーネント階層、IPC 契約マトリクス）に厳密に従う
- placeholder を local mock で延命せず real contract へ置き換える
- silent fallback 禁止: capability 不足時は guidance block を表示（P62 準拠）
- Store 統一: useStreamingChat 内の `useStore()` を `useAppStore()` に統一（P31 対策として個別セレクタ経由）
- 既存のスキル統合コード（SkillStreamingView, SkillManagementPanel）は変更しない

## 実行タスク

- Task 5-1 Store 拡張: chatSlice に chatPanelStatus（8 状態）、chatMessages、currentConversationId を追加する。個別セレクタ（useChatPanelStatus, useChatMessages 等）を定義する（P31/P48 対策）
- Task 5-2 useStreamingChat 接続: ChatPanel に useStreamingChat hook を接続し、startStream/cancelStream を配線する。useStore() -> useAppStore() の統一を実施する。ChatPanel は `LLMChatRequestInput` 型を使用し、`LLMChatRequestSchema.parse()` でバリデーション後に `llm:stream-chat` に送信する（`AI_CHAT` チャンネルは使用しない）
- Task 5-3 placeholder 置換 - message-list-slot: ChatMessageList + StreamingMessage コンポーネントを message list 領域に配置する。role="log"、aria-live="polite" を付与する
- Task 5-4 placeholder 置換 - chat-input-slot: ComposerInput + SendButton を入力領域に配置する。Enter で送信、Shift+Enter で改行、provider/model 未選択時はエラー表示（P62 準拠）
- Task 5-5 RuntimeBanner 実装: capability 表示バナー（integratedRuntime/terminalSurface/both/none）を ChatPanel 上部に配置する。role="status" を付与する
- Task 5-6 ErrorGuidance 実装: LLMErrorCode 全 10 値に対応するガイダンス分岐を実装する。retryable/non-retryable でボタンと誘導を切り替える。role="alert" を付与する
- Task 5-7 HandoffBlock + PersistentTerminalLauncher 実装: terminal handoff 導線を実装する。auto send 禁止、hidden prompt injection 禁止の制約を遵守する

## 実装順序

Phase 2 の設計に基づき、以下の順序で段階的に実装する。各 Step は前の Step の成果物に依存する。

```
Step 1: Store 拡張（Task 5-1）
  -> chatSlice に chatPanelStatus / chatMessages / currentConversationId 追加
  -> 個別セレクタ定義（useChatPanelStatus, useChatMessages, useCurrentConversationId）
  -> 派生セレクタに useShallow 適用（P48 対策）

Step 2: useStreamingChat 接続 + StreamingMessage 配置（Task 5-2 + Task 5-3）
  -> useStore() -> useAppStore() 統一
  -> ChatPanel に useStreamingChat hook を接続
  -> message-list-slot を ChatMessageList + StreamingMessage に置換
  -> role="log", aria-live="polite" 付与

Step 3: ComposerInput + SendButton（Task 5-4）
  -> chat-input-slot を ComposerInput + SendButton に置換
  -> Enter/Shift+Enter/Escape キーバインド
  -> provider/model 未選択時のエラー表示（P62 準拠）

Step 4: RuntimeBanner + ErrorGuidance（Task 5-5 + Task 5-6）
  -> model-selector-slot 領域に RuntimeBanner を配置
  -> capability 4 値に応じた表示切替
  -> LLMErrorCode 10 値のガイダンス分岐
  -> role="status", role="alert" 付与

Step 5: HandoffBlock + PersistentTerminalLauncher（Task 5-7）
  -> terminal handoff ブロック実装
  -> auto send 禁止、hidden prompt injection 禁止の制約遵守

Step 6: アクセシビリティ属性の最終確認
  -> 全コンポーネントの role/aria 属性を Phase 2 設計と照合
  -> キーボード操作（Enter/Shift+Enter/Escape/Tab）の動作確認
```

## 変更対象ファイルリスト

### 既存ファイル（変更）

| ファイル                                                  | 変更内容                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` | placeholder 3 箇所の置換、新規コンポーネントの条件レンダリング追加 |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`     | chatPanelStatus / chatMessages / currentConversationId 追加        |
| `apps/desktop/src/renderer/hooks/useStreamingChat.ts`     | useStore() -> useAppStore() 統一（Store 統一）                     |

### 新規ファイル

| ファイル                                                                   | 責務                                  |
| -------------------------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/chat/RuntimeBanner.tsx`              | capability 表示バナー（molecule）     |
| `apps/desktop/src/renderer/components/chat/ComposerInput.tsx`              | テキスト入力（atom）                  |
| `apps/desktop/src/renderer/components/chat/SendButton.tsx`                 | 送信ボタン（atom）                    |
| `apps/desktop/src/renderer/components/chat/ErrorGuidance.tsx`              | エラー表示（molecule）                |
| `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`               | terminal handoff ブロック（molecule） |
| `apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx` | terminal 常設起動ボタン（atom）       |
| `apps/desktop/src/renderer/components/chat/ChatMessageList.tsx`            | メッセージ一覧（molecule）            |
| `apps/desktop/src/renderer/components/chat/ChatMessage.tsx`                | 個別メッセージ（atom）                |
| `apps/desktop/src/renderer/components/chat/ComposerAttachmentChip.tsx`     | 添付ファイルチップ（atom）            |
| `apps/desktop/src/renderer/components/chat/TranscriptProvenanceLabel.tsx`  | transcript 出所ラベル（atom）         |

## 参照資料

### 前提 Phase 成果物

| 参照資料                | パス                              | 内容                                             |
| ----------------------- | --------------------------------- | ------------------------------------------------ |
| Phase 2（設計）         | `phase-2-design.md`               | 状態機械、コンポーネント階層、IPC 契約マトリクス |
| Phase 3（設計レビュー） | `phase-3-design-review.md`        | 16 レビュー観点の判定結果                        |
| Phase 4（テスト作成）   | `phase-4-test-creation.md`        | テストマトリクス 52 ケース、モック戦略           |
| コード調査レポート      | `outputs/code-research-report.md` | ChatPanel 現行コード・GAP 分析                   |
| 仕様調査レポート        | `outputs/spec-research-report.md` | 型定義・IPC 契約・セキュリティ要件               |

### コードベース

| 参照資料         | パス                                                             | 内容                                           |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| ChatPanel        | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`        | placeholder UI（161 行、3 箇所の placeholder） |
| useStreamingChat | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`            | streaming hook（179 行、IPC 接続済み）         |
| StreamingMessage | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx` | streaming 表示（83 行、memo + forwardRef）     |
| chatSlice        | `apps/desktop/src/renderer/store/slices/chatSlice.ts`            | Chat 状態管理                                  |
| llmSlice         | `apps/desktop/src/renderer/store/slices/llmSlice.ts`             | LLM 状態管理                                   |
| aiHandlers       | `apps/desktop/src/main/ipc/aiHandlers.ts`                        | AI_CHAT ハンドラ（234 行）                     |
| llm handlers     | `apps/desktop/src/main/handlers/llm.ts`                          | LLM streaming ハンドラ（442 行）               |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                     | パス                                                                                            | 内容                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| interfaces-llm               | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                           | LLM と chat contract の正本                          |
| llm-ipc-types                | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                            | AIChatRequest/Response、LLMErrorCode 型定義          |
| llm-streaming                | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                            | StreamChunk、StreamingState、チャンネル定義          |
| api-ipc-system               | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | AI_CHAT と selected config の IPC 正本               |
| ui-ux-feature-components     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | Workspace Chat Panel と ChatPanel 関連 UI 正本       |
| ui-ux-panels                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                             | ChatPanel 統合パターンの正本                         |
| llm-workspace-chat-edit      | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolution、HandoffGuidance 型定義            |
| arch-state-management        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`               | 個別セレクタパターン適用・useAppStore統一の参照元    |
| workflow-ai-runtime-authmode | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | RuntimeBanner/HandoffBlock実装のcapability定義参照元 |

## 実行手順

### ステップ 1: 参照資料と Phase 4 テストを確認する

Phase 4 のテストマトリクスとモック戦略を読み込み、Red テストの一覧を確認する。Phase 2 の設計成果物と照合し、実装対象を確定する。

### ステップ 2: 実装順序（Step 1〜6）に従い実装する

実装順序セクションの Step 1 から Step 6 を順に実施する。各 Step 完了後にテストを実行し、該当テストが Green になることを確認する。

```bash
# 各 Step 完了後のテスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.chat-wiring.test.tsx
```

### ステップ 3: 既存テストの回帰確認

全 Step 完了後、既存 26 テストが PASS することを確認する。

```bash
# 既存テストの回帰確認
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### ステップ 4: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、以下を確認する:

- LLMErrorCode 全 10 値の ErrorGuidance 分岐が実装されていること
- IPC レスポンス wrapper 形式が P60 準拠であること
- RuntimeBanner の capability 4 値表示が workflow-ai-runtime-authmode-unification.md と一致すること
- アクセシビリティ属性（role/aria）が llm-streaming.md と ui-ux-feature-components.md と一致すること

### ステップ 5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

Phase 5 の実装は、以下の統合テスト観点と対応する:

| テスト観点           | 対応する実装 Step | 接続内容                                            |
| -------------------- | ----------------- | --------------------------------------------------- |
| ストリーミング E2E   | Step 2            | useStreamingChat -> ChatPanel 接続、IPC #1-#5       |
| Selected config 同期 | Step 3            | ComposerInput 送信時に providerId/modelId を確認    |
| Capability 判定      | Step 4            | RuntimeBanner が capability 4 値に応じて表示切替    |
| エラーハンドリング   | Step 4            | ErrorGuidance が LLMErrorCode 10 値に対応           |
| 会話永続化           | Step 2            | done signal 後に conversation:addMessage を呼び出し |
| Terminal handoff     | Step 5            | HandoffBlock + PersistentTerminalLauncher の配線    |

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                                |
| ------------------ | ---- | --------------------------------------------------------------------------- |
| UI/UX              | 該当 | 全 8 状態の UI 表示が Phase 2 設計と一致すること                            |
| セキュリティ       | 該当 | Renderer 3 段階防御パターン適用、API key 漏洩防止、P42 バリデーション       |
| IPC 通信           | 該当 | P60 wrapper 形式、チャンネルホワイトリスト（P27）、sender 検証              |
| アクセシビリティ   | 該当 | role/aria 属性の付与（log, status, alert, busy, label）、キーボード操作     |
| エラーハンドリング | 該当 | LLMErrorCode 全 10 値のガイダンス分岐、retryable/non-retryable の適切な処理 |
| パフォーマンス     | 該当 | StreamingMessage の memo 最適化、chunk 受信時の最小再レンダー               |
| アーキテクチャ     | 該当 | Main/Renderer 責務境界（runtime 解決は Main、表示は Renderer）、Store 統一  |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                                  |
| -------------------------- | ---- | ------------------------------------------------------------- |
| フロントエンド（Renderer） | 該当 | 10 新規コンポーネント、8 状態の条件レンダリング、P31/P48 対策 |
| バックエンド（Main）       | 該当 | 既存 IPC ハンドラとの接続確認（変更なし）                     |
| IPC 通信                   | 該当 | useStreamingChat 経由の IPC 接続、wrapper 形式レスポンス処理  |
| Preload/セキュリティ       | 該当 | window.electronAPI 経由のアクセスのみ、直接 IPC 呼び出し禁止  |

## 成果物

| 成果物           | パス                                     | 内容                                       |
| ---------------- | ---------------------------------------- | ------------------------------------------ |
| 実装計画         | `outputs/phase-5/implementation-plan.md` | 実装順序（Step 1-6）と各 Step の詳細内容   |
| 変更ファイル一覧 | `outputs/phase-5/file-change-list.md`    | 変更/新規ファイル一覧と変更概要            |
| コード成果物     | プロジェクト該当ディレクトリ             | 既存 3 ファイル変更 + 新規 10 ファイル作成 |

## 完了条件

- [ ] 3 箇所の placeholder（model-selector-slot, message-list-slot, chat-input-slot）が全て実コンポーネントに置換されている
- [ ] useStreamingChat が ChatPanel に接続され、startStream/cancelStream が動作する
- [ ] chatSlice に chatPanelStatus（8 状態）、chatMessages、currentConversationId が追加されている
- [ ] RuntimeBanner が capability 4 値（integratedRuntime/terminalSurface/both/none）に応じて表示される
- [ ] ErrorGuidance が LLMErrorCode 全 10 値に対応したガイダンス分岐を表示する
- [ ] HandoffBlock + PersistentTerminalLauncher が terminal handoff 導線として動作する
- [ ] Phase 4 で定義した TDD Red テスト（52 ケース）のうち P0 テストが全て Green になっている
- [ ] 既存 26 テスト（ChatPanel.test.tsx 12 + ChatPanel.skill-management.test.tsx 14）が全て PASS
- [ ] アクセシビリティ属性（role="log", role="status", role="alert", aria-live, aria-busy, aria-label）が全て付与されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料と Phase 4 テストの確認
2. Step 1: Store 拡張（chatSlice + 個別セレクタ）
3. Step 2: useStreamingChat 接続 + message-list-slot 置換
4. Step 3: ComposerInput + SendButton（chat-input-slot 置換）
5. Step 4: RuntimeBanner + ErrorGuidance（model-selector-slot 置換含む）
6. Step 5: HandoffBlock + PersistentTerminalLauncher
7. Step 6: アクセシビリティ属性の最終確認
8. 既存 26 テストの回帰確認
9. system spec との整合確認
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 5-1〜5-7）を 100% 実行完了
- [ ] 各タスクの成果物が生成されている（2 ドキュメント + コード）
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 5

# テスト全体実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/
```

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
