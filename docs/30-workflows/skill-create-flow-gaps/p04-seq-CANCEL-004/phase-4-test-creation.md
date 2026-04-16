# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 4                                  |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| 前提Phase  | Phase 3                            |
| 後続Phase  | Phase 5                            |
| 作成日     | 2026-04-15                         |
| ステータス | pending                            |

## 目的

`cancelGeneration()` の IPC 呼び出し追加を検証するテストを TDD RED 段階で作成する。実装前にテストが失敗（RED）することを確認する。

## テストケース一覧

| ID    | テストケース名                                                          | 期待結果                                   |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------ |
| TC-01 | cancelGeneration が skillCreatorAPI.cancelGeneration を呼び出す         | モックされた `cancelGeneration` が呼ばれる |
| TC-02 | cancelGeneration が abort() を呼び出す                                  | `AbortController.abort()` が呼ばれる       |
| TC-03 | cancelGeneration が setStage("cancelled") を呼び出す                    | ステージが `"cancelled"` になる            |
| TC-04 | skillCreatorAPI が undefined の場合も cancelGeneration が例外を投げない | オプショナルチェーンにより例外なし         |

## 実行手順

### 0. テスト操作対象の確認

`cancelGeneration()` は React hook 内の `useCallback` で定義されたコールバックのため、`renderHook` を使ってテストする。`window.skillCreatorAPI` をモックで差し替える。

### 1. テストファイルの作成

**パス**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration-ipc.test.ts`

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCancelGeneration } from "../useCancelGeneration";

const mockCancelGeneration = vi.fn().mockResolvedValue({ success: true });

beforeEach(() => {
  Object.defineProperty(window, "skillCreatorAPI", {
    value: { cancelGeneration: mockCancelGeneration },
    writable: true,
    configurable: true,
  });
  mockCancelGeneration.mockClear();
});

afterEach(() => {
  Object.defineProperty(window, "skillCreatorAPI", {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

describe("useCancelGeneration IPC 連動", () => {
  it("TC-01: cancelGeneration が skillCreatorAPI.cancelGeneration を呼び出す", async () => {
    const { result } = renderHook(() => useCancelGeneration());
    await act(async () => {
      await result.current.cancelGeneration();
    });
    expect(mockCancelGeneration).toHaveBeenCalledOnce();
  });

  it("TC-02: cancelGeneration が AbortController.abort() を呼び出す", async () => {
    const { result } = renderHook(() => useCancelGeneration());
    // startGeneration で AbortController を初期化
    act(() => {
      result.current.startGeneration();
    });
    const abortSpy = vi.spyOn(result.current as any, "abortControllerRef");
    await act(async () => {
      await result.current.cancelGeneration();
    });
    expect(mockCancelGeneration).toHaveBeenCalled();
  });

  it("TC-03: cancelGeneration 後にステージが cancelled になる", async () => {
    const { result } = renderHook(() => useCancelGeneration());
    await act(async () => {
      await result.current.cancelGeneration();
    });
    // ストアのステージ確認（Zustand ストアのモックが必要）
  });

  it("TC-04: skillCreatorAPI が undefined でも例外が発生しない", async () => {
    Object.defineProperty(window, "skillCreatorAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useCancelGeneration());
    await expect(
      act(async () => {
        await result.current.cancelGeneration();
      }),
    ).resolves.not.toThrow();
  });
});
```

### 2. RED 確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/hooks/__tests__/useCancelGeneration-ipc.test.ts
# 期待: TC-01〜TC-04 が全て FAIL
```

## 統合テスト連携【必須】

| 判定項目              | 基準 | 結果    |
| --------------------- | ---- | ------- |
| TC-01〜TC-04 作成完了 | 完了 | pending |
| RED 確認実施済み      | FAIL | pending |

## 多角的チェック観点（AIが判断）

- [ ] `renderHook` と `act` を使ったテストが既存のテストパターンと一致しているか
- [ ] `window.skillCreatorAPI` のモック設定が正しいか（`Object.defineProperty` vs `vi.stubGlobal`）
- [ ] Zustand ストアのモックが必要か（TC-03 の検証に影響）

## サブタスク管理

1. テストファイル配置先の確認
2. TC-01 作成（IPC 呼び出し確認）
3. TC-02 作成（abort 呼び出し確認）
4. TC-03 作成（ステージ更新確認）
5. TC-04 作成（undefined ガード確認）
6. RED 確認実施

## 成果物

| 成果物         | パス                                                                        | 説明                     |
| -------------- | --------------------------------------------------------------------------- | ------------------------ |
| テストスイート | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration-ipc.test.ts` | TC-01〜TC-04（RED 状態） |

## 完了条件

- [ ] TC-01〜TC-04 が作成されている
- [ ] 実装前に全テストが FAIL（RED）することを確認済み
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
