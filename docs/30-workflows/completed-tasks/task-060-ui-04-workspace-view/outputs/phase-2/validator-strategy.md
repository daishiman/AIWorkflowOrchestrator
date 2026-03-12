# Phase 2 Validator Strategy

## 正本コマンド

| 用途                 | コマンド                                                                                                                                                                     | 再利用 Phase |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 構造検証             | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view`                            | 4, 9, 12     |
| 全体整合性           | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view`                      | 4, 9, 12     |
| link/path 監査       | `rg` による canonical path / dependency / sync target 検証                                                                                                                   | 4, 6, 9      |
| implementation guide | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view` | 12           |
| unassigned link 監査 | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                          | 12           |

## Red/Green/Refactor への割り当て

- Phase 4: contract test matrix と red 条件定義
- Phase 5: pointer / master index / workflow root の更新
- Phase 6-7: cross-doc audit と coverage 確認
- Phase 8: 用語と path 表記の正規化
- Phase 9: validator suite の再実行

## 失敗時の戻り先

| 失敗種別                         | 戻り先          |
| -------------------------------- | --------------- |
| workflow root / pointer の不整合 | Phase 5         |
| requirement / design 不足        | Phase 2         |
| implementation guide 不足        | Phase 12 Task 1 |
| unassigned link 切れ             | Phase 12 Task 4 |
