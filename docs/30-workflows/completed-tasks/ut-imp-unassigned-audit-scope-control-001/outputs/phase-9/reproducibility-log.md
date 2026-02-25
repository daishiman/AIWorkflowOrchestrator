# Phase 9 再現性ログ

## 実行コマンド

```bash
pnpm exec eslint .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js .claude/skills/task-specification-creator/scripts/__tests__/audit-unassigned-tasks.test.mjs
node --test .claude/skills/task-specification-creator/scripts/__tests__/audit-unassigned-tasks.test.mjs
node --test --experimental-test-coverage .claude/skills/task-specification-creator/scripts/__tests__/audit-unassigned-tasks.test.mjs
```

## 結果ファイル

- `outputs/phase-9/eslint.log`
- `outputs/phase-9/eslint-no-ignore.log`
- `outputs/phase-9/test.log`

## 補足

- `eslint-no-ignore` は `.claude/` を lint 対象にした追加検証で、プロジェクトESLint設定外の `process/console` 参照に起因するエラーを確認した（通常運用は ignore 対象）。
