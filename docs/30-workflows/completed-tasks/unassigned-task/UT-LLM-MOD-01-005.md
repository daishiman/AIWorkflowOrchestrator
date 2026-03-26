# UT-LLM-MOD-01-005: PROVIDER_CONFIGS / inferProviderId / LLMProviderIdSchema 三重管理解消

## メタ情報

| 項目         | 値                                            |
| ------------ | --------------------------------------------- |
| タスクID     | UT-LLM-MOD-01-005                             |
| 由来         | TASK-LLM-MOD-01 30種思考法分析（KJ法テーマA） |
| 優先度       | 中                                            |
| 発見日       | 2026-03-23                                    |
| issue_number | 1524                                          |

## 目的

`PROVIDER_CONFIGS`（llm.ts）、`inferProviderId`（llm.ts）、`LLMProviderIdSchema`（packages/shared の Zod enum）の3箇所が独立してプロバイダー/モデル情報を管理しており、新プロバイダー追加時に3箇所の同時更新が必要な構造になっている。この契約ドリフト発生源（P44/P45類似パターン）を解消し、Single Source of Truth を確立する。

## 苦戦箇所・知見

- **if思考で発見**: 将来 OpenAI が `o5` シリーズを発売した場合、`PROVIDER_CONFIGS` への追加だけでなく `inferProviderId` にも `modelId.startsWith("o5")` を追加する必要がある。この2箇所の同期を保証する仕組みがない
- **`PROVIDER_CONFIGS` から prefix ルールを自動導出する方法**: 各プロバイダーの models 配列からモデルID prefix を抽出し、`inferProviderId` のルールを自動生成するユーティリティが有効
- **Zod enum との統合**: `LLMProviderIdSchema` の enum 値を `PROVIDER_CONFIGS` の `id` フィールドから自動生成すれば、型安全と Single Source of Truth を両立できる

## 対象ファイル

| ファイル                                            | 変更内容                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `apps/desktop/src/main/handlers/llm.ts`             | `inferProviderId` を `PROVIDER_CONFIGS` から自動導出するロジックに変更   |
| `packages/shared/src/types/llm/schemas/provider.ts` | `LLMProviderIdSchema` を `PROVIDER_CONFIGS` のキーから生成する構造に変更 |

## 設計方針

```typescript
// Before: 3箇所独立管理
const PROVIDER_CONFIGS = [{ id: "openai", ... }, ...];
function inferProviderId(modelId: string) { /* 手動 prefix マッチング */ }
const LLMProviderIdSchema = z.enum(["openai", "anthropic", ...]);

// After: PROVIDER_CONFIGS が Single Source of Truth
const PROVIDER_IDS = PROVIDER_CONFIGS.map(p => p.id) as const;
type LLMProviderId = typeof PROVIDER_IDS[number];
function inferProviderId(modelId: string) {
  return PROVIDER_CONFIGS.find(p => p.models.some(m => modelId.startsWith(m.id.split("-")[0])))?.id ?? null;
}
```

## 完了条件

- [ ] `PROVIDER_CONFIGS` が唯一のプロバイダー/モデル情報源になっている
- [ ] `inferProviderId` が `PROVIDER_CONFIGS` から自動導出されている
- [ ] `LLMProviderIdSchema` が `PROVIDER_CONFIGS` のキーから生成されている
- [ ] 新プロバイダー追加時に `PROVIDER_CONFIGS` のみの変更で済むことをテストで検証
- [ ] 既存テスト全PASS
