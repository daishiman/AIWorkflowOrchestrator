# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 8                                          |
| Phase名   | リファクタリング                           |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 7                                    |
| 後続Phase | Phase 9                                    |

## 目的

監査マトリクスと指摘ログを再利用しやすい形式へ再編し、次回監査の立ち上がり時間を短縮する。

## 実行タスク

- 構造整理: マトリクス列順と見出し命名を統一する。
- 表記統一: タスクID、仕様名、判定語彙を正規化する。
- 回帰検証: リファクタ後も判定結果が変わらないことを確認する。

## 参照資料

| 参照資料                   | パス                                                               | 内容           |
| -------------------------- | ------------------------------------------------------------------ | -------------- |
| Phase 1 要件定義           | `outputs/phase-1/requirements-definition.md`                       | 原則再確認     |
| Phase 2 監査設計           | `outputs/phase-2/audit-matrix-design.md`                           | 構造維持の基準 |
| Phase 5 監査マトリクス     | `outputs/phase-5/reflection-matrix.md`                             | 判定維持の基準 |
| Phase 6 拡張監査結果       | `outputs/phase-6/expanded-audit-report.md`                         | 反映範囲の基準 |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                               | 改善対象特定   |
| Phase 7 ギャップ分析       | `outputs/phase-7/coverage-gap-analysis.md`                         | 優先是正対象   |
| Phase 7 改善バックログ     | `outputs/phase-7/improvement-backlog.md`                           | 実施順序       |
| リファクタ基準             | `.claude/skills/task-specification-creator/references/patterns.md` | 整理指針       |
| セクションリンクマップ     | `outputs/phase-5/section-link-map.md`                              | Phase 5 成果物 |
| 指摘ログ                   | `outputs/phase-5/finding-log.md`                                   | Phase 5 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                             | このPhaseでの適用観点 |
| ---------------- | -------------------------------------------------------------------------------- | --------------------- |
| 仕様ガイドライン | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`           | 命名規則統一          |
| 仕様分割ガイド   | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` | 見出し構造統一        |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`           | 再発防止              |

## 統合テスト連携

| 連携観点 | 実施内容                                           | 出力先                                      |
| -------- | -------------------------------------------------- | ------------------------------------------- |
| 構造統一 | マトリクス列順・見出し命名・判定語彙を統一する。   | `outputs/phase-8/matrix-refactor-plan.md`   |
| 内容再編 | 冗長記述を整理し再利用可能な形式へ再編する。       | `outputs/phase-8/matrix-refactor-result.md` |
| 回帰保証 | リファクタ前後で判定結果が一致することを確認する。 | `outputs/phase-8/regression-validation.md`  |

## 実行順序（直列/並列）

| 作業           | 実行方式 | 理由                                 |
| -------------- | -------- | ------------------------------------ |
| 統一ルール確定 | 直列     | 変換規則を先に固定するため           |
| ファイル整理   | 並列     | 成果物ファイルは独立で整理できるため |
| 回帰検証       | 直列     | 判定結果の整合を最終確認するため     |

## SubAgent Team分担

| SubAgent                  | 関心ごと | 担当成果物                                  |
| ------------------------- | -------- | ------------------------------------------- |
| SubAgent-REFACTOR-STRUCT  | 構造整理 | `outputs/phase-8/matrix-refactor-plan.md`   |
| SubAgent-REFACTOR-CONTENT | 内容整理 | `outputs/phase-8/matrix-refactor-result.md` |
| SubAgent-REFACTOR-VERIFY  | 回帰検証 | `outputs/phase-8/regression-validation.md`  |

## 成果物

| 成果物         | パス                                        | 内容         |
| -------------- | ------------------------------------------- | ------------ |
| リファクタ計画 | `outputs/phase-8/matrix-refactor-plan.md`   | 整理方針     |
| リファクタ結果 | `outputs/phase-8/matrix-refactor-result.md` | 実施結果     |
| 回帰検証記録   | `outputs/phase-8/regression-validation.md`  | 判定一致確認 |

## 完了条件

- [x] 命名規則が全成果物へ適用されている。
- [x] 判定語彙が統一されている。
- [x] 回帰検証で判定差異がない。
- [x] 次回監査の再利用手順が記録されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 命名規則を先に確定する。
2. SubAgentで成果物を並列整理する。
3. 回帰検証結果を統合する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 9 監査入力を確定した。

## 依存関係

- 前提: Phase 7
- 後続: Phase 9
- 参照依存: Phase 1 / 2 / 5 / 6 / 7

## 次のPhase

- Phase 9: 品質保証
