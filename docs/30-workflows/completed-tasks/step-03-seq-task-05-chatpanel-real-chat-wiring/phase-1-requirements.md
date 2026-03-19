# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 1                                   |
| Phase名    | 要件定義                            |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | なし                                |
| 後続Phase  | Phase 2（設計）                     |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 更新日     | 2026-03-17                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

ChatPanel の placeholder を実 AI チャット機能に置換するための要件を定義する。3箇所の具体的 placeholder（model-selector-slot, message-list-slot, chat-input-slot）の置換対象を特定し、既存資産の活用方針、access capability 要件、IPC 契約接続要件、依存タスクとの handoff 要件を FR/NFR 分類で整理する。

## 実行タスク

- P50チェック（既実装状態の調査）: ChatPanel.tsx、useStreamingChat.ts、StreamingMessage.tsx、AI_CHAT ハンドラの現在の実装状態を確認し、既実装/未実装を判定する
- placeholder 整理: 3箇所の具体的 placeholder（model-selector-slot L95, message-list-slot L124, chat-input-slot L141）を列挙し、各 placeholder の置換先コンポーネントを特定する
- 既存資産インベントリ: useStreamingChat(179行), StreamingMessage(83行), AI_CHAT ハンドラ(234行), buildMessages(36行) の活用方針を策定する
- FR/NFR 分類: 機能要件（メッセージ送信、streaming、cancel、メッセージ表示、会話永続化）と非機能要件（アクセシビリティ WCAG 2.1 AA、パフォーマンス、セキュリティ）を分離・定義する
- access capability 要件定義: integratedRuntime / terminalSurface / both / none の4値判定ロジックと、UI 語彙 ready / blocked / unavailable の対応を定義する
- IPC 契約整理: AI_CHAT, llm:stream-chat/chunk/done/cancel-stream, llm:set-selected-config の接続要件を整理する
- 依存タスク handoff 整理: Task02 Phase 2（terminal handoff 契約）、Task06 Phase 2（selected config 契約）の前提条件と handoff 要件を明文化する

## 参照資料

### コードベース

| 参照資料                  | パス                                                                                      | 内容                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| ChatPanel                 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                 | placeholder UI の現状確認（161行、3箇所の placeholder）            |
| useStreamingChat          | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                     | streaming hook の契約確認（179行、IPC 接続済み）                   |
| StreamingMessage          | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`                          | streaming 表示コンポーネント（83行、memo + forwardRef 最適化済み） |
| llm handlers              | `apps/desktop/src/main/handlers/llm.ts`                                                   | LLM_STREAM_CHAT / LLM_STREAM_CANCEL 等のハンドラ（442行）          |
| aiHandlers                | `apps/desktop/src/main/ipc/aiHandlers.ts`                                                 | AI_CHAT ハンドラ + provider 解決ロジック（234行）                  |
| llmConfigProvider         | `apps/desktop/src/main/ipc/llmConfigProvider.ts`                                          | selected config 保持（GAP-03 準拠、DEFAULT_CONFIG fallback 禁止）  |
| buildMessages             | `apps/desktop/src/main/utils/buildMessages.ts`                                            | message 正規化（36行）                                             |
| llmSlice                  | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                                      | LLM 状態管理（selectedProviderId / selectedModelId）               |
| chatSlice                 | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                     | Chat 状態管理（streaming 関連状態）                                |
| ChatPanel tests           | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`                  | 既存 UI 契約テスト（313行、12テスト）                              |
| ChatPanel skill-mgmt test | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx` | スキル管理テスト（375行、14テスト）                                |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | LLM と chat contract の正本                                                                                                                           |
| llm-ipc-types                                   | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                   | AIChatRequest/Response、LLMErrorCode の型定義                                                                                                         |
| llm-streaming                                   | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                                   | StreamChunk、StreamingState、チャンネル定義                                                                                                           |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT と selected config の IPC 正本                                                                                                                |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Workspace Chat Panel と ChatPanel 関連 UI 正本                                                                                                        |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access capability と settings 表示契約                                                                                                                |
| ui-ux-panels                                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                                    | ChatPanel 統合パターンの正本                                                                                                                          |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config と auth key の既存ルール ※セキュリティフック対象ファイル。直接参照不可の場合は `interfaces-llm.md` / `api-ipc-system.md` から代替参照 |
| workflow-ai-runtime-authmode-unification        | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`        | capability foundation（4値定義）                                                                                                                      |

## 実行手順

### ステップ0: P50チェック - 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。ChatPanel の placeholder が既に置換済みか、useStreamingChat が ChatPanel に接続済みかを判定する。

```bash
# ChatPanel の placeholder 状態確認
grep -n "model-selector-slot\|message-list-slot\|chat-input-slot" apps/desktop/src/renderer/components/chat/ChatPanel.tsx

# useStreamingChat の ChatPanel からの import 有無
grep -rn "useStreamingChat" apps/desktop/src/renderer/components/chat/ChatPanel.tsx

# StreamingMessage の ChatPanel からの import 有無
grep -rn "StreamingMessage" apps/desktop/src/renderer/components/chat/ChatPanel.tsx

# 最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/renderer/components/chat/ChatPanel.tsx
```

