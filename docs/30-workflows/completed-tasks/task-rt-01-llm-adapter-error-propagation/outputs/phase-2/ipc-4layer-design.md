# Phase 2: IPC 4層設計表 - TASK-RT-01

## チャネル 1: `skill-creator:get-adapter-status`（invoke/pull）

| 層                | 対象ファイル                                    | 追加内容                                                                                |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1. チャネル定数   | `apps/desktop/src/preload/channels.ts`          | `SKILL_CREATOR_GET_ADAPTER_STATUS: "skill-creator:get-adapter-status"`                  |
| 2. ALLOWED リスト | `apps/desktop/src/preload/channels.ts`          | `ALLOWED_INVOKE_CHANNELS` 配列に `IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS` を追加 |
| 3. ハンドラ登録   | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS, ...)`                    |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts` | `getAdapterStatus: () => safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)`     |

## チャネル 2: `skill-creator:adapter-status-changed`（on/push）

| 層                | 対象ファイル                                    | 追加内容                                                                                        |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1. チャネル定数   | `apps/desktop/src/preload/channels.ts`          | `SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed"`                  |
| 2. ALLOWED リスト | `apps/desktop/src/preload/channels.ts`          | `ALLOWED_ON_CHANNELS` 配列に `IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED` を追加         |
| 3. push 送信      | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | `mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED, payload)`       |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts` | `onAdapterStatusChanged: (cb) => safeOn(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED, cb)` |

## Facade コールバック設計

```typescript
onAdapterStatusChanged?: (status: LLMAdapterStatus, reason: string | null) => void;
```

呼び出しタイミング:

| 呼び出し元メソッド            | 遷移後ステータス | 引数                 |
| ----------------------------- | ---------------- | -------------------- |
| `setLLMAdapter(adapter)`      | `"ready"`        | `("ready", null)`    |
| `setLLMAdapterFailed(reason)` | `"failed"`       | `("failed", reason)` |

## コンポーネント設計: LLMAdapterErrorBanner

- Props: `{ status, failureReason, onOpenSettings? }`
- `status !== "failed"` の場合は `null` 返却（非表示）
- `role="alert"`, `data-testid="llm-adapter-error-banner"`

## フック設計: useLLMAdapterStatus

- 初期値: `{ status: "initializing", failureReason: null }`
- マウント時: pull（getAdapterStatus）+ push購読（onAdapterStatusChanged）
- アンマウント時: `cancelled = true` + `unsubscribe()`
