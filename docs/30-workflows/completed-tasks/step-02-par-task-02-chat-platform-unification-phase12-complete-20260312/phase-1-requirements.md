# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| Phase名    | 要件定義                                      |
| タスクID   | TASK-SKILL-LIFECYCLE-02                       |
| タスク名   | 会話基盤・セッション統合                      |
| 機能名     | step-02-par-task-02-chat-platform-unification |
| ステータス | completed                                     |
| 後続Phase  | [phase-2-design.md](./phase-2-design.md)      |
| 作成日     | 2026-03-12                                    |

## 目的

会話基盤の統合対象、モード差分、共通化すべき契約を明確化し、Task03 が依存できる共通会話要件を定義する。

## 背景

current HEAD では general chat と workspace chat が別実装で進化しており、`docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/` の prior attempt archive とも状態がずれている。さらに Task01 で `SkillCenterView` / `skillLifecycleJourney.ts` に一次導線と handoff 契約が固定され、Task03 は completed archive 側へ移管されているため、Task02 では archive を比較資料として残したまま、current HEAD を正本にした reopen design を作る必要がある。

## 実行タスク

- baseline 棚卸し: `ChatView` `chatSlice` `useStreamingChat` `useWorkspaceChatController` の責務差分を整理する
- branch 差分監査: current workflow / completed archive / Task03 completed archive の整合と path drift を確認する
- mode 要件抽出: `general` `workspace` `skill-lifecycle` の共通項と差分項を一覧化する
- session 要件抽出: create / append / revive / handoff の最小契約を定義する
- stream 要件抽出: requestId / cancel / end / error の共通要件を定義する
- entry / execution 分離: `SkillCenterView` / `WorkspaceView` は handoff payload 作成、`ChatView` は会話実行 surface として責務を分離する
- persist 境界抽出: revive 対象 state と `isStreaming` / placeholder / `currentStreamId` のような非永続 state を切り分ける
- archive/current 分離: current workflow と completed archive の役割を明文化する

## 参照資料

| 参照資料                | パス                                                                                                       | 内容                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------- |
| ChatView                | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                       | 現行 general chat                |
| chatSlice               | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                      | current overlay state            |
| useStreamingChat        | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                                      | requestId / cancel 契約          |
| Workspace chat current  | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`                        | workspace 別実装                 |
| SkillCenterView         | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                                | entry surface の現行責務         |
| skillLifecycleJourney   | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                                            | handoff / downstream contract    |
| preload llm + history   | `apps/desktop/src/preload/index.ts`                                                                        | `llm` / `conversationAPI` 公開面 |
| preload public types    | `apps/desktop/src/preload/types.ts`                                                                        | requestId / conversation 型      |
| Task01 design           | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/phase-2-design.md`              | 一次導線と Task03 handoff        |
| Task02 archive          | `../step-02-par-task-02-chat-platform-unification/phase-2-design.md`                                       | prior attempt 比較資料           |
| Task03 completed design | `../../../completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | downstream 契約の現物比較        |
| Task02 current index    | `./index.md`                                                                                               | reopen workflow の正本           |
| Follow-up guard         | `./unassigned-task/task-imp-chat-platform-handoff-revive-guard-001.md`                                     | revive / handoff の残課題候補    |
| task workflow guide     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                             | current/archive split の運用基準 |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                             | 内容                       |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| resource-map              | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                 | 抽出起点                   |
| quick-reference           | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`              | 検索語と読む順番           |
| interfaces-llm            | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`            | LLM / cancel 契約          |
| llm-ipc-types             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`             | requestId と IPC 型        |
| llm-streaming             | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`             | ストリーミング契約         |
| interfaces-chat-history   | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | conversationAPI 境界       |
| architecture-chat-history | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | overlay / history 責務分離 |
| api-chat-history          | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          | Use Case API 境界          |
| llm-workspace-chat-edit   | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`   | workspace handoff 文脈     |
| arch-state-management     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | current state ownership    |
| ui-ux-feature-components  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`  | Skill Center / handoff 面  |
| ui-ux-navigation          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`          | entry / destination 導線   |
| security-electron-ipc     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`     | preload / IPC 安全境界     |
| task-workflow             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`             | current / completed 台帳   |
| lessons-learned           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`           | revive / path drift 教訓   |

## 統合テスト連携

| 観点             | 連携内容                                                                        |
| ---------------- | ------------------------------------------------------------------------------- |
| current baseline | general / workspace の現行責務差分を Phase 4 の contract test へ渡す            |
| session contract | create / revive / handoff を Phase 6 の境界テスト観点へ渡す                     |
| entry/execution  | Skill Center / Workspace の handoff と ChatView 実行面の分離を Phase 4-6 へ渡す |
| archive split    | current/archive 分離前提を Phase 12 の documentation へ渡す                     |

## 成果物

| 成果物             | パス                                         | 説明                      |
| ------------------ | -------------------------------------------- | ------------------------- |
| 要件定義           | `outputs/phase-1/requirements-definition.md` | Task02 の要件正本         |
| モード差分表       | `outputs/phase-1/chat-mode-gap-matrix.md`    | general / workspace 差分  |
| セッション要件メモ | `outputs/phase-1/session-requirements.md`    | create / revive / handoff |
| archive split メモ | `outputs/phase-1/archive-current-split.md`   | current/archive 運用前提  |

## 完了条件

- [x] general / workspace / skill-lifecycle の要件差分が分離されている
- [x] session / streaming / history の共通要件が列挙されている
- [x] entry surface と execution surface の責務境界が定義されている
- [x] revive 対象と非永続 state の境界が列挙されている
- [x] current workflow と completed archive の役割が明文化されている
- [x] Task03 completed archive と current Task02 reopen の整合確認点が列挙されている
