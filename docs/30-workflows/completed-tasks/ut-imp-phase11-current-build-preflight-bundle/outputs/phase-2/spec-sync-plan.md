# Phase 2 system spec 同期計画

## 更新対象

| 種別            | パス                                                                                                    | 更新内容                                            |
| --------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| workflow 正本   | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md`   | preflight bundle 名、実行順、関連改善タスクの参照先 |
| task 台帳       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                    | 未タスク参照先の正規化、実装完了記録                |
| 教訓集          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                  | 4 bucket preflight と build first ルール            |
| feature catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                         | representative workflow 導線の補強                  |
| task-spec 手順  | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                    | current/baseline 分離の参照確認                     |
| skill logs      | `.claude/skills/aiworkflow-requirements/LOGS.md`, `.claude/skills/task-specification-creator/LOGS.md`   | 実施記録                                            |
| skill changelog | `.claude/skills/aiworkflow-requirements/SKILL.md`, `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴                                            |

## mirror 方針

- canonical root は `.claude/skills/**`
- `.agents/skills/**` は mirror として drift を確認し、必要箇所のみ同期する
