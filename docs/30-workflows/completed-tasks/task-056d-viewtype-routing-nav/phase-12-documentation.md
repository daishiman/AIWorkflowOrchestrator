# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| Phase        | 12                                                                                |
| Phase名      | ドキュメント更新                                                                  |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| 後続Phase    | Phase 13                                                                          |
| ステータス   | completed                                                                         |
| 作成日       | 2026-03-05                                                                        |
| 機能名       | task-056d-viewtype-routing-nav                                                    |
| 担当SubAgent | SubAgent-C                                                                        |

## 目的

仕様書作成タスクとしての完了記録手順を固定し、`spec_created` 管理と正本仕様同期の判定方法を定義する。

## 実行タスク

- 実装ガイド作成: Part 1（中学生向け）とPart 2（技術者向け）の構成を作成する。
- Step 1-A実行: 完了タスク記録と関連ドキュメントリンク追加手順を定義する。
- Step 1-B実行: 実装状況テーブルを `spec_created` へ更新する手順を定義する。
- Step 1-C実行: 関連タスクテーブル更新手順を定義する。
- Step 2判定: システム仕様更新要否の判断手順を定義する。
- 必須成果物定義: changelog、未タスク検出、フィードバック出力手順を定義する。

## 参照資料

| 参照資料          | パス                                                                           | 内容               |
| ----------------- | ------------------------------------------------------------------------------ | ------------------ |
| Phase 2仕様       | `phase-2-design.md`                                                            | 設計入力           |
| Phase 5仕様       | `phase-5-implementation.md`                                                    | 実装入力           |
| Phase 6仕様       | `phase-6-test-expansion.md`                                                    | 試験入力           |
| Phase 7仕様       | `phase-7-coverage-check.md`                                                    | カバレッジ入力     |
| Phase 8仕様       | `phase-8-refactoring.md`                                                       | 改善入力           |
| Phase 9仕様       | `phase-9-quality-assurance.md`                                                 | QA入力             |
| Phase 10仕様      | `phase-10-final-review.md`                                                     | 最終判定入力       |
| Phase 11仕様      | `phase-11-manual-test.md`                                                      | 検証入力           |
| 仕様更新フロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A/1-B/1-C/2 |
| Phase 11/12ガイド | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Task 1-5要件       |
| 品質基準          | `.claude/skills/task-specification-creator/references/quality-standards.md`    | 文書品質           |
| task-workflow正本 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 台帳反映先         |
| lessons正本       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 教訓反映先         |

## システム仕様（aiworkflow-requirements）

| 参照資料                     | パス                                                                              | 内容                                      |
| ---------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- |
| task-workflow                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | タスク状態同期                            |
| lessons-learned              | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 教訓同期                                  |
| arch-state-management        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | ViewType関連の同期対象判定                |
| ui-ux-navigation             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | ナビ契約の同期対象判定                    |
| API設計（限定適用）          | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | IPC/API仕様更新が不要であることの判定根拠 |
| IPC契約（限定適用）          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | Step 2の更新不要判定に利用                |
| インターフェース（限定適用） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`    | 型契約更新の要否判定に利用                |
| インターフェース（限定適用） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skillCenter関連契約更新の要否判定に利用   |
| データ整合性（非適用確認）   | `.claude/skills/aiworkflow-requirements/references/database-schema.md`            | DB変更なしを記録するための参照            |

## 実行手順

### ステップ1: 実装ガイド構成定義

Part 1とPart 2の章立て、必須要素、検証観点を定義する。

### ステップ2: Step 1-A/1-B/1-C定義

完了記録、`spec_created` 更新、関連タスク更新の実施手順を定義する。

### ステップ3: Step 2判定定義

新規インターフェース有無で更新要否を判定する条件を定義する。

### ステップ4: 必須成果物定義

`documentation-changelog.md`、`unassigned-task-detection.md`、`skill-feedback-report.md` の作成規約を定義する。

## 成果物

| 成果物           | パス                                              | 内容                               |
| ---------------- | ------------------------------------------------- | ---------------------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`        | Part 1/Part 2構成                  |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`         | Step別結果                         |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md`     | 変更ログ                           |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`   | 検出結果                           |
| フィードバック   | `outputs/phase-12/skill-feedback-report.md`       | 改善提案                           |
| 多角的監査       | `outputs/phase-12/recheck-multithinking-audit.md` | 矛盾・漏れ・依存整合チェック       |
| 準拠再確認       | `outputs/phase-12/phase12-compliance-recheck.md`  | Task 1〜5 / Step 1-A〜1-E 実施記録 |

## 完了条件

- [x] Part 1/Part 2の実装ガイド構成が定義されている
- [x] Step 1-A/1-B/1-Cの実施手順が定義されている
- [x] 仕様書作成タスクの `spec_created` 更新手順が明記されている
- [x] Step 2の更新要否判定基準が定義されている
- [x] 必須成果物5件の作成規約が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 13: PR作成

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                   | 仕様参照先                                   |
| ------------------ | -------------------------- | -------------------------------------------- |
| ドキュメント整合   | 本Phaseの主目的のため適用  | `aiworkflow-requirements: task-workflow.md`  |
| アーキテクチャ     | 同期対象判定のため適用     | `aiworkflow-requirements: architecture-*.md` |
| UI/UX              | ナビ契約同期判定のため適用 | `aiworkflow-requirements: ui-ux-*.md`        |
| エラーハンドリング | 更新失敗時記録のため適用   | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

1. 参照資料の確認
2. 実装ガイド構成定義
3. Step 1-A/1-B/1-C定義
4. Step 2判定定義
5. 必須成果物定義

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
