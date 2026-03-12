# Phase 5 File Change Plan

| ファイル | 役割 |
| --- | --- |
| `apps/desktop/src/renderer/App.tsx` | `dashboard` render 時に `OnboardingGate` を重ねる |
| `apps/desktop/src/renderer/store/index.ts` | `useDisplayName()` を `userProfile.name` 優先へ修正 |
| `apps/desktop/src/renderer/views/DashboardView/components/onboarding/constants.ts` | suggestion / theme / skill card 定義を集約 |
| `apps/desktop/src/renderer/views/DashboardView/components/onboarding/OnboardingWizard.tsx` | wizard 本体、focus trap、skip / complete UI |
| `apps/desktop/src/renderer/views/DashboardView/components/onboarding/OnboardingGate.tsx` | persistence / theme / skill import / close 制御 |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx` | rerun card と `onboarding.completed=false` 保存導線 |
| `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx` | display name fallback 回帰 |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx` | rerun card 表示回帰 |
| `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` | rerun action integration |
| `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts` | `window.electronAPI.store` mock 追加 |
| `apps/desktop/src/renderer/phase11-onboarding-wizard.tsx` | Phase 11 専用ハーネス |
| `apps/desktop/scripts/capture-task-061-onboarding-wizard-phase11.mjs` | screenshot automation |
