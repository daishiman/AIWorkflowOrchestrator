# Phase 6 child companion ラベル確認レポート - UT-VERIFY-DOC-CONSOLIDATION-001

## 確認対象と結果

| ファイル                                                             | `> 役割:` 有無            | `> 区分:` 有無             | 対応状況           |
| -------------------------------------------------------------------- | ------------------------- | -------------------------- | ------------------ |
| `task-workflow-completed.md`                                         | あり（completed records） | **あり（Phase 5 で追記）** | 対応済み           |
| `task-workflow-active.md`                                            | あり（active guide）      | **あり（Phase 5 で追記）** | 対応済み           |
| `interfaces-skill-verify-contract.md`                                | なし                      | **あり（Phase 5 で追記）** | 対応済み           |
| `task-workflow-completed-workspace-chat-lifecycle-tests.md`          | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-ipc-graceful-degradation-lifecycle.md`      | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-notification-history-auth-key-state.md`     | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-skill-import-skill-center-nav.md`           | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-advanced-views-analytics-audit.md`          | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-debug-scheduler-doc-generation-theme.md`    | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-ipc-contract-preload-alignment.md`          | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-quality-gates-module-resolution-logging.md` | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-abort-contract-auth-session-chat.md`        | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`  | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-skill-lifecycle.md`                         | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-skill-create-ui-integration.md`             | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-completed-ui-ux-visual-baseline-drift.md`             | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-history.md`                                           | なし                      | なし                       | 本タスクスコープ外 |
| `task-workflow-backlog.md`                                           | なし                      | なし                       | 本タスクスコープ外 |

## スコープ判断

child companion の `task-workflow-completed-*.md` 群への `> 区分:` 追記は本タスク UT-VERIFY-DOC-CONSOLIDATION-001 のスコープ外とする。

**根拠:**

- 本タスクの FR-001〜FR-005 は4ファイル（`task-workflow.md` / `completed.md` / `active.md` / `interfaces-skill-verify-contract.md`）への適用に限定されている
- child companion 全件への一括対応は後続タスクとして切り出す候補（task-workflow-backlog.md に追記予定）

## 完了確認

- [x] 全 child companion のラベル確認が完了している
- [x] 優先度評価（本タスクスコープ内か否か）が完了している
