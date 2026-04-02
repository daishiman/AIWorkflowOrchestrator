# Phase 11 Manual Test Checklist

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| workflow | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| phase    | 11                                         |
| mode     | NON_VISUAL                                 |
| status   | completed                                  |

## チェック項目

| ID       | 確認項目                                                                                                                                                 | 期待値                          | 状態      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------- |
| NV-11-01 | `pnpm --filter @repo/desktop build` を実行する                                                                                                           | PASS                            | completed |
| NV-11-02 | `pnpm --filter @repo/desktop typecheck` を実行する                                                                                                       | PASS                            | completed |
| NV-11-03 | `rg -c -F "@repo/shared/src/ipc/channels" apps/desktop/out/preload/index.js` を実行する                                                                  | `0`                             | completed |
| NV-11-04 | `rg -q -F "@repo/shared" apps/desktop/out/preload/index.js` を実行する                                                                                   | match 0件                       | completed |
| NV-11-05 | `pnpm exec vitest run src/preload/__tests__/skill-api.getDetail-update.test.ts src/main/services/runtime/__tests__/governance-bundle.test.ts` を実行する | `2 files / 37 tests PASS`       | completed |
| NV-11-06 | `rg -n "../../../../../../../packages/shared/src/ipc/channels" apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` を実行する    | `0 件`                          | completed |
| NV-11-07 | `outputs/phase-11/discovered-issues.md` を確認する                                                                                                       | current blocker / minor が 0 件 | completed |

## 備考

- UI/UX 変更がないため screenshot は不要。
- 代替証跡は manual-test-result.md と discovered-issues.md に集約する。
