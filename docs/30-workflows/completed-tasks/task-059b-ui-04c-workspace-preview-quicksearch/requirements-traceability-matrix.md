# Requirements Traceability Matrix

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | TASK-UI-04C-WORKSPACE-PREVIEW   |
| 作成日   | 2026-03-11                      |
| 目的     | 元タスク要件と Phase 仕様の追跡 |

## トレーサビリティ表

| 要件ID | 元タスク要求                                                        | 反映Phase          | 反映先                                                                                                                                                             |
| ------ | ------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RQ-01  | Source/Preview 切替                                                 | Phase 1,2,4        | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`                                                                                         |
| RQ-02  | HTML iframe sandbox                                                 | Phase 1,2,5,9      | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-9-quality-assurance.md`                                                        |
| RQ-03  | Markdown preview                                                    | Phase 1,2,5        | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`                                                                                        |
| RQ-04  | 画像 preview                                                        | Phase 1,2,4        | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`                                                                                         |
| RQ-05  | QuickFileSearch Cmd+P                                               | Phase 1,2,4,11     | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-11-manual-test.md`                                                              |
| RQ-06  | ファジー検索 + 上位10件                                             | Phase 1,2,4,6      | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-6-test-expansion.md`                                                            |
| RQ-07  | Arrow/Enter/Escape 操作                                             | Phase 1,2,4,11     | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-11-manual-test.md`                                                              |
| RQ-08  | `file:read` IPC 再利用                                              | Phase 1,2,5,9      | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-9-quality-assurance.md`                                                        |
| RQ-09  | 04A watcher 連携                                                    | Phase 1,2,6,11     | `phase-1-requirements.md`, `phase-2-design.md`, `phase-6-test-expansion.md`, `phase-11-manual-test.md`                                                             |
| RQ-10  | P31/P39/P40 品質規約                                                | Phase 1,4,6,7      | `phase-1-requirements.md`, `phase-4-test-creation.md`, `phase-6-test-expansion.md`, `phase-7-coverage-check.md`                                                    |
| RQ-11  | Phase 12 ドキュメント更新                                           | Phase 12           | `phase-12-documentation.md`                                                                                                                                        |
| RQ-12  | commit/PR 保留                                                      | Phase 13           | `phase-13-pr-creation.md`                                                                                                                                          |
| RQ-13  | PreviewToolbar の Refresh/Wrap                                      | Phase 1,2,4,5      | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-5-implementation.md`                                                            |
| RQ-14  | JSON/YAML の整形 preview                                            | Phase 1,2,4,6      | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-6-test-expansion.md`                                                            |
| RQ-15  | watcher 再読込 300ms デバウンス + P5 再発防止                       | Phase 1,2,5,6,9    | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`, `phase-9-quality-assurance.md`                           |
| RQ-16  | timeout 5秒 + retry 1秒間隔3回 + 復帰導線                           | Phase 1,2,5,6,9    | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`, `phase-9-quality-assurance.md`                           |
| RQ-17  | Task 5D 用語整合                                                    | Phase 1,2,4,6,9,11 | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-6-test-expansion.md`, `phase-9-quality-assurance.md`, `phase-11-manual-test.md` |
| RQ-18  | QuickSearch モーダル視覚仕様（幅/角丸/影）                          | Phase 2,4,11       | `phase-2-design.md`, `phase-4-test-creation.md`, `phase-11-manual-test.md`                                                                                         |
| RQ-19  | screenshot-plan/coverage 検証（TC-ID↔png整合）                      | Phase 11,12        | `phase-11-manual-test.md`, `phase-12-documentation.md`                                                                                                             |
| RQ-20  | Phase 12 の LOGS.md 2ファイル同時更新と mirror root 確認            | Phase 12           | `phase-12-documentation.md`                                                                                                                                        |
| RQ-21  | sanitize + 危険URL除去の入力検証                                    | Phase 1,2,5,9      | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-9-quality-assurance.md`                                                        |
| RQ-22  | SourceView read-only + ダブルクリック Editor導線 + 行番号ガター40px | Phase 1,2,4,5,6    | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`                               |
| RQ-23  | HTML preview の完全CSP（style/img/font/frame 含む）                 | Phase 1,2,4,5,9    | `phase-1-requirements.md`, `phase-2-design.md`, `phase-4-test-creation.md`, `phase-5-implementation.md`, `phase-9-quality-assurance.md`                            |
| RQ-24  | ErrorBoundary reset と iframe crash 隔離                            | Phase 1,2,5,6,9    | `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`, `phase-9-quality-assurance.md`                           |

## 判定

- 追跡対象 24 件すべてに反映先を定義済み
- 実装前に Phase 1-3 の設計根拠を参照可能
