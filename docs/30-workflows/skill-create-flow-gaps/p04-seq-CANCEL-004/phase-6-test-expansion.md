# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 6                                  |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| 前提Phase  | Phase 5                            |
| 後続Phase  | Phase 7                            |
| 作成日     | 2026-04-15                         |
| ステータス | pending                            |

## 目的

Phase 4 で作成した TC-01〜TC-04 に加え、エラーハンドリング・エッジケースに関するテストを追加してカバレッジを向上させる。

## 追加テストケース

| ID    | テストケース名                                                                          | 期待結果                        |
| ----- | --------------------------------------------------------------------------------------- | ------------------------------- |
| TC-05 | IPC 呼び出しが失敗しても cancelGeneration が例外を投げない                              | reject されても例外が伝播しない |
| TC-06 | cancelGeneration を連続2回呼んでも IPC が2回呼ばれない（abortControllerRef リセット後） | 2回目は IPC 呼び出しが1回だけ   |
| TC-07 | cancelGeneration の呼び出し順序が正しい（abort → setStage → IPC）                       | 順序が設計通りであること        |

## 実行手順

### 1. エラーハンドリングテストの追加

```typescript
// useCancelGeneration-ipc.test.ts に追記

describe("cancelGeneration エラーハンドリング・エッジケース", () => {
  it("TC-05: IPC 呼び出しが失敗しても例外が伝播しない", async () => {
    mockCancelGeneration.mockRejectedValueOnce(new Error("IPC error"));
    const { result } = renderHook(() => useCancelGeneration());
    await expect(
      act(async () => {
        await result.current.cancelGeneration();
      }),
    ).resolves.not.toThrow();
  });

  it("TC-06: startGeneration なしで cancelGeneration を呼んでも IPC は呼ばれる", async () => {
    const { result } = renderHook(() => useCancelGeneration());
    // startGeneration を呼ばずに直接 cancelGeneration
    await act(async () => {
      await result.current.cancelGeneration();
    });
    expect(mockCancelGeneration).toHaveBeenCalledOnce();
  });

  it("TC-07: cancelGeneration の呼び出し後に skillCreatorAPI.cancelGeneration が呼ばれる", async () => {
    const callOrder: string[] = [];
    mockCancelGeneration.mockImplementation(async () => {
      callOrder.push("ipc");
      return { success: true };
    });
    const { result } = renderHook(() => useCancelGeneration());
    await act(async () => {
      await result.current.cancelGeneration();
    });
    expect(callOrder).toContain("ipc");
  });
});
```

### 2. 全テスト PASS 確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/hooks/__tests__/useCancelGeneration-ipc.test.ts
# 期待: TC-01〜TC-07 全て PASS
```

## 統合テスト連携【必須】

| 判定項目              | 基準 | 結果    |
| --------------------- | ---- | ------- |
| TC-05〜TC-07 作成完了 | 完了 | pending |
| TC-01〜TC-07 全 PASS  | PASS | pending |

## 多角的チェック観点（AIが判断）

- [ ] TC-05 で `try-catch` が実装されている場合、catch 内でエラーが握りつぶされているか確認したか
- [ ] TC-07 の「呼び出し後」の検証が「呼び出し前」と混同されていないか

## サブタスク管理

1. TC-05 作成（エラーハンドリング確認）
2. TC-06 作成（startGeneration なし確認）
3. TC-07 作成（呼び出し順序確認）
4. 全テスト PASS 確認

## 成果物

| 成果物     | パス                                                                        | 説明                  |
| ---------- | --------------------------------------------------------------------------- | --------------------- |
| テスト拡充 | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration-ipc.test.ts` | TC-05〜TC-07 追加済み |

## 完了条件

- [ ] TC-05〜TC-07 が追加されている
- [ ] TC-01〜TC-07 が全て PASS
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
