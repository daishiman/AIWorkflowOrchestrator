# Phase 10: 最終レビューゲート

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 10                                         |
| Phase名   | 最終レビューゲート                         |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 9                                    |
| 後続Phase | Phase 11                                   |

## 目的

監査仕様書セットを最終判定し、手動検証へ進める品質レベルかを確定する。

## 実行タスク

- 最終レビュー: QA結果とリスク台帳をレビューする。
- ゲート判定: PASS/MINOR/MAJOR/CRITICAL を決定する。
- 是正指示: MINOR以上の是正指示を明文化する。

## 参照資料

| 参照資料                 | パス                                                                           | 内容               |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------ |
| Phase 1 要件定義         | `outputs/phase-1/requirements-definition.md`                                   | レビュー観点の原点 |
| Phase 2 監査設計         | `outputs/phase-2/audit-matrix-design.md`                                       | 設計整合の確認     |
| Phase 5 監査結果         | `outputs/phase-5/reflection-matrix.md`                                         | 判定整合の確認     |
| Phase 9 QAレポート       | `outputs/phase-9/qa-report.md`                                                 | 最終判定入力       |
| Phase 9 リスク台帳       | `outputs/phase-9/qa-risk-register.md`                                          | 最終判定入力       |
| Phase 9 QAチェックリスト | `outputs/phase-9/qa-checklist.md`                                              | 是正確認           |
| レビューゲート基準       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準           |
| 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`                                       | Phase 1 成果物     |
| スコープ定義             | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物     |
| 証跡取得計画             | `outputs/phase-2/evidence-plan.md`                                             | Phase 2 成果物     |
| SubAgent計画             | `outputs/phase-2/subagent-plan.md`                                             | Phase 2 成果物     |
| セクションリンクマップ   | `outputs/phase-5/section-link-map.md`                                          | Phase 5 成果物     |
| 指摘ログ                 | `outputs/phase-5/finding-log.md`                                               | Phase 5 成果物     |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`                                           | Phase 7 成果物     |
| ギャップ分析             | `outputs/phase-7/coverage-gap-analysis.md`                                     | Phase 7 成果物     |
| 改善バックログ           | `outputs/phase-7/improvement-backlog.md`                                       | Phase 7 成果物     |
| リファクタ計画           | `outputs/phase-8/matrix-refactor-plan.md`                                      | Phase 8 成果物     |
| リファクタ結果           | `outputs/phase-8/matrix-refactor-result.md`                                    | Phase 8 成果物     |
| 回帰検証記録             | `outputs/phase-8/regression-validation.md`                                     | Phase 8 成果物     |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                        | このPhaseでの適用観点 |
| ---------------------- | --------------------------------------------------------------------------- | --------------------- |
| タスクワークフロー規約 | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  | ゲート運用規約        |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 最終品質基準          |
| 教訓集                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 判定誤り防止          |

## 統合テスト連携

| 連携観点         | 実施内容                                   | 出力先                                     |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| 最終レビュー     | Phase 1〜9 成果物の整合を最終確認する。    | `outputs/phase-10/final-review-report.md`  |
| ゲート判定       | PASS/MINOR/MAJOR/CRITICAL 判定を確定する。 | `outputs/phase-10/review-gate-decision.md` |
| Phase 11引き継ぎ | 手動検証で確認すべき観点を確定する。       | `outputs/phase-10/review-gate-decision.md` |

## 実行順序（直列/並列）

| 作業             | 実行方式 | 理由                         |
| ---------------- | -------- | ---------------------------- |
| レビュー資料配布 | 並列     | 観点別レビューを分担するため |
| ゲート判定会議   | 直列     | 判定を一つへ統合するため     |
| 是正指示確定     | 直列     | 次工程の入力を固定するため   |

## SubAgent Team分担

| SubAgent              | 関心ごと     | 担当成果物                                 |
| --------------------- | ------------ | ------------------------------------------ |
| SubAgent-FINAL-REVIEW | 最終レビュー | `outputs/phase-10/final-review-report.md`  |
| SubAgent-FINAL-GATE   | ゲート判定   | `outputs/phase-10/review-gate-decision.md` |

## 成果物

| 成果物           | パス                                       | 内容                      |
| ---------------- | ------------------------------------------ | ------------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md`  | 判定根拠                  |
| ゲート判定       | `outputs/phase-10/review-gate-decision.md` | PASS/MINOR/MAJOR/CRITICAL |

## 完了条件

- [x] 最終レビュー観点が全件判定されている。
- [x] ゲート判定結果が記録されている。
- [x] 是正指示が明記されている。
- [x] Phase 11 へ渡す検証対象が確定している。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 観点別レビューを実施する。
2. 判定会議で合意形成する。
3. 是正指示と次Phase入力を確定する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 11 手動検証観点を確定した。

## 依存関係

- 前提: Phase 9
- 後続: Phase 11
- 参照依存: Phase 1 / 2 / 5 / 9

## 次のPhase

- Phase 11: 手動テスト検証
