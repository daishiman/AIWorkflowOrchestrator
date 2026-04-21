# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| 前提Phase  | Phase 6                         |
| 後続Phase  | Phase 8                         |
| 作成日     | 2026-04-21                      |
| ステータス | pending                         |

## 目的

仕様 concern、dependency edge、error path に対する coverage を可視化する。

## 実行タスク

- タスク1: AC とテストの対応を確認する
- タスク2: dependency edge と error path の coverage を確認する
- タスク3: 未カバーがあれば Phase 6 または 8 への戻り先を判断する

## 参照資料

| 資料              | パス                                         | 用途        |
| ----------------- | -------------------------------------------- | ----------- |
| 要件定義          | `outputs/phase-1/requirements-definition.md` | AC 基準     |
| validation matrix | `outputs/phase-2/validation-matrix.md`       | coverage 軸 |

## 実行手順

1. AC とテストの対応表を作る
2. error path を確認する
3. 未カバーがあれば戻り先を明記する

## 統合テスト連携

| 判定項目       | 基準                                       | 結果    |
| -------------- | ------------------------------------------ | ------- |
| AC coverage    | AC-1〜AC-7 を追える                        | pending |
| error coverage | cancel / fallback / parse failure が追える | pending |

## 多角的チェック観点（AIが判断）

- 2軸思考: AC coverage × error coverage の両軸で穴がないか
- 因果ループ: 未カバーが後工程に再流入しないか

## サブタスク管理

| サブタスク | 責務                 | 状態    |
| ---------- | -------------------- | ------- |
| ST-16      | coverage-report 作成 | pending |

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | AC / dependency / error coverage |

## 完了条件

- [ ] AC coverage が可視化されている
- [ ] error path coverage が可視化されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次Phase

Phase 8: リファクタリング
