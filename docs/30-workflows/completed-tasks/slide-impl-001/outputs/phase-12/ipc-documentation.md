# slide:capability:get IPC ドキュメント

## チャネル名

`slide:capability:get`

## 方向

Renderer → Main (invoke)

## 引数形式

```typescript
{
  sessionId: string;
}
```

## レスポンス形式（P60準拠）

### 成功時

```typescript
{
  success: true,
  data: {
    lane: "integrated" | "manual",
    apiKeySource: "safeStorage" | "env" | "none",
    uiStatus: "synced" | "running" | "degraded" | "guidance",
    blockedReason?: string
  }
}
```

### 失敗時

```typescript
{
  success: false,
  error: {
    code: "SLIDE_E011",  // バリデーションエラー
    message: string
  }
}
```

## P42 バリデーション仕様

| 段階 | チェック内容                    | エラーメッセージ                        |
| ---- | ------------------------------- | --------------------------------------- |
| 1    | `typeof sessionId !== "string"` | "sessionId must be a string"            |
| 2    | `sessionId === ""`              | "sessionId must not be empty"           |
| 3    | `sessionId.trim() === ""`       | "sessionId must not be whitespace only" |

追加: `args` が `null` / `undefined` の場合も段階1で拒否される。

## Preload API

```typescript
window.slideApi.getCapability(sessionId: string): Promise<SlideResponse<SlideCapabilityDTO>>
```
