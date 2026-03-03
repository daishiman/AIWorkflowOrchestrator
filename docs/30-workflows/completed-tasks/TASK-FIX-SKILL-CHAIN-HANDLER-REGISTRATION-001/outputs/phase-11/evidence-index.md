# Phase 11: 証跡索引

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| Phase    | 11 - 証跡索引                                 |
| 作成日   | 2026-03-03                                    |
| 更新日   | 2026-03-03                                    |

## 証跡一覧

| #     | 証跡種別     | パス                                                      | 内容                                           | Phase |
| ----- | ------------ | --------------------------------------------------------- | ---------------------------------------------- | ----- |
| EV-01 | 要件定義     | outputs/phase-1/requirements-definition.md                | 要件定義書                                     | 1     |
| EV-02 | 要件定義     | outputs/phase-1/acceptance-criteria.md                    | 受入基準                                       | 1     |
| EV-03 | 要件定義     | outputs/phase-1/aiworkflow-requirements-extraction.md     | 仕様抽出結果                                   | 1     |
| EV-04 | 設計書       | outputs/phase-2/architecture-design.md                    | アーキテクチャ設計                             | 2     |
| EV-05 | 設計書       | outputs/phase-2/ipc-contract-design.md                    | IPC契約設計                                    | 2     |
| EV-06 | 設計書       | outputs/phase-2/test-strategy.md                          | テスト戦略                                     | 2     |
| EV-07 | レビュー     | outputs/phase-3/design-review-result.md                   | 設計レビュー結果                               | 3     |
| EV-08 | テスト       | outputs/phase-4/red-test-result.md                        | Red テスト結果                                 | 4     |
| EV-09 | 実装         | outputs/phase-5/implementation-summary.md                 | 実装サマリー                                   | 5     |
| EV-10 | テスト拡充   | outputs/phase-6/regression-test-result.md                 | 回帰テスト結果                                 | 6     |
| EV-11 | カバレッジ   | outputs/phase-7/coverage-plan.md                          | カバレッジ計画                                 | 7     |
| EV-12 | リファクタ   | outputs/phase-8/refactoring-plan.md                       | リファクタリング計画                           | 8     |
| EV-13 | 品質         | outputs/phase-9/quality-report.md                         | 品質監査レポート                               | 9     |
| EV-14 | 最終レビュー | outputs/phase-10/final-review-result.md                   | 最終レビュー結果                               | 10    |
| EV-15 | 手動テスト   | outputs/phase-11/manual-test-result.md                    | 手動テスト検証結果                             | 11    |
| EV-16 | 画面証跡     | outputs/phase-11/chain-builder-evidence.png               | Chain Builder 表示スクリーンショット（生証跡） | 11    |
| EV-17 | 画面証跡     | outputs/phase-11/screenshots/tc-01-chain-builder-view.png | TC-01 カバレッジ検証用スクリーンショット       | 11    |
| EV-18 | ドキュメント | outputs/phase-12/implementation-guide.md                  | 実装ガイド                                     | 12    |
| EV-19 | ドキュメント | outputs/phase-12/spec-update-summary.md                   | 仕様更新サマリー                               | 12    |
| EV-20 | ドキュメント | outputs/phase-12/documentation-changelog.md               | 更新履歴                                       | 12    |
| EV-21 | ドキュメント | outputs/phase-12/unassigned-task-detection.md             | 未タスク検出                                   | 12    |
| EV-22 | ドキュメント | outputs/phase-12/skill-feedback-report.md                 | スキルフィードバック                           | 12    |

## コード変更証跡

| #     | ファイル                                                              | 変更種別 | 説明                                  |
| ----- | --------------------------------------------------------------------- | -------- | ------------------------------------- |
| CV-01 | `apps/desktop/src/main/ipc/index.ts`                                  | 修正     | `registerSkillChainHandlers` 呼出追加 |
| CV-02 | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | 修正     | 回帰防止テスト追加                    |
