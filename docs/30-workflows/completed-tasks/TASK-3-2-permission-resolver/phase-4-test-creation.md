# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| Phase名    | テスト作成              |
| 前提Phase  | Phase 3                 |
| 後続Phase  | Phase 5                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-25              |
| 機能名     | PermissionResolver 実装 |

---

## 目的

TDD の Red フェーズとして、失敗するテストを作成する。
PermissionResolver の全機能に対応するテストケースを網羅する。

## 背景

Phase 2 の設計に基づき、実装前にテストを作成する。
このテストが Phase 5 の実装の正しさを検証する基準となる。

---

## 実行タスク

### タスク 1: テストファイル作成

**目的**: テストファイルの基本構造を作成する

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/` ディレクトリを確認
2. `PermissionResolver.test.ts` ファイルを作成
3. describe ブロックの構造を作成

**期待される成果物**:

- `PermissionResolver.test.ts` ファイル

### タスク 2: 正常系テスト作成

**目的**: 正常フローのテストを作成する

**実行手順**:

1. `waitForResponse` → `resolveRequest` の正常フローテスト
2. `cancelRequest` の正常フローテスト
3. `cancelAll` の正常フローテスト
4. `pendingCount` の正常フローテスト

**期待される成果物**:

- 正常系テストケース（5件以上）

### タスク 3: 異常系テスト作成

**目的**: エラーケース・エッジケースのテストを作成する

**実行手順**:

1. タイムアウトテストを作成
2. AbortSignal キャンセルテストを作成
3. 存在しない requestId の処理テストを作成
4. 重複 requestId のテストを作成

**期待される成果物**:

- 異常系テストケース（4件以上）

---

## 参照資料

| 参照資料            | パス                      | 内容                 |
| ------------------- | ------------------------- | -------------------- |
| Phase 1 成果物      | `phase-1-requirements.md` | 受け入れ基準         |
| Phase 2 成果物      | `phase-2-design.md`       | クラス設計           |
| Vitest ドキュメント | https://vitest.dev/       | テストフレームワーク |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容   |
| -------------------- | --------------------------------------------------------------------------- | ------ |
| interfaces-agent-sdk | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義 |

---

## 成果物

| 成果物         | パス                                                                        | 内容       |
| -------------- | --------------------------------------------------------------------------- | ---------- |
| テストファイル | `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` | 単体テスト |

---

## テストコード（期待される成果物）

```typescript
// apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PermissionResolver } from "../PermissionResolver";
import type { PermissionResponse } from "@repo/shared";

