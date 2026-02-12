# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| タスクID   | UT-FIX-5-4                             |
| タスク名   | AgentSDKAPI型定義不一致修正            |
| 機能名     | ut-fix-5-4-agent-sdk-api-type-mismatch |
| 作成日     | 2026-02-10                             |
| 依存タスク | UT-FIX-5-3                             |

## 目的

`agentSDKAPI.abort()` メソッドの型定義修正を検証するテストを、実装より先に作成する（Red状態）。

---

## 実行タスク

### Task 1: テストケース設計

**目的**: `abort()` メソッドの型安全性を検証するテストケースを設計する

**テストケース一覧**:

| テストID | テスト項目                                                | 期待結果                              |
| -------- | --------------------------------------------------------- | ------------------------------------- |
| ASDT-01  | `abort()` が `Promise<void>` を返すことを検証             | 戻り値が `Promise` インスタンスである |
| ASDT-02  | `await abort()` でエラーなく待機できることを検証          | `await` 後に正常終了する              |
| ASDT-03  | IPC通信成功時にPromiseがresolveすることを検証             | `resolved` 状態になる                 |
| ASDT-04  | IPC通信失敗時にPromise rejectionが発生することを検証      | `rejected` 状態になる                 |
| ASDT-05  | 他のAgentSDKAPIメソッドと戻り値型が一貫していることを検証 | 全メソッドがPromiseを返す             |

### Task 2: テスト仕様書作成

**成果物パス**: `outputs/phase-04/test-specification.md`

**テスト仕様内容**:

```markdown
# abort()メソッド型定義テスト仕様

## テスト対象

- ファイル: `apps/desktop/src/preload/types.ts` (AgentSDKAPI.abort)
- ファイル: `packages/shared/src/agent/types.ts` (AgentAPI.abort)

## 前提条件

- UT-FIX-5-3のセキュリティ修正が完了していること
- `safeInvoke` が正しく `IPC_CHANNELS.AGENT_ABORT` を呼び出すこと

## テスト環境

- Vitest
- モック: `safeInvoke` 関数

## テストデータ

- 正常系: `safeInvoke` が `Promise.resolve()` を返す
- 異常系: `safeInvoke` が `Promise.reject(new Error("IPC Error"))` を返す
```

### Task 3: テストコード実装

**テストファイル**: `apps/desktop/src/preload/__tests__/agentSDKAPI.abort.test.ts`

**実装コード**:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// モック設定
vi.mock("../ipc-bridge", () => ({
  safeInvoke: vi.fn(),
}));

describe("agentSDKAPI.abort() 型定義テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("戻り値の型検証", () => {
    it("ASDT-01: should return a Promise", async () => {
      // Given: safeInvokeがPromiseを返す
      const { safeInvoke } = await import("../ipc-bridge");
      (safeInvoke as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // When: abort()を呼び出す
      const { agentSDKAPI } = await import("../agentSDKAPI");
      const result = agentSDKAPI.abort();

      // Then: 戻り値がPromiseである
      expect(result).toBeInstanceOf(Promise);
    });

    it("ASDT-02: should be awaitable without error", async () => {
      // Given: safeInvokeが正常に完了する
      const { safeInvoke } = await import("../ipc-bridge");
      (safeInvoke as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // When: await abort()を実行
      const { agentSDKAPI } = await import("../agentSDKAPI");

      // Then: エラーなく完了する
      await expect(agentSDKAPI.abort()).resolves.toBeUndefined();
    });
  });

  describe("Promise動作検証", () => {
    it("ASDT-03: should resolve on successful IPC communication", async () => {
      // Given: IPC通信が成功する
      const { safeInvoke } = await import("../ipc-bridge");
      (safeInvoke as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // When: abort()を呼び出す
      const { agentSDKAPI } = await import("../agentSDKAPI");
      const promise = agentSDKAPI.abort();

      // Then: Promiseがresolveする
      await expect(promise).resolves.not.toThrow();
    });

    it("ASDT-04: should reject on IPC communication failure", async () => {
      // Given: IPC通信が失敗する
      const { safeInvoke } = await import("../ipc-bridge");
      const ipcError = new Error("IPC communication failed");
      (safeInvoke as ReturnType<typeof vi.fn>).mockRejectedValue(ipcError);

      // When: abort()を呼び出す
      const { agentSDKAPI } = await import("../agentSDKAPI");
      const promise = agentSDKAPI.abort();

      // Then: Promiseがrejectする
      await expect(promise).rejects.toThrow("IPC communication failed");
    });
  });

  describe("他メソッドとの一貫性検証", () => {
    it("ASDT-05: should have consistent return type with other AgentSDKAPI methods", async () => {
      // Given: AgentSDKAPIのメソッド群
      const { agentSDKAPI } = await import("../agentSDKAPI");

      // When: 各メソッドの型を確認
      const abortResult = agentSDKAPI.abort();

      // Then: abortがPromiseを返す（他メソッドと同様）
      expect(abortResult).toBeInstanceOf(Promise);

      // 型定義上、以下のメソッドもPromiseを返すことを確認
      // - startExecution: Promise<void>
      // - abortExecution: Promise<void> (deprecated)
      // 型レベルでの一貫性は TypeScript コンパイラが検証
    });
  });
});
```

### Task 4: 型レベルテスト

**テストファイル**: `apps/desktop/src/preload/__tests__/agentSDKAPI.types.test.ts`

**実装コード**:

```typescript
import { describe, it, expectTypeOf } from "vitest";
import type { AgentSDKAPI } from "../types";

