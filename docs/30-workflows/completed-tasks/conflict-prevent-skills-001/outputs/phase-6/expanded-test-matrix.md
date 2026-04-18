# Phase 6 Output: 拡張テストマトリクス

## EC-6-01: driver 未登録時の fail-fast

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| 前提     | `merge.ours.driver` が未設定                                                     |
| 操作     | indexes/\*.md に差分がある状態で `git merge`                                     |
| 期待値   | Git が fallback merge を試みるか conflict を出す。session-init.sh の warn が出る |
| 検出方法 | `git config --get merge.ours.driver` → 空                                        |

## EC-6-02: regenerate 後も差分が残るケース

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 前提     | references/ に新ファイルが追加済み                               |
| 操作     | `node scripts/generate-index.js` を実行                          |
| 期待値   | topic-map.md が更新され、2回目の実行では diff なし（idempotent） |
| 検出方法 | 2回目実行後に `git diff indexes/topic-map.md` → 空               |

## EC-6-03: LOGS.md archive threshold 未満のケース

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| 前提     | LOGS.md が archive threshold 未満の行数                |
| 操作     | 両ブランチで追記して merge                             |
| 期待値   | `merge=union` で両追記が統合され、archive は起動しない |
| 検出方法 | merge 後に両ブランチの追記行が存在する                 |

## EC-6-04: EVALS consumer が見つかったケース（仮定）

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| 前提   | EVALS.json を参照する TS/JS コードが見つかった場合                    |
| 操作   | consumer のコードを確認                                               |
| 期待値 | schema 変更なしで本 task を完了し、consumer audit を follow-up に移す |
| 判定   | EVALS は本 task で schema 変更しない（AC-6）                          |
