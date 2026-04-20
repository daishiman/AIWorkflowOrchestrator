# Phase 12: 未タスク検出レポート

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-CANCEL-004 |
| Phase    | 12                 |
| 作成日   | 2026-04-20         |

## 検出結果

**検出件数: 1 件**

## 未タスク

| タスクID                                        | 状態 | 内容                                                                                                                             | 根拠                                                                          |
| ----------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `TASK-SW-CANCEL-004-ipc-e2e-cancel-integration` | open | `SkillCreateWizard` の cancel UI バインディング証跡、Renderer→Preload→Main の統合 close、`startGeneration()` consumer の扱い整理 | hook 単体テストと 4層 grep は完了済みだが、UI / consumer / E2E close は未回収 |

## スコープ外事項（参考）

以下は本 task の対象外・別系統で扱うべき事項であり、本 workflow の未タスク件数には含めない:

| 事項                                                                                  | 理由                                                                      |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts:446` の `any` warning                  | 別系統のスキル作成 API 型整備 task で扱う                                 |
| `apps/desktop/src/main/ipc/authHandlers.ts:193` の `any` warning                      | 認証系の型整備 task で扱う                                                |
| `apps/desktop/src/renderer/phase11-app-debug-localstorage-clear.tsx` の `any` warning | phase11 デバッグ用コードで別枠                                            |
| `apps/desktop/src/renderer/views/ConcurrencyGuardReviewHarness.tsx` の `any` warning  | review harness 系の別 task                                                |
| `docs/30-workflows/unassigned-task/TASK-SC-07-IPC-CANCEL.md`                          | 旧未実装前提の legacy 台帳。`TASK-SW-CANCEL-001`〜`004` により superseded |

## 本 task の回収状況

| 項目                                                          | 状態               |
| ------------------------------------------------------------- | ------------------ |
| Phase 4 test-matrix で C-6 (IPC failure swallow) 未カバー検出 | Phase 6 で回収済み |
| Phase 5 diff check mismatch                                   | 0 件検出           |
| Phase 8 命名 drift                                            | 0 件検出           |
| Phase 10 AC / 4条件 / 4層                                     | 全 PASS            |
| Phase 11 blocker / MAJOR / MINOR                              | 0 件               |
| UI binding / E2E close / `startGeneration()` consumer         | follow-up 1 件     |

## 結論

- 本 workflow で新規に保持すべき未タスクは **1 件**
- hook 単体 contract は閉じているが、UI binding / E2E close / `startGeneration()` の扱いは follow-up として分離した
- それ以外の回収事項は全 Phase 内で対応済み
