# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 7                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

Phase 4 と Phase 6 のテストが状態遷移、UI 境界、API 経路を十分に網羅しているか確認し、未検証箇所を明文化する。

## 実行タスク

- 遷移カバレッジ確認: create / execute / improve の成功と failure を突合する
- UI カバレッジ確認: session card、wizard secondary action、analysis summary の表示条件を突合する
- API カバレッジ確認: skill API と skillCreatorAPI の呼び出し経路を突合する
- ギャップ整理: 未検証ケースと追加不要ケースを明文化する

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| 実装記録         | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/modified-files.md`         | Phase 5 成果物 |
| 失敗系テスト一覧 | `outputs/phase-6/failure-test-cases.md`     | Phase 6 成果物 |
| テスト拡充結果   | `outputs/phase-6/test-expansion-report.md`  | Phase 6 成果物 |

## 実行手順

### ステップ1: 状態遷移表を作成する

設計上の遷移と実テストの対応関係を一覧化する。

### ステップ2: UI / API の網羅率を確認する

表示条件と API 呼び出し経路ごとに、既存テストが存在するかを確認する。

### ステップ3: ギャップを整理する

追加テストが必要な項目と、現在のリスク受容で十分な項目を区別して記録する。

## 統合テスト連携

| 観点     | 対応成果物               | 連携内容                                         |
| -------- | ------------------------ | ------------------------------------------------ |
| 状態遷移 | Phase 4 / 6 テストケース | create / execute / improve の全遷移を突合する    |
| UI 表示  | component tests          | session card と wizard 遷移の網羅を確認する      |
| API 経路 | hook / store tests       | preload skill API と detectMode の網羅を確認する |

## 成果物

| 成果物             | パス                                   | 説明                       |
| ------------------ | -------------------------------------- | -------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`   | 遷移と UI / API の網羅状況 |
| ギャップ一覧       | `outputs/phase-7/coverage-gap-list.md` | 未検証項目と対応方針       |

## 完了条件

- [ ] 状態遷移の網羅状況が一覧化されている
- [ ] UI と API の未検証箇所が明文化されている
- [ ] Phase 8 以降へ持ち越すリスクが整理されている
