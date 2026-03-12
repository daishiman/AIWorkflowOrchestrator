# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| Phase名    | 要件定義                                 |
| タスクID   | TASK-SKILL-LIFECYCLE-02                  |
| タスク名   | 会話基盤・セッション統合                 |
| 機能名     | chat-platform-unification                |
| ステータス | completed                                |
| 後続Phase  | [phase-2-design.md](./phase-2-design.md) |
| 作成日     | 2026-03-11                               |

## 目的

会話基盤の統合対象、mode 差分、共通化すべき契約を明確化し、Task03 が依存できる共通会話要件を定義する。

## 背景

現ブランチには Task01 の一次導線基盤が入っているが、会話自体は `ChatView` `chatSlice` `useStreamingChat` `WorkspaceView` に分散したままである。Task02 では UI 入口の違いを維持したまま、会話セッション・ストリーミング・履歴・文脈注入を同一基盤へ寄せる必要がある。

## SubAgent Team 編成

| 役割       | 担当             | 責務                                            |
| ---------- | ---------------- | ----------------------------------------------- |
| Lead       | Requirement Lead | 受入基準、要件粒度、Task03 引継ぎ境界の確定     |
| SubAgent-A | Session Agent    | conversationId / history / resume 要件の整理    |
| SubAgent-B | Stream Agent     | streaming / abort / retry / partial update 要件 |
| SubAgent-C | Context Agent    | workspace / skill-lifecycle mode 差分の整理     |
| SubAgent-D | Spec Agent       | `.claude` 正本仕様の抽出順序と不足導線の監査    |

## 実行タスク

- P50判定: `HEAD` 差分を確認し、Task01 で導入済みの前提と Task02 未着手部分を切り分ける
- 現行責務整理: `ChatView` `chatSlice` `useStreamingChat` `WorkspaceView` の責務差分を洗い出す
- mode差分整理: `general` `workspace` `skill-lifecycle` の共通項と差分項を一覧化する
- 共通要件定義: ストリーミング、履歴、文脈注入、途中停止/再開、永続化の共通要件を定義する
- Task03契約定義: Task03 に引き渡す API・状態・禁止事項を定義する
- 仕様抽出確認: aiworkflow-requirements から必要仕様を引ける順序と検索語を確定する

## 参照資料

| 参照資料              | パス                                                                                                                                 | 内容                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| Task01 抽出マップ     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/spec-extraction-map.md`                   | 現ブランチで確立した仕様抽出順序  |
| ChatView              | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                                                 | 現行通常チャット                  |
| chatSlice             | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                                                | 非ストリーミング中心の現行状態    |
| useStreamingChat      | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                                                                | ストリーミング hook               |
| WorkspaceView         | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                                                                            | Task01 後の入口からつながる作業面 |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                                                                      | Task01 が固定した一次導線契約     |
| Workspace Chat 仕様   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059a-ui-04b-workspace-chat-panel.md` | To-Be 要件                        |
| Task03 要求元         | `../step-02-par-task-03-skill-creator-execute-improve-integration/phase-1-requirements.md`                                           | 後続タスクが期待する会話基盤前提  |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                             | 内容                                  |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------- |
| interfaces-llm            | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`            | LLM / streaming / workspace 関連入口  |
| llm-ipc-types             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`             | request / response / conversationId   |
| llm-streaming             | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`             | ストリーミング契約                    |
| interfaces-chat-history   | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 履歴永続化契約                        |
| architecture-chat-history | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | 履歴アーキテクチャ                    |
| api-chat-history          | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          | session / message use case            |
| llm-workspace-chat-edit   | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`   | Workspace 文脈会話                    |
| arch-state-management     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | slice / local state 境界              |
| ui-ux-feature-components  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`  | Workspace / Agent / Skill Center 境界 |
| interfaces-agent-sdk-ui   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`   | Task03 handoff の UI 契約             |
| ui-ux-agent-execution     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`     | execution surface と streaming UX     |
| security-electron-ipc     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`     | IPC / abort / timeout 安全性          |
| task-workflow             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`             | 再監査・未タスク台帳                  |
| lessons-learned           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`           | 再発防止知見                          |

## 実行手順

### 0. P50チェック: 現ブランチ差分の確認

