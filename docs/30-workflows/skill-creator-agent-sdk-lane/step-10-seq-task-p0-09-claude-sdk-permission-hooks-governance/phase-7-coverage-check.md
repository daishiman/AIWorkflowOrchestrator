# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 7                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

phase 別 policy、hook、audit の coverage を確認する。

## 実行タスク

- phase ごとの policy coverage 確認
- hook coverage 確認
- denial 表示 coverage 確認

## 参照資料

| 資料名  | パス                       | 説明   |
| ------- | -------------------------- | ------ |
| Phase 1 | `phase-1-requirements.md`  | 要件   |
| Phase 4 | `phase-4-test-creation.md` | テスト |

## 実行手順

### ステップ1: phase 別 coverage を確認する

- plan / execute / verify / improve の coverage を確認する

### ステップ2: hook coverage を確認する

- SessionStart / PreToolUse / PostToolUse / SessionEnd の coverage を確認する

### ステップ3: denial 表示 coverage を確認する

- UI / audit / log に denial の理由が残るかを確認する

### ステップ4: dependency edge を可視化する

- upstream / downstream の missing edge がないか確認する

## 成果物

| 成果物          | パス                                 | 説明     |
| --------------- | ------------------------------------ | -------- |
| coverage report | `outputs/phase-7/coverage-report.md` | coverage |

## 完了条件

- [x] coverage が可視化されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 4 / 6 の test matrix を coverage view に集約する
- Phase 8 の refactor 前提として重複ロジックを抽出する

## coverage matrix

| 観点   | 見るもの              | 期待                                   |
| ------ | --------------------- | -------------------------------------- |
| policy | phase 別 allow / deny | plan/execute/verify/improve が分かれる |
| hook   | event order           | SessionStart 〜 SessionEnd が追える    |
| audit  | provenance / denial   | reason 付きで記録される                |
| UI     | denial 表示           | 理由つきで表示される                   |

## 多角的チェック観点（AIが判断）

- concern × command × dependency edge が MECE か
- denial / hook / audit の coverage が揃っているか
- coverage report が実装者の次行動に繋がるか

## サブタスク管理

| SubAgent   | 責務                   |
| ---------- | ---------------------- |
| SubAgent-A | phase coverage 集計    |
| SubAgent-B | hook coverage 確認     |
| SubAgent-C | dependency edge 可視化 |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 8: リファクタリング
