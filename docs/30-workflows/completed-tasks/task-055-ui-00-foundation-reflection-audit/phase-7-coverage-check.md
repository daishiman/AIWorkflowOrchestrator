# Phase 7: テストカバレッジ確認

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 7                                          |
| Phase名   | テストカバレッジ確認                       |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 6                                    |
| 後続Phase | Phase 8                                    |

## 目的

監査対象セクションの反映確認率を定量化し、未達領域を次Phaseで是正できる状態にする。

## 実行タスク

- 集計: 反映元セクション総数、判定済み数、反映済み数を集計する。
- ギャップ分析: 未判定、要追記、証跡不足を分類する。
- 改善計画: 未達項目の是正順序と担当SubAgentを決定する。

## 参照資料

| 参照資料                   | パス                                                                         | 内容             |
| -------------------------- | ---------------------------------------------------------------------------- | ---------------- |
| Phase 5 監査マトリクス     | `outputs/phase-5/reflection-matrix.md`                                       | 反映判定の母集団 |
| Phase 6 拡張監査レポート   | `outputs/phase-6/expanded-audit-report.md`                                   | 集計元           |
| Phase 6 回帰チェックリスト | `outputs/phase-6/regression-checklist.md`                                    | 集計元           |
| Phase 6 追加指摘ログ       | `outputs/phase-6/followup-finding-log.md`                                    | 改善入力         |
| カバレッジ基準             | `.claude/skills/task-specification-creator/references/coverage-standards.md` | 集計基準         |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                        | このPhaseでの適用観点 |
| ------------------ | --------------------------------------------------------------------------- | --------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 監査品質指標          |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | 証跡記録方式          |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | ギャップ再発防止      |

## 統合テスト連携

| 連携観点     | 実施内容                                     | 出力先                                     |
| ------------ | -------------------------------------------- | ------------------------------------------ |
| 指標集計     | 総対象数、判定済み数、反映済み数を集計する。 | `outputs/phase-7/coverage-report.md`       |
| ギャップ分類 | 未判定/要追記/証跡不足を分類する。           | `outputs/phase-7/coverage-gap-analysis.md` |
| 是正優先度   | 未達項目の修正順序と担当SubAgentを定義する。 | `outputs/phase-7/improvement-backlog.md`   |

## 実行順序（直列/並列）

| 作業           | 実行方式 | 理由                         |
| -------------- | -------- | ---------------------------- |
| 指標定義       | 直列     | 集計式を先に固定するため     |
| 監査データ集計 | 並列     | 指標ごとに独立集計できるため |
| ギャップ判定   | 直列     | 判定ルールを統一するため     |

## SubAgent Team分担

| SubAgent                 | 関心ごと     | 担当成果物                                 |
| ------------------------ | ------------ | ------------------------------------------ |
| SubAgent-COVERAGE-METRIC | 指標集計     | `outputs/phase-7/coverage-report.md`       |
| SubAgent-COVERAGE-GAP    | ギャップ分析 | `outputs/phase-7/coverage-gap-analysis.md` |
| SubAgent-COVERAGE-PLAN   | 改善計画     | `outputs/phase-7/improvement-backlog.md`   |

## 成果物

| 成果物             | パス                                       | 内容     |
| ------------------ | ------------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`       | 定量指標 |
| ギャップ分析       | `outputs/phase-7/coverage-gap-analysis.md` | 未達分類 |
| 改善バックログ     | `outputs/phase-7/improvement-backlog.md`   | 是正順序 |

## 完了条件

- [x] 監査カバレッジ率が算出されている。
- [x] 未達項目が分類されている。
- [x] 改善順序と担当が定義されている。
- [x] Phase 8 の入力一覧が定義されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 集計式を定義して全SubAgentへ共有する。
2. 指標別に並列集計する。
3. 改善順序を統合して確定する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 8 是正対象を確定した。

## 依存関係

- 前提: Phase 6
- 後続: Phase 8

## 次のPhase

- Phase 8: リファクタリング
