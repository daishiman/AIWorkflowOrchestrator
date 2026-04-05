# TASK-P0-05 実装ガイド: execute フェーズ -> SkillFileWriter 統合

## 概要

TASK-P0-05 は `RuntimeSkillCreatorFacade.execute()` の中で、`parseLlmResponseToContent()` により抽出したコンテンツを `SkillFileWriter.persist()` で永続化する統合パスを保証する。

## 1. データフロー（要約）

```
execute()
  -> parseLlmResponseToContent(sdkEvents)
  -> if content != null and skillFileWriter injected
       skillFileWriter.persist(planResult.skillName, content, { overwrite: true })
  -> return { persistResult, persistError, ... }
```

## 2. 条件分岐（Current Facts）

| 条件                          | 期待動作                            | 検証テスト        |
| ----------------------------- | ----------------------------------- | ----------------- |
| content あり + Writer 注入    | persist 実行                        | F-01, F-02        |
| persist 失敗/例外             | persistError 設定（success は維持） | F-03, E-10 ~ E-14 |
| コードブロックなし/parse null | persist スキップ                    | F-05, E-28        |
| execute 失敗                  | persist スキップ                    | F-06              |
| Writer 未注入                 | warn + スキップ                     | F-04, E-16, E-29  |
| PATH_TRAVERSAL/rollback       | persistError に反映                 | E-21 ~ E-25       |
| 回帰ガード                    | executeResult のフィールド維持      | E-26 ~ E-29       |

## 3. OutputHandler との責務分離（別系統）

`SkillCreatorOutputHandler` は `SkillCreatorIpcBridge` 経由の session-output パイプラインであり、本タスクの正式パス（Facade -> Writer）とは別系統。
`toSlug()` は path-safe（`/` `\\` `..` `\\0` を無効化、空は `unnamed-skill`）。
