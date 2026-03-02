# TASK-UI-05A ブランチ差分反映マトリクス

## 目的

本ブランチ差分（`git diff --name-only`）に対して、`task-specification-creator` 準拠の反映漏れを防ぐため、変更ファイルと仕様書反映先を 1:1 で追跡する。

## 判定ルール

- ✅ 反映済み: `skill-editor-view` 仕様書または aiworkflow 正本で、変更内容・状態・依存を追跡できる
- N/A: TASK-UI-05A の責務外（参照のみ）
- ⚠ 要対応: 参照先未定義、または状態矛盾

## SubAgent 分担（関心ごと分離）

| SubAgent | 関心ごと         | 担当                                                                  |
| -------- | ---------------- | --------------------------------------------------------------------- |
| A        | UI仕様同期       | `ui-ux-components.md`, `ui-ux-feature-components.md`, Phase 1/2/10/11 |
| B        | IPC/API契約同期  | `api-ipc-agent.md`, Phase 1/4/9/10/12                                 |
| C        | セキュリティ同期 | `security-electron-ipc.md`, `security-api-electron.md`, Phase 9/10/12 |
| D        | 台帳・履歴同期   | `task-workflow.md`, `SKILL.md`, `LOGS.md`, Phase 12                   |

## 差分反映トレース

| 変更ファイル                                                                                  | 関心ごと  | 反映先                                                                               | 状態 |
| --------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------ | ---- |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                          | IPC/API   | `phase-1`, `phase-4`, `phase-9`, `phase-10`, `phase-12`, `UT-UI-05A-GETFILETREE-001` | ✅   |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                       | UI/UX     | `phase-1`, `phase-2`, `phase-10`, `phase-12`, extraction-matrix                      | ✅   |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`               | UI/UX     | `phase-1`, `phase-2`, `phase-10`, `phase-12`, extraction-matrix                      | ✅   |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                          | 台帳      | `phase-12`, `spec-alignment-review`, extraction-matrix                               | ✅   |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                        | 台帳/教訓 | extraction-matrix, `spec-alignment-review`                                           | ✅   |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                             | 変更履歴  | `phase-12` Step 1-A チェック項目                                                     | ✅   |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                              | 変更履歴  | `phase-12` Step 1-A チェック項目                                                     | ✅   |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                 | 索引      | `phase-12` Step 1-D / 検証コマンド                                                   | ✅   |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                                | 索引      | `phase-12` 検証コマンド（`generate-index.js`）                                       | ✅   |
| `.claude/skills/task-specification-creator/SKILL.md`                                          | 変更履歴  | `phase-12` Step 1-A チェック項目                                                     | ✅   |
| `.claude/skills/task-specification-creator/LOGS.md`                                           | 変更履歴  | `phase-12` Step 1-A チェック項目                                                     | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-1-requirements.md`      | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-2-design.md`            | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-3-design-review.md`     | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-4-test-creation.md`     | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-5-implementation.md`    | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-6-test-expansion.md`    | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-8-refactoring.md`       | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-9-quality-assurance.md` | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-10-final-review.md`     | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-11-manual-test.md`      | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |
| `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/phase-12-documentation.md`    | 先行比較  | extraction-matrix E（先行整合）                                                      | ✅   |

## 機械検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-editor-view
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-api-electron" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ipc-contract-checklist" -C 2
```

## 結果（2026-03-01）

- 差分反映: ✅ 22/22（要追跡対象）
- 仕様整合: ✅ `verify-all-specs` errors=0 warnings=0
- Phase整合: ✅ `validate-phase-output` errors=0 warnings=0
