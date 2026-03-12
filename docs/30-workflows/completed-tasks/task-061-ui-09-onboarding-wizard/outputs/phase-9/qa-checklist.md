# Phase 9 QA Checklist

| 項目 | 結果 | 根拠 |
| --- | --- | --- |
| overlay が `dashboard` へ限定されている | PASS | `App.tsx`, `OnboardingGate.tsx` |
| store persistence が `electronAPI.store` のみを使う | PASS | `OnboardingGate.tsx`, `SettingsView/index.tsx` |
| copy がやさしい日本語で統一されている | PASS | wizard / rerun card screenshot |
| mock response が API 非依存 | PASS | `constants.ts`, `OnboardingWizard.tsx` |
| skill handoff が `skillName` 基準 | PASS | `OnboardingGate.tsx`, test |
| theme 切替が store action 経由 | PASS | `OnboardingGate.tsx`, `SettingsView/index.tsx` |
| rerun path が settings から再表示できる | PASS | INT-09, TC-11-04, TC-11-05 |
| keyboard / focus trap | PASS | component test + Playwright spot check |
| responsive evidence | PASS | TC-11-01, 02, 03 |
| coverage gate | MINOR | function coverage 76.92% |
