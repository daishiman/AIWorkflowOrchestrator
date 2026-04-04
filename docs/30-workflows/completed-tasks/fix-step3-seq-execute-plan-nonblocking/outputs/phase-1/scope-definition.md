# スコープ定義書 - TASK-FIX-EP-01

## メタ情報

```yaml
task_id: TASK-FIX-EP-01
formal_task_id: TASK-FIX-EXECUTE-PLAN-FF-001
document_type: スコープ定義書
created_date: 2026-04-04
```

## スコープ内

### Main プロセス

- `creatorHandlers.ts` の `SKILL_CREATOR_EXECUTE_PLAN` ハンドラーを fire-and-forget 化
- `emitWorkflowStateChanged()` による snapshot 通知（`isDestroyed` チェック付き）
- `onWorkflowStateSnapshot` コールバックのワイヤリング
- `RuntimeSkillCreatorFacade.executeAsync()` メソッド

### Renderer プロセス

- `SkillLifecyclePanel.handleExecutePlan()` の ack 分岐
- `isExecutePlanAck()` 型ガード関数

### IPC 定義

- `SKILL_CREATOR_EXECUTE_PLAN` チャンネル
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントチャンネル

### テスト

- `creatorHandlers.fire-and-forget.test.ts`: TC-T2-01 ~ TC-T2-07

## スコープ外

- 他の IPC チャンネルの非同期化（step4以降で対応済み）
- E2E テスト（Playwright による統合テスト）
- `workflowEngine` 内部の phase 管理ロジック変更
- preload API の型定義変更（既存の `executePlan` API シグネチャはそのまま）
- NotificationService との統合（TASK-NOTIFICATION-SERVICE-001 で対応済み）

## 前提条件

- TASK-FIX-AUTH-IPC-001（auth:login fire-and-forget 化）が完了済み
- `RuntimeSkillCreatorFacade` に `executeAsync()` メソッドが実装可能な設計
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネルが定義済み

## 制約

- Electron の IPC ハンドラー内で `void` による fire-and-forget は unhandled rejection を発生させない
- `mainWindow.isDestroyed()` チェックにより、ウィンドウ破棄後の `webContents.send` エラーを防止
- テストでは `vi.mock("electron")` パターンを使用