describe("PermissionResolver", () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    vi.useFakeTimers();
    resolver = new PermissionResolver();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("waitForResponse", () => {
    it("should resolve when resolveRequest is called", async () => {
      const requestId = "test-request-1";
      const response: PermissionResponse = {
        requestId,
        approved: true,
        rememberChoice: false,
      };

      const waitPromise = resolver.waitForResponse(requestId);

      // 非同期でレスポンスを送信
      setTimeout(() => {
        resolver.resolveRequest(response);
      }, 100);

      vi.advanceTimersByTime(100);

      const result = await waitPromise;
      expect(result).toEqual(response);
    });

    it("should timeout after default timeout", async () => {
      const requestId = "test-request-2";

      const waitPromise = resolver.waitForResponse(requestId);

      // 5分経過
      vi.advanceTimersByTime(300000);

      await expect(waitPromise).rejects.toThrow(
        `Permission request timed out: ${requestId}`,
      );
    });

    it("should reject when signal is aborted", async () => {
      const requestId = "test-request-3";
      const controller = new AbortController();

      const waitPromise = resolver.waitForResponse(
        requestId,
        controller.signal,
      );

      controller.abort();

      await expect(waitPromise).rejects.toThrow(
        `Permission request aborted: ${requestId}`,
      );
    });

    it("should use custom timeout when provided", async () => {
      const customResolver = new PermissionResolver(1000); // 1秒
      const requestId = "test-request-4";

      const waitPromise = customResolver.waitForResponse(requestId);

      vi.advanceTimersByTime(1000);

      await expect(waitPromise).rejects.toThrow(
        `Permission request timed out: ${requestId}`,
      );
    });
  });

  describe("resolveRequest", () => {
    it("should resolve pending request", async () => {
      const requestId = "test-request-5";
      const response: PermissionResponse = {
        requestId,
        approved: false,
        rejectReason: "User denied",
      };

      const waitPromise = resolver.waitForResponse(requestId);

      resolver.resolveRequest(response);

      const result = await waitPromise;
      expect(result.approved).toBe(false);
      expect(result.rejectReason).toBe("User denied");
    });

    it("should do nothing for unknown requestId", () => {
      const response: PermissionResponse = {
        requestId: "unknown-id",
        approved: true,
      };

      // 例外が発生しないことを確認
      expect(() => {
        resolver.resolveRequest(response);
      }).not.toThrow();
    });

    it("should clear timeout when resolved", async () => {
      const requestId = "test-request-6";
      const response: PermissionResponse = {
        requestId,
        approved: true,
      };

      const waitPromise = resolver.waitForResponse(requestId);
      resolver.resolveRequest(response);

      await waitPromise;

      // タイムアウト後もエラーにならない
      vi.advanceTimersByTime(300000);
      expect(resolver.pendingCount).toBe(0);
    });
  });

  describe("cancelRequest", () => {
    it("should reject pending request", async () => {
      const requestId = "test-request-7";

      const waitPromise = resolver.waitForResponse(requestId);

      resolver.cancelRequest(requestId, "User cancelled");

      await expect(waitPromise).rejects.toThrow("User cancelled");
    });

    it("should use default message when reason is not provided", async () => {
      const requestId = "test-request-8";

      const waitPromise = resolver.waitForResponse(requestId);

      resolver.cancelRequest(requestId);

      await expect(waitPromise).rejects.toThrow(
        `Request cancelled: ${requestId}`,
      );
    });

    it("should do nothing for unknown requestId", () => {
      expect(() => {
        resolver.cancelRequest("unknown-id");
      }).not.toThrow();
    });
  });

  describe("cancelAll", () => {
    it("should cancel all pending requests", async () => {
      const requestId1 = "test-request-9";
      const requestId2 = "test-request-10";

      const waitPromise1 = resolver.waitForResponse(requestId1);
      const waitPromise2 = resolver.waitForResponse(requestId2);

      expect(resolver.pendingCount).toBe(2);

      resolver.cancelAll();

      await expect(waitPromise1).rejects.toThrow();
      await expect(waitPromise2).rejects.toThrow();
      expect(resolver.pendingCount).toBe(0);
    });

    it("should work when no pending requests", () => {
      expect(() => {
        resolver.cancelAll();
      }).not.toThrow();
    });
  });

  describe("pendingCount", () => {
    it("should return correct count", async () => {
      expect(resolver.pendingCount).toBe(0);

      resolver.waitForResponse("req-1");
      expect(resolver.pendingCount).toBe(1);

      resolver.waitForResponse("req-2");
      expect(resolver.pendingCount).toBe(2);

      resolver.cancelRequest("req-1");
      expect(resolver.pendingCount).toBe(1);
    });

    it("should decrease when request is resolved", async () => {
      const requestId = "test-request-11";
      resolver.waitForResponse(requestId);
      expect(resolver.pendingCount).toBe(1);

      resolver.resolveRequest({
        requestId,
        approved: true,
      });

      expect(resolver.pendingCount).toBe(0);
    });

    it("should decrease when request times out", async () => {
      resolver.waitForResponse("test-request-12");
      expect(resolver.pendingCount).toBe(1);

      vi.advanceTimersByTime(300000);

      expect(resolver.pendingCount).toBe(0);
    });
  });
});
```

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run PermissionResolver
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）
- [ ] 全テストケースが定義されている
- [ ] テストが受け入れ基準（AC-1〜AC-6）をカバーしている

---

## 完了条件

- [ ] テストファイルが作成されている
- [ ] `waitForResponse` の正常系テストが作成されている
- [ ] `resolveRequest` の正常系テストが作成されている
- [ ] `cancelRequest` の正常系テストが作成されている
- [ ] `cancelAll` の正常系テストが作成されている
- [ ] タイムアウトテストが作成されている
- [ ] AbortSignal テストが作成されている
- [ ] 存在しない requestId のテストが作成されている
- [ ] テストが失敗すること（Red状態）を確認している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-2-permission-resolver/phase-5-implementation.md`
