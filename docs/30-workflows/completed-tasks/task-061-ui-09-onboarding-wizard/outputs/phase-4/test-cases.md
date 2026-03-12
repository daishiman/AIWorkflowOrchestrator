# Phase 4 Test Cases

| ID | 種別 | 観点 | 期待値 | 実装先 |
| --- | --- | --- | --- | --- |
| P4-TC-01 | Component | Step 1 入力 | 空文字では進めず、preview が更新される | `OnboardingWizard.test.tsx` |
| P4-TC-02 | Component | 4 step 完了 | `onComplete(payload)` と完了画面、自動 close が動く | `OnboardingWizard.test.tsx` |
| P4-TC-03 | Component | Escape skip | `onSkip()` が 1 回だけ呼ばれる | `OnboardingWizard.test.tsx` |
| P4-TC-04 | Component | Focus trap | `Shift+Tab` / `Tab` が dialog 内で循環する | `OnboardingWizard.test.tsx` |
| P4-TC-05 | Integration | completed=false | overlay が開き、skill preload が走る | `OnboardingGate.test.tsx` |
| P4-TC-06 | Integration | completed=true | overlay を描画しない | `OnboardingGate.test.tsx` |
| P4-TC-07 | Integration | skip persistence | `onboarding.completed=true` を保存して閉じる | `OnboardingGate.test.tsx` |
| P4-TC-08 | Integration | complete persistence | profile / theme / skill / store が連携する | `OnboardingGate.test.tsx` |
| P4-TC-09 | Selector | display name fallback | `userProfile.name` が dashboard greeting に反映される | `DashboardView.test.tsx` |
| P4-TC-10 | Unit | rerun section render | settings に rerun card と button が表示される | `SettingsView.test.tsx` |
| P4-TC-11 | Integration | rerun action | click で `onboarding.completed=false` 保存 + `dashboard` 戻り | `SettingsView.integration.test.tsx` |
| P4-TC-12 | Manual | responsive / visual | desktop / tablet / mobile screenshot を撮る | Phase 11 |
