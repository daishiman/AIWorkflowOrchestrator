# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 3                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

Phase 2 設計が 4条件と AC を満たしているかを判定し、Phase 4 へ進めるかを決める。

## 実行タスク

- 設計レビュー: 4条件と責務境界の整合を確認する
- リスク分類: 既存 review flow 破壊、unknown option fallback、artifact 型整合を確認する
- ゲート判定: PASS / MINOR / MAJOR を記録する

## 参照資料

| 資料名                   | パス                                  | 説明         |
| ------------------------ | ------------------------------------- | ------------ |
| phase 1 requirements     | `outputs/phase-1/requirements.md`     | 原要件       |
| phase 2 design           | `outputs/phase-2/design.md`           | レビュー対象 |
| phase 2 transition table | `outputs/phase-2/transition-table.md` | 遷移詳細     |
| gate decision            | `outputs/phase-3/gate-decision.md`    | 判定記録     |

## 実行手順

### ステップ1: 4条件で設計を評価する

矛盾なし、漏れなし、整合性あり、依存関係整合の観点で設計を評価する。

### ステップ2: 実装開始条件を確定する

owner 境界、fallback、test 観点が十分なら Phase 4 へ進める。

## 統合テスト連携

- Phase 4 に持ち込む test matrix の coverage 観点をゲート条件に含める

## 成果物

| 成果物     | パス                               | 説明                  |
| ---------- | ---------------------------------- | --------------------- |
| ゲート判定 | `outputs/phase-3/gate-decision.md` | PASS / blocker の記録 |

## 完了条件

- [x] 4条件のレビュー結果が記録されている
- [x] 実装前 blocker の有無が明記されている
- [x] Phase 4 へ渡す test 観点が閉じている
- [x] 本Phase内の全タスクを100%実行完了
