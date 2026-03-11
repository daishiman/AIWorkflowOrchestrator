# Phase 8 成果物: 共通化判定

| 対象                      | 判定            | 理由                                              |
| ------------------------- | --------------- | ------------------------------------------------- |
| `GreetingHeader`          | view-local 維持 | ホーム固有の挨拶・overview copy を持つため        |
| `DashboardSuggestionCard` | view-local 維持 | `ViewType` handoff と配色設計がホーム専用         |
| `RecentTimeline`          | view-local 維持 | 「最新 5 件 + historySearch handoff」がホーム固有 |
| `dashboardContent.ts`     | view-local 維持 | suggestion priority が dashboard slice 前提       |

## 共通化しない判断

- 現時点では reuse 先がなく、早い共有化は API drift を生む。
- `TASK-UI-02` / `TASK-UI-06` との責務境界を守るため、shared へ昇格させない。
