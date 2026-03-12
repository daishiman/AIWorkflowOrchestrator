# 実行コマンド集

## 単体テスト

```bash
pnpm exec vitest run scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs
```

## guard 実行

```bash
node scripts/validate-workspace-parent-reference-sweep.mjs --json
```

## workflow validator

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard
```

## docs / mirror 確認

```bash
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```
