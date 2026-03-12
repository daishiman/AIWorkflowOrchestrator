# Phase 2: 設計

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 2                                                      |
| Phase名    | 設計                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                |
| タスク名   | 会話基盤・セッション統合                               |
| 機能名     | step-02-par-task-02-chat-platform-unification          |
| 前提Phase  | [phase-1-requirements.md](./phase-1-requirements.md)   |
| 後続Phase  | [phase-3-design-review.md](./phase-3-design-review.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-12                                             |

## 目的

共通チャットセッション、ストリーミング制御、履歴永続化、文脈注入、UI モード切替の設計を確定する。

## 設計方針

- UI は mode 差分、基盤は共有とする
- general chat と workspace chat の current ownership を壊さずに統合点だけを設計する
- `SkillCenterView` / `WorkspaceView` は entry surface、`ChatView` は execution surface として責務を分ける
- `conversationAPI` は long-term history、renderer state は overlay として分離する
- `requestId` / `currentStreamId` / placeholder streaming state は revive 対象へ混ぜない
- completed archive は比較資料として参照し、current workflow は現 HEAD 基準で更新する

## 実行タスク

- session model 設計: conversation create / append / revive / handoff の契約を定義する
- mode state 設計: `general | workspace | skill-lifecycle` の state 遷移を定義する
- streaming 設計: requestId / cancel / end / error の責務分離を定義する
- persistence 設計: overlay state と永続履歴の境界を定義する
- adapter 設計: workspace 文脈と skill lifecycle 文脈を mode adapter へ押し込む
- handoff boundary 設計: entry surface payload と execution surface state の境界を定義する
- revive boundary 設計: revive 対象と non-persist streaming state の扱いを定義する

## 参照資料

| 参照資料                | パス                                                                                                       | 内容                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 requirements    | `outputs/phase-1/requirements-definition.md`                                                               | 要件正本                       |
| Phase 1 mode gap matrix | `outputs/phase-1/chat-mode-gap-matrix.md`                                                                  | current 差分                   |
| Phase 1 split memo      | `outputs/phase-1/archive-current-split.md`                                                                 | archive/current 運用前提       |
| Task01 設計             | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/phase-2-design.md`              | Task03 handoff 前提            |
| useStreamingChat        | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                                      | general stream                 |
| chatSlice               | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                      | general state                  |
| Workspace chat current  | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`                        | workspace state                |
| SkillCenterView         | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                                | entry surface 表現             |
| skillLifecycleJourney   | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                                            | allowed handoff 正本           |
| preload llm + history   | `apps/desktop/src/preload/index.ts`                                                                        | `llm` / `conversationAPI` 公開 |
| preload types           | `apps/desktop/src/preload/types.ts`                                                                        | renderer 契約型                |
| Task02 archive design   | `../step-02-par-task-02-chat-platform-unification/phase-2-design.md`                                       | prior attempt 比較資料         |
| Task03 completed design | `../../../completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | downstream 契約の現物          |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                             | 内容                       |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| quick-reference           | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`              | Task02 読み順              |
| interfaces-llm            | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`            | LLM 呼び出し契約           |
| llm-ipc-types             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`             | requestId / cancel         |
| llm-streaming             | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`             | stream lifecycle           |
| interfaces-chat-history   | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | conversation API 境界      |
| architecture-chat-history | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | overlay / history 境界     |
| api-chat-history          | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          | persistence API            |
| llm-workspace-chat-edit   | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`   | workspace handoff          |
| arch-state-management     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | store / local state 分離   |
| ui-ux-feature-components  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`  | Skill Center / Task03 接続 |
| ui-ux-navigation          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`          | entry / destination 遷移   |
| security-electron-ipc     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`     | preload / IPC 境界         |
| task-workflow             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`             | current / completed 台帳   |
| lessons-learned           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`           | revive / path drift 再利用 |

## 統合テスト連携

| 観点             | 連携内容                                                          |
| ---------------- | ----------------------------------------------------------------- |
| state ownership  | general / workspace の責務境界を Phase 5-7 の state test へ渡す   |
| streaming        | cancel / end / error 契約を Phase 4-6 の streaming test へ渡す    |
| persistence      | revive / handoff 契約を Phase 6-9 の品質観点へ渡す                |
| handoff boundary | entry surface payload と ChatView 実行面の分離を Phase 4-6 へ渡す |

## 成果物

| 成果物           | パス                                          | 説明                          |
| ---------------- | --------------------------------------------- | ----------------------------- |
| セッション設計   | `outputs/phase-2/session-model.md`            | create / revive / handoff     |
| モード遷移設計   | `outputs/phase-2/chat-mode-state-machine.md`  | mode 状態遷移                 |
| streaming 設計   | `outputs/phase-2/streaming-contract.md`       | requestId / cancel / end      |
| adapter 設計     | `outputs/phase-2/mode-adapter-design.md`      | workspace / lifecycle 文脈    |
| handoff 境界設計 | `outputs/phase-2/entry-execution-boundary.md` | entry surface / ChatView 分離 |
| revive 境界設計  | `outputs/phase-2/persist-boundary.md`         | revive 対象 / 非永続 state    |

## 完了条件

- [x] mode 差分が 1 つの state model で説明できる
- [x] session / streaming / persistence の責務分離が定義されている
- [x] Task03 completed archive と current Task02 reopen の互換確認点がある
- [x] entry surface と execution surface の境界が定義されている
- [x] non-persist streaming state を revive 対象へ混ぜない設計がある
- [x] current / archive の責務分離が設計前提として固定されている
