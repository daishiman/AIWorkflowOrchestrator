# Phase 2: Error Response Catalog

## エラーコード一覧

| errorCode                  | ステータス       | メッセージ                                          | 条件                                                                |
| -------------------------- | ---------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| `LLM_ADAPTER_FAILED`       | `"failed"`       | "APIキーを設定してください"                         | failureReason に `api_key` / `API key` / `ANTHROPIC_API_KEY` を含む |
| `LLM_ADAPTER_FAILED`       | `"failed"`       | (failureReason そのまま)                            | 上記以外の具体的な失敗理由                                          |
| `LLM_ADAPTER_FAILED`       | `"failed"`       | "LLMAdapter の初期化に失敗しました"                 | failureReason が null / 空                                          |
| `LLM_ADAPTER_INITIALIZING` | `"initializing"` | "LLMAdapter の初期化中です。しばらくお待ちください" | 初期化完了前に plan() が呼ばれた                                    |

## レスポンス型

```typescript
// エラーレスポンス
{
  success: false,
  error: string,           // actionable メッセージ
  errorCode: string,       // "LLM_ADAPTER_FAILED" | "LLM_ADAPTER_INITIALIZING"
  adapterStatus: LLMAdapterStatus,
}

// 正常レスポンス (既存 + adapterStatus 付与)
{
  success: true,
  plan: RuntimeSkillCreatorPlan,
  adapterStatus: "ready",
}
```

## actionable メッセージ判定ロジック

```typescript
function toActionableMessage(reason: string | null): string {
  if (!reason) return "LLMAdapter の初期化に失敗しました";
  if (/api.?key|ANTHROPIC_API_KEY/i.test(reason)) {
    return "APIキーを設定してください";
  }
  return reason;
}
```
