# Phase 4 契約検証ケース

## テストケース一覧（Task 4-1, 4-2）

| ケースID | 対象               | 種別 | 期待結果                                      |
| -------- | ------------------ | ---- | --------------------------------------------- |
| CT-01    | 30チャネル完全一致 | 成功 | 30件一致、欠落0件                             |
| CT-02    | チャネル重複検出   | 失敗 | 重複が存在する場合にFail                      |
| CT-03    | 命名規則違反       | 失敗 | `skill:{group}:{action}` 逸脱でFail           |
| CT-04    | 引数型不整合       | 失敗 | Preload型とHandler型差分でFail                |
| CT-05    | 戻り値型不整合     | 失敗 | Promise戻り値差分でFail                       |
| CT-06    | handle/on混在誤り  | 失敗 | `skill:debug:event` 以外のon指定をFail        |
| CT-07    | 競合チャネル再発   | 失敗 | `skill:import` を外部ソース用途で使ったらFail |

## 実行コマンド案

```bash
rg -n "skill:(chain|fork|importFromSource|schedule|debug|docs|analytics)" docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence
rg -n "skill:debug:event" docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence
```

## SubAgent分担

- SubAgent-A: CT-01,02,03
- SubAgent-B: CT-04,05,06
- SubAgent-D: CT-07と総合判定

## 完了状態

- Phase 4 Task 4-1/4-2: Completed
