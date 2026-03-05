# Phase 7: テストカバレッジ確認

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 7                              |
| Phase名      | テストカバレッジ確認           |
| 前提Phase    | Phase 5, Phase 6               |
| 後続Phase    | Phase 8                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-B                     |

## 目的

ViewType関連分岐とナビ契約の検証範囲を数値化し、品質ゲート通過判定の基準を固定する。

## 実行タスク

- 測定指標定義: Line/Branch/Functionの目標値を固定する。
- 観測点定義: `renderView` とナビショートカットの観測点を定義する。
- ギャップ判定: 目標未達時の再作業条件を定義する。

## 参照資料

| 参照資料       | パス                                                                                        | 内容         |
| -------------- | ------------------------------------------------------------------------------------------- | ------------ |
| Phase 5仕様    | `phase-5-implementation.md`                                                                 | 実装計画     |
| Phase 6仕様    | `phase-6-test-expansion.md`                                                                 | 回帰計画     |
| 回帰マトリクス | `outputs/phase-6/regression-matrix.md`                                                      | 測定対象     |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 閾値         |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 分岐網羅観点 |

## システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容           |
| ------------ | ------------------------------------------------------------------------------------------- | -------------- |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ目標 |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 分岐測定対象   |
| エラー仕様   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗時扱い     |

## 実行手順

### ステップ1: 指標設定

Line/Branch/Functionの目標値を成果物へ記録する。

### ステップ2: 観測点整理

主要分岐と主要導線を観測点として一覧化する。

### ステップ3: ギャップ判定定義

未達時の戻り先と追加試験条件を定義する。

## 統合テスト連携

| 観点       | 内容                                      |
| ---------- | ----------------------------------------- |
| 測定連携   | 分岐単位でTC-IDとカバレッジ項目を紐付ける |
| ゲート連携 | Phase 10の最終判定に同じ閾値を再利用する  |
| 戻り連携   | 未達時はPhase 6に戻る運用を固定する       |

## 成果物

| 成果物                 | パス                                        | 内容          |
| ---------------------- | ------------------------------------------- | ------------- |
| カバレッジ目標レポート | `outputs/phase-7/coverage-target-report.md` | 閾値と測定点  |
| カバレッジゲート判定   | `outputs/phase-7/coverage-gate-result.md`   | Pass/Fail条件 |

## 完了条件

- [x] Line/Branch/Functionの閾値が定義されている
- [x] 観測点が分岐IDで識別できる
- [x] 未達時の戻り条件が定義されている
- [x] Phase 10への再利用条件が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 8: リファクタリング

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                         | 仕様参照先                                         |
| ------------------ | -------------------------------- | -------------------------------------------------- |
| テスタビリティ     | カバレッジ基準が主目的のため適用 | `aiworkflow-requirements: quality-requirements.md` |
| アーキテクチャ     | 分岐観測点を固定するため適用     | `aiworkflow-requirements: architecture-*.md`       |
| エラーハンドリング | 未達時の処理定義のため適用       | `aiworkflow-requirements: error-handling.md`       |

## サブタスク管理

1. 参照資料の確認
2. 指標設定
3. 観測点整理
4. ギャップ判定定義
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