| 判定     | 条件                                     | 対応                                                     |
| -------- | ---------------------------------------- | -------------------------------------------------------- |
| 未実装   | placeholder が3箇所残存                  | 通常の Phase 1 要件定義を実施                            |
| 部分実装 | 一部 placeholder が置換済み              | 未実装部分のみ要件定義、既実装部分は検証モードに切り替え |
| 実装済み | 全 placeholder が置換済み、hook 接続済み | Phase 4-5 を「検証・補完」モードに切り替え（P50 準拠）   |

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、ChatPanel の実 AI チャット配線の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、以下の契約・UI・security・state のズレを残さない:

- AIChatRequest / AIChatResponse の型が llm-ipc-types.md と一致すること
- StreamChunk / StreamingState の型が llm-streaming.md と一致すること
- access capability の4値が workflow-ai-runtime-authmode-unification.md と一致すること
- Provider/Model 解決順が GAP-03（DEFAULT_CONFIG fallback 禁止）に準拠すること

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

以下の接続要件を Phase 1 の要件として明文化する:

| 接続ポイント               | IPC チャンネル            | 方向             | 要件                                                                    |
| -------------------------- | ------------------------- | ---------------- | ----------------------------------------------------------------------- |
| AI チャット送信            | `AI_CHAT`                 | Renderer -> Main | AIChatRequest に providerId/modelId を明示または selected config を使用 |
| ストリーミング開始         | `llm:stream-chat`         | Renderer -> Main | LLMChatRequestInput（providerId, modelId, messages, stream: true）      |
| ストリーミングチャンク受信 | `llm:stream-chunk`        | Main -> Renderer | StreamChunk（type: content/error/done）                                 |
| ストリーミング完了         | `llm:stream-done`         | Main -> Renderer | requestId で紐付け                                                      |
| ストリーミングキャンセル   | `llm:cancel-stream`       | Renderer -> Main | AbortController 連携                                                    |
| selected config 同期       | `llm:set-selected-config` | Renderer -> Main | providerId + modelId の同時設定（部分設定禁止）                         |

## 多角的チェック観点

| 観点             | 適用 | チェック内容                                                                                                                                                                                                                                       |
| ---------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX            | 該当 | ChatPanel の画面構成（RuntimeBanner + MessageList + Composer）が ui-ux-diagrams.md と一致すること                                                                                                                                                  |
| セキュリティ     | 該当 | API key が Renderer に漏洩しないこと、IPC sender 検証があること、XSS 防止（React auto-escape）                                                                                                                                                     |
| IPC 通信         | 該当 | P42 3段バリデーション、チャンネルホワイトリスト、sender 検証（チャンネル例: `llm:stream-chat` (IPC_CHANNELS.LLM_STREAM_CHAT), `llm:stream-chunk` (LLM_STREAM_CHUNK), `llm:stream-done` (LLM_STREAM_END), `llm:cancel-stream` (LLM_STREAM_CANCEL)） |
| アクセシビリティ | 該当 | message list に `role="log"` + `aria-live="polite"`、streaming に `aria-busy`、cancel に `aria-label`                                                                                                                                              |
| パフォーマンス   | 該当 | StreamingMessage の memo 最適化、chunk 受信時の最小再レンダー                                                                                                                                                                                      |

## 成果物

| 成果物               | パス                                         | 内容                                                     |
| -------------------- | -------------------------------------------- | -------------------------------------------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | FR/NFR 分類、受入基準、access capability 要件            |
| スコープ定義書       | `outputs/phase-1/scope-definition.md`        | 対象範囲、除外範囲、依存タスク handoff 要件              |
| 既存資産インベントリ | `outputs/phase-1/asset-inventory.md`         | useStreamingChat, StreamingMessage, AI_CHAT 等の活用方針 |

## 完了条件

- [ ] placeholder の置換対象が3箇所（model-selector-slot, message-list-slot, chat-input-slot）すべて特定されている
- [ ] ChatPanel に必要な auth と runtime 要件が FR/NFR 分類で定義されている
- [ ] 既存資産（useStreamingChat 179行, StreamingMessage 83行, AI_CHAT ハンドラ 234行, buildMessages 36行）の活用方針が明確
- [ ] access capability の4値（integratedRuntime / terminalSurface / both / none）と UI 表示語彙（ready / blocked / unavailable）の対応が定義されている
- [ ] IPC 契約（AI_CHAT, llm:stream-chat/chunk/done/cancel-stream, llm:set-selected-config）の接続要件が整理されている
- [ ] 依存タスク（Task02 Phase 2: terminal handoff 契約、Task06 Phase 2: selected config 契約）との handoff 要件が明文化されている
- [ ] P50チェックの結果が記録されている（既実装/部分実装/未実装の判定）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. P50チェック: 既実装状態の調査
2. placeholder 整理（3箇所の特定と置換先コンポーネント決定）
3. 既存資産インベントリ作成
4. FR/NFR 分類と受入基準定義
5. access capability 要件定義（4値 + UI語彙対応）
6. IPC 契約接続要件の整理
7. 依存タスク handoff 要件の明文化
8. system spec との整合確認
9. 成果物の作成・配置
10. 完了条件の検証

## タスク100%実行確認（必須）

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 1
```

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
