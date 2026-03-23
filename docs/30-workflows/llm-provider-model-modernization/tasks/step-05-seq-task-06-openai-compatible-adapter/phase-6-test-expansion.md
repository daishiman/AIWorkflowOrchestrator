# Phase 6: テスト拡充 -- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 6                         |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 5（実装）           |

## 目的

Phase 5 の実装完了後、Phase 4 で追加したテストのカバレッジ不足を補完する。境界値・異常系・プロバイダー間の動作一貫性を追加テストで検証し、カバレッジ基準（Line: 80%、Branch: 60%、Function: 80%）を達成する。

## 実行タスク

### Task 6-1: カバレッジ測定

Phase 5 の実装完了後、以下でカバレッジを測定する:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts --coverage
```

カバレッジレポートから `OpenAICompatibleAdapter.ts` と `LLMAdapterFactory.ts` のカバレッジ数値を確認する。

### Task 6-2: 追加テストケース実装

#### テストブロック T-07: sendChat 境界値・異常系

```typescript
describe("T-07: sendChat 境界値・異常系", () => {
  it("should handle empty choices array gracefully", async () => {
    // choices: [] のレスポンスで content が空文字列になることを検証
  });

  it("should handle undefined content in choice", async () => {
    // choices[0].message.content が undefined の場合の動作を検証
  });

  it("should pass temperature and maxTokens to request body", async () => {
    // temperature: 0.5, maxTokens: 1000 がボディに含まれることを検証
  });
});
```

#### テストブロック T-08: streamChat 境界値・異常系

```typescript
describe("T-08: streamChat 境界値・異常系", () => {
  it("should handle stream with no content delta", async () => {
    // delta.content が undefined のチャンクを正しく処理することを検証
  });

  it("should pass abort signal to fetchSSE", async () => {
    // AbortSignal が fetchSSE に渡されることを検証
  });

  it("should include extraHeaders in stream request", async () => {
    // OpenRouter 設定で extraHeaders がストリームリクエストに含まれることを検証
  });
});
```

#### テストブロック T-09: checkHealth 拡充

```typescript
describe("T-09: checkHealth 拡充", () => {
  it("should include extraHeaders in health check request", async () => {
    // OpenRouter 設定で extraHeaders がヘルスチェックリクエストに含まれることを検証
  });

  it("should return non-Error message as default error message", async () => {
    // throw "string error" の場合のデフォルトエラーメッセージを検証
  });
});
```

#### テストブロック T-10: プロバイダー間一貫性

```typescript
describe("T-10: プロバイダー間一貫性", () => {
  it("should create adapters with correct baseUrl for each provider", () => {
    // OpenAI: https://api.openai.com/v1
    // xAI: https://api.x.ai/v1
    // OpenRouter: https://openrouter.ai/api/v1
  });

  it("should create OpenRouter adapter with extraHeaders", () => {
    // OpenRouter のみ HTTP-Referer と X-Title が設定されていることを検証
  });

  it("should create OpenAI and xAI adapters without extraHeaders", () => {
    // OpenAI / xAI に extraHeaders がないことを検証
  });
});
```

#### テストブロック T-11: OPENAI_COMPATIBLE_CONFIGS キーと providerId の一致

```typescript
describe("T-11: OPENAI_COMPATIBLE_CONFIGS 整合性（設計レビュー U-02 対策）", () => {
  it("should have matching key and providerId for all entries", () => {
    // マップの各エントリでキー === providerId であることを検証
  });
});
```

### Task 6-3: カバレッジ再測定

追加テスト実装後に再度カバレッジを測定し、基準達成を確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts --coverage
```

期待するカバレッジ:

- `OpenAICompatibleAdapter.ts`: Line >= 80%, Branch >= 60%, Function >= 80%
- `LLMAdapterFactory.ts`: Line >= 80%, Branch >= 60%, Function >= 80%

基準未達の場合は Phase 7 に進む前に Task 6-2 を繰り返す。

## 参照資料

| 資料名           | パス                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト   | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-4-test-creation.md` |
| テストファイル   | `apps/desktop/src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts`                                                    |
| コード品質ルール | `.claude/rules/02-code-quality.md`（カバレッジ基準）                                                                              |

## 成果物

| 成果物                       | パス                                                                           | 形式       |
| ---------------------------- | ------------------------------------------------------------------------------ | ---------- |
| 拡充済みテストファイル       | `apps/desktop/src/main/adapters/llm/__tests__/OpenAICompatibleAdapter.test.ts` | TypeScript |
| カバレッジレポート（確認用） | `apps/desktop/coverage/`（実行時生成）                                         | HTML/JSON  |

## 完了条件

- [x] Phase 5 の全テストが PASS していることを確認した
- [x] T-07（sendChat 境界値・異常系）: 3 テストケースを追加した
- [x] T-08（streamChat 境界値・異常系）: 3 テストケースを追加した
- [x] T-09（checkHealth 拡充）: 2 テストケースを追加した
- [x] T-10（プロバイダー間一貫性）: 3 テストケースを追加した
- [x] T-11（OPENAI_COMPATIBLE_CONFIGS 整合性）: 1 テストケースを追加した（U-02 対策）
- [x] `OpenAICompatibleAdapter.ts` の Line Coverage が 80% 以上である
- [x] `OpenAICompatibleAdapter.ts` の Branch Coverage が 60% 以上である
- [x] `OpenAICompatibleAdapter.ts` の Function Coverage が 80% 以上である

## 次の Phase

Phase 7: カバレッジ確認（`phase-7-coverage.md`）
