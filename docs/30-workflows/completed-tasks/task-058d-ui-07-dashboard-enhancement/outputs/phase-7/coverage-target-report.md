# Phase 7 成果物: カバレッジ目標

## 基準

- Line: 80%以上
- Branch: 60%以上
- Function: 80%以上

## 対象スコープ

- `apps/desktop/src/renderer/views/DashboardView/index.tsx`
- `apps/desktop/src/renderer/views/DashboardView/components/*.tsx`
- `apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.ts`

## 実測コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/DashboardView/DashboardView.test.tsx \
  src/renderer/views/DashboardView/components/dashboardContent.test.ts \
  --coverage \
  --coverage.reporter=text-summary \
  --coverage.reporter=json-summary \
  --coverage.include='src/renderer/views/DashboardView/**/*.{ts,tsx}'
```
