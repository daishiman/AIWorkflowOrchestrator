# Phase 8 Output: Discovery Link Adjustments

## representative discovery hits

| 入口                 | ヒット                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `quick-reference.md` | `ui-ux-feature-components.md`, `arch-state-management.md`, `task-workflow.md`, `lessons-learned.md` |
| `resource-map.md`    | `api-ipc-agent.md`, `ui-ux-feature-components.md`, `deployment.md`, `task-workflow.md`              |
| parent file          | `仕様書インデックス` 経由で child companion へ到達                                                  |

## 調整内容

- child file 名を parent table に明示し、深掘り経路を parent で閉じた
- F1 の archive 導線は `LOGS.md` → `logs-archive-index.md`、`task-workflow.md` → `backlog/history`、`lessons-learned.md` → category child に正規化した
- `generate-index.js` 再生成により resource map / quick reference の file inventory を更新した
