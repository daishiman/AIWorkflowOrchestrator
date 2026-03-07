# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| Phase        | 12                                                                                |
| Phase名      | ドキュメント更新                                                                  |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| 後続Phase    | Phase 13                                                                          |
| ステータス   | completed                                                                         |
| 作成日       | 2026-03-06                                                                        |
| 機能名       | task-056e-integration-gate-and-spec-sync                                          |
| 担当SubAgent | SubAgent-E2 / E4                                                                  |

## 目的

統合レビューゲートと仕様同期台帳の成果を、task-specification-creator と aiworkflow-requirements の正本へ反映する手順を固定する。

## 実行タスク

- 実装ガイド作成: Part 1 と Part 2 の2部構成で実装ガイドを作成する。
- Step 1-A / 1-B / 1-C 定義: 完了記録、実装状況更新、関連タスク更新を定義する。
- Step 2 判定: 条件付きで更新する aiworkflow 正本を判断する。
- 多角的再監査: 破棄判断、漏れ、矛盾、依存整合を20思考フレームで再確認する。
- 未タスク / フィードバック出力: 必須成果物を出力する。

## 参照資料

| 参照資料                        | パス                                                                                    | 内容                          |
| ------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1要件                     | `phase-1-requirements.md`                                                               | 更新根拠                      |
| Phase 2設計                     | `phase-2-design.md`                                                                     | 更新根拠                      |
| Phase 5実装                     | `phase-5-implementation.md`                                                             | 更新対象                      |
| Phase 6拡充                     | `phase-6-test-expansion.md`                                                             | 回帰観点                      |
| Phase 7判定                     | `phase-7-coverage-check.md`                                                             | カバレッジ根拠                |
| Phase 8リファクタ               | `phase-8-refactoring.md`                                                                | 命名整合根拠                  |
| Phase 9品質保証                 | `phase-9-quality-assurance.md`                                                          | 品質根拠                      |
| Phase 10最終レビュー            | `phase-10-final-review.md`                                                              | 判定結果                      |
| Phase 11手動検証                | `phase-11-manual-test.md`                                                               | 証跡根拠                      |
| 仕様更新フロー                  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1-A / 1-B / 1-C / 2      |
| Phase 11/12ガイド               | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Task 1〜5 の必須要件          |
| 技術ドキュメントガイド          | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1 / Part 2 記述要件      |
| 未タスクガイドライン            | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | Step 1-E と Task 4 の品質基準 |
| aiworkflow リソースマップ       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                        | 必要仕様の初期選定            |
| aiworkflow クイックリファレンス | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                     | 主要仕様の早見表              |
| aiworkflow トピックマップ       | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                           | セクション位置の特定          |
| 要件定義書                      | `outputs/phase-1/requirements-definition.md`                                            | Phase 1 成果物                |
| 受け入れ基準                    | `outputs/phase-1/acceptance-criteria.md`                                                | Phase 1 成果物                |
| スコープ定義                    | `outputs/phase-1/scope-definition.md`                                                   | Phase 1 成果物                |
| 統合ゲート設計                  | `outputs/phase-2/integration-gate-design.md`                                            | Phase 2 成果物                |
| 仕様同期マトリクス              | `outputs/phase-2/spec-sync-matrix.md`                                                   | Phase 2 成果物                |
| 引き渡し計画                    | `outputs/phase-2/dependency-handoff-plan.md`                                            | Phase 2 成果物                |
| aiworkflow抽出レポート          | `outputs/phase-2/aiworkflow-requirements-extract.md`                                    | Phase 2 成果物                |
| トレーサビリティ表              | `outputs/phase-2/traceability-matrix.md`                                                | Phase 2 成果物                |
| 実装計画                        | `outputs/phase-5/implementation-plan.md`                                                | Phase 5 成果物                |
| レビューゲート                  | `outputs/phase-5/review-gate.md`                                                        | Phase 5 成果物                |
| 仕様同期対象一覧                | `outputs/phase-5/spec-sync-targets.md`                                                  | Phase 5 成果物                |
| リファクタ計画                  | `outputs/phase-8/refactoring-plan.md`                                                   | Phase 8 成果物                |
| 一貫性チェック                  | `outputs/phase-8/contract-consistency-check.md`                                         | Phase 8 成果物                |
| 品質チェックリスト              | `outputs/phase-9/quality-checklist.md`                                                  | Phase 9 成果物                |
| 仕様同期準備レポート            | `outputs/phase-9/spec-sync-readiness.md`                                                | Phase 9 成果物                |
| 最終レビュー結果                | `outputs/phase-10/final-review-result.md`                                               | Phase 10 成果物               |
| 差し戻し判断ログ                | `outputs/phase-10/rework-decision-log.md`                                               | Phase 10 成果物               |
| 手動テスト計画                  | `outputs/phase-11/manual-test-plan.md`                                                  | Phase 11 成果物               |
| 手動テスト結果                  | `outputs/phase-11/manual-test-result.md`                                                | Phase 11 成果物               |
| 証跡インデックス                | `outputs/phase-11/evidence-index.md`                                                    | Phase 11 成果物               |
| スクリーンショットマトリクス    | `outputs/phase-11/screenshot-matrix.md`                                                 | Phase 11 成果物               |
| 発見事項一覧                    | `outputs/phase-11/discovered-issues.md`                                                 | Phase 11 成果物               |

## システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| タスク台帳                           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了記録と spec_created 反映先           |
| 教訓集                               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止策の反映先                       |
| 品質要件                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 統合ゲート品質ルールの反映候補           |
| 実装パターン                         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeInvoke / safeOn と契約記述の反映候補 |
| 状態管理パターン                     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | state同期判断の反映候補                  |
| IPC仕様                              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | ipc同期判断の反映候補                    |
| Preloadセキュリティ                  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge / whitelist の反映候補     |
| IPCセキュリティ                      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | security同期判断の反映候補               |
| エラーハンドリング                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | FAIL理由とエラーコードの反映候補         |
| 履歴データ型                         | `.claude/skills/aiworkflow-requirements/references/ui-history-data-types.md`                | history DTO の反映候補                   |
| 履歴統合                             | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md`               | history導線の反映候補                    |
| ナビゲーションUI                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | navigation同期判断の反映候補             |
| UIインターフェース（条件付き）       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | 下流UI型契約の反映候補                   |
| Skill UIインターフェース（条件付き） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | SkillCenter導線の反映候補                |

## 実行手順

### ステップ1: aiworkflow 抽出対象の固定

`resource-map.md` と `quick-reference.md` を起点に読み込む仕様を選定し、`topic-map.md` で対象セクションを特定して `spec-update-summary.md` に抽出根拠を記録する。

### ステップ2: Task 12-1 実装ガイド構成定義

Part 1 は「駅の改札」を例え話に使い、統合レビューゲートの役割を中学生向けに説明する。Part 2 は TypeScript の型定義、APIシグネチャ、使用例、エラーハンドリング、エッジケース、設定可能なパラメータと定数一覧を技術者向けに整理する。

### ステップ3: Task 12-2 Step 1-A / 1-B / 1-C / 1-D / 1-E の定義

Step 1-A では `task-workflow.md`、`lessons-learned.md`、両方の `LOGS.md`、必要時の `SKILL.md` 変更履歴を更新対象として固定する。Step 1-B では `spec_created` へ更新する実装状況テーブルを定義する。Step 1-C では関連タスク表の更新対象を grep で確認する。Step 1-D では `generate-index.js` による `topic-map.md` 再生成を必須化する。Step 1-E では `unassigned-task-guidelines.md` に従い raw検出件数と精査後件数を分離して記録し、1件以上の検出時に未タスク指示書作成、物理ファイル存在確認、`task-workflow.md` 登録、関連仕様リンク更新、`verify-unassigned-links.js` 実行を必須化する。

### ステップ4: Task 12-2 Step 2 の条件付き更新判定

`arch-state-management.md`、`api-ipc-system.md`、`security-electron-ipc.md`、`ui-ux-navigation.md`、`quality-requirements.md` は、Eの実行で新しい統合ルール、判定軸、運用基準を追加した場合だけ更新対象とする。更新不要の場合も `documentation-changelog.md` に判断理由を記録する。

### ステップ5: Task 12-3 / 12-4 / 12-5 の出力定義

`implementation-guide.md`、`spec-update-summary.md`、`documentation-changelog.md`、`unassigned-task-detection.md`、`skill-feedback-report.md`、`recheck-multithinking-audit.md`、`phase12-compliance-recheck.md` を出力し、`verification-report.md` との整合も確認する。

## 成果物

| 成果物             | パス                                              | 内容                                 |
| ------------------ | ------------------------------------------------- | ------------------------------------ |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`        | Part 1 / Part 2 のガイド             |
| 仕様更新サマリー   | `outputs/phase-12/spec-update-summary.md`         | Step別の更新判断                     |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`     | 変更履歴                             |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md`   | current / baseline の判定結果        |
| フィードバック     | `outputs/phase-12/skill-feedback-report.md`       | スキル改善提案                       |
| 多角的再監査       | `outputs/phase-12/recheck-multithinking-audit.md` | 破棄判断、矛盾、漏れ、依存整合の監査 |
| Phase 12準拠再確認 | `outputs/phase-12/phase12-compliance-recheck.md`  | Task 1〜5 の実施確認                 |

