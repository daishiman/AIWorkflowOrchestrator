# TASK-SDK-07: execution-governance-and-handoff-alignment

## 概要

foundation で固定した lane response baseline と downstream outputs を前提に、API レーンと terminal handoff レーン、approval、disclosure、manual boundary を適用・整合・hardening する task。

## 実装者向けクイックガイド

### 着手条件

- Task02, 03, 04, 05, 06 の結果を読了している
- API primary / handoff secondary の原則に合意している

### 想定変更ポイント

- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`
- `apps/desktop/src/main/services/runtime/ApprovalGate.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/channels.ts`

### 非対象

- manifest 契約
- lane response baseline の初定義
- resource / budget 起因の degrade trigger 定義
- create 主導線 UI の設計
- session 保存実装

### 完了イメージ

- API lane / handoff lane / manual boundary を誤解なく説明できる
- compliance 前提を破らずに graceful degradation を定義できる
- Task03 の degrade trigger と Task04 / 05 / 06 の surface に governance bundle を矛盾なく被せられる
- 外部/custom `skill-creator` root を読んだ場合の disclosure / trust boundary を説明できる

### 並列実行メモ

- 後段 task として扱う
- Task08 より先に governance を固定する

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
