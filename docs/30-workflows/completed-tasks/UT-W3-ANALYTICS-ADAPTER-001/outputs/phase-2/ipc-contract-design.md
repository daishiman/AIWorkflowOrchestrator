# Phase 2: IPC 契約設計書

## タスクID: UT-W3-ANALYTICS-ADAPTER-001

## 1. チャネル定義

| チャネル名       | 方向                     | 用途         |
| ---------------- | ------------------------ | ------------ |
| `analytics:send` | Renderer → Main (invoke) | イベント送信 |

## 2. DTO 型定義

```typescript
// Renderer → Main
export interface AnalyticsSendRequest {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

// Main → Renderer (response)
export interface AnalyticsSendResponse {
  success: boolean;
  queued?: boolean; // オフライン時にMainでキューイングした場合
  error?: string;
}
```

## 3. `IPC_CHANNELS` への追加

```typescript
// apps/desktop/src/preload/channels.ts に追加
ANALYTICS_SEND: "analytics:send",
```

## 4. `ALLOWED_INVOKE_CHANNELS` への追加

```typescript
// ALLOWED_INVOKE_CHANNELS 配列に追加
IPC_CHANNELS.ANALYTICS_SEND,
```

## 5. Preload API 設計

```typescript
// contextBridge.exposeInMainWorld("analyticsAPI", analyticsAPI)
export interface AnalyticsAPI {
  send: (request: AnalyticsSendRequest) => Promise<AnalyticsSendResponse>;
}

const analyticsAPI: AnalyticsAPI = {
  send: (request) => safeInvoke(IPC_CHANNELS.ANALYTICS_SEND, request),
};
```

## 6. 命名規則整合性確認

| 項目             | 既存パターン             | 今回の設計                        | 整合性                      |
| ---------------- | ------------------------ | --------------------------------- | --------------------------- |
| チャネル名       | `skill:analytics:record` | `analytics:send`                  | ✅ `namespace:action` 形式  |
| Preload API名    | `skillCreatorAPI`        | `analyticsAPI`                    | ✅ `<feature>API` 形式      |
| ハンドラー関数名 | `registerSkillHandlers`  | `registerAnalyticsHandlers`       | ✅ `register*Handlers` 形式 |
| DTO suffix       | `*Request`/`*Response`   | `AnalyticsSendRequest`/`Response` | ✅ 既存パターンと一致       |

---

_生成日: 2026-04-11 / Phase 2 完了_
