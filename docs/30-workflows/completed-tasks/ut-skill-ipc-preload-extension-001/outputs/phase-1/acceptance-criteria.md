# Phase 1 受け入れ基準

## 検証観点

| 観点                 | 検証コマンド                                                                                 | 期待結果                                  |
| -------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------- | ----- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 30チャネル件数       | `rg -n "skill:(chain                                                                         | fork                                      | importFromSource                                                                                            | schedule                   | debug | docs | analytics)" docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023\*.md docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md` | 9D-9J合計30チャネルが抽出できる |
| handle/on内訳        | 仕様書のチャネル一覧目視確認                                                                 | handle 29 / on 1 (`skill:debug:event`)    |
| 競合回避             | `rg -n "skill:importFromSource" docs/30-workflows/skill-import-agent-system/tasks -g "*.md"` | `skill:import` 競合回避の痕跡が確認できる |
| ワイルドカード不採用 | `rg -n "skill:\*                                                                             | wildcard                                  | ワイルドカード" docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-1/\*.md` | 不採用方針が明記されている |
| 依存関係明示         | `cat docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/artifacts.json`    | 1→2→...の依存が定義されている             |

## 受け入れ基準

1. チャネル定義の総数が30であり、task-9D〜9Jへ一意に割り当て済みである。
2. `skill:debug:event` を唯一の on チャネルとして識別できる。
3. P5/P32/P44/P45対策が要件文書に記録されている。
4. SubAgent-A〜Dの責務境界が重複なく定義されている。

## 前提条件

- 元仕様: `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-012-ut-skill-ipc-preload-extension-001.md`
- task群: 9D〜9J (`task-023e`, `023f`, `022`, `023a`, `023b`, `023c`, `023d`)

## 判定

- 判定: PASS
- 判定日: 2026-02-24
- 判定者: SubAgent-D
