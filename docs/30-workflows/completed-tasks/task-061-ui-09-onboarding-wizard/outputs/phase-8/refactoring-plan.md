# Phase 8 Refactoring Plan

## 実施済み整理

1. wizard 固有定数を `constants.ts` へ分離し、表示定義と振る舞いを切り離した。
2. overlay 表示判断を `OnboardingGate.tsx`、dialog 本体を `OnboardingWizard.tsx` に分けた。
3. display name fallback を store selector に閉じ込め、dashboard view 側へ条件分岐を漏らさない形にした。
4. Phase 11 harness を production routing から切り離し、`phase11-onboarding-wizard.tsx` に隔離した。

## 継続方針

- onboarding 実装は `DashboardView/components/onboarding/` に閉じ込めたまま維持する。
- shared component 化は、別 workflow でも再利用ニーズが確定するまで見送る。
- test warning の吸収を目的に component 内ロジックを崩すことはしない。
