# Phase 2: IPC 契約拡張設計

## 設計方針

既存の `DocOperationResult<string>` 型を維持する。
`retryable` フィールドは `DocError.retryable` として既に存在している。

## IPC 返却型（変更なし）

```typescript
// 成功
{ success: true, data: string }

// 失敗（DocError は retryable フィールドを含む）
{
  success: false,
  error: {
    code: number,       // 2001/2002/3001/3002/3003/3004/5001
    category: DocErrorCategory,
    message: string,    // 日本語ユーザーメッセージ
    retryable: boolean, // UI 再試行判断
    guidance?: DocErrorGuidance,
  }
}
```

## 後方互換性保証

- `skill:docs:generate` 成功時の返却形式は変更しない
- Preload 側の型定義は変更不要
- `LLMQueryFn` の関数シグネチャは変更しない
