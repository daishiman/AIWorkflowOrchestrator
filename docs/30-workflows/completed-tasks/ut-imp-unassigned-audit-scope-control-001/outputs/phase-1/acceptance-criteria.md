# Phase 1 受入基準

## 判定基準

1. `--target-file` 指定時、対象外違反は `baselineViolations` に分類される。
2. `--diff-from` 指定時、差分対象のみ `currentViolations` に分類される。
3. scoped実行時は `currentViolations.total` が 0 なら exit 0。
4. scope未指定実行は従来互換で全体違反により exit 1。
5. 不正入力（未知オプション、存在しない `--target-file`、不正 `--diff-from`）は exit 2。

## 検証コマンド（Phase 5以降）

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-unassigned-audit-scope-control-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node --test .claude/skills/task-specification-creator/scripts/__tests__/audit-unassigned-tasks.test.mjs
```

## 合否条件

- [x] current/baseline の分離条件が機械判定可能
- [x] exit code 条件が current 基準として定義済み
- [x] 後方互換条件（scope未指定）が定義済み
