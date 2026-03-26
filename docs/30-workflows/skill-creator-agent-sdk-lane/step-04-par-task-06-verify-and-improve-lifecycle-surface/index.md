# TASK-SDK-06: verify-and-improve-lifecycle-surface

## 概要

verify / improve を正式 lane として追加し、結果表示・適用・再検証までの surface を定義する。

## 実装者向けクイックガイド

### 着手条件

- Task03 / 04 の結果を読了している
- Task02 の state owner と lane response baseline を読了している
- verify を初回から重い別エンジンにしない方針に合意している

### 想定変更ポイント

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`
- `packages/shared/src/types/skill-improver.ts`

### 非対象

- create 入口の一本化
- handoff governance の hardening
- session persistence 詳細

### 完了イメージ

- verify / improve / apply / re-verify の流れを 1 つの surface で説明できる
- Task05 と責務衝突せずに再入場導線を定義できる
- lane response baseline を崩さずに integrated / handoff 両レーンで振る舞いを説明できる
- 検証対象がどの source root / 構成 snapshot かを結果 surface に残せる

### 並列実行メモ

- Task05 と並列可能
- state owner が重なる場合は Task02 の owner 表を優先する
- shared lifecycle state contract が未合意なら、Task05 との最終 navigation 決定は直列化する

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
