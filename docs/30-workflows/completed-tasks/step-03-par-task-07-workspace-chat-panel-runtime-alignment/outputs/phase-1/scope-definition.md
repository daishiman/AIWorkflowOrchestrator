# Phase 1: スコープ定義書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 1                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

---

## スコープ概要

Task059a で実装済みの WorkspaceChatPanel 基盤に対して、ai-runtime-authmode-unification ワークフローの access capability 統合を行う。主スコープは「RuntimeResolver の結果に応じた UI 状態切り替え」と「P62 準拠の provider/model 必須化」。

---

## スコープ内（IN SCOPE）

### Critical（Phase 5 で必ず実装）

| ID    | 内容                                                                | 対応 GAP |
| ----- | ------------------------------------------------------------------- | -------- |
| SC-01 | P62 対策: `selectedModelId ?? "gpt-4o"` フォールバック除去          | GAP-01   |
| SC-02 | accessCapability 統合: RuntimeResolver 結果に応じた UI 状態切り替え | GAP-04   |
| SC-03 | GuidanceBlock: 実行不能時の説明コンポーネント新規作成               | GAP-06   |
| SC-04 | errorMessage 表示: fail-fast / guidance / silent の3段階エラー表示  | GAP-02   |
| SC-05 | cancel ボタン: ストリーミング中の送信ボタン → cancel ボタン変化     | GAP-03   |

### High（Phase 5 で実装）

| ID    | 内容                                                                | 対応 GAP |
| ----- | ------------------------------------------------------------------- | -------- |
| SC-06 | llmProvider/llmModel 保存: assistant メッセージに使用モデル情報記録 | GAP-05   |
| SC-07 | TranscriptProvenanceChip: メッセージ出典チップ新規作成              | GAP-06   |
| SC-08 | CompactLayout: 360px 以下のレスポンシブレイアウト新規作成           | GAP-06   |
| SC-09 | HandoffCard: terminal handoff 時のコンテキスト渡し UI               | GAP-04   |
| SC-10 | model 未選択時 UI: provider/model 未選択状態の GuidanceBlock 表示   | GAP-01   |

### Medium（Phase 5 で実装、Phase 8 で改善）

| ID    | 内容                                                                     | 対応 GAP |
| ----- | ------------------------------------------------------------------------ | -------- |
| SC-11 | エラーポリシー統合: 9種類のエラーに対する fail-fast/guidance/silent 分類 | GAP-02   |
| SC-12 | P42 3段バリデーション: `handleStreamChat` の modelId/providerId 検証強化 | -        |

---

## スコープ外（OUT OF SCOPE）

| ID     | 内容                                      | 理由                                              |
| ------ | ----------------------------------------- | ------------------------------------------------- |
| OOS-01 | buildMessages 統一                        | Phase 8 リファクタリング対象（GAP-07）            |
| OOS-02 | mention 機能の改修                        | Task059a で完成済み、Task08 スコープ外            |
| OOS-03 | SuggestionBubbles の改修                  | Task059a で完成済み、Task08 スコープ外            |
| OOS-04 | ConversationRepository のページネーション | 別タスクで対応（本タスクの永続化は既存 API 利用） |
| OOS-05 | メッセージ本文全文検索                    | 別タスクで対応                                    |
| OOS-06 | terminal 直接制御                         | Workspace Chat Panel は HandoffCard のみ提供      |
| OOS-07 | 自動 transcript 送信                      | 禁止事項（手動共有のみ）                          |

---

## 変更対象ファイル

### 既存ファイル（修正）

| ファイル                           | 変更内容                                          |
| ---------------------------------- | ------------------------------------------------- |
| `useWorkspaceChatController.ts`    | P62 対策、accessCapability 統合、エラーポリシー   |
| `WorkspaceChatPanel.tsx`           | GuidanceBlock/HandoffCard 配置、errorMessage 表示 |
| `WorkspaceChatInput.tsx`           | cancel ボタン、送信ボタン条件変更                 |
| `llm.ts` (handleStreamChat/Cancel) | P42 バリデーション強化、エラーメッセージ改善      |

### 新規ファイル（作成）

| ファイル                       | 内容                               |
| ------------------------------ | ---------------------------------- |
| `GuidanceBlock.tsx`            | 実行不能時の説明コンポーネント     |
| `TranscriptProvenanceChip.tsx` | メッセージ出典チップ               |
| `CompactLayout.tsx`            | 360px 以下のレスポンシブレイアウト |

---

## 依存関係

### 前提タスク（完了済み）

| タスク                  | 提供する成果                                      |
| ----------------------- | ------------------------------------------------- |
| Task01（AccessMatrix）  | RuntimeResolver / RuntimePolicyResolver           |
| Task06（Main Chat同期） | IPC 契約正本（providerId/modelId 必須化パターン） |
| Task059a（Panel基盤）   | WorkspaceChatPanel 基盤実装一式                   |

### Task08 が確立すべきパターン

| パターン                       | 消費先                                  |
| ------------------------------ | --------------------------------------- |
| RuntimeResolver 結果の UI 反映 | 他の surface（Agent, Skill Creator 等） |
| GuidanceBlock の再利用         | 全 surface 共通コンポーネント           |
| HandoffCard の再利用           | 全 surface 共通コンポーネント           |

---

## リスク

| リスク                                           | 影響度 | 対策                                          |
| ------------------------------------------------ | ------ | --------------------------------------------- |
| AccessCapabilityResolver/Port が未実装           | High   | RuntimeResolver を直接消費、Port は設計で定義 |
| P5 リスナー二重登録（StrictMode）                | Medium | リスナー登録のモジュールレベルガード          |
| P48 useShallow 未適用による無限ループ            | Medium | 派生セレクタに useShallow を適用              |
| llm.ts の handleStreamChat に modelId 検証がない | High   | P42 3段バリデーション追加                     |

---

## 成功基準

| 基準                                                             | 検証方法                    |
| ---------------------------------------------------------------- | --------------------------- |
| `selectedModelId === null` 時に送信不可・GuidanceBlock 表示      | ユニットテスト + 手動テスト |
| RuntimeResolver 結果に応じた integrated/handoff UI 切り替え      | ユニットテスト + 手動テスト |
| ストリーミング中に cancel ボタンが表示される                     | ユニットテスト + 手動テスト |
| エラー種別に応じた3段階（fail-fast/guidance/silent）表示         | ユニットテスト              |
| 360px 以下で CompactLayout に切り替わる                          | ユニットテスト + 手動テスト |
| TranscriptProvenanceChip でメッセージ出典が表示される            | ユニットテスト              |
| assistant メッセージに llmProvider/llmModel が保存される         | ユニットテスト              |
| Line Coverage 80%+, Branch Coverage 60%+, Function Coverage 80%+ | vitest --coverage           |
