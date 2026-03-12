# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 1                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

Skill Creator 領域の現行機能分散を整理し、表導線・内部 API・ユーザー会話フローに必要な要件を定義する。

## 実行タスク

- 現行能力棚卸し: `SkillCreatorService`、`skillCreatorHandlers`、preload `skillCreatorAPI` の能力を整理する
- 導線差分整理: `SkillManagementPanel`、`SkillCreateWizard`、`skill.create` の責務差分を整理する
- セッション要件定義: `作成 -> 実行 -> 改善` の会話セッション要件を定義する
- 内部オーケストレーション要件定義: Planner / Executor / Improver の内部責務と表出境界を定義する
- Task02 依存契約定義: 共通会話基盤に依存する UI / state / IPC 契約を整理する

## 参照資料

| 資料名                       | パス                                                                               | 説明                         |
| ---------------------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| SkillCreatorService          | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                      | 現行の skill creator 本体    |
| skillCreatorHandlers         | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                | IPC 契約                     |
| preload skillCreatorAPI      | `apps/desktop/src/preload/skill-creator-api.ts`                                    | renderer 露出 API            |
| SkillService                 | `apps/desktop/src/main/services/skill/SkillService.ts`                             | wizard 経由の作成導線        |
| SkillManagementPanel         | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`              | 現行 UI 導線                 |
| SkillCreateWizard            | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                 | wizard UI                    |
| Agent slice                  | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                             | execute / improve 導線       |
| API / IPC 仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`               | Agent / skill IPC            |
| UI/UX コンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`    | Skill panel 契約             |
| Claude Code エージェント運用 | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md` | 内部オーケストレーション前提 |

## 実行手順

### ステップ1: 既存 create / execute / improve 導線を調査する

main、preload、renderer の各レイヤで skill 作成、実行、改善に関わる API と UI を整理する。

### ステップ2: 単一導線化の要件を抽出する

ユーザーに見せる導線、内部エンジン、wizard secondary action の責務を分離して要件化する。

### ステップ3: 受け入れ基準とスコープを固定する

Phase 2 以降で使う受け入れ基準、対象範囲、SubAgent 分担を成果物として確定する。

## 統合テスト連携

| 接続観点     | 内容                                                   | 次フェーズへの引き継ぎ    |
| ------------ | ------------------------------------------------------ | ------------------------- |
| create 経路  | `skill.create` と `skillCreatorAPI` の責務境界         | Phase 2 API 位置づけ設計  |
| execute 経路 | `agentSlice.executeSkill` の handoff 条件              | Phase 2 状態遷移設計      |
| improve 経路 | `analyze` / `applyImprovements` / `autoImprove` の接続 | Phase 2 状態遷移設計      |
| UI 導線      | `SkillManagementPanel` と wizard の責務差分            | Phase 2 session card 設計 |

## 成果物

| 成果物        | パス                                         | 説明                 |
| ------------- | -------------------------------------------- | -------------------- |
| 要件定義書    | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件 |
| 受け入れ基準  | `outputs/phase-1/acceptance-criteria.md`     | 完了判定の基準       |
| スコープ定義  | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲   |
| SubAgent 分担 | `outputs/phase-1/subagent-ownership.md`      | 関心ごとの分担       |

## 完了条件

- [ ] 現行 API と UI の二重系統が整理されている
- [ ] 単一会話フローの要件が定義されている
- [ ] Task02 依存契約が明文化されている
