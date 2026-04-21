# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 13                                              |
| タスクID   | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| 前提Phase  | Phase 12                                        |
| 作成日     | 2026-04-21                                      |
| ステータス | blocked                                         |

## 目的

ユーザー明示承認後のみ PR 作成に進む。承認前は local check と change summary の準備までに留める。

## 実行タスク

1. blocked 理由を明記する
2. local check 項目を整理する
3. change summary と PR 情報の準備物を定義する

## 参照資料

| 資料              | パス                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| Phase 13 template | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` |
| Phase 12 outputs  | `outputs/phase-12/`                                                              |

## 実行手順

- `git status`
- 関連 test / grep / diff の最終確認
- PR 本文に必要な change summary を整理
- ユーザー承認があるまで commit / PR / push は実行しない

## 統合テスト連携

| 判定項目    | 基準              | 結果    |
| ----------- | ----------------- | ------- |
| approval    | user 明示承認あり | blocked |
| local check | 準備済み          | TBD     |

## 多角的チェック観点（AIが判断）

- 戦略的思考: 承認前に不要な publish 動作をしない
- 逆説思考: blocked 状態でも準備物は定義しておく

## サブタスク管理

1. blocked 理由記録
2. local check 定義
3. PR 準備物定義

## 成果物

| 成果物           | パス                                     | 説明          |
| ---------------- | ---------------------------------------- | ------------- |
| local check 結果 | `outputs/phase-13/local-check-result.md` | 承認前確認    |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR 要約下書き |
| PR 情報          | `outputs/phase-13/pr-info.md`            | 承認後に使用  |

## 完了条件

- [ ] blocked 理由を明記した
- [ ] commit / PR / push を含めていない
- [ ] local check と PR 準備物を定義した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物3件を定義
- [ ] 4条件を確認

## 次Phase

ユーザー承認後に実施
