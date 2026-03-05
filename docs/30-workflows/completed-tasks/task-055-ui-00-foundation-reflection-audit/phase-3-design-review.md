# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 3                                          |
| Phase名   | 設計レビューゲート                         |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 2                                    |
| 後続Phase | Phase 4                                    |

## 目的

Phase 2 設計内容の欠落を検出し、Phase 4 以降で監査失敗が起きない設計品質へ到達させる。

## 実行タスク

- 設計レビュー: 監査マトリクス列定義、判定ルール、証跡規約をレビューする。
- ゲート判定: PASS/MINOR/MAJOR/CRITICAL の判定を実施する。
- 戻り先確定: MAJOR以上のときに戻り先Phaseを明示する。

## 参照資料

| 参照資料               | パス                                                                           | 内容           |
| ---------------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 1 要件定義       | `outputs/phase-1/requirements-definition.md`                                   | 監査要件の確認 |
| Phase 2 マトリクス設計 | `outputs/phase-2/audit-matrix-design.md`                                       | レビュー対象   |
| Phase 2 証跡計画       | `outputs/phase-2/evidence-plan.md`                                             | レビュー対象   |
| Phase 2 SubAgent計画   | `outputs/phase-2/subagent-plan.md`                                             | レビュー対象   |
| レビュー基準           | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準       |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                                       | Phase 1 成果物 |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                        | このPhaseでの適用観点 |
| ------------------ | --------------------------------------------------------------------------- | --------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲート判定軸      |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  | 戻り先判定ルール      |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 既知失敗パターン照合  |

## 統合テスト連携

| 連携観点         | 実施内容                                                   | 出力先                                    |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------- |
| レビュー観点整合 | Phase 1/2 の監査設計と判定基準が矛盾していないか確認する。 | `outputs/phase-3/design-review-report.md` |
| ゲート証跡       | PASS/MINOR/MAJOR/CRITICAL 判定の根拠を証跡付きで記録する。 | `outputs/phase-3/review-gate-decision.md` |
| 戻り先制御       | MAJOR以上の戻り先Phaseと再実行条件を確定する。             | `outputs/phase-3/review-gate-decision.md` |

## 実行順序（直列/並列）

| 作業               | 実行方式 | 理由                                   |
| ------------------ | -------- | -------------------------------------- |
| レビュー項目の配布 | 並列     | 項目ごとの確認は独立して進められるため |
| 判定会議           | 直列     | 判定結果を一つに統一するため           |
| 戻り先確定         | 直列     | 次工程の入力を確定するため             |

## SubAgent Team分担

| SubAgent                  | 関心ごと     | 担当成果物                                |
| ------------------------- | ------------ | ----------------------------------------- |
| SubAgent-REVIEW-STRUCTURE | 構造レビュー | `outputs/phase-3/design-review-report.md` |
| SubAgent-REVIEW-QUALITY   | 品質レビュー | `outputs/phase-3/design-review-report.md` |
| SubAgent-REVIEW-GATE      | ゲート判定   | `outputs/phase-3/review-gate-decision.md` |

## 成果物

| 成果物           | パス                                      | 内容               |
| ---------------- | ----------------------------------------- | ------------------ |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 指摘一覧と是正方針 |
| ゲート判定       | `outputs/phase-3/review-gate-decision.md` | 判定と戻り先       |

## 完了条件

- [x] 全レビュー項目の判定が記録されている。
- [x] ゲート判定結果が記録されている。
- [x] MAJOR以上の戻り先が明記されている。
- [x] Phase 4 へ進む条件が明記されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. レビュー観点をSubAgentへ配布する。
2. 指摘を統合して重複を除去する。
3. 判定と戻り先を記録する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 4 の入力ファイルを確定した。

## 依存関係

- 前提: Phase 2
- 後続: Phase 4

## 次のPhase

- Phase 4: テスト作成
