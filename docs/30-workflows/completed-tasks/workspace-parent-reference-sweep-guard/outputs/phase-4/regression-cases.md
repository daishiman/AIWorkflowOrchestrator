# 回帰ケース

## Path Drift

| ID         | ケース                                       | 入力                   | 期待結果             |
| ---------- | -------------------------------------------- | ---------------------- | -------------------- |
| RC-PATH-01 | task-060 がローカル不存在リンクを持つ        | fixture task-060       | `path-drift` 1件以上 |
| RC-PATH-02 | task-workflow が旧 04B outputs path を持つ   | fixture task-workflow  | `path-drift` 1件以上 |
| RC-PATH-03 | capture script が旧 04A workflow root を持つ | fixture capture script | `path-drift` 1件以上 |

## Status Drift

| ID           | ケース                                  | 入力                 | 期待結果               |
| ------------ | --------------------------------------- | -------------------- | ---------------------- |
| RC-STATUS-01 | completed-task pointer docs が `未着手` | fixture pointer docs | `status-drift` 1件以上 |
| RC-STATUS-02 | task-090 が `pending`                   | fixture legacy index | `status-drift` 1件以上 |

## Mirror Drift

| ID           | ケース                                   | 入力      | 期待結果               |
| ------------ | ---------------------------------------- | --------- | ---------------------- |
| RC-MIRROR-01 | `.claude` と `.agents` が 1 ファイル違う | temp dirs | `mirror-drift` 1件以上 |

## Green 確認

| ID          | ケース            | 入力      | 期待結果                |
| ----------- | ----------------- | --------- | ----------------------- |
| RC-GREEN-01 | current repo 全体 | real repo | `ok=true`, 全 drift 0件 |
