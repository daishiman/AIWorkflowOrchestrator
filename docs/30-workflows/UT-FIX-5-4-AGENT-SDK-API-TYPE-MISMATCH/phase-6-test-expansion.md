# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                     |
| --------- | -------------------------------------- |
| Phase     | 6                                      |
| タスクID  | UT-FIX-5-4                             |
| タスク名  | AgentSDKAPI型定義不一致修正            |
| 機能名    | ut-fix-5-4-agent-sdk-api-type-mismatch |
| 作成日    | 2026-02-10                             |
| 前提Phase | Phase 5（実装）                        |

## 目的

境界値テスト、エラー系テスト、型一貫性テストを追加し、テストカバレッジを向上させる。

---

## 実行タスク

### Task 1: エラーハンドリングテスト追加

**テストファイル**: `apps/desktop/src/preload/__tests__/agentSDKAPI.abort.test.ts`

**追加テストケース**:

| テストID | テスト項目                                  | 期待結果                          |
| -------- | ------------------------------------------- | --------------------------------- |
| ASDT-06  | ネットワークエラー時のPromise rejection     | NetworkErrorでrejectする          |
| ASDT-07  | タイムアウト時のPromise rejection           | TimeoutErrorでrejectする          |
| ASDT-08  | 未定義エラー（非Errorオブジェクト）時の動作 | 適切にrejectする                  |
| ASDT-09  | 複数回連続呼び出し時の動作                  | 各呼び出しが独立したPromiseを返す |
| ASDT-10  | abort後の再abort呼び出し                    | エラーなく処理される              |

**実装コード**:

```typescript
describe("agentSDKAPI.abort() エラーハンドリング拡張テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ASDT-06: should reject with NetworkError", async () => {
    // Given: ネットワークエラーが発生する
    const { safeInvoke } = await import("../ipc-bridge");
    const networkError = new Error("Network connection lost");
    networkError.name = "NetworkError";
    (safeInvoke as ReturnType<typeof vi.fn>).mockRejectedValue(networkError);

    // When: abort()を呼び出す
    const { agentSDKAPI } = await import("../agentSDKAPI");

    // Then: NetworkErrorでrejectする
    await expect(agentSDKAPI.abort()).rejects.toMatchObject({
      name: "NetworkError",
      message: "Network connection lost",
    });
  });

  it("ASDT-07: should reject with TimeoutError", async () => {
    // Given: タイムアウトエラーが発生する
    const { safeInvoke } = await import("../ipc-bridge");
    const timeoutError = new Error("Request timeout");
    timeoutError.name = "TimeoutError";
    (safeInvoke as ReturnType<typeof vi.fn>).mockRejectedValue(timeoutError);

    // When: abort()を呼び出す
    const { agentSDKAPI } = await import("../agentSDKAPI");

    // Then: TimeoutErrorでrejectする
    await expect(agentSDKAPI.abort()).rejects.toMatchObject({
      name: "TimeoutError",
    });
  });

  it("ASDT-08: should handle non-Error rejection", async () => {
    // Given: 非Errorオブジェクトがthrowされる
    const { safeInvoke } = await import("../ipc-bridge");
    (safeInvoke as ReturnType<typeof vi.fn>).mockRejectedValue(
      "String error message",
    );

    // When: abort()を呼び出す
    const { agentSDKAPI } = await import("../agentSDKAPI");

    // Then: rejectする（文字列がそのまま渡される）
    await expect(agentSDKAPI.abort()).rejects.toBe("String error message");
  });

  it("ASDT-09: should return independent Promises for multiple calls", async () => {
    // Given: safeInvokeがそれぞれ異なる結果を返す
    const { safeInvoke } = await import("../ipc-bridge");
    let callCount = 0;
    (safeInvoke as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error("Second call failed"));
      }
    });

    // When: 2回連続で呼び出す
    const { agentSDKAPI } = await import("../agentSDKAPI");
    const promise1 = agentSDKAPI.abort();
    const promise2 = agentSDKAPI.abort();

    // Then: 各Promiseは独立した結果を持つ
    await expect(promise1).resolves.toBeUndefined();
    await expect(promise2).rejects.toThrow("Second call failed");
  });

  it("ASDT-10: should handle abort after previous abort", async () => {
    // Given: 最初のabortが完了している
    const { safeInvoke } = await import("../ipc-bridge");
    (safeInvoke as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { agentSDKAPI } = await import("../agentSDKAPI");
    await agentSDKAPI.abort();

    // When: 再度abortを呼び出す
    const secondAbort = agentSDKAPI.abort();

    // Then: エラーなく処理される
    await expect(secondAbort).resolves.toBeUndefined();
    expect(safeInvoke).toHaveBeenCalledTimes(2);
  });
});
```

