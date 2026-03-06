# Phase 2 検証コマンド契約

## 実行順

1. `node .claude/skills/task-specification-creator/scripts/validate-task10ab-ledger-sync.js`
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
3. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`

## 期待値

| コマンド                        | 期待値                        |
| ------------------------------- | ----------------------------- |
| `validate-task10ab-ledger-sync` | `LEDGER_SYNC_OK`              |
| `verify-unassigned-links`       | `ALL_LINKS_EXIST`             |
| `audit --diff-from HEAD`        | `currentViolations.total = 0` |

## 解釈ルール

- `baselineViolations.total` は FAIL 判定に使わない
- repo 既存 anomaly は quality report に別記録する
