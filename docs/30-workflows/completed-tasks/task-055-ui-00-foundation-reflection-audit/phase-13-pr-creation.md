# Phase 13: PR作成

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 13                                         |
| Phase名   | PR作成                                     |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 12                                   |
| 後続Phase | なし                                       |

## 目的

監査仕様書一式をレビュー提出可能な形へ整理し、PR作成時に必要な説明情報を揃える。

## 実行タスク

- PR草案作成: 目的、変更範囲、検証結果、未解決事項を整理する。
- レビュー観点整理: レビュアー向け確認ポイントを作成する。
- リリースノート草案: 監査仕様の更新点を短くまとめる。
- 実行制約明記: 本タスクではコミットとPR作成を実行しない方針を記録する。

## 参照資料

| 参照資料                  | パス                                                     | 内容               |
| ------------------------- | -------------------------------------------------------- | ------------------ |
| Phase 2 監査設計          | `outputs/phase-2/audit-matrix-design.md`                 | PR説明の設計根拠   |
| Phase 5 監査結果          | `outputs/phase-5/reflection-matrix.md`                   | PR説明の結果根拠   |
| Phase 6 拡張監査          | `outputs/phase-6/expanded-audit-report.md`               | PR説明の範囲根拠   |
| Phase 7 カバレッジ        | `outputs/phase-7/coverage-report.md`                     | PR説明の定量根拠   |
| Phase 8 回帰検証          | `outputs/phase-8/regression-validation.md`               | PR説明の安定性根拠 |
| Phase 9 QA結果            | `outputs/phase-9/qa-report.md`                           | PR説明の品質根拠   |
| Phase 10 最終判定         | `outputs/phase-10/review-gate-decision.md`               | PR説明の承認根拠   |
| Phase 11 手動検証         | `outputs/phase-11/manual-test-result.md`                 | PR説明の再現根拠   |
| Phase 12 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | PR本文入力         |
| Phase 12 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`                | PR本文入力         |
| Phase 12 更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更履歴入力       |
| Phase 12 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | 残課題入力         |
| Phase 12 フィードバック   | `outputs/phase-12/skill-feedback-report.md`              | 改善計画入力       |
| 最終レビュー報告          | `outputs/phase-10/final-review-report.md`                | Phase 10 成果物    |
| 証跡一覧                  | `outputs/phase-11/screenshots-index.md`                  | Phase 11 成果物    |
| 発見課題                  | `outputs/phase-11/discovered-issues.md`                  | Phase 11 成果物    |
| Phase12準拠チェック       | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物    |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                        | このPhaseでの適用観点 |
| ------------------ | --------------------------------------------------------------------------- | --------------------- |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | 完了記録の書式        |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 次回監査の改善点      |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 最終確認観点          |

## 実行順序（直列/並列）

| 作業                            | 実行方式 | 理由                             |
| ------------------------------- | -------- | -------------------------------- |
| PR本文骨子作成                  | 直列     | 全体説明を先に固定するため       |
| レビュー観点/リリースノート作成 | 並列     | 入力元が同じで独立作業できるため |
| 最終整形                        | 直列     | 提出形式を統一するため           |

## SubAgent Team分担

| SubAgent            | 関心ごと       | 担当成果物                                    |
| ------------------- | -------------- | --------------------------------------------- |
| SubAgent-PR-BODY    | PR本文草案     | `outputs/phase-13/pr-description-draft.md`    |
| SubAgent-PR-REVIEW  | レビュー観点   | `outputs/phase-13/review-comment-template.md` |
| SubAgent-PR-RELEASE | リリースノート | `outputs/phase-13/release-note-draft.md`      |

## 成果物

| 成果物                       | パス                                          | 内容               |
| ---------------------------- | --------------------------------------------- | ------------------ |
| PR説明草案                   | `outputs/phase-13/pr-description-draft.md`    | 目的/範囲/検証結果 |
| レビューコメントテンプレート | `outputs/phase-13/review-comment-template.md` | レビュアー観点     |
| リリースノート草案           | `outputs/phase-13/release-note-draft.md`      | 変更点要約         |

## 完了条件

- [ ] PR本文草案が作成されている。
- [ ] レビュー観点テンプレートが作成されている。
- [ ] リリースノート草案が作成されている。
- [ ] コミットとPRを実行しない方針が明記されている。
- [ ] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. Phase 12 の成果物を入力として取り込む。
2. SubAgentごとに文書草案を作成する。
3. 最終整形で表記を統一する。

## タスク100%実行確認【必須】

- [ ] 実行タスクの全項目を完了した。
- [ ] 完了条件の全チェック項目を確認した。
- [ ] 本PhaseでコミットとPRを実行していない。

## 依存関係

- 前提: Phase 12
- 後続: なし
- 参照依存: Phase 1 / 2 / 5 / 6 / 7 / 8 / 9 / 10 / 11 / 12

## 次のPhase

- なし
