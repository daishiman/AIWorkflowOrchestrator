# Unified Task Execution Index

UI/UX/バックエンドを1ディレクトリで実行するための統合インデックス。

## 実行順序（単一フロー）

### Phase 0: 参照と実行計画

1. `task-001-skill-creator-integration.md`
2. `task-002-task-template.md`
3. `task-003-execution-plan.md`

### Phase 1: 契約ギャップ先行解消（UT）

4. `task-010-ut-skill-import-channel-conflict-001.md`
5. `task-011-ut-ipc-data-flow-type-gaps-001.md`
6. `task-012-ut-skill-ipc-preload-extension-001.md`
7. `task-013-task9-ui-backend-consistency-improvements-001.md`

### Phase 2: バックエンド基幹（直列）

8. `task-020-task-9b-skill-creator.md`
9. `task-021-task-9a-skill-editor.md`
10. `task-022-task-9f-skill-share.md`

### Phase 3: バックエンド拡張（並列）

11. `task-023a-task-9g-skill-schedule.md`（並列）
12. `task-023b-task-9h-skill-debug.md`（並列）
13. `task-023c-task-9i-skill-docs.md`（並列）
14. `task-023d-task-9j-skill-analytics.md`（並列）
15. `task-023e-task-9d-skill-chain.md`（並列）
16. `task-023f-task-9e-skill-fork.md`（並列）

### Phase 4: UIスキル管理（直列）

17. `task-030-ui-05-skill-center-view.md`
18. `task-031-ui-05a-skill-editor-view.md`
19. `task-032-ui-05b-skill-advanced-views.md`

### Phase 5: 10A統合

20. `task-040-task-10a-skill-lifecycle.md`
21. `task-041a-task-10a-a-management-panel.md`（並列）
22. `task-041b-task-10a-b-analysis-view.md`（並列）
23. `task-041c-task-10a-c-create-wizard.md`（並列）
24. `task-042-task-10a-d-integration.md`（最終統合）

### Phase 6: UI/UX基盤トラック（独立管理）

25. `task-050-ui-00-ui-design-foundation.md`
26. `task-051-ui-00-1-design-tokens.md`
27. `task-052-ui-00-2-atoms-components.md`
28. `task-053-ui-00-3-molecules-components.md`
29. `task-054-ui-00-4-organisms-components.md`
30. `task-055-ui-00-foundation-reflection-audit.md`
31. `task-056-ui-01-store-ipc-architecture.md`
32. `task-057-ui-02-global-nav-core.md`
33. `task-058-ui-03-agent-view-enhancement.md`
34. `task-059-ui-04-workspace-view.md`
35. `task-060-ui-04a-workspace-layout-filebrowser.md`
36. `task-061-ui-04b-workspace-chat-panel.md`
37. `task-062-ui-04c-workspace-preview-quicksearch.md`
38. `task-063-ui-06-history-search-view.md`
39. `task-064-ui-07-dashboard-enhancement.md`
40. `task-065-ui-08-notification-center.md`
41. `task-066-ui-09-onboarding-wizard.md`

## 並列実行ルール

- `task-023a`〜`task-023f` は同時実行可能。
- `task-041a`〜`task-041c` は同時実行可能。
- `task-042` は `task-041a/b/c` 完了後に実施。
- `task-050`〜`task-066` は UI/UX独立トラックとして、Phase 2〜5 と並列進行可能。

## 管理単位（独立）

- バックエンド/IPC契約: `task-010`〜`task-023f`
- UIスキル管理: `task-030`〜`task-032`
- 統合: `task-040`〜`task-042`
- UI/UX基盤: `task-050`〜`task-066`

## 旧インデックス（参考）

- `task-090-tasks-index-legacy.md`
- `task-091-ui-overhaul-index-legacy.md`
- `task-092-task9-execution-order-index-legacy.md`
