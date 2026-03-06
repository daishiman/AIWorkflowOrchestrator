# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 10                                 |
| Phase名      | 最終レビューゲート                 |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 9 |
| 後続Phase    | Phase 11                           |
| ステータス   | completed                          |
| 作成日       | 2026-03-06                         |
| 機能名       | task-057-ui-02-global-nav-core     |
| 担当SubAgent | SubAgent-A（最終レビュー）         |

## 目的

要件、設計、実装、テスト、QA の結果をまとめて最終 Gate 判定を行い、Phase 11 の手動検証へ進めるかを決める。

## 背景

Phase 10 は「実装できたか」ではなく「この仕様書群が実装実行に耐えるか」を最終確認する工程である。要件から QA までの一貫性が欠けたまま手動検証へ進むと、発見事項の責任境界が曖昧になる。

## 実行タスク

- レビュー統合: Phase 1、2、5、9 の成果物を統合して差分を確認する。
- リリース判定: Step 3 の `AppDock` 削除可否、ロールバック可否、残課題許容可否を判定する。
- 修正戻り先判定: 指摘の種類ごとに戻り先 Phase を決める。
- 証跡整備確認: Phase 11 で必要な手動検証入力が揃っているかを確認する。

## 参照資料

| 参照資料                   | パス                                                           | 内容             |
| -------------------------- | -------------------------------------------------------------- | ---------------- |
| Phase 1仕様                | `phase-1-requirements.md`                                      | 要件基準         |
| Phase 2仕様                | `phase-2-design.md`                                            | 設計基準         |
| Phase 5仕様                | `phase-5-implementation.md`                                    | 実装基準         |
| Phase 9仕様                | `phase-9-quality-assurance.md`                                 | QA 結果          |
| 品質検証レポート           | `outputs/phase-9/quality-verification.md`                      | QA の正本        |
| レスポンシブ監査           | `outputs/phase-9/responsive-accessibility-audit.md`            | 手動検証前の監査 |
| 削除準備チェックリスト     | `outputs/phase-8/appdock-removal-readiness.md`                 | Step 3 判定材料  |
| アーキテクチャ設計         | `outputs/phase-2/architecture-design.md`                       | Phase 2 成果物   |
| ナビ契約設計               | `outputs/phase-2/nav-contract-design.md`                       | Phase 2 成果物   |
| レスポンシブ設計           | `outputs/phase-2/responsive-layout-design.md`                  | Phase 2 成果物   |
| アクセシビリティ仕様       | `outputs/phase-2/accessibility-specification.md`               | Phase 2 成果物   |
| 正本仕様抽出マトリクス     | `outputs/phase-2/aiworkflow-requirements-extraction-matrix.md` | Phase 2 成果物   |
| 移行手順設計               | `outputs/phase-2/migration-sequence-design.md`                 | Phase 2 成果物   |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`                   | Phase 1 成果物   |
| 受け入れ基準               | `outputs/phase-1/acceptance-criteria.md`                       | Phase 1 成果物   |
| スコープ定義               | `outputs/phase-1/scope-definition.md`                          | Phase 1 成果物   |
| 移行境界マトリクス         | `outputs/phase-1/migration-boundary-matrix.md`                 | Phase 1 成果物   |
| SubAgent分担表             | `outputs/phase-1/subagent-boundary-map.md`                     | Phase 1 成果物   |
| 実装サマリー               | `outputs/phase-5/implementation-summary.md`                    | Phase 5 成果物   |
| 変更ファイル一覧           | `outputs/phase-5/changed-files-list.md`                        | Phase 5 成果物   |
| ロールバック手順確認       | `outputs/phase-5/rollback-checklist.md`                        | Phase 5 成果物   |
| ブランチ変更反映マトリクス | `outputs/phase-5/branch-change-reflection-matrix.md`           | Phase 5 成果物   |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`                           | Phase 7 成果物   |
| カバレッジギャップ分析     | `outputs/phase-7/coverage-gap-analysis.md`                     | Phase 7 成果物   |
| 契約一致チェック           | `outputs/phase-7/contract-parity-checklist.md`                 | Phase 7 成果物   |
| リファクタリングレポート   | `outputs/phase-8/refactoring-report.md`                        | Phase 8 成果物   |
| 差分要約                   | `outputs/phase-8/refactor-diff-summary.md`                     | Phase 8 成果物   |
| 技術負債整理               | `outputs/phase-8/technical-debt-register.md`                   | Phase 8 成果物   |
| QAチェックリスト           | `outputs/phase-9/qa-checklist.md`                              | Phase 9 成果物   |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                           | 内容                               |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------------------- |
| ナビゲーション仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | 導線正本                           |
| デザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | コントラスト、spacing、breakpoint  |
| UI設計原則         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | HIG と WCAG                        |
| 状態管理仕様       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | selector と viewHistory            |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | Gate の品質基準                    |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | Renderer 全体整合の最終確認        |
| UIポータル仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`   | More メニューと overlay の最終確認 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | fallback と想定外入力              |

## レビューゲート

### 判定基準

| 判定     | 条件                                       | 次のアクション                        |
| -------- | ------------------------------------------ | ------------------------------------- |
| PASS     | 受け入れ基準、品質基準、手動検証入力が揃う | Phase 11 へ進行                       |
| MINOR    | 軽微な指摘のみで未タスク化して前進可能     | 未タスク化後に Phase 11 へ進行        |
| MAJOR    | 実装、設計、テストの再実施が必要           | 影響範囲に応じて Phase 2/4/5/8 へ戻る |
| CRITICAL | 要件や基盤前提が崩れており再定義が必要     | Phase 1 へ戻る                        |

### 戻り先決定基準

| 問題の種類       | 戻り先                          |
| ---------------- | ------------------------------- |
| 要件の問題       | Phase 1（要件定義）             |
| 設計の問題       | Phase 2（設計）                 |
| テスト設計の問題 | Phase 4（テスト作成）           |
| 実装の問題       | Phase 5（実装）                 |
| テスト拡充の問題 | Phase 6（テスト拡充）           |
| カバレッジ未達   | Phase 7（テストカバレッジ確認） |
| コード品質の問題 | Phase 8（リファクタリング）     |

## 実行手順

### ステップ1: 成果物照合

各 Phase の主要成果物を読み、要件から QA までの抜けを確認する。

### ステップ2: Gate 判定

PASS / MINOR / MAJOR / CRITICAL を決め、理由を 1 行で書く。

### ステップ3: 手動検証入力確認

スクリーンショット対象、操作シナリオ、期待結果が揃っているかを確認する。

## 統合テスト連携

| 観点     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| UI接続   | 手動検証対象の表示モードと操作導線が揃っているかを確認する            |
| 状態接続 | `viewHistory` と `isNavExpanded` が検証対象へ含まれているかを確認する |
| 移行接続 | Step 1〜3 の各状態を手動検証対象へ引き継ぐ                            |
| 証跡接続 | Phase 11 のスクリーンショット計画へ入力を渡す                         |

## 成果物

| 成果物                   | パス                                            | 内容               |
| ------------------------ | ----------------------------------------------- | ------------------ |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`       | Gate 判定          |
| リリース判定             | `outputs/phase-10/release-decision.md`          | Go / No-Go         |
| ロールバック準備レビュー | `outputs/phase-10/rollback-readiness-review.md` | 戻し手順と判断条件 |

