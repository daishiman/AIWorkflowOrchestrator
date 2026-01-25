# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| Phase名    | テスト拡充              |
| 前提Phase  | Phase 5                 |
| 後続Phase  | Phase 7                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-25              |
| 機能名     | PermissionResolver 実装 |

---

## 目的

カバレッジ目標達成に向けて、エッジケースや境界条件のテストを追加する。

## 背景

Phase 4 で作成した基本テストに加え、
より網羅的なテストを追加してコードの品質を担保する。

---

## 実行タスク

### タスク 1: エッジケーステスト追加

**目的**: 境界条件・エッジケースのテストを追加する

**実行手順**:

1. 同一 requestId で複数回 waitForResponse を呼んだ場合のテスト
2. resolveRequest 後に再度同じ requestId で waitForResponse した場合
3. 非常に短いタイムアウト（0ms, 1ms）の動作確認

**期待される成果物**:

- エッジケーステスト（3件以上）

### タスク 2: 並行処理テスト追加

**目的**: 並行リクエスト処理のテストを追加する

**実行手順**:

1. 複数リクエストを同時に待機するテスト
2. 複数リクエストを順番に解決するテスト
3. 一部のみキャンセルするテスト

**期待される成果物**:

- 並行処理テスト（3件以上）

### タスク 3: メモリリーク防止テスト

**目的**: リソースリークがないことを確認する

**実行手順**:

1. 多数のリクエストを作成・解決してもメモリが解放されることを確認
2. タイマーが確実にクリアされることを確認

**期待される成果物**:

- メモリ管理テスト

---

## 参照資料

| 参照資料       | パス                        | 内容       |
| -------------- | --------------------------- | ---------- |
| Phase 4 成果物 | `phase-4-test-creation.md`  | 基本テスト |
| Phase 5 成果物 | `phase-5-implementation.md` | 実装コード |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容   |
| -------------------- | --------------------------------------------------------------------------- | ------ |
| interfaces-agent-sdk | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義 |

---

## 成果物

| 成果物             | パス                                                                        | 内容       |
| ------------------ | --------------------------------------------------------------------------- | ---------- |
| 拡張テストファイル | `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` | 追加テスト |

---

## 追加テストコード

