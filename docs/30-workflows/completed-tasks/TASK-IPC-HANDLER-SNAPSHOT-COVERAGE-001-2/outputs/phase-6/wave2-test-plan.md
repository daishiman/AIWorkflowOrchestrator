# Phase 6 Wave 2 Test Plan

## 方針

- Wave 1 を Green 化してから Wave 2 に進む
- `REG-SNAP` / `REG-DEDUP` / `REG-COUNT` の契約を LLM と同じ形で横展開する

## 対象

- registerFileHandlers
- registerFsHandlers
- registerStoreHandlers
- registerUserSettingsHandlers
- registerAIHandlers
- registerDashboardHandlers
- registerGraphHandlers
- registerAuthHandlers
- registerApiKeyHandlers
- registerHistoryHandlers
- registerHistorySearchHandlers
- registerNotificationHandlers
- registerAgentSkillHandlers
- registerCommunityHandlers
- registerSkillScheduleHandlers
- registerSkillAnalyticsHandlers

## 着手条件

1. `esbuild` 不整合を解消する
2. Wave 1 の 7 テストを作成する
3. `coverage-report.md` で Wave 1 完了率 100% を確認する
