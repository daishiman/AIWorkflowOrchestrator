# Phase 11 実行証跡

## 参照ログ

- `outputs/phase-11/command-transcript.log`

## 実行コマンド

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-unassigned-audit-scope-control-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file ../invalid.md
```

## 実行結果要約

- target-file: `currentViolations = 0`, exit 0
- full mode: 全体違反あり, exit 1
- invalid target: exit 2
