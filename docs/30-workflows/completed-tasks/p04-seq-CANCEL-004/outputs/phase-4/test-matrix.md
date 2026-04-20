# Phase 4: テストマトリクス (AC ↔ Test 対応表)

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | TASK-SW-CANCEL-004                                                      |
| Phase      | 4                                                                       |
| 作成日     | 2026-04-20                                                              |
| 対象テスト | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` |
| 対象実装   | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                |

## 1. 既存テストケース棚卸し

| #   | テスト名                                                                 | 検証観点                                                      | 行    |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------- | ----- |
| T-1 | `startGeneration が AbortSignal を返す`                                  | `startGeneration()` の返り値が AbortSignal 型で aborted=false | 28-38 |
| T-2 | `cancelGeneration が AbortSignal を abort する`                          | `abort()` 呼び出し + IPC `cancelGeneration` 1回呼び出し       | 40-54 |
| T-3 | `cancelGeneration がストアを cancelled に更新する`                       | `streamingStage === "cancelled"`                              | 56-68 |
| T-4 | `startGeneration を呼ばずに cancelGeneration を呼んでもクラッシュしない` | undefined guard + stage 更新                                  | 70-78 |

## 2. AC ↔ Test 対応表

| AC                                    | contract                                   | 対応 Test               | 状態        |
| ------------------------------------- | ------------------------------------------ | ----------------------- | ----------- |
| AC-1 (`verify_existing` / NON_VISUAL) | spec metadata 整合                         | N/A (metadata レビュー) | OK          |
| AC-2 (Phase 4-5 は既存検証)           | `abort → ref clear → setStage → IPC await` | T-2, T-3, T-4           | **Covered** |
| AC-3 (Phase 11 NON_VISUAL 3点セット)  | 証跡方針                                   | N/A (Phase 11)          | OK          |
| AC-4 (Phase 12 6成果物 + parity)      | docs                                       | N/A (Phase 12)          | OK          |
| AC-5 (4条件)                          | spec 全体整合                              | N/A                     | OK          |

## 3. 契約観点 ↔ Test 対応表

| #   | 観点                              | 対応 Test                                              | 状態                 |
| --- | --------------------------------- | ------------------------------------------------------ | -------------------- |
| C-1 | `abort()` 呼び出し                | T-2 (`signal.aborted === true`)                        | Covered              |
| C-2 | `ref clear`                       | （間接的に T-4 で検証 — 再 cancel がクラッシュしない） | Indirectly covered   |
| C-3 | `setStage("cancelled")`           | T-3, T-4                                               | Covered              |
| C-4 | IPC `cancelGeneration` 呼び出し   | T-2 (`toHaveBeenCalledTimes(1)`)                       | Covered              |
| C-5 | undefined guard (start 前 cancel) | T-4                                                    | Covered              |
| C-6 | **IPC failure swallow (catch)**   | **対応テストなし**                                     | **Uncovered**        |
| C-7 | `Promise<void>` 戻り値型          | 型推論で担保（TypeScript）                             | Compile-time covered |

## 4. 不足ケース判定

### 4.1 未カバー観点

- **C-6: IPC failure swallow**
  - 対象コード: `useCancelGeneration.ts:36-40` の `try/catch`
  - 重要度: 中（contract の一部、UI 伝播防止の要）
  - 現行テストでは `mockResolvedValue` のみで reject パスを検証していない

### 4.2 targeted 追加方針（Phase 6 で実施）

**新規ファイルは作成しない**。既存の `useCancelGeneration.test.ts` へ 1 ケースのみ追加する想定:

```typescript
it("IPC cancelGeneration が reject してもエラーを伝播させない", async () => {
  const rejectingMock = vi.fn().mockRejectedValue(new Error("IPC fail"));
  Object.defineProperty(window, "skillCreatorAPI", {
    value: { cancelGeneration: rejectingMock },
    writable: true,
    configurable: true,
  });

  const { result } = renderHook(() => useCancelGeneration());

  await expect(
    act(async () => {
      await result.current.cancelGeneration();
    }),
  ).resolves.not.toThrow();

  expect(useAppStore.getState().streamingStage).toBe("cancelled");
});
```

## 5. Phase 4 結論

- 既存4ケースで AC-2 主要観点を **Covered**
- **C-6 (IPC failure swallow) のみ Uncovered**、Phase 6 で targeted 1 ケース追加を推奨
- 新規テストファイルは不要