```typescript
// PermissionResolver.test.ts に追加するテスト

describe("PermissionResolver - Edge Cases", () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    vi.useFakeTimers();
    resolver = new PermissionResolver();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("duplicate requestId handling", () => {
    it("should handle same requestId called twice", async () => {
      const requestId = "dup-request-1";

      // 最初のリクエスト
      const promise1 = resolver.waitForResponse(requestId);

      // 同じ requestId で2回目を呼ぶ（上書き）
      const promise2 = resolver.waitForResponse(requestId);

      expect(resolver.pendingCount).toBe(1); // Map なので1つ

      // 解決
      resolver.resolveRequest({
        requestId,
        approved: true,
      });

      // 後から登録した promise2 が解決される
      await expect(promise2).resolves.toEqual({
        requestId,
        approved: true,
      });
    });

    it("should allow new waitForResponse after resolve", async () => {
      const requestId = "reuse-request-1";

      // 1回目
      const promise1 = resolver.waitForResponse(requestId);
      resolver.resolveRequest({ requestId, approved: true });
      await promise1;

      // 2回目（同じ requestId）
      const promise2 = resolver.waitForResponse(requestId);
      expect(resolver.pendingCount).toBe(1);

      resolver.resolveRequest({ requestId, approved: false });
      const result = await promise2;
      expect(result.approved).toBe(false);
    });
  });

  describe("extreme timeout values", () => {
    it("should handle zero timeout", async () => {
      const zeroTimeoutResolver = new PermissionResolver(0);
      const requestId = "zero-timeout-1";

      const promise = zeroTimeoutResolver.waitForResponse(requestId);

      vi.advanceTimersByTime(0);

      await expect(promise).rejects.toThrow("timed out");
    });

    it("should handle very short timeout (1ms)", async () => {
      const shortResolver = new PermissionResolver(1);
      const requestId = "short-timeout-1";

      const promise = shortResolver.waitForResponse(requestId);

      vi.advanceTimersByTime(1);

      await expect(promise).rejects.toThrow("timed out");
    });
  });

  describe("concurrent requests", () => {
    it("should handle multiple concurrent requests", async () => {
      const requests = ["req-a", "req-b", "req-c", "req-d", "req-e"];
      const promises = requests.map((id) => resolver.waitForResponse(id));

      expect(resolver.pendingCount).toBe(5);

      // 順番に解決
      for (const id of requests) {
        resolver.resolveRequest({ requestId: id, approved: true });
      }

      const results = await Promise.all(promises);
      expect(results.every((r) => r.approved)).toBe(true);
      expect(resolver.pendingCount).toBe(0);
    });

    it("should cancel only specified requests", async () => {
      const promise1 = resolver.waitForResponse("keep-1");
      const promise2 = resolver.waitForResponse("cancel-1");
      const promise3 = resolver.waitForResponse("keep-2");

      expect(resolver.pendingCount).toBe(3);

      resolver.cancelRequest("cancel-1");

      await expect(promise2).rejects.toThrow();
      expect(resolver.pendingCount).toBe(2);

      // 残りを解決
      resolver.resolveRequest({ requestId: "keep-1", approved: true });
      resolver.resolveRequest({ requestId: "keep-2", approved: true });

      await expect(promise1).resolves.toBeDefined();
      await expect(promise3).resolves.toBeDefined();
    });

    it("should resolve requests in any order", async () => {
      const promise1 = resolver.waitForResponse("order-1");
      const promise2 = resolver.waitForResponse("order-2");
      const promise3 = resolver.waitForResponse("order-3");

      // 順番を変えて解決
      resolver.resolveRequest({ requestId: "order-3", approved: true });
      resolver.resolveRequest({ requestId: "order-1", approved: false });
      resolver.resolveRequest({ requestId: "order-2", approved: true });

      const [r1, r2, r3] = await Promise.all([promise1, promise2, promise3]);

      expect(r1.approved).toBe(false);
      expect(r2.approved).toBe(true);
      expect(r3.approved).toBe(true);
    });
  });

  describe("memory management", () => {
    it("should not leak timers after resolve", async () => {
      const requestId = "timer-test-1";
      resolver.waitForResponse(requestId);

      resolver.resolveRequest({ requestId, approved: true });

      // タイムアウト時間経過後もエラーにならない
      vi.advanceTimersByTime(300000);
      expect(resolver.pendingCount).toBe(0);
    });

    it("should not leak timers after cancel", async () => {
      const requestId = "timer-test-2";
      resolver.waitForResponse(requestId);

      resolver.cancelRequest(requestId);

      // タイムアウト時間経過後もエラーにならない
      vi.advanceTimersByTime(300000);
      expect(resolver.pendingCount).toBe(0);
    });

    it("should handle many requests without leaking", async () => {
      const requestCount = 100;

      // 多数のリクエストを作成
      for (let i = 0; i < requestCount; i++) {
        resolver.waitForResponse(`batch-${i}`);
      }

      expect(resolver.pendingCount).toBe(requestCount);

      // 全てキャンセル
      resolver.cancelAll();

      expect(resolver.pendingCount).toBe(0);
    });
  });

  describe("AbortSignal edge cases", () => {
    it("should handle already aborted signal", async () => {
      const controller = new AbortController();
      controller.abort(); // 事前に abort

      const promise = resolver.waitForResponse("pre-abort", controller.signal);

      await expect(promise).rejects.toThrow("aborted");
    });

    it("should not affect other requests when one is aborted", async () => {
      const controller = new AbortController();

      const promise1 = resolver.waitForResponse(
        "abort-test-1",
        controller.signal,
      );
      const promise2 = resolver.waitForResponse("abort-test-2");

      controller.abort();

      await expect(promise1).rejects.toThrow();
      expect(resolver.pendingCount).toBe(1);

      resolver.resolveRequest({ requestId: "abort-test-2", approved: true });
      await expect(promise2).resolves.toBeDefined();
    });
  });
});
```

---

## 完了条件

- [ ] エッジケーステストが追加されている（3件以上）
- [ ] 並行処理テストが追加されている（3件以上）
- [ ] メモリ管理テストが追加されている
- [ ] AbortSignal エッジケーステストが追加されている
- [ ] 全テストが成功している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-2-permission-resolver/phase-7-coverage.md`
