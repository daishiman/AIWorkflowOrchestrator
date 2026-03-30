# Phase 2 Layer Check Catalog

## Layer 1

| ID       | 観点                                | 期待結果               |
| -------- | ----------------------------------- | ---------------------- |
| `L1-001` | `SKILL.md` 存在                     | missing なら `error`   |
| `L1-002` | `agents/` ディレクトリ存在          | missing なら `error`   |
| `L1-003` | `agents/` 配下に 1 ファイル以上存在 | 0件なら `error`        |
| `L1-004` | `references/` 存在                  | missing なら `warning` |
| `L1-005` | `output-schema.json` 存在           | missing なら `warning` |

## Layer 2

| ID       | 観点                                      | 期待結果                |
| -------- | ----------------------------------------- | ----------------------- |
| `L2-001` | `SKILL.md` に概要がある                   | missing なら `error`    |
| `L2-002` | `SKILL.md` に Trigger がある              | missing なら `error`    |
| `L2-003` | `SKILL.md` に Anchors がある              | missing なら `error`    |
| `L2-004` | 見出し構造が崩れていない                  | 崩れたら `warning`      |
| `L2-005` | agent spec に責務がある                   | missing なら `error`    |
| `L2-006` | agent spec の必須セクションがある         | 欠落なら `error`        |
| `L2-007` | `output-schema.json` がある場合 JSON 妥当 | parse fail なら `error` |
