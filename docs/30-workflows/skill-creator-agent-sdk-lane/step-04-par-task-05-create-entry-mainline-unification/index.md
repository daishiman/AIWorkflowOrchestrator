# TASK-SDK-05: create-entry-mainline-unification

## 概要

`SkillLifecyclePanel` と `SkillCreateWizard` の重複を整理し、主導線を一本化する task。

## 実装者向けクイックガイド

### 着手条件

- Task03 / 04 の結果を読了している
- Task02 の shared lifecycle state owner を読了している
- 入口統合と interaction bridge を混同しない方針に合意している

### 想定変更ポイント

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`
- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

### 非対象

- verify / improve contract そのもの
- runtime governance
- session / resume 契約

### 完了イメージ

- create の一次入口を 1 つに説明できる
- 補助導線が secondary route として整理されている
- Task06 の re-entry と衝突しない mainline navigation を説明できる
- 動的に解決された source root / 構成差分 warning を mainline へどこまで出すか説明できる

### 並列実行メモ

- Task06 と並列可能
- 共通 component を同時改修する場合は同期ポイントを持つ
- shared lifecycle state contract が固まるまでは Task06 と完全独立扱いにしない

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
