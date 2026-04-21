# Phase 11: 手動テスト

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 11                              |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| taskType            | NON_VISUAL                      |
| implementation_mode | new                             |
| 前提Phase           | Phase 10                        |
| 後続Phase           | Phase 12                        |
| 作成日              | 2026-04-21                      |
| ステータス          | pending                         |

## 目的

NON_VISUAL task として、再現コマンドと自動テスト結果を主証跡にした manual verification を残す。

## 実行タスク

- タスク1: `manual-test-checklist.md` を作成する
- タスク2: `manual-test-result.md` に固定文言と確認結果を残す
- タスク3: `discovered-issues.md` に問題なしを含め記録する

## 参照資料

| 資料           | パス                                      | 用途         |
| -------------- | ----------------------------------------- | ------------ |
| final review   | `outputs/phase-10/final-review-result.md` | 主要論点確認 |
| quality report | `outputs/phase-9/quality-report.md`       | 代替証跡     |

## 実行手順

1. 再現コマンドを整理する
2. `manual-test-result.md` に固定文言を記載する
3. 発見事項を記録する

## 統合テスト連携

| 判定項目        | 基準                                   | 結果    |
| --------------- | -------------------------------------- | ------- |
| NON_VISUAL 明記 | スクリーンショット不要理由がある       | pending |
| 代替証跡整備    | checklist / result / discovered が揃う | pending |

## 多角的チェック観点（AIが判断）

- 素人思考: 初見読者でも何を確認したか分かるか
- プラスサム思考: スクリーンショットなしでも十分な証跡になっているか

## サブタスク管理

| サブタスク | 責務                   | 状態    |
| ---------- | ---------------------- | ------- |
| ST-20      | checklist 作成         | pending |
| ST-21      | result 作成            | pending |
| ST-22      | discovered issues 作成 | pending |

## 成果物

| 成果物                   | パス                                        | 説明                     |
| ------------------------ | ------------------------------------------- | ------------------------ |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 確認項目                 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 固定文言、コマンド、結果 |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | 問題なしを含む記録       |

## 完了条件

- [ ] `UI/UX変更なしのため Phase 11 スクリーンショット不要` を記載している
- [ ] checklist / result / discovered が揃っている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次Phase

Phase 12: ドキュメント更新
