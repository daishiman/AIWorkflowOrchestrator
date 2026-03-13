# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 11                                               |
| Phase名    | 手動テスト                                       |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 10（最終レビュー）                         |
| 後続Phase  | Phase 12（ドキュメント）                         |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

代表シナリオを手動で確認する。

## 実行タスク

- 代表操作確認: check connection、index job、unsupported capability guidance、community summary、partial failure 表示を確認する
- screenshot 計画: job status / guidance / graph summary 代表画面を定義する

## 参照資料

| 参照資料                    | パス                                             | 内容                                              |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                        | 対象範囲と代表導線を確認する                      |
| Phase 2（設計）             | `phase-2-design.md`                              | capability matrix と handoff 契約を確認する       |
| Phase 5（実装）             | `phase-5-implementation.md`                      | 手動確認対象の変更点を確認する                    |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                      | 回帰シナリオを確認する                            |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                      | coverage gap を確認する                           |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                         | 整理後の責務境界を確認する                        |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                   | 品質観点の確認結果を確認する                      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                       | 最終判定後の確認観点を確認する                    |
| aiHandlers                  | `apps/desktop/src/main/ipc/aiHandlers.ts`        | check connection / index job の確認対象を確認する |
| communityHandlers           | `apps/desktop/src/main/ipc/communityHandlers.ts` | community summary の確認対象を確認する            |

## 統合テスト連携

check connection、index job、unsupported capability guidance、community summary、partial failure の代表シナリオを手動で確認する。

## 成果物

| 成果物                 | パス                                     | 内容                         |
| ---------------------- | ---------------------------------------- | ---------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 実施結果と問題を記録する     |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.json`  | 取得対象と判定基準を整理する |

## 完了条件

- [ ] index / guidance / graph summary の代表シナリオが含まれている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
