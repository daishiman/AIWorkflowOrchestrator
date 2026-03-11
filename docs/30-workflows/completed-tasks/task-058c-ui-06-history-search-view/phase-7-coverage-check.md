# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 7                              |
| Phase名      | テストカバレッジ確認           |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 6                        |
| 後続Phase    | Phase 8                        |
| 担当SubAgent | SubAgent-D                     |

## 目的

058c の主要変更箇所が coverage とケース密度の両方で十分かを確認し、未検証領域を見える化する。

## 実行タスク

- 対象ファイル特定: view、components、hooks、slice、IPC、shared types を coverage 対象へ固定する
- 閾値定義: line、function、branch の目標を定義する
- gap 分析: 未到達分岐と未検証 UI状態を抽出する

## 参照資料

| 参照資料       | パス                                     | 内容           |
| -------------- | ---------------------------------------- | -------------- |
| Phase 6 成果物 | `outputs/phase-6/`                       | 追加 test 一覧 |
| Phase 5 成果物 | `outputs/phase-5/affected-files-list.md` | 対象ファイル   |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                        | 内容          |
| -------- | --------------------------------------------------------------------------- | ------------- |
| quality  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | coverage 基準 |

## 実行手順

### ステップ1: coverage 対象を固定

変更対象ファイルを workflow 成果物から抽出し、対象外を明記する。

### ステップ2: 閾値を決定

timeline card と slice は branch coverage を高めに設定し、shared types は line coverage を重視する。

### ステップ3: gap を分析

未到達 branch が observer、error、zero state、expand toggle のどれに偏るかを記録する。

## 統合テスト連携

- view、hook、slice、IPC の coverage を同じレポートで追跡する
- screenshot でしか担保できない状態は Phase 11 へ明示移送する
- coverage gap が manual test と重複する場合でも両方に根拠を残す

## 成果物

| 成果物         | パス                                           | 説明               |
| -------------- | ---------------------------------------------- | ------------------ |
| coverage 計画  | `outputs/phase-7/coverage-plan.md`             | 実行対象とコマンド |
| 閾値マトリクス | `outputs/phase-7/coverage-threshold-matrix.md` | 指標一覧           |
| gap analysis   | `outputs/phase-7/gap-analysis.md`              | 未検証箇所         |

## 完了条件

- [x] coverage 対象ファイルが固定されている
- [x] line、function、branch の閾値が定義されている
- [x] 未検証領域の補完先が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク           | 結果      | 備考                                  |
| ---------------- | --------- | ------------------------------------- |
| 対象ファイル特定 | completed | `affected-files-list.md` を基に固定   |
| 閾値定義         | completed | `coverage-threshold-matrix.md` に反映 |
| gap 分析         | completed | `gap-analysis.md` に反映              |

### 発見事項

- 良かった点: 058c 変更面だけで測ることで現実的な coverage を得られた
- 問題点: repository 全体 threshold では task 単位の評価がしづらい
- 改善提案: task-scope coverage runner を共通化したい

### 次Phaseへの引き継ぎ事項

- Phase 8 では coverage gap のうち構造改善で減らせるものを整理する

## 次のPhase

Phase 8: リファクタリングへ進む。
