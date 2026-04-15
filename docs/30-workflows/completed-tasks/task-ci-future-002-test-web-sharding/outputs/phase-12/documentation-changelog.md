# ドキュメント更新履歴

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 更新ファイル一覧

| ファイル                                                                        | 変更内容                                         | Phase    |
| ------------------------------------------------------------------------------- | ------------------------------------------------ | -------- |
| `.github/workflows/ci.yml`                                                      | test-web ジョブ追加・test-desktop シャード数削減 | Phase 5  |
| `docs/30-workflows/task-ci-future-002-test-web-sharding/index.md`               | Phase 1〜13 の status 再生成                     | Phase 12 |
| `docs/30-workflows/task-ci-future-002-test-web-sharding/artifacts.json`         | root 台帳を completed / blocked に更新           | Phase 12 |
| `docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/artifacts.json` | root 台帳の mirror を同期                        | Phase 12 |
| `outputs/phase-1/acceptance-criteria.md`                                        | AC-1〜AC-6 定義                                  | Phase 1  |
| `outputs/phase-1/p50-check-result.md`                                           | 現状調査（apps/backend が実体と確認）            | Phase 1  |
| `outputs/phase-1/parallel-count-calculation.md`                                 | 並列数計算シート                                 | Phase 1  |
| `outputs/phase-1/baseline-timing.md`                                            | ベースライン計測値                               | Phase 1  |
| `outputs/phase-1/vitest-config-review.md`                                       | vitest.config.ts 修正不要の確認                  | Phase 1  |
| `outputs/phase-2/shard-count-design.md`                                         | シャード数設計書（計算根拠）                     | Phase 2  |
| `outputs/phase-2/desktop-shard-impact.md`                                       | test-desktop 削減影響評価                        | Phase 2  |
| `outputs/phase-2/ci-yml-diff-preview.md`                                        | ci.yml 差分イメージ                              | Phase 2  |
| `outputs/phase-2/vitest-config-decision.md`                                     | vitest.config.ts 修正不要判断                    | Phase 2  |
| `outputs/phase-3/design-review-result.md`                                       | 設計レビュー PASS                                | Phase 3  |
| `outputs/phase-4/test-matrix.md`                                                | TC-01〜TC-05 定義                                | Phase 4  |
| `outputs/phase-5/implementation-result.md`                                      | 実装結果サマリー                                 | Phase 5  |
| `outputs/phase-6/edge-case-verification.md`                                     | エッジケース検証                                 | Phase 6  |
| `outputs/phase-7/traceability-coverage-report.md`                               | TC と AC のトレーサビリティ                      | Phase 7  |
| `outputs/phase-8/refactoring-result.md`                                         | リファクタリング結果                             | Phase 8  |
| `outputs/phase-9/quality-check-result.md`                                       | 品質チェック結果                                 | Phase 9  |
| `outputs/phase-10/final-review-result.md`                                       | 最終レビュー PASS                                | Phase 10 |
| `outputs/phase-11/manual-test-result.md`                                        | 手動テスト結果                                   | Phase 11 |
| `outputs/phase-12/implementation-guide.md`                                      | 実装ガイド（中学生向け + 技術者向け）            | Phase 12 |

## artifacts.json / index.md 更新

root / outputs の `artifacts.json` を同期し、Phase 1〜12 を `completed`、Phase 13 を `blocked` に更新した。
あわせて `index.md` を再生成し、Phase 状態表を最新化した。
