# 未タスク検出レポート

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| 検出日     | 2026-03-16                                     |
| 対象タスク | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 検出件数   | 1件                                            |

## 検出ソース

| ソース                       | 確認方法                                                                   | 結果    |
| ---------------------------- | -------------------------------------------------------------------------- | ------- |
| Phase 3 MINOR 指摘           | `phase-3-design-review.md` を参照                                          | 0件     |
| Phase 10 MINOR 指摘          | `outputs/phase-10/final-review-result.md` を参照                           | 0件     |
| Phase 11 発見課題            | `outputs/phase-11/manual-test-result.md` を参照                            | 0件     |
| Phase 7 カバレッジ確認       | `outputs/phase-7/coverage-check-result.md` を参照                          | **1件** |
| コードコメント（TODO/FIXME） | `grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/conversationHandlers.ts` | 0件     |

## 検出された未タスク

| ID                                 | ソース                 | 内容                                                                                                                                                                                                              | 優先度 | 指示書パス                                                                                                               |
| ---------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| UT-COVERAGE-INDEX-TS-EXCLUSION-001 | Phase 7 カバレッジ確認 | `vitest.config.ts` の `coveragePathIgnorePatterns` で `**/index.ts` を除外しているが、エクスポート専用ではない `ipc/index.ts`（実装ロジックを含む）もカバレッジ計測から除外されている。除外パターンの精緻化が必要 | LOW    | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/unassigned-task/UT-COVERAGE-INDEX-TS-EXCLUSION-001.md` |

### UT-COVERAGE-INDEX-TS-EXCLUSION-001 の詳細

- **問題**: `**/index.ts` 除外パターンは、バレルエクスポート用の `index.ts`（`export * from "./foo"`のみ）を想定しているが、`apps/desktop/src/main/ipc/index.ts` は `registerAllIpcHandlers()` / `unregisterAllIpcHandlers()` 等の実装ロジックを含む。このファイルのカバレッジが計測されないため、Section 13 追加分のカバレッジを直接確認できなかった
- **影響**: カバレッジレポートの精度が低下する。実装ロジックを含む `index.ts` のテスト漏れを検出できない
- **改善案**: `**/index.ts` を除外パターンから削除し、代わりにバレルエクスポート専用ファイルを個別に除外するか、`!apps/desktop/src/main/ipc/index.ts` のような否定パターンで対象から復帰させる

## 3ステップ実施状況（P3/P38 対策）

| ステップ                             | 状態     | 備考                                                                                                                     |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1. `unassigned-task/` に指示書作成   | 実施予定 | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/unassigned-task/UT-COVERAGE-INDEX-TS-EXCLUSION-001.md` |
| 2. `task-workflow.md` 残課題テーブル | 実施予定 | 残課題テーブルに登録                                                                                                     |
| 3. 関連仕様書に参照リンク追加        | 実施予定 | 該当仕様書に参照リンクを追加                                                                                             |

## unassigned-task-detection.md 更新

- 件数: 1件
- ステータス: 確認完了（2026-03-16）
