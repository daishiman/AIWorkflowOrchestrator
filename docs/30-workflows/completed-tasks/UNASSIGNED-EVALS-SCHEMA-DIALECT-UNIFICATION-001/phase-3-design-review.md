# Phase 3: 設計レビュー

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| Phase     | 3                                               |
| タスクID  | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| 前提Phase | Phase 2                                         |
| 後続Phase | Phase 4                                         |
| 作成日    | 2026-04-21                                      |

## 目的

Phase 2 設計が skill 契約、依存ゲート、命名、成果物整合の4観点で破綻していないことを確認する。

## 実行タスク

1. 設計の矛盾・漏れをレビューする
2. 依存ゲート違反がないことを確認する
3. `.claude` / `.agents` 以外の root 前提が残っていないことを確認する
4. MAJOR/MINOR/PASS 判定を出す

## 参照資料

| 資料            | パス                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Phase 2 outputs | `outputs/phase-2/`                                                                              |
| lessons         | `.claude/skills/aiworkflow-requirements/references/lessons-learned-evals-consumer-audit-001.md` |

## 実行手順

- 命名: Phase ファイル名、成果物名、artifacts 名が一致しているか
- 依存: 先行タスク未完了時に Phase 5 へ進まないか
- 範囲: validator 導入が後続委譲として整理されているか
- 整合: consumer matrix と validation matrix の対象が一致しているか

## 統合テスト連携

| 判定項目      | 基準       | 結果 |
| ------------- | ---------- | ---- |
| design review | MAJOR 0 件 | TBD  |
| naming drift  | 0 件       | TBD  |

## 多角的チェック観点（AIが判断）

- 批判的思考: 設計に古い運用前提が混入していないか
- 論点思考: root / gate / consumer / evidence の4論点で判定する

## サブタスク管理

1. 設計レビュー
2. 指摘整理
3. Gate 判定

## 成果物

| 成果物           | パス                                      | 説明                        |
| ---------------- | ----------------------------------------- | --------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | MAJOR/MINOR/PASS と対応方針 |

## 完了条件

- [ ] MAJOR 指摘の有無を判定した
- [ ] root / gate / naming / scope をレビューした
- [ ] Phase 4 進行可否を明記した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物1件を定義
- [ ] 4条件を確認

## 次Phase

Phase 4: テスト作成
