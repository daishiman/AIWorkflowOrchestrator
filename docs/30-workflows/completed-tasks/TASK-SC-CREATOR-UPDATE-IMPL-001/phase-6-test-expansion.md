# Phase 6: テスト拡充

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 6                               |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| taskType            | NON_VISUAL                      |
| implementation_mode | new                             |
| 前提Phase           | Phase 5                         |
| 後続Phase           | Phase 7                         |
| 作成日              | 2026-04-21                      |
| ステータス          | pending                         |

## 目的

Phase 4 で定義した test matrix に対して不足ケースのみを追加し、過剰テストを避けつつ観測性を上げる。

## 実行タスク

- タスク1: uncovered 観点を特定する
- タスク2: progress emit / cancel / parse failure の不足ケースを追加する
- タスク3: targeted 追加が不要なら理由を記録する

## 参照資料

| 資料          | パス                               | 用途                     |
| ------------- | ---------------------------------- | ------------------------ |
| test matrix   | `outputs/phase-4/test-matrix.md`   | covered / uncovered 判定 |
| change record | `outputs/phase-5/change-record.md` | 追加観点の確認           |

## 実行手順

1. covered / uncovered を分類する
2. uncovered のみ追加する
3. 結果を要約する

## 統合テスト連携

| 判定項目       | 基準                     | 結果    |
| -------------- | ------------------------ | ------- |
| uncovered 解消 | 必要ケースが埋まる       | pending |
| 重複追加回避   | Covered 観点の再追加なし | pending |

## 多角的チェック観点（AIが判断）

- 改善思考: 観測性向上に本当に効く追加だけに絞れているか
- KJ法: 不足ケースを性質別に整理できているか

## サブタスク管理

| サブタスク | 責務                           | 状態    |
| ---------- | ------------------------------ | ------- |
| ST-14      | uncovered 観点抽出             | pending |
| ST-15      | regression-expansion-plan 作成 | pending |

## 成果物

| 成果物         | パス                                           | 説明               |
| -------------- | ---------------------------------------------- | ------------------ |
| テスト拡充計画 | `outputs/phase-6/regression-expansion-plan.md` | 不足観点と追加方針 |

## 完了条件

- [ ] uncovered 観点が整理されている
- [ ] 重複追加を避ける方針が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次Phase

Phase 7: カバレッジ確認
