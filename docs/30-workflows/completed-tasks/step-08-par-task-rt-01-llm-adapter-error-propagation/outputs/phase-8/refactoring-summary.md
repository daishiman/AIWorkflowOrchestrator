# Phase 8: Refactoring Summary

## エラーメッセージ生成の共通化

`plan()` 内のインライン判定を `toActionableMessage()` ヘルパーに抽出。
将来 `execute()` / `improve()` で同じ判定が必要になった際の再利用性を確保。

```typescript
function toActionableMessage(reason: string | null): string {
  if (!reason) return "LLMAdapter の初期化に失敗しました";
  if (/api.?key|ANTHROPIC_API_KEY/i.test(reason)) {
    return "APIキーを設定してください";
  }
  return reason;
}
```

## ステータス管理の改善候補 (future)

Discriminated union パターンが候補だが、本タスクでは既存パターンに従う。

```typescript
// 将来候補（本タスクではやらない）
type AdapterState =
  | { status: "initializing" }
  | { status: "ready"; adapter: LLMAdapter }
  | { status: "failed"; reason: string };
```

## エラーコード体系の整理

```typescript
type SkillCreatorErrorCode = "LLM_ADAPTER_FAILED" | "LLM_ADAPTER_INITIALIZING";
```

将来の拡張に備え union type で管理。shared types に定義。
