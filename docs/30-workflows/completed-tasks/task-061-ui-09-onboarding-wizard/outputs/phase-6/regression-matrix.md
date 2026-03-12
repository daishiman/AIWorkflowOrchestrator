# Phase 6 Regression Matrix

| 回帰観点 | 自動テスト | 手動 / visual | 判定 |
| --- | --- | --- | --- |
| 初回起動で overlay open | `OnboardingGate.test.tsx` | TC-11-01 | PASS |
| Step 1 name preview | `OnboardingWizard.test.tsx` | TC-11-01 | PASS |
| Step 2 mock response | `OnboardingWizard.test.tsx` | TC-11-02 進行中に確認 | PASS |
| Step 3 skill handoff | `OnboardingGate.test.tsx` | TC-11-02 | PASS |
| Step 4 theme selection | `OnboardingWizard.test.tsx`, `OnboardingGate.test.tsx` | TC-11-03 | PASS |
| complete persistence | `OnboardingGate.test.tsx` | TC-11-05 の再表示導線 | PASS |
| display name fallback | `DashboardView.test.tsx` | dashboard greeting spot check | PASS |
| settings rerun | `SettingsView.integration.test.tsx` | TC-11-04, TC-11-05 | PASS |
| keyboard / focus trap | `OnboardingWizard.test.tsx` | Playwright spot check | PASS |
| responsive layout | なし | TC-11-01, 02, 03 | PASS |

## 補足

- regression の主軸は 73 targeted tests。
- responsive は screenshot と visual review を main evidence にした。
