# 要件定義書 - TASK-FIX-EP-01

## メタ情報

```yaml
task_id: TASK-FIX-EP-01
formal_task_id: TASK-FIX-EXECUTE-PLAN-FF-001
document_type: 要件定義書
created_date: 2026-04-04
```

## 機能要件 (FR)

| ID    | 要件                                                                                                            | 実装状況 |
| ----- | --------------------------------------------------------------------------------------------------------------- | -------- |
| FR-01 | `skill-creator:execute-plan` ハンドラーは fire-and-forget パターンで動作し、バックグラウンド実行を await しない | 実装済み |
| FR-02 | ハンドラーは 100ms 以内に `{ accepted: true, planId }` を返却する                                               | 実装済み |
| FR-03 | `RuntimeSkillCreatorFacade.executeAsync()` がバックグラウンドで実行される                                       | 実装済み |
| FR-04 | 実行完了/エラーは `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベント経由で renderer に通知される                   | 実装済み |
| FR-05 | Renderer 側は ack 受信後 `activeWorkflowId` を設定し、イベント監視に切り替える                                  | 実装済み |
| FR-06 | `isExecutePlanAck()` 型ガードにより ack レスポンスと従来レスポンスを判別する                                    | 実装済み |

## 非機能要件 (NFR)

| ID     | 要件                                                                                | 実装状況 |
| ------ | ----------------------------------------------------------------------------------- | -------- |
| NFR-01 | ハンドラーのレスポンス時間は 100ms 以内                                             | 実装済み |
| NFR-02 | 10 件の並列 invoke が全て 100ms 以内に応答する                                      | 実装済み |
| NFR-03 | `executeAsync` がエラーを throw しても invoke の ack 返却に影響しない（エラー耐性） | 実装済み |
| NFR-04 | `mainWindow.isDestroyed()` チェックにより破棄済みウィンドウへの送信を防止           | 実装済み |
| NFR-05 | snapshot 通知は `emitWorkflowStateChanged()` に一本化                               | 実装済み |

## 受入基準 (AC)

| ID   | 基準                                                                                                       | 検証状況 |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------- |
| AC-1 | `SKILL_CREATOR_EXECUTE_PLAN` ハンドラーが `void executeAsync()` + `return { accepted: true, planId }` 形式 | 充足     |
| AC-2 | `RuntimeSkillCreatorFacade` に `executeAsync()` メソッドが存在し、バックグラウンドで phase 遷移を行う      | 充足     |
| AC-3 | `onWorkflowStateSnapshot` コールバックが `emitWorkflowStateChanged` に接続されている                       | 充足     |
| AC-4 | `SkillLifecyclePanel.handleExecutePlan()` で `isExecutePlanAck()` による分岐が実装されている               | 充足     |
| AC-5 | TC-T2-01 ~ TC-T2-07 の全テストが PASS する                                                                 | 充足     |
| AC-6 | 既存テストに回帰がない                                                                                     | 充足     |
| AC-7 | `typecheck` / `lint` が 0 エラー                                                                           | 充足     |

## 変更対象ファイル

| ファイル                                                                      | 変更内容                                              |
| ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                | fire-and-forget ハンドラー + コールバックワイヤリング |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`         | `executeAsync()` メソッド追加                         |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`          | ack 分岐 + `isExecutePlanAck` 型ガード                |
| `apps/desktop/src/preload/channels.ts`                                        | チャンネル定数定義                                    |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts` | fire-and-forget テスト 7 件                           |
