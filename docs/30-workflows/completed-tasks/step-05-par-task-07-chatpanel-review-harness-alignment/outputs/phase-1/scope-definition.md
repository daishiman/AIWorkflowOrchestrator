# Phase 1: スコープ定義

> タスクID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
> 作成日: 2026-03-23

## 1. 対象スコープ

### 1.1 対象ファイル

| ファイル                                                  | 変更種別 | 内容                                      |
| --------------------------------------------------------- | -------- | ----------------------------------------- |
| `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` | 修正     | JSDoc role 明文化、no-op コールバック排除 |
| `outputs/phase-*/`                                        | 新規     | 各 Phase の設計成果物                     |

### 1.2 対象責務

| 責務             | 内容                                                             |
| ---------------- | ---------------------------------------------------------------- |
| Role 明文化      | ChatPanel が review harness であることを JSDoc / 仕様書に記載    |
| No-op 排除       | `() => {}` コールバック 4 箇所を actionable な実装に置換する設計 |
| 差分表固定       | mainline vs harness の責務境界を表形式で定義                     |
| 統合パターン整合 | launcher / fallback UX が mainline 契約と一致していることを検証  |

## 2. 除外スコープ

| 除外項目                              | 理由                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| useStreamingChat.ts の改修            | LLM ストリーミング機能は mainline 契約そのもの。本タスクは harness alignment に限定 |
| chatSlice の状態追加                  | 状態機械は既に 8 state で実装済み。新規状態の追加は scope 外                        |
| MINOR-1（handleSendMessage ガード）   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 の後続未タスク                                  |
| MINOR-2（chatSlice streaming テスト） | 同上                                                                                |
| SkillStreamingView の改修             | TASK-7D 完了済み。review harness alignment とは独立                                 |
| LLMSelectorPanel の機能追加           | プロバイダー / モデル選択の UI 改修は別タスク                                       |
| テストコード変更                      | 本タスクは設計タスク。テストコード実装は後続タスクで実施                            |

## 3. 依存タスク

### 3.1 上流依存（本タスク開始の前提条件）

| 依存タスク                                         | ステータス   | 本タスクへの影響              |
| -------------------------------------------------- | ------------ | ----------------------------- |
| TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 | Phase 2 完了 | mainline shell 契約を参照     |
| TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 | Phase 2 完了 | main chat 契約を参照          |
| TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001  | Phase 2 完了 | handoff / launcher 契約を参照 |
| TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 | Phase 2 完了 | provenance linkage 契約を参照 |

### 3.2 下流依存（本タスクが前提条件になるタスク）

| 下流タスク                    | 影響                                                 |
| ----------------------------- | ---------------------------------------------------- |
| Task08（Legacy lane cleanup） | review harness alignment 完了後に legacy lane を整理 |

## 4. 境界条件

### 4.1 本タスクが変更してよい範囲

- ChatPanel.tsx の JSDoc / コメント
- ChatPanel.tsx のコールバック引数（no-op → actionable）
- 設計成果物（outputs/ ディレクトリ）

### 4.2 本タスクが変更してはいけない範囲

- chatSlice の状態定義（8 state union）
- useStreamingChat.ts の IPC 通信ロジック
- 子コンポーネントの内部実装
- テストファイル（設計タスクのため）
- mainline の primary lane 契約

## 5. Phase Gate 条件

| Gate              | 条件                                                  |
| ----------------- | ----------------------------------------------------- |
| Phase 1 → Phase 2 | 現状棚卸し完了 + AC 検証可能化完了 + スコープ固定完了 |
| Phase 2 → Phase 3 | concern 3 つ以下 + 契約表 + validation matrix 完成    |
| Phase 3 → Phase 4 | PASS / MINOR 判定（MAJOR 時は Phase 1 or 2 へ戻る）   |
| Phase 4 以降      | Phase 1-3 全完了が前提                                |

## 6. Phase 2 への未確定論点

| Concern | 内容                                                                                    | Phase 2 での方針                                                    |
| ------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| C-1     | no-op コールバック 4 箇所の actionable 化方針（Store action vs IPC call vs event emit） | 各 no-op の最適な実装パターンを比較検討                             |
| C-2     | PersistentTerminalLauncher の共有 vs 独立配置                                           | launcher が mainline と共有可能か、harness 固有で分離すべきかを判定 |
| C-3     | review harness が新規ジョブを生成しない制約の enforcement 方法                          | runtime チェック vs 型制約 vs lint rule のどれで担保するか          |
