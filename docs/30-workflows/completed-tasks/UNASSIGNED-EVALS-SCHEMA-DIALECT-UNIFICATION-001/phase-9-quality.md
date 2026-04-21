# Phase 9: 品質保証

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| Phase     | 9                                               |
| タスクID  | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| 前提Phase | Phase 8                                         |
| 後続Phase | Phase 10                                        |
| 作成日    | 2026-04-21                                      |

## 目的

grep / diff / test / lint / typecheck の品質ゲートを整理し、Phase 10 へ進めるか判定する。

## 実行タスク

1. 実行すべき品質コマンドを列挙する
2. 結果を PASS / MINOR / MAJOR で分類する
3. 修正と未タスクの境界を明確にする

## 参照資料

| 資料            | パス                                       |
| --------------- | ------------------------------------------ |
| Phase 7 outputs | `outputs/phase-7/`                         |
| Phase 8 log     | `outputs/phase-8/refactor-decision-log.md` |

## 実行手順

- 旧方言残存 grep
- `.claude` / `.agents` parity diff
- 関連 test
- lint / typecheck は対象実装差分が TypeScript / ESLint 対象を含む場合に実行する

## 統合テスト連携

| 判定項目      | 基準               | 結果 |
| ------------- | ------------------ | ---- |
| quality gate  | MAJOR 0 件         | TBD  |
| replayability | command 再実行可能 | TBD  |

## 多角的チェック観点（AIが判断）

- 戦略的思考: close-out を止める問題だけを blocker とする
- 仮説思考: 問題が root drift 起因か局所実装起因か切り分ける

## サブタスク管理

1. command 実行
2. 結果分類
3. 判定記録

## 成果物

| 成果物         | パス                                     | 説明                    |
| -------------- | ---------------------------------------- | ----------------------- |
| 品質ゲート報告 | `outputs/phase-9/quality-gate-report.md` | command / 判定 / 残課題 |

## 完了条件

- [ ] 品質コマンドを定義した
- [ ] MAJOR / MINOR を分類した
- [ ] Phase 10 進行可否を記録した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物1件を定義
- [ ] 4条件を確認

## 次Phase

Phase 10: 最終レビュー
