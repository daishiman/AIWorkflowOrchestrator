# Phase 2 チャネル設計書

## 設計方針

- 方針1: `IPC_CHANNELS` は個別定数を維持し、ワイルドカードを不採用にする。
- 方針2: 定数名は `SKILL_<GROUP>_<ACTION>` で統一する。
- 方針3: `skill:debug:event` のみ on チャネルとして明示管理する。

## 30チャネル対応表

| task | 定数名（案）                    | 文字列                          | 方式   |
| ---- | ------------------------------- | ------------------------------- | ------ |
| 9D   | `SKILL_CHAIN_LIST`              | `skill:chain:list`              | handle |
| 9D   | `SKILL_CHAIN_GET`               | `skill:chain:get`               | handle |
| 9D   | `SKILL_CHAIN_SAVE`              | `skill:chain:save`              | handle |
| 9D   | `SKILL_CHAIN_DELETE`            | `skill:chain:delete`            | handle |
| 9D   | `SKILL_CHAIN_EXECUTE`           | `skill:chain:execute`           | handle |
| 9E   | `SKILL_FORK`                    | `skill:fork`                    | handle |
| 9F   | `SKILL_IMPORT_FROM_SOURCE`      | `skill:importFromSource`        | handle |
| 9F   | `SKILL_EXPORT`                  | `skill:export`                  | handle |
| 9F   | `SKILL_VALIDATE_SOURCE`         | `skill:validateSource`          | handle |
| 9G   | `SKILL_SCHEDULE_LIST`           | `skill:schedule:list`           | handle |
| 9G   | `SKILL_SCHEDULE_ADD`            | `skill:schedule:add`            | handle |
| 9G   | `SKILL_SCHEDULE_UPDATE`         | `skill:schedule:update`         | handle |
| 9G   | `SKILL_SCHEDULE_DELETE`         | `skill:schedule:delete`         | handle |
| 9G   | `SKILL_SCHEDULE_TOGGLE`         | `skill:schedule:toggle`         | handle |
| 9H   | `SKILL_DEBUG_START`             | `skill:debug:start`             | handle |
| 9H   | `SKILL_DEBUG_COMMAND`           | `skill:debug:command`           | handle |
| 9H   | `SKILL_DEBUG_BREAKPOINT_ADD`    | `skill:debug:breakpoint:add`    | handle |
| 9H   | `SKILL_DEBUG_BREAKPOINT_REMOVE` | `skill:debug:breakpoint:remove` | handle |
| 9H   | `SKILL_DEBUG_INSPECT`           | `skill:debug:inspect`           | handle |
| 9H   | `SKILL_DEBUG_EVALUATE`          | `skill:debug:evaluate`          | handle |
| 9H   | `SKILL_DEBUG_EVENT`             | `skill:debug:event`             | on     |
| 9I   | `SKILL_DOCS_GENERATE`           | `skill:docs:generate`           | handle |
| 9I   | `SKILL_DOCS_PREVIEW`            | `skill:docs:preview`            | handle |
| 9I   | `SKILL_DOCS_EXPORT`             | `skill:docs:export`             | handle |
| 9I   | `SKILL_DOCS_TEMPLATES`          | `skill:docs:templates`          | handle |
| 9J   | `SKILL_ANALYTICS_RECORD`        | `skill:analytics:record`        | handle |
| 9J   | `SKILL_ANALYTICS_STATISTICS`    | `skill:analytics:statistics`    | handle |
| 9J   | `SKILL_ANALYTICS_SUMMARY`       | `skill:analytics:summary`       | handle |
| 9J   | `SKILL_ANALYTICS_TREND`         | `skill:analytics:trend`         | handle |
| 9J   | `SKILL_ANALYTICS_EXPORT`        | `skill:analytics:export`        | handle |

## 重複検査

- 文字列重複: 0件
- 定数名重複: 0件
- task未割当: 0件

## SubAgentレビュー

- SubAgent-A: 契約名・命名規則を監査しPASS。
- SubAgent-B: Preload公開可否（invoke/on）を監査しPASS。
- SubAgent-C: 型参照の命名一貫性を監査しPASS。
- SubAgent-D: 統合判定 PASS。

## 完了状態

- Phase 2 Task 2-1: Completed
