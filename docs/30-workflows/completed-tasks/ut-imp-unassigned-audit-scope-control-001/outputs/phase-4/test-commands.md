# Phase 4 実行コマンド集

## Red確認

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-unassigned-audit-scope-control-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD~1
```

## Green確認（Phase 5以降）

```bash
node --test .claude/skills/task-specification-creator/scripts/__tests__/audit-unassigned-tasks.test.mjs
node --test --experimental-test-coverage .claude/skills/task-specification-creator/scripts/__tests__/audit-unassigned-tasks.test.mjs
```

## 証跡

- Redログ: `outputs/phase-4/pre-implementation-red.log`
