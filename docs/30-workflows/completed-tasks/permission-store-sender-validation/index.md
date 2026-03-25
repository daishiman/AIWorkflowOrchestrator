# UT-06-002-UT-1: permission-store-handlers sender 検証追加

## メタ情報

| 項目     | 値                                                       |
| -------- | -------------------------------------------------------- |
| タスクID | UT-06-002-UT-1                                           |
| 元タスク | UT-06-002                                                |
| Issue    | #1527                                                    |
| 種別     | セキュリティ改善                                         |
| 優先度   | Medium                                                   |
| 作成日   | 2026-03-24                                               |
| 対象     | `apps/desktop/src/main/ipc/permission-store-handlers.ts` |
| ブランチ | `fix/UT-06-002-UT-1-permission-store-sender-validation`  |

## 概要

`permission-store-handlers.ts` の全4ハンドラに `validateIpcSender` を適用し、不正な BrowserWindow からの IPC 呼び出しを拒否する。

## 変更対象ファイル

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts`                | 修正     |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` | 修正     |

## Phase 一覧

| Phase | ファイル                                                       | 状態      |
| ----- | -------------------------------------------------------------- | --------- |
| 1     | [phase-1-requirements.md](./phase-1-requirements.md)           | completed |
| 2     | [phase-2-design.md](./phase-2-design.md)                       | completed |
| 3     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed |
| 4     | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed |
| 5     | [phase-5-implementation.md](./phase-5-implementation.md)       | completed |
| 6     | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed |
| 7     | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed |
| 8     | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed |
| 9     | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed |
| 10    | [phase-10-final-review.md](./phase-10-final-review.md)         | completed |
| 11    | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed |
| 12    | [phase-12-documentation.md](./phase-12-documentation.md)       | completed |
| 13    | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | completed |