1. `git show --name-only --stat HEAD^..HEAD` で current `HEAD` の変更ファイルを確認する。
2. Task01 の一次導線追加と、Task02 対象の会話基盤変更が未着手であることを切り分ける。
3. 既存 `ChatView` / `useStreamingChat` / `WorkspaceView` を確認し、Task02 が「新規設計」であることを記録する。

### 1. 現行責務整理

1. `ChatView` と `chatSlice` の会話表示・入力・履歴責務を整理する。
2. `useStreamingChat` の chunk 管理・abort・error surface を抜き出す。
3. `WorkspaceView` と Task01 導線から見た conversation entry の境界を整理する。

### 2. mode差分整理

1. `general` `workspace` `skill-lifecycle` の開始地点、文脈注入、履歴保持、終了条件を表で比較する。
2. UI が持つ差分と基盤が持つ差分を分離して記録する。

### 3. 共通要件定義

1. session / streaming / history / context adapter / stop-resume を共通要件として定義する。
2. Task03 が必要とする `skill-lifecycle` mode 専用の入力・出力・禁止事項を列挙する。

### 4. 仕様抽出確認

1. `indexes/resource-map.md` と `indexes/quick-reference.md` から読める順序を確認する。
2. `ChatMessage` `llm:stream-chat` `conversationId` `workspacePath` `ChatSessionDTO` `chat_sessions` `ChatView` `WorkspaceView` `skill-lifecycle` `skillLifecycleJourney` の1概念1クエリで引く検索語セットを確定し、spec extraction plan として成果物化する。

## 統合テスト連携

| 観点           | 連携内容                                                                           |
| -------------- | ---------------------------------------------------------------------------------- |
| 会話開始地点   | Task01 で固定した入口から Task02 基盤へ遷移できることを後続統合テスト条件にする    |
| session 継続性 | conversationId の生成 / 再利用 / 履歴復元を Phase 4 以降の契約テストへ引き継ぐ     |
| streaming 中断 | abort / retry / partial update の扱いを失敗系テストへ引き継ぐ                      |
| workspace 文脈 | workspacePath や file context が general mode を汚染しないことを統合観点へ引き継ぐ |
| Task03 handoff | skill-lifecycle mode 専用の依存契約を Task03 契約テストへ引き継ぐ                  |

## 多角的チェック観点

| 観点               | 適用内容                                                           |
| ------------------ | ------------------------------------------------------------------ |
| アーキテクチャ     | session / stream / history / adapter の責務分離                    |
| UI/UX              | mode 差分がユーザーの認知負荷を増やさないこと                      |
| セキュリティ       | workspace 文脈漏洩、IPC 中断時の安全性、タイムアウト回復           |
| エラーハンドリング | partial failure 時の表示、resume 可否、history 破損防止            |
| テスタビリティ     | mode / adapter / storage / stream が独立テスト可能な粒度であること |

## 成果物

| 成果物          | パス                                            | 説明                                 |
| --------------- | ----------------------------------------------- | ------------------------------------ |
| 要件定義書      | `outputs/phase-1/requirements-definition.md`    | 共通要件と受入基準                   |
| mode差分表      | `outputs/phase-1/mode-difference-table.md`      | 3 mode の差分と共有部                |
| Task03 依存契約 | `outputs/phase-1/task03-dependency-contract.md` | Task03 に渡す input/output/forbidden |
| 仕様抽出計画    | `outputs/phase-1/spec-extraction-plan.md`       | aiworkflow-requirements の読む順番   |

## 完了条件

- [x] P50判定結果が記録されている
- [x] 共通化対象と mode 差分が分離されている
- [x] ストリーミングと履歴の共通要件が定義されている
- [x] Task03 に必要な会話基盤契約が列挙されている
- [x] aiworkflow-requirements の抽出順序が成果物化されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: Task01 完了状態
- 後続: [phase-2-design.md](./phase-2-design.md)

## サブタスク管理

- [x] 参照資料確認
- [x] P50判定
- [x] 現行責務整理
- [x] mode差分整理
- [x] Task03 契約定義
- [x] spec extraction plan 作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物パスが Phase 2 から参照可能
- [x] current `HEAD` 差分と Task02 未着手範囲が分離記録されている

## 次のPhase

Phase 2: [phase-2-design.md](./phase-2-design.md)
