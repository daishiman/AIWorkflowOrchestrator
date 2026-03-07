# Phase 6 回帰テスト計画

## 実行順

1. `node --test .claude/skills/task-specification-creator/scripts/__tests__/validate-task10ab-ledger-sync.test.mjs`
2. `node .claude/skills/task-specification-creator/scripts/validate-task10ab-ledger-sync.js`
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
4. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`

## 代表ケース

| ケース               | 期待値                  |
| -------------------- | ----------------------- |
| 001/003/008 完了除外 | active set に含まれない |
| 009 継続             | active set に含まれる   |
| derived mismatch     | validator FAIL          |
| missing path         | validator FAIL          |