## 依存関係

| 区分         | 内容                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| 入力依存     | Phase 1 / 2 / 5 / 9 と Phase 8 の削除準備結果が最終 Gate の根拠になる                                |
| 並列調整     | SubAgent-A が最終判定を主担当し、SubAgent-C/D の検証入力整備状況を確認する                           |
| 後続引き渡し | Phase 11 は PASS/MINOR の結果と手動検証入力をそのまま利用し、MAJOR/CRITICAL はここで戻り先を固定する |

## 完了条件

- [x] Gate 判定が記録されている
- [x] Step 3 の実施可否が記録されている
- [x] 戻り先 Phase のルールが記録されている
- [x] Phase 11 に必要な入力が揃っている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- 最終 Gate 判定と戻り先 Phase を成果物へ明記する
- `artifacts.json` に Phase 10 の成果物登録内容を反映する
- 手動検証で必要な入力不足を未記録のまま残さない
- Phase 11 に渡す操作シナリオと証跡対象を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                                         | 仕様参照先                                          |
| ---------------- | ------------------------------------------------ | --------------------------------------------------- |
| UI/UX            | 手動検証へ進める判断を行うため適用               | `aiworkflow-requirements: ui-ux-*.md`               |
| アクセシビリティ | キーボード導線の最終確認を行うため適用           | `aiworkflow-requirements: testing-accessibility.md` |
| テスタビリティ   | QA 結果を Gate 判定へ使うため適用                | `aiworkflow-requirements: quality-requirements.md`  |
| 状態管理         | `viewHistory` と selector を最終確認するため適用 | `aiworkflow-requirements: arch-state-management.md` |

## サブタスク管理

1. 参照資料の確認
2. レビュー統合
3. リリース判定
4. 修正戻り先判定
5. 証跡整備確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク         | 結果      | 備考                     |
| -------------- | --------- | ------------------------ |
| レビュー統合   | completed | outputs/phase-10/ を参照 |
| リリース判定   | completed | outputs/phase-10/ を参照 |
| 修正戻り先判定 | completed | outputs/phase-10/ を参照 |
| 証跡整備確認   | completed | outputs/phase-10/ を参照 |

### 発見事項

- 良かった点: MINOR 判定、Step 3 readiness、Phase 11 の手動検証入力が outputs/phase-10/ に揃っていた。
- 問題点: 本文仕様書が pending のまま残り、Phase 12 依存参照 warning の一因になっていた。
- 次Phaseへの引き継ぎ: Phase 11 は outputs/phase-10/ の最終レビュー結果、release decision、rollback readiness をそのまま使う。

## 次のPhase

Phase 11: 手動テスト検証
