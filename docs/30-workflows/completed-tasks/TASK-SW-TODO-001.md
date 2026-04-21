# ConversationRoundStep 主ツールバッジ TODOコメント整理 - 完了記録

## メタ情報

```yaml
issue_number: 2225
task_id: TASK-SW-TODO-001
status: completed
priority: low
scale: tiny
task_type: CLEANUP
completion_date: 2026-04-20
canonical_workflow: docs/30-workflows/p05-opt-TODO-001/
```

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | TASK-SW-TODO-001                                                         |
| タスク名   | todo-001-cleanup-main-tool-badge-todo-comment                            |
| 分類       | クリーンアップ / verify_existing                                         |
| ステータス | 完了                                                                     |
| 根拠       | PR #2199（commit `2fcca99de`）時点で cleanup 実装済み                    |
| 現在の責務 | stale premise を task spec / evidence / system spec に同期する close-out |
| 仕様書     | `docs/30-workflows/p05-opt-TODO-001/`                                    |

## 要約

このタスクは「TODO をこれから削除する作業」ではなく、「すでに削除済みである事実を確認し、task spec と台帳を current fact へ合わせる作業」として完了した。

## current facts

- `ConversationRoundStep.tsx` に `TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` は存在しない
- `MAIN_TOOL_BADGE_ENABLED` と `shouldShowMainToolBadge` は削除済み
- `SkillCreateWizard.tsx` は `resolveExternalIntegration(toolNames: string[])` current contract を保持する
- close-out 証跡は `docs/30-workflows/p05-opt-TODO-001/outputs/phase-11/` と `outputs/phase-12/` に保存した

## 成果物

| 成果物                    | パス                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| workflow root             | `docs/30-workflows/p05-opt-TODO-001/`                                                        |
| Phase 11 正本             | `docs/30-workflows/p05-opt-TODO-001/outputs/phase-11/manual-test-result.md`                  |
| Phase 11 primary evidence | `docs/30-workflows/p05-opt-TODO-001/outputs/phase-11/TASK-SW-TODO-001-manual-test-report.md` |
| Phase 12 close-out        | `docs/30-workflows/p05-opt-TODO-001/outputs/phase-12/`                                       |

## 備考

- stale な未完了 narrative は本ファイルから除去済み
- 追加の未タスクは検出されていない
