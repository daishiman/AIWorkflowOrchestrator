# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 7                          |
| Phase名    | テストカバレッジ確認       |
| カテゴリ   | 品質                       |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 6                    |
| 後続Phase  | Phase 8                    |

## 目的

04B で変更した renderer files に対して coverage 下限を満たしているか確認し、抜けを Phase 8 へ渡す。

## 実行タスク

- coverage 計測: changed files の line / branch / function を測定する
- ギャップ分析: 未到達分岐と未確認状態を列挙する
- 補完判断: Phase 8 へ送る不足項目を確定する

## 参照資料

| 参照資料       | パス                                        | 説明           |
| -------------- | ------------------------------------------- | -------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 回帰マトリクス | `outputs/phase-6/regression-matrix.md`      | Phase 6 成果物 |
| 統合テスト結果 | `outputs/phase-6/integration-test.md`       | Phase 6 成果物 |
| a11y ケース    | `outputs/phase-6/accessibility-cases.md`    | Phase 6 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                      |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage gate の正本      |
| testing patterns     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | changed files test の正本 |

## 実行手順

### ステップ1: coverage 基準を適用する

| 指標              | 下限 |
| ----------------- | ---- |
| Line Coverage     | 85%  |
| Branch Coverage   | 80%  |
| Function Coverage | 85%  |

### ステップ2: ギャップを分類する

| 分類          | 例                             |
| ------------- | ------------------------------ |
| stream 異常系 | error / cancel / end 競合      |
| mention 分岐  | 候補 0 件、1 件、複数件        |
| responsive    | compact 状態の UI 分岐         |
| conversation  | create 済み / 新規作成の二分岐 |

## 統合テスト連携

| 観点          | 内容                                                       |
| ------------- | ---------------------------------------------------------- |
| changed files | integration test が changed files を横断しているか確認する |
| state 分岐    | stream / mention / conversation の branch を確認する       |
| manual bridge | Phase 11 の TC に coverage 未達状態が残らないよう引き継ぐ  |

## 多角的チェック観点

| 観点           | このPhaseでの確認内容                                    | 仕様参照先                                                                        |
| -------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 品質           | line / branch / function の不足を分離して記録する        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       |
| テスタビリティ | 未到達分岐を test 追加で埋めるか manual に送るか判定する | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

## 成果物

| 成果物             | パス                                   | 説明               |
| ------------------ | -------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`   | 数値と対象ファイル |
| ギャップ一覧       | `outputs/phase-7/coverage-gap-list.md` | 未達項目一覧       |

## 完了条件

- [x] changed files の coverage 数値を記録している
- [x] 下限未達があればギャップを列挙している
- [x] Phase 8 へ引き継ぐ不足項目を定義している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. coverage 計測
2. changed files 集計
3. ギャップ分類
4. Phase 8 引き継ぎ整理
5. 成果物と完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-7/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 8: リファクタリング](./phase-8-refactoring.md)
