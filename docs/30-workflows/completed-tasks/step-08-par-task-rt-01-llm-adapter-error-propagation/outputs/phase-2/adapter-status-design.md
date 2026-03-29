# Phase 2: Adapter Status Design

## LLMAdapterStatus 型

```typescript
type LLMAdapterStatus = "ready" | "initializing" | "failed";
```

## ステータス遷移図

```
              ┌──────────────┐
              │ initializing │  ← Facade 生成直後 (初期値)
              └──────┬───────┘
                     │
          ┌──────────┴──────────┐
          │                     │
  setLLMAdapter()       setLLMAdapterFailed()
          │                     │
          ▼                     ▼
   ┌──────────┐          ┌──────────┐
   │  ready   │◄────────▶│  failed  │
   └──────────┘          └──────────┘
     setLLMAdapterFailed()  setLLMAdapter()
      → failed へ遷移       → ready へ遷移 (リカバリー)
```

## Facade API

| API                                | 型                 | 説明                                                          |
| ---------------------------------- | ------------------ | ------------------------------------------------------------- |
| `llmAdapterStatus` (getter)        | `LLMAdapterStatus` | 現在のステータスを返す                                        |
| `llmAdapterFailureReason` (getter) | `string \| null`   | 失敗理由。`"failed"` 以外は `null`                            |
| `setLLMAdapter(adapter)`           | `void`             | ステータスを `"ready"` に遷移、failureReason を `null` クリア |
| `setLLMAdapterFailed(reason)`      | `void`             | ステータスを `"failed"` に遷移、failureReason を設定          |

## 設計方針

- ステータス管理は Facade に集約（ipc/index.ts はトリガーのみ）
- fire-and-forget パターンを維持（`void (async () => { ... })()` を壊さない）
- Facade は public bridge のまま、state owner にはしない
