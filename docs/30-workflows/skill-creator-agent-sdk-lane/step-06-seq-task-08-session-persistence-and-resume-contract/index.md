# TASK-SDK-08: session-persistence-and-resume-contract

## 概要

workflow session、checkpoint、resume 互換性を既存 persistence 基盤へどう載せるかを定義する contract-first の後段 task。

## 実装者向けクイックガイド

### 着手条件

- Task02 と Task07 の結果を読了している
- 初回は本実装完了ではなく契約境界の明確化を優先することに合意している

### 想定変更ポイント

- `apps/desktop/src/main/services/session/SessionPersistenceService.ts`
- `apps/desktop/src/main/services/session/SessionStorage.ts`
- `apps/desktop/src/main/ipc/session-persistence-handler.ts`
- `packages/shared/src/types/agent.ts`
- `packages/shared/src/types/skillCreator.ts`

### 非対象

- create / verify UI
- handoff governance
- manifest 契約そのもの
- chat history domain model の全面再設計

### 完了イメージ

- save target / invalidation / resume 可否を説明できる
- manifest 更新時の互換性境界を第三者が判断できる
- workflow session を既存 `PersistedSession` 系へ載せる方針または wrapper 方針を説明できる
- source root / resource snapshot が変わったときの resume compatibility を説明できる

### 並列実行メモ

- governance より先に着手しない
- Task07 の route state 境界を前提にする
- Task02 では workflow state envelope まで、Task08 では persistence / invalidation / compatibility を閉じる

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
