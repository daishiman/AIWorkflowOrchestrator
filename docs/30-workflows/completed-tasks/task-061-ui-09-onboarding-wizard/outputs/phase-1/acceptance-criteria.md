# Acceptance Criteria

| ID | 観点 | 判定方法 |
| --- | --- | --- |
| AC-01 | overlay shell | `OnboardingWizard` が `dashboard` overlay として設計されている |
| AC-02 | persistence | `onboarding.completed` と `onboarding.selectedSkillName` が `electronAPI.store` に紐づく |
| AC-03 | display name | Step 1 完了後の名前が dashboard greeting fallback に接続される |
| AC-04 | mock response | Step 2 が API 呼び出しゼロで成立する |
| AC-05 | skill import | Step 3 の card data が `skillName` を持つ |
| AC-06 | theme action | Step 4 が `useSetThemeMode()` に接続される |
| AC-07 | rerun path | SettingsView から再表示できる |
| AC-08 | responsive | mobile で step indicator と card layout の縮約方針が定義されている |
| AC-09 | micro interaction | Step 2 の bubble bounce、Step 4 の theme transition、complete の confetti が設計内で明示されている |
| AC-10 | keyboard / focus | Step modal のフォーカス移動と Trap が仕様に含まれている |
| AC-11 | phase policy | Phase 状態遷移と承認後の Phase 13 完了が artifacts に反映されている |
| AC-12 | team split | Atent Team / SubAgent の直列と並列が定義されている |
