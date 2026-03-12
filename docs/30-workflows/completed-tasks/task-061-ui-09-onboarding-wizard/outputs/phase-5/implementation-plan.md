# Phase 5 Implementation Plan

## 実装レーン

1. Dashboard lane
   `App.tsx` に overlay gate を差し込み、`dashboard` surface 上でのみ表示する。
2. Onboarding lane
   `OnboardingWizard.tsx` と `OnboardingGate.tsx` を view-local component として追加し、name / mock chat / skill / theme の 4 step を実装する。
3. Settings lane
   `SettingsView` に rerun card を追加し、`onboarding.completed=false` 保存後に `dashboard` へ戻す。
4. Verification lane
   unit / integration test、Phase 11 harness、スクリーンショット script を追加する。

## 実装ポリシー

- 新しい `ViewType` は追加しない。
- `window.electronAPI.config` は使わず、`window.electronAPI.store` と store action のみを使う。
- Step 2 は完全ローカル mock。
- Step 3 は `skillName` を primary key にして handoff する。
- shared component への premature extraction は行わず、onboarding は `DashboardView/components/onboarding/` に閉じ込める。
