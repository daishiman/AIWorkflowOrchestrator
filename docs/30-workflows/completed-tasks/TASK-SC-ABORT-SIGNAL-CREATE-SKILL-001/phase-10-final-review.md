# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 10                                    |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

仕様、実装、テスト、artifacts parity を最終観点で束ね、Phase 11 へ進めるか判定する。

## 実行タスク

1. AC-1〜AC-4 を最終判定する
2. 残課題を blocker と note に分ける
3. review prompt を生成できる状態にする

## 参照資料

| 資料    | パス                           | 用途           |
| ------- | ------------------------------ | -------------- |
| Phase 3 | `phase-3-design-review.md`     | 初回 Gate 比較 |
| Phase 9 | `phase-9-quality-assurance.md` | 実測結果       |

## 実行手順

- `_signal` 残存確認
- targeted test / typecheck / artifact parity の総合判定
- Phase 11 へ引き継ぐ evidence を固定

## 統合テスト連携

- Phase 11 は `final-review-result.md` を一次参照にする
- Phase 12 は blocker disposition を close-out に転記する

## 成果物

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-10/blocker-disposition.md`
- `outputs/phase-10/review-prompt.txt`

## 完了条件

- [ ] AC-1〜AC-4 の最終判定表がある
- [ ] blocker と note が分離されている
- [ ] Phase 11 参照元が固定されている
