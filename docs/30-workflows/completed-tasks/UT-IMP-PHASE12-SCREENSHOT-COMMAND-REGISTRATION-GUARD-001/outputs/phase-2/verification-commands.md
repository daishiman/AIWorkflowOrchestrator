# Phase 2 検証コマンド設計

## 実行順序（固定）

1. `pnpm --filter @repo/desktop run | rg screenshot`
2. `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard`
3. `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001`
4. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001`

## 期待値

| コマンド           | 期待結果                                           |
| ------------------ | -------------------------------------------------- |
| run一覧            | `screenshot:skill-import-idempotency-guard` が表示 |
| screenshot 実行    | `TC-01..04` と diagnostics 更新                    |
| coverage validator | expected=4, covered=4                              |
| verify-all-specs   | 13/13, error=0, warning=0                          |
