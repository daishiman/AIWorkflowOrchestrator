# IPC Channel Spec

## 目的

`TASK-SDK-SC-01` で導入する `SKILL_CREATOR_SESSION_CHANNELS` の 5 チャネルを、方向・payload・IPC メカニズム・用途の観点で固定する。

## チャネル一覧

| チャネル名                        | 方向            | IPC メカニズム      | Payload                            | 用途                                          |
| --------------------------------- | --------------- | ------------------- | ---------------------------------- | --------------------------------------------- |
| `skill-creator:start-session`     | Renderer → Main | `handle` / `invoke` | `SkillCreatorSessionStartRequest`  | SDK セッションの開始要求                      |
| `skill-creator:question-received` | Main → Renderer | `webContents.send`  | `UserInputQuestion`                | SDK が `AskUserQuestion` を要求したことを通知 |
| `skill-creator:answer`            | Renderer → Main | `handle` / `invoke` | `UserInputAnswer`                  | Renderer から SDK へ回答を注入                |
| `skill-creator:session-complete`  | Main → Renderer | `webContents.send`  | `SkillCreatorSessionCompleteEvent` | SDK セッション正常完了を通知                  |
| `skill-creator:session-error`     | Main → Renderer | `webContents.send`  | `SkillCreatorSessionErrorEvent`    | SDK セッション失敗・タイムアウトを通知        |

## Payload 型定義

### `SkillCreatorSessionStartRequest`

```typescript
{ request: string; sessionId?: string }
```

### `SkillCreatorSessionCompleteEvent`

```typescript
{
  result: string;
}
```

### `SkillCreatorSessionErrorEvent`

```typescript
{
  error: string;
}
```

### `UserInputQuestion`

- `toolCallId: string`
- `type: UserInputType` (`single_select` / `multi_select` / `free_text` / `secret` / `confirm`)
- `question: string`
- `options?: { value?: string; label?: string; description?: string; preview?: string }[]`
- `placeholder?: string`

### `UserInputAnswer`

- `toolCallId: string`
- `value: string | string[] | boolean`

## セキュリティ・バリデーション

- **sender 検証**: `assertSender()` により `event.sender.id === window.webContents.id` を保証。不一致の場合はエラーをスロー
- **多重セッション拒否**: `hasActiveSession()` により `running` / `awaiting-input` 状態のセッションが存在する場合は新規セッションを拒否し `console.warn` + エラースロー
- **ウィンドウ閉鎖時**: `handleWindowClosed` がセッションを `silent abort`（onError コールバックを呼ばない）
- **`start-session`**: `request` 必須（空文字不可）、`sessionId` は任意
- **`answer`**: `toolCallId` が pending question と一致しない場合はエラーをスロー

## 実装上の注意

- START_SESSION・ANSWER 両チャネルとも `ipcMain.handle` / `ipcRenderer.invoke` を使用する（`ipcMain.on` / `send` は不使用）
- `session-complete` と `session-error` はどちらもセッション終端イベントとして扱い、UI に状態復帰の導線を返す
- channel 名は `skill-creator:` プレフィックスで統一し、他の lane の IPC と混在させない
- 具体的な TypeScript 型は `packages/shared/src/types/skillCreator.ts` を正とする

## 参照

- [Phase 1 要件定義](../../phase-1-requirements.md)
- [Phase 2 設計](../../phase-2-design.md)
- [Phase 12 本文](../../phase-12-documentation.md)
