# Main 側詳細設計書 - TASK-FIX-EP-01

## メタ情報

```yaml
task_id: TASK-FIX-EP-01
formal_task_id: TASK-FIX-EXECUTE-PLAN-FF-001
document_type: Main側詳細設計書
created_date: 2026-04-04
```

## 1. creatorHandlers.ts - execute-plan ハンドラー

### 変更概要

従来の `await execute()` パターンから `void executeAsync()` + 即時 ack 返却パターンへ変更。

### ハンドラー設計

```typescript
// 戻り値型: IpcResult<never> | { accepted: true; planId: string }
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, async (event, args) => {
  // 1. sender バリデーション
  validateSender(event, channel, mainWindow);

  // 2. 引数バリデーション
  if (isBlank(args?.planId)) return validationError("...");
  if (isBlank(args?.skillSpec)) return validationError("...");
  if (!runtimeSkillCreatorService) return validationError("...");

  // 3. planId を trim
  const planId = args.planId.trim();

  // 4. fire-and-forget: void で Promise を捨てる
  void runtimeSkillCreatorService.executeAsync(planId, args);

  // 5. 即時 ack 返却
  return { accepted: true, planId };
});
```

### 設計判断

- `void` 演算子により Promise の戻り値を明示的に捨てる -> unhandled rejection を回避
- バリデーションエラーは従来通り `IpcResult<never>` 形式で同期返却
- ack は `{ accepted: true, planId }` という専用形式（`IpcResult` とは異なる構造）

## 2. emitWorkflowStateChanged ヘルパー

```typescript
function emitWorkflowStateChanged(
  mainWindow: BrowserWindow,
  snapshot: SkillCreatorWorkflowUiSnapshot,
): void {
  if (mainWindow.isDestroyed()) return; // 安全ガード
  mainWindow.webContents.send(
    IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    snapshot,
  );
}
```

- `isDestroyed()` チェックにより、アプリ終了中の `webContents.send` エラーを防止
- snapshot が null の場合は呼び出し元（コールバック）で除外

## 3. onWorkflowStateSnapshot コールバックのワイヤリング

```typescript
if (runtimeSkillCreatorService) {
  runtimeSkillCreatorService.onWorkflowStateSnapshot = (_planId, snapshot) => {
    if (snapshot) {
      emitWorkflowStateChanged(mainWindow, snapshot);
    }
  };
}
```

- ハンドラー登録時に一度だけワイヤリング
- `_planId` は現時点で未使用だが、将来の拡張（マルチプラン対応等）に備えて受け取る
- snapshot が falsy の場合は送信しない

## 4. RuntimeSkillCreatorFacade.executeAsync()

### メソッドシグネチャ

```typescript
async executeAsync(
  planId: string,
  args: {
    planId: string;
    skillSpec: string;
    authMode?: AuthMode;
    apiKey?: string | null;
  },
): Promise<void>
```

### 処理フロー

1. `triggerPhaseTransition("executing")` -> snapshot 通知
2. 実行ロジック（Agent SDK 呼び出し等）
3. 成功: `triggerPhaseTransition("complete")` -> snapshot 通知
4. エラー: catch -> `triggerPhaseTransition("error")` -> snapshot 通知 + `console.error`

### エラーハンドリング

- try-catch で全エラーをキャッチ
- エラー時も snapshot 通知を行い、Renderer 側でエラー状態を表示可能にする
- `console.error` でログ出力（デバッグ用）
- throw はしない（fire-and-forget のため unhandled rejection を防止）
