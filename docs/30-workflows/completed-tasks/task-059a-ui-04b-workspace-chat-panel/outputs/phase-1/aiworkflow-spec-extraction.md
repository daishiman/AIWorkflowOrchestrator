# Phase 1 aiworkflow-requirements 抽出

| 分類         | 仕様書                                   | 04Bで使用した契約                              |
| ------------ | ---------------------------------------- | ---------------------------------------------- |
| UI           | `references/ui-ux-feature-components.md` | Workspace 04A/04B の責務分離と UI 構成         |
| State        | `references/arch-state-management.md`    | `workspaceSlice` / `fileSelectionSlice` 再利用 |
| LLM          | `references/interfaces-llm.md`           | stream API の境界                              |
| Conversation | `references/interfaces-chat-history.md`  | `conversationAPI.create/addMessage` 契約       |
| Security     | `references/security-electron-ipc.md`    | preload allowlist 経由のみで通信               |
| Workflow     | `references/task-workflow.md`            | 完了台帳・未タスク・証跡同期                   |
| Lessons      | `references/lessons-learned.md`          | 04Bの再発防止知見の記録先                      |
