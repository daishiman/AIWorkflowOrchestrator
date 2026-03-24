# Phase 4: テスト作成（テスト更新設計） — テスト期待値更新

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 4                     |
| 機能名    | test-update           |
| タスクID  | TASK-LLM-MOD-04       |
| 作成日    | 2026-03-23            |
| 前Phase   | Phase 3: 設計レビュー |
| 次Phase   | Phase 5: 実装         |

## 目的

このタスクはテスト更新タスクであるため、Phase 4 では「新規追加するテストケース」の詳細設計を行う。既存テストの期待値更新は Phase 5（実装）で行い、新規追加分（inferProviderId / GoogleAdapter system_instruction）はここで最終的なテストコードを設計する。

## 実行タスク

### Task 4-1: 現行テストファイルの状態確認

Phase 5 実装前に各ファイルの現状を確認し、変更が必要な箇所を特定する。

```bash
# llm.test.ts の inferProviderId テスト確認
grep -n "inferProviderId\|o3\|o4-mini" apps/desktop/src/main/handlers/__tests__/llm.test.ts

# AnthropicAdapter のヘルスチェックモデルID確認
grep -n "claude-haiku\|claude-3-haiku\|healthCheck" apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts

# GoogleAdapter のシステムプロンプト関連確認
grep -n "systemPrompt\|system_instruction\|system" apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts

# OpenAI / xAI のモデルID確認
grep -n "model:" apps/desktop/src/main/adapters/llm/__tests__/OpenAIAdapter.test.ts
grep -n "model:" apps/desktop/src/main/adapters/llm/__tests__/xAIAdapter.test.ts
```

### Task 4-2: inferProviderId 追加テストの詳細設計

`llm.test.ts` の `inferProviderId` describe ブロックに追加する2テストケース:

```typescript
// 追加テストケース T-01
it("should return 'openai' for model 'o3'", () => {
  const result = inferProviderId("o3");
  expect(result).toBe("openai");
});

// 追加テストケース T-02
it("should return 'openai' for model 'o4-mini'", () => {
  const result = inferProviderId("o4-mini");
  expect(result).toBe("openai");
});
```

- モック不要（純粋関数のユニットテスト）
- `beforeEach` のリセット不要

### Task 4-3: GoogleAdapter system_instruction 追加テストの詳細設計

`GoogleAdapter.test.ts` に追加する describe ブロック。既存の describe 構造を継承する:

```typescript
describe("system_instruction handling", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: { parts: [{ text: "response text" }] },
            finishReason: "STOP",
          },
        ],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      }),
    });
  });

  // T-03: systemPrompt あり
  it("should include system_instruction.parts when systemPrompt is provided", async () => {
    const request = {
      model: "gemini-2.0-flash",
      messages: [{ role: "user" as const, content: "Hello" }],
      systemPrompt: "You are a helpful assistant.",
    };
    await adapter.complete(request);
    const calledBody = JSON.parse(
      (mockFetch.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(calledBody.system_instruction).toEqual({
      parts: [{ text: "You are a helpful assistant." }],
    });
  });

  // T-04: systemPrompt なし
  it("should omit system_instruction when systemPrompt is not provided", async () => {
    const request = {
      model: "gemini-2.0-flash",
      messages: [{ role: "user" as const, content: "Hello" }],
    };
    await adapter.complete(request);
    const calledBody = JSON.parse(
      (mockFetch.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(calledBody.system_instruction).toBeUndefined();
  });
});
```

**注意事項:**

- `userEvent` は使用しない（happy-dom 環境 / P39 対応）
- `mockFetch` は既存テストで定義されている変数名を使用すること（Phase 5 実装前に既存ファイルを Read して変数名を確認する）

### Task 4-4: テストケース一覧

| テストID | ファイル              | テスト内容                                  | 種別 |
| -------- | --------------------- | ------------------------------------------- | ---- |
| T-01     | llm.test.ts           | inferProviderId("o3") === "openai"          | 追加 |
| T-02     | llm.test.ts           | inferProviderId("o4-mini") === "openai"     | 追加 |
| T-03     | GoogleAdapter.test.ts | systemPrompt あり → system_instruction 設定 | 追加 |
| T-04     | GoogleAdapter.test.ts | systemPrompt なし → system_instruction 省略 | 追加 |

期待値更新（新規追加でない変更）は Phase 5 で実施する。

## 参照資料

| 資料                                     | 用途                                 |
| ---------------------------------------- | ------------------------------------ |
| `phase-2-design.md`                      | テスト追加コード雛形                 |
| `.claude/rules/06-known-pitfalls.md#P39` | happy-dom での userEvent 非互換      |
| `.claude/rules/06-known-pitfalls.md#P40` | テスト実行ディレクトリ依存           |
| `.claude/rules/02-code-quality.md`       | テスト設計規約（独立性・リセット等） |

## 統合テスト連携

T-03 / T-04 の GoogleAdapter テストは Task03 の実装（system_instruction 追加）を検証する統合テストとして機能する。Task03 が未完了の場合、T-03 / T-04 は FAIL することが期待される。

## 成果物

| 成果物                                 | パス                       |
| -------------------------------------- | -------------------------- |
| テスト作成設計書（本ファイル）         | `phase-4-test-creation.md` |
| 新規追加テストケース一覧（T-01〜T-04） | 本ファイル Task 4-4 参照   |

## 完了条件

- [x] 現行ファイル確認コマンドが定義されている
- [x] 追加テストケース T-01〜T-04 が詳細設計されている
- [x] happy-dom 制約（P39）が設計に反映されている
- [x] 期待値更新（既存テストの修正）と新規追加テストが明確に分離されている

## 次のPhase

Phase 5: 実装（テスト期待値の実際の更新） (`phase-5-implementation.md`)
