# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| Phase        | 13                                                                                          |
| Phase名      | PR作成                                                                                      |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase    | 完了                                                                                        |
| ステータス   | pending                                                                                     |
| 作成日       | 2026-03-05                                                                                  |
| 機能名       | task-056d-viewtype-routing-nav                                                              |
| 担当SubAgent | SubAgent-C                                                                                  |

## 目的

実装完了後に再利用するPR準備手順を定義し、レビュー観点と引き継ぎ情報を統一する。

## 実行タスク

- PR本文テンプレート作成: 変更点、検証結果、影響範囲、ロールバック方針を定義する。
- レビュー依頼テンプレート作成: 重点確認観点と判定項目を定義する。
- 事前チェック定義: CI、型検証、テスト結果の提出項目を定義する。

## 参照資料

| 参照資料         | パス                                                                        | 内容           |
| ---------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 2仕様      | `phase-2-design.md`                                                         | 設計基準       |
| Phase 5仕様      | `phase-5-implementation.md`                                                 | 実装計画       |
| Phase 6仕様      | `phase-6-test-expansion.md`                                                 | 試験拡充基準   |
| Phase 7仕様      | `phase-7-coverage-check.md`                                                 | カバレッジ基準 |
| Phase 8仕様      | `phase-8-refactoring.md`                                                    | リファクタ基準 |
| Phase 9仕様      | `phase-9-quality-assurance.md`                                              | QA基準         |
| Phase 10仕様     | `phase-10-final-review.md`                                                  | ゲート判定基準 |
| Phase 11仕様     | `phase-11-manual-test.md`                                                   | 手動検証証跡   |
| Phase 12仕様     | `phase-12-documentation.md`                                                 | 文書同期結果   |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                   | 判定根拠       |
| 文書更新サマリー | `outputs/phase-12/spec-update-summary.md`                                   | 同期根拠       |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 提出基準       |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容             |
| -------------------- | --------------------------------------------------------------------------- | ---------------- |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | 完了記録方針     |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 教訓引き継ぎ方針 |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質提出条件     |

## 実行手順

### ステップ1: PR本文テンプレート定義

変更要約、検証証跡、影響範囲、リスク、ロールバック項目を定義する。

### ステップ2: レビュー依頼テンプレート定義

レビュアー別の確認観点を定義する。

### ステップ3: 事前チェック定義

提出必須の検証ログと添付成果物を定義する。

## 成果物

| 成果物         | パス                                | 内容             |
| -------------- | ----------------------------------- | ---------------- |
| PR計画書       | `outputs/phase-13/pr-plan.md`       | PR本文構成       |
| 引き継ぎノート | `outputs/phase-13/handover-note.md` | レビュー依頼観点 |

## 完了条件

- [ ] PR本文テンプレートが定義されている
- [ ] レビュー依頼テンプレートが定義されている
- [ ] 事前チェック項目が定義されている
- [ ] Phase 12成果物との接続条件が明示されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

完了

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                     | 仕様参照先                                         |
| ------------------ | ---------------------------- | -------------------------------------------------- |
| ドキュメント整合   | PR入力を統一するため適用     | `aiworkflow-requirements: task-workflow.md`        |
| 品質保証           | 提出条件を定義するため適用   | `aiworkflow-requirements: quality-requirements.md` |
| エラーハンドリング | リスク記載を定義するため適用 | `aiworkflow-requirements: error-handling.md`       |

## サブタスク管理

1. 参照資料の確認
2. PR本文テンプレート定義
3. レビュー依頼テンプレート定義
4. 事前チェック定義
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物を指定パスに出力
- [ ] 完了条件のチェックを更新