describe("AgentSDKAPI 型定義テスト", () => {
  it("ASDT-TYPE-01: abort() should return Promise<void>", () => {
    // 型レベルテスト: abort()の戻り値がPromise<void>であること
    expectTypeOf<AgentSDKAPI["abort"]>().returns.toEqualTypeOf<Promise<void>>();
  });

  it("ASDT-TYPE-02: abort() should match other async method signatures", () => {
    // 型レベルテスト: startExecutionとabortが同じPromise<void>を返すこと
    expectTypeOf<AgentSDKAPI["abort"]>().returns.toEqualTypeOf<
      ReturnType<AgentSDKAPI["startExecution"]>
    >();
  });
});
```

---

## 参照資料

| 資料名           | パス                                                                | 説明                     |
| ---------------- | ------------------------------------------------------------------- | ------------------------ |
| タスク指示書     | `docs/30-workflows/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/index.md` | タスク仕様               |
| 型定義ファイル   | `apps/desktop/src/preload/types.ts`                                 | 修正対象の型定義         |
| 共有型定義       | `packages/shared/src/agent/types.ts`                                | 修正対象の正本型定義     |
| 既存テスト       | `apps/desktop/src/preload/__tests__/`                               | 参考テストコード         |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                  | TDDの原則                |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                | P23: API二重定義の型管理 |

---

## 統合テスト連携【必須】

IPC通信の型契約を検証する:

| 統合ポイント | 確認項目                           |
| ------------ | ---------------------------------- |
| IPC契約      | `agent:abort` チャンネルの型一貫性 |
| 型安全性     | Preload/Shared 間の型契約維持      |
| safeInvoke   | Promise<void> 戻り値型の検証       |

---

## アーキテクチャ層別テスト観点

| 層      | テスト観点                                       |
| ------- | ------------------------------------------------ |
| Preload | `abort()` が `Promise<void>` を返すことを検証    |
| Shared  | `AgentAPI.abort` の型定義が正しいことを検証      |
| IPC     | `agent:abort` チャンネルの呼び出しパターンを検証 |

---

## 成果物

| 成果物           | パス                                                           | 説明               |
| ---------------- | -------------------------------------------------------------- | ------------------ |
| テスト仕様書     | `outputs/phase-04/test-specification.md`                       | テスト設計仕様     |
| テストケース一覧 | `outputs/phase-04/test-cases.md`                               | テストケースID一覧 |
| ランタイムテスト | `apps/desktop/src/preload/__tests__/agentSDKAPI.abort.test.ts` | Promise動作テスト  |
| 型レベルテスト   | `apps/desktop/src/preload/__tests__/agentSDKAPI.types.test.ts` | 型定義検証テスト   |

---

## 完了条件

- [ ] ASDT-01: Promiseインスタンス検証テストが作成されている
- [ ] ASDT-02: await動作テストが作成されている
- [ ] ASDT-03: IPC成功時のresolveテストが作成されている
- [ ] ASDT-04: IPC失敗時のrejectテストが作成されている
- [ ] ASDT-05: 他メソッドとの一貫性テストが作成されている
- [ ] ASDT-TYPE-01〜02: 型レベルテストが作成されている
- [ ] すべてのテストが失敗状態（Red）を確認
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "agentSDKAPI.abort"

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] ASDT-TYPE-01: 型エラーが発生する（abort(): void と Promise<void> の不一致）
# - [ ] 他のテストは型修正後に PASS になる見込み
```

---

## 次のPhase

Phase 5: 実装（TDD: Green）
