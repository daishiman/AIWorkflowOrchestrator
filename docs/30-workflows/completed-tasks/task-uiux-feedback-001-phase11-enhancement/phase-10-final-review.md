# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 10                                    |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 状態   | pending                               |
| 現在地 | spec_created                          |

## 目的

Phase 11 に進む前の gate 条件を定義し、current facts と future execution を混同しない。

## 実行タスク

- AC ごとの current fact と進行条件を照合する
- blocker を整理する
- Phase 11 / 12 / 13 へ渡す gate 条件を固定する

## 参照資料

| 資料名                 | パス                                      | 説明                      |
| ---------------------- | ----------------------------------------- | ------------------------- |
| Phase 3 design review  | `outputs/phase-3/design-review-result.md` | 初期 gate の判断          |
| Phase 4 test spec      | `outputs/phase-4/test-specification.md`   | 実行予定の test inventory |
| Phase 11 manual test   | `phase-11-manual-test.md`                 | evidence 契約             |
| Phase 12 documentation | `phase-12-documentation.md`               | close-out 契約            |

## 判定マトリクス

| 観点               | current fact | Phase 11 進行条件                                  |
| ------------------ | ------------ | -------------------------------------------------- |
| AC-1               | 設計済み     | `.claude` 正本更新完了                             |
| AC-2               | 設計済み     | feedback loop 実装完了                             |
| AC-3               | 設計済み     | Playwright `_electron` 実装完了                    |
| AC-4               | 設計済み     | AI UX evaluator 実装完了                           |
| AC-5               | 設計済み     | TASK-RT-05 Phase 11 再定義反映完了                 |
| Phase 11 evidence  | 未実行       | `manual-test-result.md` が `not_run` ではない      |
| Phase 12 close-out | 未実施       | `system-spec-update-summary.md` へ実更新結果を記録 |

## blocker

| blocker   | 内容                                                        |
| --------- | ----------------------------------------------------------- |
| BLK-10-01 | `.claude` 正本未更新                                        |
| BLK-10-02 | `.claude/skills/task-specification-creator/scripts/` 未実装 |
| BLK-10-03 | Phase 11 evidence 未取得                                    |
| BLK-10-04 | user approval 未取得のまま Phase 13 へ進もうとしている      |

## 実行手順

### ステップ1: current fact を整理する

- spec_created 現在地で completed にしてよい phase を切り分ける
- `.claude` 正本未更新を blocker として固定する

### ステップ2: downstream gate を固定する

- Phase 11 は evidence 実測が必要
- Phase 12 は sync 実更新が必要
- Phase 13 は blocked 維持

## 統合テスト連携

- Phase 11 で `manual-test-result.md` を current facts へ更新する
- Phase 12 で sync 実更新を記録する
- Phase 13 では approval 取得まで操作しない

## 成果物

| 成果物       | パス                       | 説明            |
| ------------ | -------------------------- | --------------- |
| final review | `phase-10-final-review.md` | gate 条件の定義 |

## 完了条件

- [ ] future wave で AC-1〜AC-5 を実測で再判定する
- [ ] blocker が 0 件になっている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
