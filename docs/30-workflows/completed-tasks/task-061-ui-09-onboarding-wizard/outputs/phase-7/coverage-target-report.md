# Phase 7 Coverage Target Report

## 対象スコープ

- `src/renderer/views/DashboardView/components/onboarding/**`
- `src/renderer/views/DashboardView/DashboardView.tsx`
- `src/renderer/views/SettingsView/index.tsx`

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage --coverage.reporter=text-summary \
  --coverage.include=src/renderer/views/DashboardView/components/onboarding/** \
  --coverage.include=src/renderer/views/DashboardView/DashboardView.tsx \
  --coverage.include=src/renderer/views/SettingsView/index.tsx \
  src/renderer/views/DashboardView/components/onboarding/OnboardingWizard.test.tsx \
  src/renderer/views/DashboardView/components/onboarding/OnboardingGate.test.tsx \
  src/renderer/views/DashboardView/DashboardView.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx \
  src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx
```

## 結果

| 指標 | 結果 | 目標 |
| --- | --- | --- |
| Statements | 89.22% | 80% |
| Branches | 83.06% | 60% |
| Functions | 76.92% | 80% |
| Lines | 89.22% | 80% |

## 解釈

- statement / branch / line は gate を超えた。
- function のみ `76.92%` で未達。
- 73 targeted tests はすべて pass しており、体験上の主要経路は押さえられている。
