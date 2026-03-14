# unassigned task detection

## 実施日時

- 2026-03-14

## 監査コマンド

- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 結果

| 指標                    | 値                   |
| ----------------------- | -------------------- |
| currentViolations       | 0                    |
| baselineViolations      | 133                  |
| verify-unassigned-links | 223/223（missing=0） |

## 判定

- 今回差分から新規に formalize が必要な未タスクは検出されなかった。
- baseline 133件は既存 backlog として管理継続。
