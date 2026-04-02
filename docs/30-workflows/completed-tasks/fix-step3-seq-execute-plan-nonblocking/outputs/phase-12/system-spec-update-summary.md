# Phase 12 成果物: 仕様書更新サマリー

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 12                           |
| タスクID | TASK-FIX-EXECUTE-PLAN-FF-001 |
| 作成日   | 2026-04-01                   |

## 更新対象仕様書一覧

| 仕様書ファイル                                              | 優先度 | 更新内容                                                                         | ステータス  |
| ----------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- | ----------- |
| `security-electron-ipc.md`                                  | should | IPC fire-and-forget パターンをベストプラクティスとして追記                       | ✅ 更新済み |
| `api-ipc-system-core.md`                                    | must   | `skill-creator:execute-plan` の ack/snapshot 契約を現在実装に同期                | ✅ 更新済み |
| `architecture-overview.md`                                  | should | スキル生成フローの非同期アーキテクチャ（fire-and-forget + snapshot relay）を記録 | ✅ 更新済み |
| `task-workflow-completed.md`                                | must   | TASK-FIX-EXECUTE-PLAN-FF-001 の完了を記録                                        | ✅ 更新済み |
| `task-workflow-completed-ipc-contract-preload-alignment.md` | must   | preload/renderer consumer の契約整合（`SkillCreatorExecutePlanAck`）を追記       | ✅ 更新済み |
| `task-workflow-backlog.md`                                  | must   | `executePlan` consumer follow-up + timeout cleanup を未タスクとして追記          | ✅ 更新済み |
| `lessons-learned-current.md`                                | must   | fire-and-forget 化と contract drift の教訓を追記                                 | ✅ 更新済み |
| `indexes/quick-reference.md`                                | must   | 主要入口の更新（`node scripts/generate-index.js` で再生成）                      | ✅ 更新済み |
| `indexes/resource-map.md`                                   | must   | 関連参照先の更新（再生成）                                                       | ✅ 更新済み |
| `indexes/topic-map.md`                                      | must   | トピック別索引の更新（再生成）                                                   | ✅ 更新済み |

## 主要更新内容の詳細

### `api-ipc-system-core.md` への追記（must）

```markdown
## skill-creator:execute-plan

### 現行動作（TASK-FIX-EXECUTE-PLAN-FF-001 以降）

- Main Process: `ipcMain.handle` が即時 `{ accepted: true, planId }` を返す
- バックグラウンド: `RuntimeSkillCreatorFacade.executeAsync()` が Agent SDK query() を実行
- 進捗通知: `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベント経由で snapshot を送信

### 契約整合状態

- preload `skill-creator-api.ts`: `SkillCreatorExecutePlanAck` を正本として `IpcResult<SkillCreatorExecutePlanAck>` に変換済み
- consumer (SkillCreateWizard.tsx, SkillLifecyclePanel.tsx): ack + snapshot relay を受ける compat path を保持
- follow-up: TASK-SKILL-CREATOR-EXECUTE-PLAN-CONSUMER-ALIGNMENT-001（compat shim の削減と direct ack 参照の統一）
```

### `lessons-learned-current.md` への追記（must）

```markdown
## fire-and-forget 化と contract drift（2026-04-01）

**教訓**: IPC ハンドラーの戻り値型を変更する際、preload 層での type guard による差分吸収は有効だが、
consumer 側（Renderer コンポーネント）との契約整合は別タスクとして必ず積むこと。

**原因**: `skill-creator:execute-plan` の戻り値を `{ success: true }` から `{ accepted: true, planId }`
に変更した際、preload の `SkillCreatorExecutePlanAck` 変換で一時的に吸収できたが、
Renderer consumer が compat path を残したままなので完全整合はまだ follow-up として管理が必要。

**対処**: Phase 9 で consumer 影響を記録し、Phase 12 で follow-up 未タスクとして積んだ。
```

## 再生成コマンド

```bash
node scripts/generate-index.js
# → indexes/quick-reference.md / resource-map.md / topic-map.md を再生成
```
