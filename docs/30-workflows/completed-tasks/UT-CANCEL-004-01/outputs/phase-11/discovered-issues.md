# Phase 11 Discovered Issues

## 検出結果サマリー

| ソース         | 検出数 |
| -------------- | ------ |
| 製品不具合     | 0件    |
| 実行環境 block | 1件    |
| 新規未タスク   | 0件    |
| 合計           | 1件    |

## 詳細

| ID                      | 種別        | 重要度 | 状態  | 内容                                                                   |
| ----------------------- | ----------- | ------ | ----- | ---------------------------------------------------------------------- |
| ENV-UT-CANCEL-004-01-01 | environment | medium | noted | worktree `esbuild` host/binary mismatch により Vitest rerun が blocked |

## 判定

新規 formal unassigned task は不要。製品上の未解決事項ではなく、既知の worktree 環境問題として扱う。
