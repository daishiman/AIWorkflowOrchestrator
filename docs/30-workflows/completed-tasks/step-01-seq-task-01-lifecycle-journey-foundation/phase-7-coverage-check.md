# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 7                                                        |
| Phase名    | カバレッジ確認                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                  |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤               |
| 前提Phase  | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| 後続Phase  | [phase-8-refactoring.md](./phase-8-refactoring.md)       |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

Task01 の変更範囲に対するテスト密度を確認し、未検証導線と後続タスクへの影響箇所を明示する。

## 実行タスク

- coverage 集計: route、nav、view entry、advanced 導線のカバレッジを集計する
- 未検証導線抽出: 実行されていない導線と状態を列挙する
- 要件追跡更新: AC と TC-ID の対応表を更新する
- downstream 影響確認: Task02-05 の入口が未検証で残っていないか確認する

## 参照資料

| 参照資料              | パス                                         | 内容           |
| --------------------- | -------------------------------------------- | -------------- |
| implementation log    | `outputs/phase-5/implementation-log.md`      | 実装内容       |
| journey diff summary  | `outputs/phase-5/journey-diff-summary.md`    | 導線差分       |
| test expansion result | `outputs/phase-6/test-expansion-result.md`   | 追加テスト結果 |
| regression matrix     | `outputs/phase-6/regression-case-matrix.md`  | 導線分類       |
| test cases            | `outputs/phase-4/test-cases.md`              | TC-ID          |
| requirements          | `outputs/phase-1/requirements-definition.md` | AC 正本        |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容              |
| -------------------- | --------------------------------------------------------------------------------- | ----------------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage 基準     |
| component testing    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 分析単位          |
| feature components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 対象 surface 一覧 |

## 実行手順

1. 導線変更対象ファイルごとに line / branch / function coverage を集計する。
2. TC-ID と AC の紐付けを更新する。
3. route / nav / advanced / downstream の 4 軸で未検証点を整理する。
4. 未検証点は Phase 8 で改善するか、Phase 12 で未タスク化するかを判定する。

## 統合テスト連携

| 観点              | 連携内容                                     |
| ----------------- | -------------------------------------------- |
| AC追跡            | AC と TC-ID の対応関係を固定する             |
| view coverage     | 主要画面の入口・handoff 状態の抜けを確認する |
| downstream impact | Task02-05 依存点の検証不足を明確化する       |

## 成果物

| 成果物             | パス                                          | 説明       |
| ------------------ | --------------------------------------------- | ---------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`          | 集計結果   |
| 未検証導線一覧     | `outputs/phase-7/uncovered-journeys.md`       | 抜け一覧   |
| 要件追跡表         | `outputs/phase-7/requirement-traceability.md` | AC ↔ TC-ID |

## 完了条件

- [x] 主要導線と advanced 導線の coverage が集計されている
- [x] 未検証導線が一覧化されている
- [x] AC と TC-ID の対応が更新されている
- [x] Task02-05 への影響箇所が整理されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- 後続: [phase-8-refactoring.md](./phase-8-refactoring.md)

## サブタスク管理

- [x] 参照資料確認
- [x] coverage 集計
- [x] 未検証導線抽出
- [x] traceability 更新
- [x] 完了条件検証

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] coverage の抜けが Phase 8/12 へ受け渡されている
- [x] AC と検証結果が対応づいている

## 次のPhase

Phase 8: [phase-8-refactoring.md](./phase-8-refactoring.md)
