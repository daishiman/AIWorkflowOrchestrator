# Phase 12 Output: Generated Index Status

## 測定

| 項目         | 値                                                                  |
| ------------ | ------------------------------------------------------------------- |
| 測定対象     | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`       |
| 測定コマンド | `wc -l .claude/skills/aiworkflow-requirements/indexes/topic-map.md` |
| 行数         | 3520                                                                |
| 判定         | blocked dependency                                                  |

## 理由

- `generate-index.js` 再生成後も 500 行以下にならない
- 親タスクでは docs-only reform を責務とし、generator 実装変更はスコープ外

## follow-up

- `docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md`
