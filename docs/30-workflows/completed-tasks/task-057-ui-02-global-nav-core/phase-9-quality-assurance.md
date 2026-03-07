# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 9                              |
| Phase名      | 品質保証                       |
| 前提Phase    | Phase 8                        |
| 後続Phase    | Phase 10                       |
| ステータス   | completed                      |
| 作成日       | 2026-03-06                     |
| 機能名       | task-057-ui-02-global-nav-core |
| 担当SubAgent | SubAgent-C（QA）               |

## 目的

リファクタリング後の UI 導線、レスポンシブ挙動、アクセシビリティ、型安全、lint、ロールバック準備を横断確認する。

## 背景

Phase 9 は「動く」状態ではなく「安全に進める」状態を判定する工程である。Global Navigation は全画面導線を支配するため、レスポンシブ、ショートカット、削除準備、回帰のどれか一つでも抜けると後続タスク群へ欠陥を波及させる。

## 実行タスク

- QA チェックリスト実行: lint、typecheck、ユニットテスト、統合テスト、アクセシビリティ確認を実施する。
- レスポンシブ監査: desktop / tablet / mobile の見え方、More メニュー、DynamicIsland 共存を監査する。
- リスク再確認: P31、P39、P40、AppDock 削除漏れ、ショートカット誤発火の再発有無を確認する。
- リリース前確認: Step 3 に進んでよい条件と戻す条件をまとめる。

## 参照資料

| 参照資料                   | パス                                                 | 内容           |
| -------------------------- | ---------------------------------------------------- | -------------- |
| Phase 5仕様                | `phase-5-implementation.md`                          | 実装基準       |
| Phase 7仕様                | `phase-7-coverage-check.md`                          | 網羅状況       |
| Phase 8仕様                | `phase-8-refactoring.md`                             | 改善内容       |
| 実装サマリー               | `outputs/phase-5/implementation-summary.md`          | 実装済み対象   |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`                 | 数値結果       |
| リファクタリングレポート   | `outputs/phase-8/refactoring-report.md`              | 構造変更       |
| 削除準備チェックリスト     | `outputs/phase-8/appdock-removal-readiness.md`       | Step 3 条件    |
| 変更ファイル一覧           | `outputs/phase-5/changed-files-list.md`              | Phase 5 成果物 |
| ロールバック手順確認       | `outputs/phase-5/rollback-checklist.md`              | Phase 5 成果物 |
| ブランチ変更反映マトリクス | `outputs/phase-5/branch-change-reflection-matrix.md` | Phase 5 成果物 |
| 差分要約                   | `outputs/phase-8/refactor-diff-summary.md`           | Phase 8 成果物 |
| 技術負債整理               | `outputs/phase-8/technical-debt-register.md`         | Phase 8 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                           | 内容                               |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | QA 基準                            |
| デザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | コントラストと spacing の正本      |
| テストアクセシビリティ | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | 手動・自動のアクセシビリティ観点   |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | HIG と WCAG                        |
| UIポータル仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`   | More メニューと overlay の QA 観点 |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | P31 対策                           |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | Renderer 全体の整合確認            |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | 導線期待値                         |

## 実行手順

### ステップ1: QA 実行

Lint、typecheck、テスト、アクセシビリティ項目を順番に確認し、結果を記録する。

### ステップ2: レスポンシブ監査

表示モードごとに操作導線と視認性を確認し、差分を整理する。

### ステップ3: リスク判定

再発したリスクの戻り先 Phase を決める。

## 品質ゲート

| 判定     | 条件                                                                                            | 次のアクション                 |
| -------- | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| PASS     | lint / typecheck / 自動テスト / レスポンシブ監査 / アクセシビリティ監査に blocking issue がない | Phase 10 へ進行                |
| MINOR    | 軽微な UI 差分または文書化不足のみ                                                              | 指摘を記録して Phase 10 へ進行 |
| MAJOR    | 回帰、表示崩れ、ショートカット誤発火、削除準備不足のいずれかがある                              | Phase 5 / 6 / 8 へ戻る         |
| CRITICAL | 全画面導線を破壊する欠陥またはロールバック不能状態がある                                        | Phase 1 から再確認する         |