## 完了条件

- [x] 実装ガイドが Part 1 / Part 2 の2部構成で定義されている
- [x] Part 2 に TypeScript型定義、APIシグネチャ、使用例、エラーハンドリング、設定パラメータの要求が定義されている
- [x] `task-workflow.md`、`lessons-learned.md`、両方の `LOGS.md` が常時更新対象として定義されている
- [x] `spec_created` へ更新する実装状況テーブルの対象が定義されている
- [x] Step 1-D の `topic-map.md` 再生成が定義されている
- [x] Step 1-E の raw / 精査後件数分離、未タスク指示書登録、物理ファイル存在確認、`verify-unassigned-links.js` が定義されている
- [x] 条件付き更新対象の判断基準が定義されている
- [x] 多角的再監査の出力内容と破棄判断基準が定義されている
- [x] 必須成果物7件の出力規則が定義されている

## 次のPhase

Phase 13: PR作成

## 多角的チェック観点（AIが判断）

| 観点                                | 適用判断                                           | 仕様参照先                                                                                                                  |
| ----------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| ドキュメント整合                    | Phase 12 の主目的であるため適用                    | `aiworkflow-requirements: task-workflow.md`, `lessons-learned.md`                                                           |
| アーキテクチャ / 状態管理           | 条件付き更新の判断に必要なため適用                 | `aiworkflow-requirements: architecture-overview.md`, `arch-state-management.md`                                             |
| IPC / Preload / セキュリティ / ナビ | 条件付き更新の判断に必要なため適用                 | `aiworkflow-requirements: api-ipc-system.md`, `security-api-electron.md`, `security-electron-ipc.md`, `ui-ux-navigation.md` |
| エラーハンドリング / 履歴統合       | FAIL理由と history 契約の同期判断に必要なため適用  | `aiworkflow-requirements: error-handling.md`, `ui-history-data-types.md`, `ui-history-integration.md`                       |
| インデックス整合                    | topic-map と resource-map の再同期が必要なため適用 | `aiworkflow-requirements: indexes/resource-map.md`, `indexes/topic-map.md`                                                  |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. aiworkflow 抽出対象の固定
2. 実装ガイド構成定義
3. Step 1-A / 1-B / 1-C / 1-D / 1-E 定義
4. Step 2 条件付き更新判定
5. 多角的再監査と破棄判断
6. 必須成果物と検証結果の整合確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] aiworkflow 抽出根拠を成果物へ反映
- [x] Phase 12 必須タスクと Step 1-A〜1-E / Step 2 を成果物へ反映
- [x] 多角的再監査と破棄判断を成果物へ反映
- [x] 必須成果物と検証結果の整合を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 12
```
