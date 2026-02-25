# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 13                                                                     |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 12                                                               |
| 後続Phase  | なし                                                                   |
| ステータス | 未実施                                                                 |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

変更内容を最終確認し、ユーザー許可を取得した場合のみコミット・PR作成へ進む。

## 背景

Phase 12までの全成果物と変更差分を最終確認し、ユーザーの明示的な承認を得た場合のみコミット・PR作成を実行する。ユーザー承認なしでのコミット/PRは禁止。

## 実行タスク

- SubAgent-A（差分整理）: 変更ファイルと成果物の整合を確認する。
- SubAgent-B（最終確認）: リンク切れ、検証漏れ、不要差分を確認する。
- Lead（承認管理）: ユーザーの明示許可取得後にのみ PR 手順へ進む。

## 参照資料

| 参照資料                     | パス                                                                 | 内容                   |
| ---------------------------- | -------------------------------------------------------------------- | ---------------------- |
| Phase 2                      | `phase-2-design.md`                                                  | 設計根拠の確認         |
| Phase 5                      | `phase-5-implementation.md`                                          | 実装差分の確認         |
| Phase 6                      | `phase-6-test-expansion.md`                                          | 検証差分の確認         |
| Phase 7                      | `phase-7-coverage-check.md`                                          | 網羅結果の確認         |
| Phase 8                      | `phase-8-refactoring.md`                                             | 構造変更の確認         |
| Phase 9                      | `phase-9-quality-assurance.md`                                       | 品質保証の確認         |
| Phase 10                     | `phase-10-final-review.md`                                           | 最終レビュー結果の確認 |
| Phase 11                     | `phase-11-manual-test.md`                                            | 手動検証結果の確認     |
| Phase 12                     | `phase-12-documentation.md`                                          | 完了要件の確認         |
| 更新サマリー                 | `outputs/phase-12/spec-update-summary.md`                            | 変更根拠               |
| 検証ログ                     | `outputs/verification-report.md`                                     | 全体検証結果           |
| PR手順                       | `.claude/skills/task-specification-creator/references/commands.md`   | 実行コマンド参照       |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`                            | Phase 10 成果物        |
| 指摘一覧                     | `outputs/phase-10/final-review-findings.md`                          | Phase 10 成果物        |
| 是正計画                     | `outputs/phase-10/remediation-plan.md`                               | Phase 10 成果物        |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                             | Phase 11 成果物        |
| 発見事項                     | `outputs/phase-11/manual-findings.md`                                | Phase 11 成果物        |
| 実行証跡                     | `outputs/phase-11/command-transcript.md`                             | Phase 11 成果物        |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                           | Phase 12 成果物        |
| 更新履歴                     | `outputs/phase-12/documentation-changelog.md`                        | Phase 12 成果物        |
| 未タスク検出                 | `outputs/phase-12/unassigned-task-detection.md`                      | Phase 12 成果物        |
| スキル改善レポート           | `outputs/phase-12/skill-feedback-report.md`                          | Phase 12 成果物        |
| リンク整合ログ               | `outputs/phase-12/verify-unassigned-links.log`                       | Phase 12 成果物        |
| 再監査コンプライアンス       | `outputs/phase-12/re-audit-compliance-report.md`                     | Phase 12 成果物        |
| 全体整合検証ログ             | `outputs/phase-12/verify-all-specs-strict-rerun3.log`                | Phase 12 成果物        |
| Phase出力検証ログ            | `outputs/phase-12/validate-phase-rerun3.log`                         | Phase 12 成果物        |
| 未タスクリンク検証ログ       | `outputs/phase-12/verify-unassigned-links-rerun3.log`                | Phase 12 成果物        |
| aiworkflow構造検証ログ       | `outputs/phase-12/quick-validate-aiworkflow-rerun3.log`              | Phase 12 成果物        |
| task-spec構造検証ログ        | `outputs/phase-12/quick-validate-task-spec-rerun3.log`               | Phase 12 成果物        |
| 未タスク対象監査ログ         | `outputs/phase-12/audit-unassigned-target-rerun3.log`                | Phase 12 成果物        |
| auditスクリプトテストログ    | `outputs/phase-12/audit-script-test-rerun3.log`                      | Phase 12 成果物        |
| 全体整合検証ログ             | `outputs/phase-12/verify-all-specs-strict-rerun4.log`                | Phase 12 成果物        |
| Phase出力検証ログ            | `outputs/phase-12/validate-phase-rerun4.log`                         | Phase 12 成果物        |
| 未タスクリンク検証ログ       | `outputs/phase-12/verify-unassigned-links-rerun4.log`                | Phase 12 成果物        |
| aiworkflow構造検証ログ       | `outputs/phase-12/quick-validate-aiworkflow-rerun4.log`              | Phase 12 成果物        |
| task-spec構造検証ログ        | `outputs/phase-12/quick-validate-task-spec-rerun4.log`               | Phase 12 成果物        |
| Phase12仕様準拠確認レポート  | `outputs/phase-12/phase12-task-spec-compliance-check.md`             | Phase 12 成果物        |
| 全体整合検証ログ             | `outputs/phase-12/verify-all-specs-strict-rerun5.log`                | Phase 12 成果物        |
| Phase出力検証ログ            | `outputs/phase-12/validate-phase-rerun5.log`                         | Phase 12 成果物        |
| 未タスクリンク検証ログ       | `outputs/phase-12/verify-unassigned-links-rerun5.log`                | Phase 12 成果物        |
| aiworkflow構造検証ログ       | `outputs/phase-12/quick-validate-aiworkflow-skillcreator-rerun2.log` | Phase 12 成果物        |
| task-spec構造検証ログ        | `outputs/phase-12/quick-validate-task-spec-skillcreator-rerun2.log`  | Phase 12 成果物        |
| 未タスク対象監査ログ         | `outputs/phase-12/audit-unassigned-target-rerun5.log`                | Phase 12 成果物        |
| aiworkflow-index再生成ログ   | `outputs/phase-12/generate-index-aiworkflow-rerun5.log`              | Phase 12 成果物        |
| workflow-index再生成ログ     | `outputs/phase-12/generate-index-workflow-rerun5.log`                | Phase 12 成果物        |
| workflow-index再生成ログ     | `outputs/phase-12/generate-index-workflow-rerun6.log`                | Phase 12 成果物        |
| 全体整合検証ログ             | `outputs/phase-12/verify-all-specs-strict-rerun6.log`                | Phase 12 成果物        |
| Phase出力検証ログ            | `outputs/phase-12/validate-phase-rerun6.log`                         | Phase 12 成果物        |
| 未タスクリンク検証ログ       | `outputs/phase-12/verify-unassigned-links-rerun6.log`                | Phase 12 成果物        |
| aiworkflow構造検証ログ       | `outputs/phase-12/quick-validate-aiworkflow-skillcreator-rerun4.log` | Phase 12 成果物        |
| task-spec構造検証ログ        | `outputs/phase-12/quick-validate-task-spec-skillcreator-rerun4.log`  | Phase 12 成果物        |
| 未タスク対象監査ログ         | `outputs/phase-12/audit-unassigned-target-rerun6.log`                | Phase 12 成果物        |
| workflow-index再生成ログ     | `outputs/phase-12/generate-index-workflow-rerun7.log`                | Phase 12 成果物        |
| workflow-index再生成ログ     | `outputs/phase-12/generate-index-workflow-rerun8.log`                | Phase 12 成果物        |
| workflow-index再生成ログ     | `outputs/phase-12/generate-index-workflow-rerun9.log`                | Phase 12 成果物        |
| 未タスク正規化タスク監査ログ | `outputs/phase-12/audit-unassigned-format-normalization-target.log`  | Phase 12 成果物        |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料            | パス                                                                       | 内容                       |
| ------------------- | -------------------------------------------------------------------------- | -------------------------- |
| task-workflow-rules | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md` | コミット前品質ゲートの要件 |

## 実行手順

1. 変更差分と成果物の対応関係を確認する。
2. `git status` と `git diff --stat` で想定外差分を確認する。
3. ユーザーに変更概要を提示して承認を求める。
4. 承認がある場合のみコミット・PR作成フローに進む。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                 | 仕様参照先                                                                                                                        |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 機密情報が差分に含まれていないことを確認 | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（PR作成のため）                   | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（PR作成のため）                   | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 適用外（PR作成のため）                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | 変更差分と成果物の整合性を最終確認       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物           | パス                                     | 説明         |
| ---------------- | ---------------------------------------- | ------------ |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 差分確認結果 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR説明用要約 |
| 承認ログ         | `outputs/phase-13/user-approval-log.md`  | 承認証跡     |

## 完了条件

- [ ] 変更差分がすべて説明可能である
- [ ] 想定外差分がないことを確認している
- [ ] ユーザー承認なしでコミット/PRを実施していない
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 12
- **後続**: なし

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 13` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

完了（ユーザー承認後にコミット/PR判断）