## 統合テスト連携

| 観点         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| UI接続       | 表示モードごとの導線を同一チェックリストで確認する            |
| 状態接続     | `isNavExpanded`、`viewHistory`、feature flag の整合を確認する |
| 操作接続     | キーボード、More メニュー、戻る操作を確認する                 |
| リリース接続 | Phase 10 の最終レビューへ QA 結果を引き渡す                   |

## 成果物

| 成果物                             | パス                                                | 内容                   |
| ---------------------------------- | --------------------------------------------------- | ---------------------- |
| 品質検証レポート                   | `outputs/phase-9/quality-verification.md`           | QA 実施結果            |
| QA チェックリスト                  | `outputs/phase-9/qa-checklist.md`                   | 実施項目一覧           |
| レスポンシブ・アクセシビリティ監査 | `outputs/phase-9/responsive-accessibility-audit.md` | 表示モード別の監査結果 |

## 依存関係

| 区分         | 内容                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| 入力依存     | Phase 5〜8 の実装・回帰・カバレッジ・改善結果が QA 判定の根拠になる                                         |
| 並列調整     | SubAgent-C が QA を主担当し、SubAgent-B は改善の実施有無、SubAgent-D は手動検証へ引き継ぐ証跡観点を受け取る |
| 後続引き渡し | Phase 10 は本Phaseの品質ゲート判定と blocking issue の有無を最終 Gate の入力にする                          |

## 完了条件

- [x] lint、typecheck、テストの結果が記録されている
- [x] 表示モード 3 系列の監査結果が記録されている
- [x] P31、P39、P40、ショートカット誤発火、削除漏れの再発有無が記録されている
- [x] Step 3 へ進む条件と戻す条件が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- 品質ゲート判定と blocking issue の有無を成果物へ明記する
- `artifacts.json` に Phase 9 の成果物登録内容を反映する
- 戻り先が必要な問題は Phase 5 / 6 / 8 のどこに返すかを曖昧にしない
- Phase 10 が最終 Gate を判断できるよう要点を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                       | 仕様参照先                                          |
| ---------------- | ------------------------------ | --------------------------------------------------- |
| テスタビリティ   | 本Phaseの主目的のため適用      | `aiworkflow-requirements: quality-requirements.md`  |
| アクセシビリティ | 監査対象に含むため適用         | `aiworkflow-requirements: testing-accessibility.md` |
| UI/UX            | レスポンシブ監査を行うため適用 | `aiworkflow-requirements: ui-ux-*.md`               |
| 状態管理         | P31 再発有無を確認するため適用 | `aiworkflow-requirements: arch-state-management.md` |

## サブタスク管理

1. 参照資料の確認
2. QA チェックリスト実行
3. レスポンシブ監査
4. リスク再確認
5. リリース前確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク                | 結果      | 備考                    |
| --------------------- | --------- | ----------------------- |
| QA チェックリスト実行 | completed | outputs/phase-9/ を参照 |
| レスポンシブ監査      | completed | outputs/phase-9/ を参照 |
| リスク再確認          | completed | outputs/phase-9/ を参照 |
| リリース前確認        | completed | outputs/phase-9/ を参照 |

### 発見事項

- 良かった点: typecheck、回帰テスト、レスポンシブ/アクセシビリティ監査の結果を outputs/phase-9/ に固定できた。
- 問題点: 本文仕様書の pending 残置が、最終 Gate 前の品質完了表示とずれていた。
- 次Phaseへの引き継ぎ: Phase 10 は outputs/phase-9/ の QA 結果を最終 Gate 判定の入力とする。

## 次のPhase

Phase 10: 最終レビューゲート
