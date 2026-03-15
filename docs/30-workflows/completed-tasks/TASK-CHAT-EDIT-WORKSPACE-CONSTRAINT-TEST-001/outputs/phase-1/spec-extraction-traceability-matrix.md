# Spec Extraction Traceability Matrix

## 目的

今回実装（workspacePath セキュリティ検証テスト）に必要な仕様を
`.claude/skills/aiworkflow-requirements/` から漏れなく抽出できているかを追跡する。

## 抽出元（canonical）

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`

## マトリクス

| 関心ごと                  | 必要情報                                                | 抽出先仕様                                                             | 反映先（workflow）             | 判定 |
| ------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------ | ---- |
| IPC request/response 契約 | `chat-edit:send-with-context` の payload/response       | `references/api-ipc-agent-core.md`                                     | Phase 1,2,4,5,7,10,11,12       | OK   |
| workspace 境界            | `workspacePath` / `isAllowedPath` / `PERMISSION_DENIED` | `references/llm-workspace-chat-edit.md`                                | Phase 1,2,4,5,6,7,10,11,12     | OK   |
| 型契約                    | `SendWithContextRequest.workspacePath?`                 | `references/interfaces-llm.md`                                         | Phase 1,2,6,9,12               | OK   |
| セキュリティ境界          | sender 検証 / contextBridge / object payload            | `references/security-electron-ipc-core.md`                             | Phase 1,2,4,5,6,7,8,9,10,11,12 | OK   |
| 再発防止知見              | payload ドリフト防止と 5-step 対応                      | `references/lessons-learned-current.md`                                | Phase 1,2,5,8,12,13            | OK   |
| 親タスク整合              | UT-CHAT-EDIT の由来と関連未タスク                       | `references/task-workflow-completed-workspace-chat-lifecycle-tests.md` | index, Phase 6,11,12,13        | OK   |

## 抽出漏れチェック

- 未解決トークン: なし
- 仕様更新要否: なし（テスト追加のみ）

## 結論

今回必要な仕様は canonical root から抽出済み。実装スコープ外論点は未タスク化方針で統制する。
