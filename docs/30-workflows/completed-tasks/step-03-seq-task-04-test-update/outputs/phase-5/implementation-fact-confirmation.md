# Phase 5: 実装実態確認

## 検証日時

2026-03-29

## 実装実態

| 項目                               | current fact                                                 | 検証結果                                    |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| provider 正本                      | `packages/shared/src/types/llm/schemas/provider-registry.ts` | ✅ 存在確認                                 |
| schema 導出                        | `packages/shared/src/types/llm/schemas/provider.ts`          | ✅ 存在確認                                 |
| main handler                       | `apps/desktop/src/main/handlers/llm.ts`                      | ✅ `PROVIDER_CONFIGS` を shared から import |
| 旧 `providers.ts`                  | 存在しない                                                   | ✅ 不存在確認                               |
| `handleGetProviders()`             | `PROVIDER_CONFIGS` を返す                                    | ✅ line 93 で確認                           |
| `AnthropicAdapter.checkHealth()`   | `claude-haiku-4-5` を使用                                    | ✅ テストで確認                             |
| `GoogleAdapter.buildRequestBody()` | `system_instruction` を生成                                  | ✅ テストで確認                             |

## grep 証跡

### EV-01: o3 / o4-mini in llm.test.ts

- `llm.test.ts:500` — `expect(modelIds).toContain("o3")`
- `llm.test.ts:501` — `expect(modelIds).toContain("o4-mini")`
- `llm.test.ts:674` — `describe("T-07: o3/o4 プレフィックスの OpenAI 解決")`

### EV-02: claude-haiku-4-5 in AnthropicAdapter.test.ts

- `AnthropicAdapter.test.ts:308` — `it("should use claude-haiku-4-5 as health check model")`
- `AnthropicAdapter.test.ts:326` — `expect(capturedBody.model).toBe("claude-haiku-4-5")`

### EV-03: system_instruction in GoogleAdapter.test.ts

- `GoogleAdapter.test.ts:157` — `it("should send systemPrompt as system_instruction field")`
- `GoogleAdapter.test.ts:508` — `it("should send system_instruction in streamChat")`
- 他 9 箇所の `system_instruction` assertion

### EV-04: Main handler shared import

- `llm.ts:15` — `PROVIDER_CONFIGS` を shared から import
- `llm.ts:93` — `for (const config of PROVIDER_CONFIGS)` で使用

## 結論

追加コードは不要。仕様書のみ更新対象。
