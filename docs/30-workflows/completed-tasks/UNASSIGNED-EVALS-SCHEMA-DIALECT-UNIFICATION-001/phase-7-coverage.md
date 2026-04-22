# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| Phase     | 7                                               |
| タスクID  | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| 前提Phase | Phase 6                                         |
| 後続Phase | Phase 8                                         |
| 作成日    | 2026-04-21                                      |

## 目的

対象ファイル限定の旧方言残存、traceability、parity、desktop consumer 回帰の4観点で coverage を確認する。

## 実行タスク

1. 対象ファイル限定の旧方言 grep を実行する
2. AC と test / evidence の traceability を作る
3. `.claude` / `.agents` parity を確認する
4. `apps/desktop` fixture / test consumer の前提が揃っていることを確認する

## 参照資料

| 資料              | パス                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| regression plan   | `outputs/phase-6/regression-expansion-plan.md`                           |
| evals schema spec | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` |

## 実行手順

- 対象ファイル限定 grep を `outputs/phase-2/validation-matrix.md` の正規コマンドで実行する
- 変更対象ペア限定 diff を `outputs/phase-2/validation-matrix.md` の正規コマンドで実行する
- AC-1〜AC-5 と test / output の対応表を作る

## 統合テスト連携

| 判定項目   | 基準      | 結果 |
| ---------- | --------- | ---- |
| 旧方言残存 | 0 件      | TBD  |
| parity     | 差分 0 件 | TBD  |

## 多角的チェック観点（AIが判断）

- MECE: 残存確認 / parity / traceability を分けて記録する
- KJ法: 検出事項を blocker / note / info に分類する

## サブタスク管理

1. grep 確認
2. traceability 整理
3. parity 確認

## 成果物

| 成果物             | パス                                     | 説明               |
| ------------------ | ---------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`     | grep / parity 結果 |
| トレーサビリティ   | `outputs/phase-7/traceability-matrix.md` | AC 対応表          |

## 完了条件

- [ ] 旧方言残存 0 件を確認した
- [ ] parity を確認した
- [ ] traceability を作成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物2件を定義
- [ ] 4条件を確認

## 次Phase

Phase 8: リファクタリング
