# Phase 6 Output: Generated Index Regression

## 実行結果

| 項目                      | 値   |
| ------------------------- | ---- |
| `generate-index.js` 実行  | PASS |
| `topic-map.md` 行数       | 3504 |
| `quick-reference.md` 行数 | 423  |
| `resource-map.md` 行数    | 382  |
| `keywords.json` 再生成    | PASS |

## 判定

- `quick-reference.md` と `resource-map.md` は line budget 内
- `topic-map.md` は generated artifact のまま 500 行超を維持
- parent / child 数の増加により `topic-map.md` は docs-only reform 後にさらに膨らむため、generator-aware sharding が必要

## follow-up

- `docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md` を formalize 済み
