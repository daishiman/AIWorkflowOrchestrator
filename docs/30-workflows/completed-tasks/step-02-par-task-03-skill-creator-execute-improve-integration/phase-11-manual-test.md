# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 11                                                            |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

ユーザー視点で create / execute / improve の単一セッション導線を手動検証し、スクリーンショット取得と Apple UI/UX レビュー観点で視覚品質を確認する。

## 実行タスク

- 手動シナリオ実施: create / execute / improve / wizard secondary action を通す
- スクリーンショット取得: 各シナリオの代表画面を保存する
- 視覚レビュー実施: Apple UI/UX レビュー観点で情報階層、余白、視線誘導を確認する
- 逸脱記録: 途中離脱、視認性課題、表現の不整合を記録する

## 参照資料

| 資料名                    | パス                                                                            | 説明           |
| ------------------------- | ------------------------------------------------------------------------------- | -------------- |
| アーキテクチャ設計        | `outputs/phase-2/architecture-design.md`                                        | Phase 2 成果物 |
| セッション状態設計        | `outputs/phase-2/session-state-design.md`                                       | Phase 2 成果物 |
| 実装記録                  | `outputs/phase-5/implementation-summary.md`                                     | Phase 5 成果物 |
| テスト拡充結果            | `outputs/phase-6/test-expansion-report.md`                                      | Phase 6 成果物 |
| カバレッジレポート        | `outputs/phase-7/coverage-report.md`                                            | Phase 7 成果物 |
| リファクタリング記録      | `outputs/phase-8/refactoring-log.md`                                            | Phase 8 成果物 |
| 品質保証レポート          | `outputs/phase-9/quality-assurance-report.md`                                   | Phase 9 成果物 |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-report.md`                                       | 手動テスト前提 |
| UI/UX ナビゲーション仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | 導線評価基準   |
| UI コンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 視覚要件       |

## 実行手順

### ステップ1: 手動シナリオを実行する

自然言語 create、作成直後の execute、実行結果から improve、wizard secondary action を順番に確認する。

### ステップ2: スクリーンショットを取得する

各シナリオの開始時と完了時を撮影し、成果物へ保存する。

### ステップ3: Apple UI/UX 観点で視覚レビューする

情報階層、余白、ラベルの分かりやすさ、アクションの主従関係を確認する。

## テストケース

| ID       | シナリオ                        | 期待結果                                         |
| -------- | ------------------------------- | ------------------------------------------------ |
| TC-11-01 | 自然言語で新規 skill を作成する | create 成功後に作成結果と選択状態が表示される    |
| TC-11-02 | 作成直後に execute を実行する   | 実行結果が同一セッション内に表示される           |
| TC-11-03 | 実行結果から improve を実行する | analysis と improvement summary が表示される     |
| TC-11-04 | 詳細設定 wizard を開閉する      | 一次導線を壊さず secondary action として動作する |

## 画面カバレッジマトリクス

| 画面状態              | テストケース | スクリーンショット成果物                                                                               |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| create 前後の代表状態 | TC-11-01     | `outputs/phase-11/screenshots/tc-11-01-start.png`, `outputs/phase-11/screenshots/tc-11-01-created.png` |
| execute 完了状態      | TC-11-02     | `outputs/phase-11/screenshots/tc-11-02-executed.png`                                                   |
| improve 完了状態      | TC-11-03     | `outputs/phase-11/screenshots/tc-11-03-improved.png`                                                   |
| wizard 表示状態       | TC-11-04     | `outputs/phase-11/screenshots/tc-11-04-wizard.png`                                                     |

## 統合テスト連携

| 観点                       | 手動確認内容                   | 連携先                    |
| -------------------------- | ------------------------------ | ------------------------- |
| create / execute / improve | 単一セッション完走             | Phase 12 ドキュメント更新 |
| 視覚品質                   | Apple UI/UX 観点のレビュー結果 | Phase 12 ドキュメント更新 |
| 逸脱記録                   | 途中離脱と UI 課題             | Phase 12 未タスク検出     |

## 成果物

| 成果物                 | パス                                      | 説明                      |
| ---------------------- | ----------------------------------------- | ------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`  | シナリオごとの実施結果    |
| 視覚レビュー報告       | `outputs/phase-11/apple-ui-ux-review.md`  | 視覚品質レビュー          |
| 発見課題一覧           | `outputs/phase-11/discovered-issues.md`   | 逸脱の重要度評価          |
| 撮影計画               | `outputs/phase-11/screenshot-plan.json`   | TC と証跡の対応表         |
| 撮影カバレッジ         | `outputs/phase-11/screenshot-coverage.md` | TC と screenshot coverage |
| スクリーンショット一覧 | `outputs/phase-11/screenshots/`           | 代表画面の証跡            |

## 完了条件

- [x] 4 シナリオの結果が記録されている
- [x] スクリーンショットが取得されている
- [x] Apple UI/UX 観点のレビュー結果が記録されている
- [x] 途中離脱ポイントまたは逸脱が整理されている
