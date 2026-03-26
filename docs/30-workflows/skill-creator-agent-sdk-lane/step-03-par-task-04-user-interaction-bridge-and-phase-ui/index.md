# TASK-SDK-04: user-interaction-bridge-and-phase-ui

## 概要

AI が質問を投げ、ユーザーが答えながら skill を組み立てる流れを UI / runtime 契約として定義する。

## 実装者向けクイックガイド

### 着手条件

- Task01 / 02 の契約を読了している
- ユーザーが最初に全部を言語化しなくてよい UX を優先することに合意している

### 想定変更ポイント

- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

### 非対象

- create 主導線の一本化
- verify / improve の結果 surface 詳細
- session 永続化

### 完了イメージ

- 質問種別と UI 入力形式の対応表が作れる
- `awaitingUserInput` の扱いを Task02 と矛盾なく説明できる
- lifecycle / navigation state owner を Task02 の表と矛盾なく説明できる
- 現在どの `skill-creator` source root / 構成を読んでいるかを UI に伝える責務境界を説明できる

### 並列実行メモ

- Task03 と並列可能
- Task05 と UI 責務が重なるため、入口導線の最終決定は持ち込まない
- Task05 / Task06 は shared lifecycle state contract を前提にするため、interaction state の owner を曖昧にしない

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
