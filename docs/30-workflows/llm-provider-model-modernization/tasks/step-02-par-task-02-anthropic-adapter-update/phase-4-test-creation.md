# Phase 4: テスト作成（TDD: Red） — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 4                        |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

Phase 2 の設計で定義したテストケース HC-001（`checkHealth` のモデルID検証）を実装し、現時点では Red（失敗）状態であることを確認する。

## 実行タスク

### Task 4-1: 前提条件確認

- `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` が存在することを確認する
- 既存の `describe("checkHealth")` ブロック内に HC-001 を追加する位置を特定する

### Task 4-2: テストコード HC-001 の追加

以下のテストケースを `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` の `describe("checkHealth")` ブロック内に追加する。

```typescript
it("should use claude-haiku-4-5 as health check model", async () => {
  let capturedBody: Record<string, unknown> = {};

  server.use(
    http.post("https://api.anthropic.com/v1/messages", async ({ request }) => {
      capturedBody = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        content: [{ type: "text", text: "pong" }],
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }),
  );

  await adapter.checkHealth();

  expect(capturedBody.model).toBe("claude-haiku-4-5");
});
```

### Task 4-3: Red 状態の確認

テストを実行し、HC-001 が失敗することを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

期待される失敗メッセージ（実装変更前）:

```
Expected: "claude-haiku-4-5"
Received: "claude-3-haiku-20240307"
```

### Task 4-4: 既存テストが引き続き Pass することを確認

HC-001 追加後も既存テスト（`ADP-008` / `ADP-009` / `ADP-010` / `streamChat` / その他 `checkHealth` テスト）が PASS であることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

- HC-001: **FAIL（期待通り）**
- その他全テスト: **PASS**

### Task 4-5: テスト追加後のインポートパス確認

P63 対策: 追加したテストのインポートパスが既存テストと同一パターンを使用していることを確認する。

```bash
grep -n "^import" apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

HC-001 は既存 `it` ブロックと同じ `describe("checkHealth")` スコープ内に配置するため、新規インポートは不要。

## 参照資料

| ドキュメント                                                            | 用途                                       |
| ----------------------------------------------------------------------- | ------------------------------------------ |
| `phase-2-design.md`                                                     | HC-001 のテスト設計（期待値定義）          |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | 追加先テストファイル                       |
| `.claude/rules/06-known-pitfalls.md` (P40, P63)                         | テスト実行ディレクトリとインポートパス確認 |

## 統合テスト連携

HC-001 は Adapter 単体テストであり、統合テスト（Task04）の範囲外。Task04 との重複はない。

## 成果物

| 成果物               | パス                                                                    | 備考          |
| -------------------- | ----------------------------------------------------------------------- | ------------- |
| テストコード（追加） | `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | HC-001 を追加 |

## 完了条件

- [ ] HC-001 テストコードが `describe("checkHealth")` ブロック内に追加されている
- [ ] `cd apps/desktop && pnpm vitest run` 実行後、HC-001 が **FAIL** である（Red 状態）
- [ ] 既存テスト（HC-001 以外）が全て **PASS** である
- [ ] P40 対策: テストを `apps/desktop/` ディレクトリから実行した
- [ ] P63 対策: インポートパスが既存テストと同一パターンであることを確認した

## 次のPhase

Phase 5: 実装（`phase-5-implementation.md`）
