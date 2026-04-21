# Phase 4 成果物: test-scenarios.md

## メタ情報

| 項目     | 値                                                                                         |
| -------- | ------------------------------------------------------------------------------------------ |
| Phase    | 4                                                                                          |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                                                      |
| Lane     | Lane B（テスト / 実装 / カバレッジ仕様書）                                                 |
| 目的     | `useStreamingProgress` の planId フィルタロジックに対する targeted test シナリオを確定する |
| 出力範囲 | spec-only（実テストコードの生成・コミットは本 spec では対象外）                            |

## TC ↔ AC マッピング（AC-4〜AC-7）

| TC ID | 観点                                                                  | 対応 AC | 期待挙動                                                                                                    |
| ----- | --------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| TC-01 | filter match: `options.planId` と `progress.planId` が一致            | AC-4    | 受信コールバックが通過し、Zustand ストアの `updateProgress` が `{ stage, percent, message }` で呼び出される |
| TC-02 | filter miss: `options.planId` と `progress.planId` が異なる値         | AC-5    | コールバック冒頭で early return し、`updateProgress` / `setStage("error")` / `setError` いずれも呼ばれない  |
| TC-03 | legacy payload: `progress.planId === undefined`                       | AC-6    | `options.planId` の指定有無に関わらず通知が受理され、後方互換で `updateProgress` が呼ばれる                 |
| TC-04 | no options: Hook に `options` 未指定 または `options.planId` が未指定 | AC-7    | `progress.planId` の値に関わらず全通知が受理される                                                          |

補足: TC-01〜TC-04 はすべて `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts` に追加する前提（vitest + React Testing Library の既存モック方式を踏襲）。

## Arrange / Act / Assert（vitest 形式擬似コード）

既存テストと同じ `window.skillCreatorAPI` モックパターンを踏襲し、`renderHook` で `options` 引数を渡す。

### TC-01: filter match

```ts
// Arrange
let emit: (p: SkillCreatorProgress) => void = () => {};
const cleanup = vi.fn();
(window as any).skillCreatorAPI = {
  onProgress: (cb) => {
    emit = cb;
    return cleanup;
  },
};
const updateProgress = vi.fn();
vi.mocked(useUpdateStreamingProgress).mockReturnValue(updateProgress);

// Act
const { unmount } = renderHook(() =>
  useStreamingProgress({ planId: "plan-A" }),
);
act(() => {
  emit({
    phase: "planning",
    percentage: 10,
    message: "start",
    planId: "plan-A",
  });
});

// Assert
expect(updateProgress).toHaveBeenCalledWith({
  stage: "planning",
  percent: 10,
  message: "start",
});
unmount();
expect(cleanup).toHaveBeenCalled();
```

### TC-02: filter miss

```ts
// Arrange（TC-01 と同様に emit / updateProgress をセット）
const updateProgress = vi.fn();
const setStage = vi.fn();
const setError = vi.fn();

// Act
renderHook(() => useStreamingProgress({ planId: "plan-A" }));
act(() => {
  emit({
    phase: "generating-skill",
    percentage: 42,
    message: "other plan progress",
    planId: "plan-B", // 不一致
  });
});

// Assert
expect(updateProgress).not.toHaveBeenCalled();
expect(setStage).not.toHaveBeenCalled();
expect(setError).not.toHaveBeenCalled();
```

### TC-03: legacy payload（planId 未設定）

```ts
// Arrange
const updateProgress = vi.fn();

// Act: options.planId 指定あり / progress.planId 欠落
renderHook(() => useStreamingProgress({ planId: "plan-A" }));
act(() => {
  emit({
    phase: "validating",
    percentage: 80,
    message: "legacy emitter",
    // planId: undefined（後方互換）
  });
});

// Assert: 後方互換で受理される（AC-6）
expect(updateProgress).toHaveBeenCalledWith({
  stage: "validating",
  percent: 80,
  message: "legacy emitter",
});
```

### TC-04: no options（全通知許容）

```ts
// Arrange
const updateProgress = vi.fn();

// Act: options 未指定で登録
renderHook(() => useStreamingProgress());
act(() => {
  emit({
    phase: "planning",
    percentage: 5,
    message: "from plan-X",
    planId: "plan-X",
  });
  emit({
    phase: "done",
    percentage: 100,
    message: "from plan-Y",
    planId: "plan-Y",
  });
});

// Assert: 両方とも受理
expect(updateProgress).toHaveBeenCalledTimes(2);
```

## 既存テスト PASS 維持方針（AC-8）

| 方針       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 後方互換   | `useStreamingProgress()` を引数なしで呼ぶ既存呼び出しが壊れないよう、`options` は完全にオプショナル                                                                |
| シグネチャ | `SkillCreatorProgress` への `planId?` / `requestId?` 追加は型のオプショナル拡張のみで、既存 payload `{ phase, percentage, message }` は引き続き合法                |
| 挙動互換   | `options.planId` 未指定かつ `progress.planId` 未指定の既存ケースは TC-04 / TC-03 の組み合わせで covered                                                            |
| テスト修正 | 既存の `useStreamingProgress.test.ts` を修正する場合は「追加のみ」を原則とし、Arrange/Act/Assert のブロックを変更せず新 describe / it を追加                       |
| 回帰確認   | `pnpm --filter @repo/desktop test -- --run useStreamingProgress` と `pnpm --filter @repo/desktop test -- --run skill-creator` の両方が PASS することをゲートとする |

## 参照

- phase-1-requirements.md AC-4 / AC-5 / AC-6 / AC-7 / AC-8
- phase-2-design.md Hook filter 擬似コード
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`
