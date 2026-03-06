# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| Phase        | 13                                                                                          |
| Phase名      | PR作成                                                                                      |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase    | なし                                                                                        |
| ステータス   | pending                                                                                     |
| 作成日       | 2026-03-06                                                                                  |
| 機能名       | task-056e-integration-gate-and-spec-sync                                                    |
| 担当SubAgent | Lead                                                                                        |

## 目的

統合レビューゲート仕様の差分、検証結果、仕様同期内容をレビュー可能なPR材料へ整理する。

## 実行タスク

- PR本文作成: 変更概要、検証結果、同期対象をPR本文へ整理する。
- レビュー依頼文作成: state / ipc / navigation / documentation の観点別に確認依頼を整理する。
- 最終確認: 仕様書作成フェーズではコミットとPRを自動実行しないことを確認する。

## 参照資料

| 参照資料                     | パス                                                                       | 内容                             |
| ---------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| Phase 1要件                  | `phase-1-requirements.md`                                                  | 要約根拠                         |
| Phase 2設計                  | `phase-2-design.md`                                                        | 要約根拠                         |
| Phase 5実装                  | `phase-5-implementation.md`                                                | 差分要約                         |
| Phase 6拡充                  | `phase-6-test-expansion.md`                                                | 回帰要約                         |
| Phase 7判定                  | `phase-7-coverage-check.md`                                                | カバレッジ要約                   |
| Phase 8リファクタ            | `phase-8-refactoring.md`                                                   | 整備内容要約                     |
| Phase 9品質保証              | `phase-9-quality-assurance.md`                                             | 品質要約                         |
| Phase 10最終レビュー         | `phase-10-final-review.md`                                                 | 判定要約                         |
| Phase 11手動検証             | `phase-11-manual-test.md`                                                  | 手動証跡要約                     |
| Phase 12更新                 | `phase-12-documentation.md`                                                | 仕様同期要約                     |
| Phase実行ワークフロー        | `.claude/skills/task-specification-creator/references/execute-workflow.md` | PR自動実行禁止とユーザー確認条件 |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`                                  | Phase 10 成果物                  |
| 差し戻し判断ログ             | `outputs/phase-10/rework-decision-log.md`                                  | Phase 10 成果物                  |
| 手動テスト計画               | `outputs/phase-11/manual-test-plan.md`                                     | Phase 11 成果物                  |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                                   | Phase 11 成果物                  |
| 証跡インデックス             | `outputs/phase-11/evidence-index.md`                                       | Phase 11 成果物                  |
| スクリーンショットマトリクス | `outputs/phase-11/screenshot-matrix.md`                                    | Phase 11 成果物                  |
| 発見事項一覧                 | `outputs/phase-11/discovered-issues.md`                                    | Phase 11 成果物                  |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                 | Phase 12 成果物                  |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`                                  | Phase 12 成果物                  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`                              | Phase 12 成果物                  |
| 未タスク検出                 | `outputs/phase-12/unassigned-task-detection.md`                            | Phase 12 成果物                  |
| スキルフィードバック         | `outputs/phase-12/skill-feedback-report.md`                                | Phase 12 成果物                  |
| 多角的再監査                 | `outputs/phase-12/recheck-multithinking-audit.md`                          | Phase 12 成果物                  |
| Phase 12準拠再確認           | `outputs/phase-12/phase12-compliance-recheck.md`                           | Phase 12 成果物                  |

## システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                   | 内容                         |
| ---------- | ---------------------------------------------------------------------- | ---------------------------- |
| タスク台帳 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | PR本文へ載せる台帳同期内容   |
| 教訓集     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | レビューで確認する再発防止策 |

## 実行手順

### ステップ1: PR本文草案の作成

変更概要、主要成果物、検証結果、同期対象、残課題を整理する。

### ステップ2: レビュー依頼文の作成

state、ipc、navigation、documentation の観点別に確認依頼を作成する。

### ステップ3: 最終確認

この仕様書作成フェーズではコミットとPRを自動実行しないことを確認する。

## 成果物

| 成果物         | パス                                      | 内容               |
| -------------- | ----------------------------------------- | ------------------ |
| PR本文草案     | `outputs/phase-13/pr-description.md`      | 変更概要と検証結果 |
| レビュー依頼文 | `outputs/phase-13/review-request-note.md` | 観点別の確認依頼   |

## 完了条件

- [ ] PR本文草案に変更概要、検証結果、同期対象、残課題が記載されている
- [ ] レビュー依頼文に state / ipc / navigation / documentation の観点がある
- [ ] 仕様書作成フェーズではコミットとPRを自動実行しないことが明記されている
- [ ] Phase 12 の更新内容がPR本文草案へ反映されている
- [ ] 下流タスクへの影響範囲がPR本文草案へ反映されている

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                                 | 仕様参照先                                                                 |
| -------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| 変更要約       | PR本文草案の粒度を揃えるため適用                         | `phase-12-documentation.md`                                                |
| レビュー導線   | 観点別のレビュー依頼を明確にするため適用                 | `aiworkflow-requirements: task-workflow.md`                                |
| 残課題管理     | 残課題を正しく引き渡すため適用                           | `aiworkflow-requirements: lessons-learned.md`                              |
| 非自動実行境界 | コミット / PR を勝手に行わない境界を明示するため適用     | `.claude/skills/task-specification-creator/SKILL.md`                       |
| 実行フロー境界 | ユーザー許可なしで `/ai:diff-to-pr` を実行しないため適用 | `.claude/skills/task-specification-creator/references/execute-workflow.md` |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. PR本文草案の作成
2. レビュー依頼文の作成
3. 変更要約の確認
4. 残課題の確認
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PR本文草案とレビュー依頼文を成果物へ反映
- [ ] 非自動実行境界を成果物へ反映
- [ ] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 13
```