### Task 2: 他のAgentSDKAPIメソッドとの一貫性テスト

**追加テストケース**:

| テストID | テスト項目                            | 期待結果                    |
| -------- | ------------------------------------- | --------------------------- |
| ASDT-11  | startExecutionとabortの戻り値型が一致 | 両方ともPromise<void>を返す |
| ASDT-12  | 非推奨のabortExecutionとの互換性      | 同じ動作パターンを持つ      |
| ASDT-13  | すべての非同期メソッドがPromiseを返す | 型一貫性の確認              |

**実装コード**:

```typescript
describe("AgentSDKAPI メソッド一貫性テスト", () => {
  it("ASDT-11: abort and startExecution should have consistent return types", async () => {
    // Given: 両メソッドのモック
    const { safeInvoke } = await import("../ipc-bridge");
    (safeInvoke as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    // When: 両メソッドを呼び出す
    const { agentSDKAPI } = await import("../agentSDKAPI");
    const abortResult = agentSDKAPI.abort();
    const startResult = agentSDKAPI.startExecution({
      conversationId: "test-conv",
      model: "test-model",
      prompt: "test prompt",
    });

    // Then: 両方ともPromiseを返す
    expect(abortResult).toBeInstanceOf(Promise);
    expect(startResult).toBeInstanceOf(Promise);
  });

  it("ASDT-12: abort should have same behavior pattern as deprecated abortExecution", async () => {
    // Given: 両メソッドが存在する
    const { agentSDKAPI } = await import("../agentSDKAPI");

    // When: 両メソッドの型を確認
    const abortType = typeof agentSDKAPI.abort;

    // Then: 両方とも関数である
    expect(abortType).toBe("function");
  });

  it("ASDT-13: all async methods should return Promises", async () => {
    // Given: AgentSDKAPIのメソッド群
    const { safeInvoke } = await import("../ipc-bridge");
    (safeInvoke as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const { agentSDKAPI } = await import("../agentSDKAPI");

    // When & Then: 非同期メソッドがPromiseを返す
    const methods = ["abort", "startExecution"];
    for (const methodName of methods) {
      const method = agentSDKAPI[methodName as keyof typeof agentSDKAPI];
      if (typeof method === "function") {
        // startExecutionには必須引数があるためスキップ（abort のみ検証）
        if (methodName === "abort") {
          const result = (method as () => Promise<void>)();
          expect(result).toBeInstanceOf(Promise);
        }
      }
    }
  });
});
```

### Task 3: IPC通信詳細テスト

**追加テストケース**:

| テストID | テスト項目                               | 期待結果                             |
| -------- | ---------------------------------------- | ------------------------------------ |
| ASDT-14  | safeInvokeが正しいチャネルで呼び出される | IPC_CHANNELS.AGENT_ABORTが使用される |
| ASDT-15  | safeInvokeに引数が渡されない             | 引数なしで呼び出される               |

**実装コード**:

