# Phase 5: 実装（TDD: Green）- 成果物

## 実装結果

- provider-registry.ts: 新規作成完了（SSoT定義 + PROVIDER_IDS + inferProviderId）
- provider.ts: LLMProviderIdSchema を PROVIDER_IDS から自動導出に変更
- index.ts: provider-registry から re-export 追加
- llm.ts: ローカル PROVIDER_CONFIGS / inferProviderId 削除、shared から import

## テスト結果

- provider-registry テスト: 18 passed (18) - GREEN
- provider テスト: 全 PASS（回帰確認）
- shared typecheck: PASS（エラー0）

## 型安全性（DJ-003）

```typescript
type ProviderIdUnion = (typeof PROVIDER_CONFIGS)[number]["id"];
// = "openai" | "anthropic" | "google" | "xai" | "openrouter"

export const PROVIDER_IDS = PROVIDER_CONFIGS.map((p) => p.id) as [
  ProviderIdUnion,
  ...ProviderIdUnion[],
];

// z.enum(PROVIDER_IDS) で LLMProviderIdSchema が自動導出
// LLMProviderId = z.infer<typeof LLMProviderIdSchema> は変更なし
```

unsafe cast は `as [ProviderIdUnion, ...ProviderIdUnion[]]` の1箇所のみ。`as unknown as` は不使用。

## Phase 5 実行記録

| タスク                    | 結果 | 備考                       |
| ------------------------- | ---- | -------------------------- |
| provider-registry.ts 作成 | 完了 | SSoT定義 + inferProviderId |
| provider.ts 変更          | 完了 | 自動導出に切替             |
| index.ts 変更             | 完了 | re-export 追加             |
| llm.ts 変更               | 完了 | ローカル定義削除           |
| typecheck                 | PASS | shared エラー0             |
| テスト Green 確認         | PASS | 18/18                      |

### 発見事項

- `as const satisfies` で厳密型推論されると、optional なプロパティ (`specialMatcher`) が未定義エントリで property 自体が存在しない型になる
- `"specialMatcher" in provider` の in 演算子でナローイングすることで型安全に解決
