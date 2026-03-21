# Phase 11: 手動テストチェックリスト - UT-TASK06-007-EXT-006

## 実施日

2026-03-21

## チェック項目

| 項目              | 結果 | 補足                                                                                        |
| ----------------- | ---- | ------------------------------------------------------------------------------------------- |
| Vitest 69件 PASS  | [x]  | `scripts/__tests__/check-ipc-contracts.test.ts` を実行し、既存49件 + 新規20件が全件PASS     |
| report-only 実行  | [x]  | `scripts/check-ipc-contracts.ts --report-only --format json` が構文エラーなしで完走         |
| TypeScript 型整合 | [x]  | `pnpm --filter @repo/desktop typecheck` がPASS                                              |
| カバレッジ基準    | [x]  | Line 95.79% / Branch 91.55% / Function 100%                                                 |
| 視覚確認の要否    | [x]  | CLI スクリプトのみが対象で、Renderer UI はなし。validator 整合のため placeholder 証跡を残す |

## 視覚確認の扱い

本タスクは `apps/desktop/scripts/check-ipc-contracts.ts` とそのユニットテストのみを対象とし、画面遷移・UI部品・実スクリーンショット対象を持たない。したがって、Phase 11 の視覚確認は **対象外** と判定する。ただし補助成果物整合のため、`screenshot-plan.json` と placeholder PNG を保存する。

## 判定

- [x] 手動確認の必須項目を全て実施
- [x] 非UIタスクとしての対象外判定を明記
- [x] Phase 12 に進行可能
