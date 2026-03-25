# パフォーマンス計測設計

## 概要

NFR-2（plan 30秒以内 / execute 120秒以内）の検証方法を設計する。

---

## 計測方法

### vi.useFakeTimers() によるタイムアウトテスト

実際の LLM API は呼び出さないため、Vitest の `vi.useFakeTimers()` を使用してタイムアウト動作を検証する。

```typescript
describe("パフォーマンステスト", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("plan が 30秒以内にタイムアウトすること", async () => {
    // Facade のモックを遅延応答に設定
    mockRuntimeFacade.plan.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 60_000)),
    );

    const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
    const resultPromise = handler(createMockEvent(), {
      prompt: "テスト",
      authMode: "api-key",
      apiKey: "valid-key",
    });

    // 30秒経過をシミュレート
    await vi.advanceTimersByTimeAsync(30_000);

    // タイムアウトまたはエラーレスポンスが返ることを検証
    // ...
  });
});
```

---

## パフォーマンス基準

| チャネル                     | タイムアウト上限 | 根拠              |
| ---------------------------- | ---------------- | ----------------- |
| `skill-creator:plan`         | 30秒             | NFR-2（正本定義） |
| `skill-creator:execute-plan` | 120秒            | NFR-2（正本定義） |

---

## 注意事項

### テスト環境の制約

- 実際の LLM 呼び出しは行わない（Facade モック使用）
- タイムアウトの検証は `vi.useFakeTimers()` で疑似的に行う
- 実環境でのパフォーマンス検証は Phase 11（手動テスト）で実施

### Fake Timer の使用パターン

1. `vi.useFakeTimers()` で時間制御を開始
2. 非同期処理を開始（Promise を取得）
3. `vi.advanceTimersByTimeAsync(ms)` で時間を進める
4. Promise の解決状態を検証
5. `vi.useRealTimers()` でクリーンアップ

### 正常応答時間の検証

タイムアウト未満で応答した場合の正常パスも検証する:

```typescript
it("plan が 30秒以内に正常応答すること", async () => {
  mockRuntimeFacade.plan.mockImplementation(
    () =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              planId: "p-1",
              skillSpec: "spec",
              estimatedSteps: 3,
              skillName: "test",
              description: "desc",
              agents: [],
              scripts: [],
              triggers: [],
              anchors: [],
            }),
          1_000,
        ),
      ),
  );

  const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
  const resultPromise = handler(createMockEvent(), {
    prompt: "テスト",
    authMode: "api-key",
    apiKey: "valid-key",
  });

  await vi.advanceTimersByTimeAsync(1_000);
  const result = await resultPromise;
  expect(result.success).toBe(true);
});
```
