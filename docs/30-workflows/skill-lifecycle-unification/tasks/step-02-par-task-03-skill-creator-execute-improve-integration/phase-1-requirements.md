# Phase 1: 要件定義 - タスク仕様書

## 目的

Skill Creator 領域の現行機能分散を整理し、表導線・内部 API・ユーザー会話フローに必要な要件を定義する。

## 実行タスク

1. `SkillCreatorService` `skillCreatorHandlers` `preload skillCreatorAPI` の現行能力を棚卸しする
2. `SkillManagementPanel` / `SkillCreateWizard` / `skill.create` 導線との差分を整理する
3. `作成 -> 実行 -> 改善` の会話セッション要件を定義する
4. `Atent Team` / `SubAgent` / `Codex` を内部オーケストレーションとして利用する条件を定義する
5. Task02 の共通会話基盤に依存する契約を定義する

## 参照資料

| 参照資料             | パス                                                                  | 説明                 |
| -------------------- | --------------------------------------------------------------------- | -------------------- |
| SkillCreatorService  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`         | 現行 back-end 能力   |
| skillCreatorHandlers | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                   | IPC 契約             |
| preload              | `apps/desktop/src/preload/skill-creator-api.ts`                       | Renderer 露出 API    |
| SkillService         | `apps/desktop/src/main/services/skill/SkillService.ts`                | wizard 経由の create |
| SkillManagementPanel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | 現行 UI 導線         |

### システム仕様（aiworkflow-requirements）

| 参照資料                    | パス                                                                               | 内容              |
| --------------------------- | ---------------------------------------------------------------------------------- | ----------------- |
| interfaces-agent-sdk-skill  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`  | スキル契約        |
| api-ipc-agent               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`               | Agent / skill IPC |
| security-skill-execution    | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`    | 実行権限          |
| claude-code-agents-workflow | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md` | SubAgent 前提     |

## 成果物

- `skill creator 現行差分分析`
- `二重系統整理方針`
- `会話フロー要件`

## 完了条件

- [ ] 現行 API と UI の二重系統が整理されている
- [ ] 単一会話フローの要件が定義されている
- [ ] Task02 依存契約が明文化されている
