# Phase 2: 設計 — テスト期待値更新

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 2                     |
| 機能名    | test-update           |
| タスクID  | TASK-LLM-MOD-04       |
| 作成日    | 2026-03-23            |
| 前Phase   | Phase 1: 要件定義     |
| 次Phase   | Phase 3: 設計レビュー |

## 目的

各テストファイルに対して「何を・どのように変更するか」を具体的に設計し、実装（Phase 5）で迷わず変更できる状態を作る。

## 実行タスク

### Task 2-1: llm.test.ts の変更設計

#### 変更箇所 A: handleGetProviders 期待値

`handleGetProviders` のテストブロック内で、各プロバイダーの `models` 配列期待値を Task01 適用後の PROVIDER_CONFIGS に合わせて更新する。

変更方針:

1. 実際の PROVIDER_CONFIGS から `models` 配列を読み取り、テストの `toEqual` マッチャーの期待値を同一内容に変更する
2. モデルIDだけでなく `label`、`maxTokens` 等のフィールドも期待値に含まれている場合は同時に更新する

#### 変更箇所 B: inferProviderId テスト追加

既存の `inferProviderId` describe ブロックに以下のテストケースを追加する:

```typescript
it("should return 'openai' for 'o3'", () => {
  expect(inferProviderId("o3")).toBe("openai");
});

it("should return 'openai' for 'o4-mini'", () => {
  expect(inferProviderId("o4-mini")).toBe("openai");
});
```

#### 変更箇所 C: handleSetSelectedConfig バリデーション

Task01 で削除されたモデルIDを指定する既存テストが存在する場合は、新モデルIDに変更する。

### Task 2-2: llm-stream.test.ts の変更設計

`streamLLM` ハンドラーのテストでリクエスト引数に含まれる `model` フィールドが旧モデルIDを参照している場合、対応する新モデルIDに変更する。

変更方針:

1. ファイル内で旧モデルID文字列を grep して変更箇所を特定する
2. 対応する新モデルIDに置換する

### Task 2-3: AnthropicAdapter.test.ts の変更設計

ヘルスチェックリクエスト送信時の `model` フィールド期待値を変更する。

変更前: `"claude-3-haiku-20240307"` または旧ヘルスチェックモデルID
変更後: `"claude-haiku-4-5"`

確認コマンド:

```bash
grep -n "claude-3-haiku\|healthCheck\|model:" apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

### Task 2-4: GoogleAdapter.test.ts の変更設計

#### 追加テスト A: system_instruction が設定される場合

```typescript
describe("system_instruction", () => {
  it("should include system_instruction when systemPrompt is provided", async () => {
    const request: LLMRequest = {
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: "Hello" }],
      systemPrompt: "You are a helpful assistant.",
    };
    await adapter.complete(request);
    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(calledBody.system_instruction).toEqual({
      parts: [{ text: "You are a helpful assistant." }],
    });
  });

  it("should omit system_instruction when systemPrompt is not provided", async () => {
    const request: LLMRequest = {
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: "Hello" }],
    };
    await adapter.complete(request);
    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(calledBody.system_instruction).toBeUndefined();
  });
});
```

#### 既存ワークアラウンドテストの更新

Task03 によってシステムプロンプトを user ロールとして埋め込む実装が変更された場合、対応する既存テストを削除または更新する。

### Task 2-5: OpenAIAdapter.test.ts / xAIAdapter.test.ts の変更設計

差分確認方針:

```bash
grep -n "model:" apps/desktop/src/main/adapters/llm/__tests__/OpenAIAdapter.test.ts
grep -n "model:" apps/desktop/src/main/adapters/llm/__tests__/xAIAdapter.test.ts
```

旧モデルIDが期待値として使われている箇所のみ新モデルIDに変更する。変更不要な場合はスキップする。

### Task 2-6: LLMAdapterFactory.test.ts の変更設計

ファクトリーが各プロバイダーのアダプターを正しく生成するテストで、プロバイダーIDやモデルIDが期待値に含まれている場合は Task01 の変更と整合させる。

### Task 2-7: provider.test.ts の変更設計

Task01 で `description` フィールドが追加された場合のみ対応する。スキーマバリデーションテストで `description` が必須フィールドとして検証される場合は期待値に追加する。

## テストファイル変更マトリクス

| ファイル                  | 変更種別          | 変更量   | 優先度   |
| ------------------------- | ----------------- | -------- | -------- |
| llm.test.ts               | 期待値更新 + 追加 | 中       | 必須     |
| llm-stream.test.ts        | 期待値更新        | 小       | 必須     |
| AnthropicAdapter.test.ts  | 期待値更新        | 小       | 必須     |
| GoogleAdapter.test.ts     | テスト追加        | 中       | 必須     |
| OpenAIAdapter.test.ts     | 期待値更新        | 小〜なし | 差分次第 |
| xAIAdapter.test.ts        | 期待値更新        | 小〜なし | 差分次第 |
| LLMAdapterFactory.test.ts | 期待値確認        | 小〜なし | 差分次第 |
| provider.test.ts          | 期待値追加        | 小〜なし | 差分次第 |

## 参照資料

| 資料                                     | 用途                                    |
| ---------------------------------------- | --------------------------------------- |
| `phase-1-requirements.md`                | R-01〜R-05 要件                         |
| `.claude/rules/06-known-pitfalls.md#P39` | happy-dom での fireEvent 使用           |
| `.claude/rules/06-known-pitfalls.md#P40` | テスト実行ディレクトリ                  |
| `.claude/rules/02-code-quality.md`       | テスト設計規約（beforeEach リセット等） |

## 統合テスト連携

Phase 5 実装（テスト更新）後に `cd apps/desktop && pnpm vitest run` を実行し、全テストが PASS することで Task01〜03 の実装コードの正当性を間接的に検証する。テスト FAIL は Task01〜03 の実装バグを示す可能性があるため、その場合は依存タスクへフィードバックする。

## 成果物

| 成果物               | パス                |
| -------------------- | ------------------- |
| 設計書（本ファイル） | `phase-2-design.md` |

## 完了条件

- [x] 全8ファイルの変更方針が具体的なコード例または grep コマンドで示されている
- [x] 変更量とタスク優先度が分類されている
- [x] P39/P40 制約が設計に反映されている
- [x] テスト追加コードの雛形が記述されている

## 次のPhase

Phase 3: 設計レビュー (`phase-3-design-review.md`)
