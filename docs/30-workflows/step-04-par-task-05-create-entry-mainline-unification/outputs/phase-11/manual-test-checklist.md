# Manual Test Checklist

## spec_created walkthrough (2026-03-26)

- [x] `SkillCenterView/index.tsx` を読み、通常ユーザーの create 入口が header CTA / journey CTA であると説明できる
- [x] `App.tsx` を読み、`skillCreate` view が `SkillCreateWizard` を返し、close が `skillCenter` へ戻ると説明できる
- [x] `SkillManagementPanel.tsx` を読み、advanced shell 上の `create` / `lifecycle` view が primary route の代替ではないと説明できる
- [x] `SkillLifecyclePanel.tsx` を読み、runtime 一気通し panel が secondary route であると説明できる
- [x] `outputs/phase-2/mainline-boundary-matrix.md` を読み、warning が summary と diagnostics に分離されていると説明できる
- [x] `outputs/phase-3/skill-compliance-and-elegance-review.md` を読み、Task05 は全面破棄ではなく局所再構成で十分だと説明できる
- [x] `phase-10-final-review.md` を読み、verify / improve は Task06、governance は Task07 の責務であると説明できる

## 実装wave walkthrough (2026-03-27)

- [x] `SkillCenterView` の header CTA / journey CTA に `data-route-kind="primary"` が設定されている
- [x] `SkillCreateWizard` に `data-route-kind="destination"` が設定されている
- [x] `SkillManagementPanel` の create/lifecycle view に `data-route-kind="secondary"` が設定されている
- [x] `ProvenanceWarningSummary` が mainline 向け warning summary を表示する
- [x] `ProvenanceWarningSummary` が raw diagnostics (root path, hash 等) を表示しない
- [x] 全98テストが PASS し、既存テストの回帰が発生していない
- [x] TypeScript 型チェックがエラーゼロで通過する
- [x] AC-1〜AC-7 が全て満たされている