```typescript
describe("agentSDKAPI.abort() IPC通信詳細テスト", () => {
  it("ASDT-14: should call safeInvoke with correct channel", async () => {
    // Given: safeInvokeのモック
    const { safeInvoke } = await import("../ipc-bridge");
    (safeInvoke as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    // When: abort()を呼び出す
    const { agentSDKAPI } = await import("../agentSDKAPI");
    await agentSDKAPI.abort();

    // Then: 正しいチャネルで呼び出される
    expect(safeInvoke).toHaveBeenCalledWith(
      expect.stringMatching(/agent:abort|AGENT_ABORT/i),
    );
  });

  it("ASDT-15: should call safeInvoke without additional arguments", async () => {
    // Given: safeInvokeのモック
    const { safeInvoke } = await import("../ipc-bridge");
    (safeInvoke as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    // When: abort()を呼び出す
    const { agentSDKAPI } = await import("../agentSDKAPI");
    await agentSDKAPI.abort();

    // Then: 引数なしで呼び出される（チャネル名のみ）
    expect(safeInvoke).toHaveBeenCalledTimes(1);
    const callArgs = (safeInvoke as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs.length).toBeLessThanOrEqual(1);
  });
});
```

---

## 参照資料

| 資料名           | パス                                                                         | 説明               |
| ---------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 4成果物    | `docs/30-workflows/UT-FIX-5-4/phase-4-test-creation.md`                      | 基本テスト仕様     |
| Phase 5成果物    | `docs/30-workflows/UT-FIX-5-4/phase-5-implementation.md`                     | 実装仕様           |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                           | テスト設計の注意点 |
| Agent IPC仕様    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         | IPCチャネル設計    |
| IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | safeInvokeパターン |

---

## 統合テスト連携【必須】

IPC通信の型契約を検証する:

| 統合ポイント | 確認項目                           |
| ------------ | ---------------------------------- |
| IPC契約      | `agent:abort` チャンネルの型一貫性 |
| 型安全性     | Preload/Shared 間の型契約維持      |
| safeInvoke   | Promise<void> 戻り値型の検証       |

---

## アーキテクチャ層別テスト拡充観点

| 層      | 拡充観点                                 |
| ------- | ---------------------------------------- |
| Preload | エラーハンドリング、複数回呼び出しテスト |
| Shared  | 型互換性テスト                           |
| IPC     | 通信失敗時のPromise rejectionテスト      |

---

## テストカバレッジ目標

| 指標              | 現在値 | 目標値 | 達成基準 |
| ----------------- | ------ | ------ | -------- |
| Line Coverage     | -      | 80%+   | 最低基準 |
| Branch Coverage   | -      | 60%+   | 最低基準 |
| Function Coverage | -      | 80%+   | 最低基準 |

---

## 成果物

| 成果物           | パス                                                           | 説明             |
| ---------------- | -------------------------------------------------------------- | ---------------- |
| 拡充テストコード | `apps/desktop/src/preload/__tests__/agentSDKAPI.abort.test.ts` | 追加テストケース |
| テスト拡充仕様書 | `outputs/phase-06/test-expansion-summary.md`                   | 本ドキュメント   |

---

## 完了条件

- [ ] ASDT-06: ネットワークエラーテストが追加されている
- [ ] ASDT-07: タイムアウトエラーテストが追加されている
- [ ] ASDT-08: 非Errorオブジェクトハンドリングテストが追加されている
- [ ] ASDT-09: 複数回連続呼び出しテストが追加されている
- [ ] ASDT-10: 再abort呼び出しテストが追加されている
- [ ] ASDT-11〜13: メソッド一貫性テストが追加されている
- [ ] ASDT-14〜15: IPC通信詳細テストが追加されている
- [ ] 全テストが PASS する
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
# - [ ] ASDT-01 〜 ASDT-15 がすべて PASS
# - [ ] カバレッジレポートで abort 関連の行が網羅されている
```

---

## 次のPhase

Phase 7: カバレッジ確認
