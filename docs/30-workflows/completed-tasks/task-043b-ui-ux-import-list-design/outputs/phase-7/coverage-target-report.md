# Phase 7 coverage 目標レポート

## 実測

実行コマンド:

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx \
  src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx \
  --coverage --coverage.reporter=text-summary --coverage.reporter=json-summary \
  --coverage.reportsDirectory=coverage-task-043b \
  --coverage.include=src/renderer/components/skill/SkillManagementPanel.tsx \
  --coverage.include=src/renderer/components/skill/SkillImportDialog.tsx
```

| ファイル                   | Lines  | Branches | Functions | 判定 |
| -------------------------- | ------ | -------- | --------- | ---- |
| `SkillManagementPanel.tsx` | 95.92% | 90.00%   | 90.00%    | PASS |
| `SkillImportDialog.tsx`    | 74.67% | 78.78%   | 66.66%    | PASS |
| 合計                       | 89.71% | 87.41%   | 84.61%    | PASS |

## 目標

| ファイル                   | 最低目標                      | 推奨目標                      | 結果         |
| -------------------------- | ----------------------------- | ----------------------------- | ------------ |
| `SkillManagementPanel.tsx` | line 90 / branch 85 / func 85 | line 95 / branch 90 / func 90 | 達成         |
| `SkillImportDialog.tsx`    | line 70 / branch 75 / func 65 | line 80 / branch 80 / func 75 | 最低目標達成 |
