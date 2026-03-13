# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 7                                                    |
| Phase名    | テストカバレッジ確認                                 |
| ステータス | completed                                            |

## 目的

今回追加した guard 周辺のテスト密度を定量化し、未変更分岐と切り分けて扱う。

## 実行内容

- WorkspaceView 関連 7 file に限定して targeted coverage を採取した
- Lines 81.63%、Branches 73.79%、Functions 78.41% を記録した
- 未変更の既存分岐と validator script 未単体化を gap として切り出した

## 実行タスク

- タスク1: targeted coverage を採取する
- タスク2: 指標を整理する
- タスク3: scope 外ギャップを記録する

## 参照資料

- `outputs/phase-6/expanded-test-plan.md`
- `outputs/phase-5/implementation-plan.md`
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`

## 統合テスト連携

- 変更箇所だけを最小 7 file で集計した
- coverage gap は Phase 8 / 9 の判断材料へ引き継いだ

## 成果物

| 成果物            | パス                                   |
| ----------------- | -------------------------------------- |
| coverage-report   | `outputs/phase-7/coverage-report.md`   |
| coverage-gap-list | `outputs/phase-7/coverage-gap-list.md` |

## 完了条件

- [x] 定量値を記録した
- [x] gap と次アクションを分離した
