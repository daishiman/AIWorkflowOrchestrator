# Phase 11: 手動テスト検証

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| Phase        | 11                                                                      |
| Phase名      | 手動テスト検証                                                          |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase    | Phase 12                                                                |
| ステータス   | completed                                                               |
| 作成日       | 2026-03-05                                                              |
| 機能名       | task-056d-viewtype-routing-nav                                          |
| 担当SubAgent | SubAgent-C                                                              |

## 目的

ViewType拡張後の画面遷移とナビ導線を手動観点で検証する計画を定義し、実装後の検証抜けを防ぐ。

## 実行タスク

- 手動試験項目定義: 主要導線、ショートカット、境界ケースの試験項目を定義する。
- 画面証跡計画定義: スクリーンショット対象とTC-IDの対応を定義する。
- 発見課題管理定義: 問題の重要度分類と記録様式を定義する。

## 参照資料

| 参照資料         | パス                                                                        | 内容           |
| ---------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 2仕様      | `phase-2-design.md`                                                         | 設計基準       |
| Phase 5仕様      | `phase-5-implementation.md`                                                 | 実装計画       |
| Phase 7仕様      | `phase-7-coverage-check.md`                                                 | カバレッジ基準 |
| Phase 8仕様      | `phase-8-refactoring.md`                                                    | 改善基準       |
| Phase 9仕様      | `phase-9-quality-assurance.md`                                              | QA基準         |
| Phase 10仕様     | `phase-10-final-review.md`                                                  | 判定条件       |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                   | 検証入力       |
| テスト拡充計画   | `outputs/phase-6/test-expansion-plan.md`                                    | ケース入力     |
| 画面検証ガイド   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | Phase 11運用   |
| ナビ正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`     | 導線正本       |

## システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                           | 内容           |
| ---------------- | ------------------------------------------------------------------------------ | -------------- |
| UIナビゲーション | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | 試験期待値     |
| UI設計原則       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | 画面品質観点   |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 手動検証品質   |
| エラー仕様       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | 異常表示期待値 |

## 実行手順

### ステップ1: 試験ケース定義

TC-ID、前提、操作、期待結果を表形式で定義する。

### ステップ2: 画面証跡計画定義

TC-IDごとに証跡ファイル名、撮影状態、検証観点を定義する。

### ステップ3: 問題記録定義

問題分類、優先度、再現手順を記録する形式を定義する。

## テストケース

| TC-ID    | 観点        | 手順                                 | 期待結果                 |
| -------- | ----------- | ------------------------------------ | ------------------------ |
| TC-11-01 | Desktopナビ | Dashboard表示後、Workspaceをクリック | Workspace画面に遷移      |
| TC-11-02 | Desktopナビ | WorkspaceからSkill Centerへ移動      | Skill Center画面に遷移   |
| TC-11-03 | Desktopナビ | Skill CenterからHistory Searchへ移動 | History Search画面に遷移 |
| TC-11-04 | Mobileナビ  | モバイル表示でHistory Searchをタップ | History Search画面に遷移 |
| TC-11-05 | Shortcut    | Cmd/Ctrl+1..8, Cmd/Ctrl+, を順に入力 | 各ViewTypeへ遷移         |

## 画面カバレッジマトリクス

| TC-ID    | 証跡                                                   | 判定       |
| -------- | ------------------------------------------------------ | ---------- |
| TC-11-01 | `screenshots/TC-056D-11-01-dashboard-desktop.png`      | SCREENSHOT |
| TC-11-02 | `screenshots/TC-056D-11-02-workspace-desktop.png`      | SCREENSHOT |
| TC-11-03 | `screenshots/TC-056D-11-03-skill-center-desktop.png`   | SCREENSHOT |
| TC-11-04 | `screenshots/TC-056D-11-05-history-search-mobile.png`  | SCREENSHOT |
| TC-11-05 | `screenshots/TC-056D-11-04-history-search-desktop.png` | SCREENSHOT |

## 統合テスト連携

| 観点     | 内容                                       |
| -------- | ------------------------------------------ |
| TC連携   | Phase 4のTC-IDを手動試験へ継承する         |
| 証跡連携 | 各TC-IDに証跡ファイルを紐付ける            |
| 課題連携 | 発見課題をPhase 12の未タスク判定へ連携する |

## 成果物

| 成果物             | パス                                    | 内容       |
| ------------------ | --------------------------------------- | ---------- |
| 手動テスト計画     | `outputs/phase-11/manual-test-plan.md`  | TC定義     |
| 画面証跡マトリクス | `outputs/phase-11/screenshot-matrix.md` | 証跡対応表 |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md` | 問題記録   |

## 完了条件

- [x] 主要導線の手動テストケースが定義されている
- [x] 各TC-IDに証跡計画が紐付いている
- [x] 問題記録フォーマットが定義されている
- [x] Phase 12への連携項目が明示されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 12: ドキュメント更新

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                         | 仕様参照先                                   |
| ------------------ | -------------------------------- | -------------------------------------------- |
| UI/UX              | 手動試験対象が画面導線のため適用 | `aiworkflow-requirements: ui-ux-*.md`        |
| アクセシビリティ   | キーボード導線確認のため適用     | `aiworkflow-requirements: ui-ux-*.md`        |
| エラーハンドリング | 異常表示確認のため適用           | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

1. 参照資料の確認
2. 試験ケース定義
3. 画面証跡計画定義
4. 問題記録定義
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
