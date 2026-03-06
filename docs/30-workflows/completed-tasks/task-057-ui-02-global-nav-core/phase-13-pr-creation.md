# Phase 13: PR作成

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 13                             |
| Phase名      | PR作成                         |
| 前提Phase    | Phase 12                       |
| 後続Phase    | 完了                           |
| ステータス   | pending                        |
| 作成日       | 2026-03-06                     |
| 機能名       | task-057-ui-02-global-nav-core |
| 担当SubAgent | SubAgent-D（PR素材作成）       |

## 目的

レビュー担当者が変更内容、検証結果、リスク、ロールバック条件を短時間で把握できる PR 素材を準備する。

## 背景

このタスクではコミットと PR 作成自体は実施対象外だが、後続で人間が安全にレビューできる材料は先に整えておく必要がある。PR 素材が曖昧だと、Global Navigation の大きな変更でもレビュー論点が拡散しやすい。

## 実行タスク

- PR 本文作成: 目的、変更点、テスト結果、スクリーンショット、リスク、ロールバック手順をまとめる。
- レビュー依頼メモ作成: 注目点、未解決事項、確認してほしい観点を整理する。
- マージ準備確認: CI 前提、ドキュメント同期、未タスク有無、ロールバック手順の有無を確認する。
- 承認待ち条件記録: コミットと PR 作成は明示指示後に行う条件を記録する。

## 参照資料

| 参照資料                     | パス                                                | 内容                 |
| ---------------------------- | --------------------------------------------------- | -------------------- |
| Phase 2仕様                  | `phase-2-design.md`                                 | 設計基準             |
| Phase 5仕様                  | `phase-5-implementation.md`                         | 実装基準             |
| Phase 6仕様                  | `phase-6-test-expansion.md`                         | 回帰試験の基準       |
| Phase 7仕様                  | `phase-7-coverage-check.md`                         | カバレッジの基準     |
| Phase 8仕様                  | `phase-8-refactoring.md`                            | 改善の基準           |
| Phase 9仕様                  | `phase-9-quality-assurance.md`                      | QA の根拠            |
| Phase 10仕様                 | `phase-10-final-review.md`                          | Gate の根拠          |
| Phase 12仕様                 | `phase-12-documentation.md`                         | 文書同期の根拠       |
| 設計成果物                   | `outputs/phase-2/architecture-design.md`            | レビュー向け設計概要 |
| 実装サマリー                 | `outputs/phase-5/implementation-summary.md`         | 変更点の要約         |
| テスト拡充レポート           | `outputs/phase-6/test-expansion-report.md`          | 回帰試験結果         |
| カバレッジレポート           | `outputs/phase-7/coverage-report.md`                | 数値結果             |
| リファクタリングレポート     | `outputs/phase-8/refactoring-report.md`             | 改善内容             |
| 品質検証レポート             | `outputs/phase-9/quality-verification.md`           | 検証結果             |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`            | 手動検証結果         |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`           | 正本同期結果         |
| 未タスク検出                 | `outputs/phase-12/unassigned-task-detection.md`     | 残課題               |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`           | Phase 10 成果物      |
| リリース判定                 | `outputs/phase-10/release-decision.md`              | Phase 10 成果物      |
| ロールバック準備レビュー     | `outputs/phase-10/rollback-readiness-review.md`     | Phase 10 成果物      |
| スクリーンショットカバレッジ | `outputs/phase-11/screenshot-coverage.md`           | Phase 11 成果物      |
| 発見事項                     | `outputs/phase-11/discovered-issues.md`             | Phase 11 成果物      |
| ナビ導線ウォークスルー       | `outputs/phase-11/navigation-walkthrough-matrix.md` | Phase 11 成果物      |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`          | Phase 12 成果物      |
| 更新履歴                     | `outputs/phase-12/documentation-changelog.md`       | Phase 12 成果物      |
| スキル改善レポート           | `outputs/phase-12/skill-feedback-report.md`         | Phase 12 成果物      |
| 正本仕様更新マトリクス       | `outputs/phase-12/system-spec-update-matrix.md`     | Phase 12 成果物      |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容                                     |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | 完了記録先                               |
| ナビゲーション仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`     | レビュー観点の正本                       |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | コンポーネント責務の説明根拠             |
| デザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`  | spacing、コントラスト、breakpoint の正本 |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | CI と品質基準                            |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 再利用すべき苦戦箇所                     |

## 実行手順

### ステップ1: PR 本文作成

変更概要、対象ファイル群、テスト結果、証跡を短くまとめる。

### ステップ2: レビュー依頼メモ作成

レビューで見てほしい論点を 3〜5 個に絞って書く。

### ステップ3: 承認待ち条件記録

コミット、push、PR 作成は人間の明示指示後に行う条件を記録する。

## 成果物

| 成果物                   | パス                                            | 内容                           |
| ------------------------ | ----------------------------------------------- | ------------------------------ |
| PR 本文                  | `outputs/phase-13/pr-description.md`            | 変更点、検証結果、リスク       |
| レビュー依頼メモ         | `outputs/phase-13/review-request-note.md`       | 重点確認ポイント               |
| マージ準備チェックリスト | `outputs/phase-13/merge-readiness-checklist.md` | CI、ドキュメント、未タスク確認 |

## 依存関係

| 区分         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| 入力依存     | Phase 2 / 5 / 9 / 11 / 12 の成果物が PR 素材の根拠になる                        |
| 並列調整     | SubAgent-D が素材整理を主担当し、他 SubAgent は設計・実装・検証の要約を提供する |
| 後続引き渡し | 人間レビュー時は本Phaseの素材をそのまま PR 本文と確認観点へ転用する             |

## 完了条件

- [ ] PR 本文が作成されている
- [ ] レビュー依頼メモが作成されている
- [ ] マージ準備チェックリストが作成されている
- [ ] コミットと PR 作成は明示指示後に行う条件が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- PR 本文、レビュー依頼メモ、マージ準備チェックリストの整合を確認する
- `artifacts.json` に Phase 13 の成果物登録内容を反映する
- コミット / push / PR 作成を自動実施しない条件を明記する
- レビュー担当者が最短で判断できる論点を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                                   | 仕様参照先                                         |
| ---------------- | ------------------------------------------ | -------------------------------------------------- |
| ドキュメント整合 | PR 素材と正本仕様を整合させるため適用      | `aiworkflow-requirements: task-workflow.md`        |
| UI/UX            | レビュー観点を明確化するため適用           | `aiworkflow-requirements: ui-ux-*.md`              |
| テスタビリティ   | 検証結果を PR 本文へ反映するため適用       | `aiworkflow-requirements: quality-requirements.md` |
| 教訓再利用       | レビューで再確認する論点を明示するため適用 | `aiworkflow-requirements: lessons-learned.md`      |

## サブタスク管理

1. 参照資料の確認
2. PR 本文作成
3. レビュー依頼メモ作成
4. マージ準備確認
5. 承認待ち条件記録

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物を指定パスへ出力
- [ ] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク               | 結果    | 備考 |
| -------------------- | ------- | ---- |
| PR 本文作成          | pending |      |
| レビュー依頼メモ作成 | pending |      |
| マージ準備確認       | pending |      |
| 承認待ち条件記録     | pending |      |

### 発見事項

- 良かった点: pending
- 問題点: pending
- 次Phaseへの引き継ぎ: pending

## 次のPhase

完了
