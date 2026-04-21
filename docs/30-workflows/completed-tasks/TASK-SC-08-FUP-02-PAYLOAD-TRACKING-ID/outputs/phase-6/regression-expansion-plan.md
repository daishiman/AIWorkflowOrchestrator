# Phase 6 成果物: regression-expansion-plan.md

## メタ情報

| 項目     | 値                                                                                         |
| -------- | ------------------------------------------------------------------------------------------ |
| Phase    | 6                                                                                          |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                                                      |
| Lane     | Lane B                                                                                     |
| 目的     | Phase 4 の 4 シナリオを境界値・並行・session-restore で拡充し、planId フィルタの耐性を担保 |

## TC ↔ AC マッピング（TC-E1〜TC-E6）

| TC ID | 観点               | 内容                                                                                          | 対応 AC     |
| ----- | ------------------ | --------------------------------------------------------------------------------------------- | ----------- |
| TC-E1 | 空文字列 planId    | `options.planId = ""` / `progress.planId = ""` は undefined 扱いしない（厳密一致）            | AC-4 / AC-5 |
| TC-E2 | useEffect 依存配列 | `options.planId` が session 中に変更された場合、古いリスナーを cleanup して新 planId で再登録 | AC-3        |
| TC-E3 | session-restore    | 一時停止セッションを resume しても planId 一致通知が通過する                                  | AC-3 / AC-4 |
| TC-E4 | 並行 executePlan   | 2 planId が並行 emit する状況で、それぞれの Hook が互いの通知を filter miss で reject する    | AC-5        |
| TC-E5 | 後方互換混在       | legacy payload（planId なし）と新 payload（planId あり）が同 session 内で混在しても全受理     | AC-6        |
| TC-E6 | 全通知許容         | `options.planId` 未指定のときは `progress.planId` の有無と値に関わらず全 progress を受理      | AC-7        |

## 各エッジケースの擬似コードと判定根拠

### TC-E1: 空文字列 planId（厳密一致）

```ts
// Arrange
renderHook(() => useStreamingProgress({ planId: "" }));

// Act: options と progress 両方 "" で一致
act(() => emit({ phase: "planning", percentage: 1, message: "", planId: "" }));
expect(updateProgress).toHaveBeenCalledTimes(1);

// Act: options="" / progress.planId="plan-A" で不一致
act(() =>
  emit({ phase: "planning", percentage: 2, message: "", planId: "plan-A" }),
);
// "" と "plan-A" は不一致なのでスキップ
expect(updateProgress).toHaveBeenCalledTimes(1);

// Act: options="" / progress.planId=undefined（legacy）
act(() => emit({ phase: "planning", percentage: 3, message: "" }));
// AC-6 legacy: undefined なら受理
expect(updateProgress).toHaveBeenCalledTimes(2);
```

判定根拠: `options?.planId !== undefined && progress.planId !== undefined && progress.planId !== options.planId` のロジックは `""` を undefined 扱いしない。JavaScript の型強制（`"" == false`）に依存しない厳密比較であることを担保。

### TC-E2: useEffect 依存配列による再登録

```ts
const { rerender } = renderHook(
  ({ pid }) => useStreamingProgress({ planId: pid }),
  { initialProps: { pid: "plan-A" } },
);

// 初回 cleanup がまだ呼ばれていない
expect(cleanup).not.toHaveBeenCalled();

// planId を "plan-B" に変更
rerender({ pid: "plan-B" });

// 古いリスナーが cleanup され、新しい onProgress が再登録される
expect(cleanup).toHaveBeenCalledTimes(1);
expect(apiOnProgressSpy).toHaveBeenCalledTimes(2);

// plan-B の通知のみ受け付ける
act(() =>
  emitNewListener({
    phase: "validating",
    percentage: 80,
    message: "",
    planId: "plan-B",
  }),
);
expect(updateProgress).toHaveBeenCalled();
```

判定根拠: useEffect の依存配列に `options?.planId` を含めることで React は依存変化時に cleanup → 再 subscribe を自動実行する。

### TC-E3: session-restore

```ts
// Arrange: 一時停止中のセッションを resume し planId "plan-A" を維持
const { result } = renderHook(() => useStreamingProgress({ planId: "plan-A" }));

// 一時停止 → resume を模擬した後の通知（planId 一致）
act(() =>
  emit({
    phase: "generating-agents",
    percentage: 60,
    message: "resumed",
    planId: "plan-A",
  }),
);

// Assert: resume 後も filter match で通過する
expect(updateProgress).toHaveBeenCalledWith({
  stage: "generating-agents",
  percent: 60,
  message: "resumed",
});
```

判定根拠: TASK-P0-08 session resume 後も options.planId が維持されていれば通知は通過する。逆に planId が resume で変わるなら TC-E2 の再登録パスに帰着する。

### TC-E4: 並行 executePlan

```ts
// Arrange: 2 つの Hook を別々の planId で立ち上げ
const hookA = renderHook(() => useStreamingProgress({ planId: "plan-A" }));
const hookB = renderHook(() => useStreamingProgress({ planId: "plan-B" }));

// onProgress は同一 broadcast なので両 Hook が同じ emit を受ける
act(() => {
  emit({ phase: "planning", percentage: 10, message: "A", planId: "plan-A" });
  emit({ phase: "planning", percentage: 10, message: "B", planId: "plan-B" });
});

// Assert: 各 Hook は自分の planId 通知のみ受理
expect(updateProgressA).toHaveBeenCalledWith(
  expect.objectContaining({ message: "A" }),
);
expect(updateProgressA).not.toHaveBeenCalledWith(
  expect.objectContaining({ message: "B" }),
);
expect(updateProgressB).toHaveBeenCalledWith(
  expect.objectContaining({ message: "B" }),
);
expect(updateProgressB).not.toHaveBeenCalledWith(
  expect.objectContaining({ message: "A" }),
);
```

判定根拠: 単一 broadcast チャンネル × 2 Hook で filter miss が独立に機能することが、本タスクの根本価値（混線防止）を直接保証する。

### TC-E5: 後方互換混在

```ts
renderHook(() => useStreamingProgress({ planId: "plan-A" }));

// 混在して emit
act(() => {
  emit({
    phase: "planning",
    percentage: 10,
    message: "new",
    planId: "plan-A",
  });
  emit({ phase: "planning", percentage: 20, message: "legacy" }); // planId なし
  emit({
    phase: "planning",
    percentage: 30,
    message: "other",
    planId: "plan-B",
  }); // 不一致
});

// Assert: new(match) と legacy(undefined=後方互換) は受理、"plan-B" はスキップ
expect(updateProgress).toHaveBeenCalledTimes(2);
```

判定根拠: filter 式で `progress.planId !== undefined` を AND 条件に含めているため、legacy payload は skip 条件から外れて受理される（AC-6）。

### TC-E6: 全通知許容（options 未指定）

```ts
renderHook(() => useStreamingProgress()); // options 未指定

act(() => {
  emit({
    phase: "planning",
    percentage: 10,
    message: "x",
    planId: "plan-X",
  });
  emit({
    phase: "planning",
    percentage: 20,
    message: "y",
    planId: "plan-Y",
  });
  emit({ phase: "planning", percentage: 30, message: "z" }); // planId 無し
});

expect(updateProgress).toHaveBeenCalledTimes(3);
```

判定根拠: `options?.planId === undefined` が先頭条件なので、filter 式全体が false となり skip しない（AC-7）。

## useEffect 依存配列方針

### 方針: `options?.planId` を依存配列に含める

```ts
useEffect(() => {
  /* onProgress 登録 */
}, [
  options?.planId, // 含める
  updateProgress,
  setStage,
  setError,
  resetProgress,
]);
```

### 含める理由

| 観点           | 根拠                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| 正しさ         | `options.planId` は useEffect callback 内で closure capture されるため、依存に入れないと古い値で filter し続ける |
| Lint ルール    | `react-hooks/exhaustive-deps` が自動検出し lint error となる                                                     |
| TC-E2 の要求   | planId 切り替え時に cleanup → 再 subscribe が走ることで、不要な通知を早期遮断できる                              |
| 副作用の有限性 | onProgress 再登録コストは低く、依存配列に含めても性能懸念は無い                                                  |
| spec 整合      | phase-6-test-expansion.md「useEffect 依存配列方針（`options?.planId` を含める理由）」要件を満たす                |

### 含めない選択肢を採らない理由

- 依存配列から外すと `useRef` で planId を保持する二段構えが必要になり、構造が複雑化
- `useRef` ベースは TC-E2 のケースで cleanup を走らせないため「古いセッションのリスナーが残留」という別の混線リスクを招く
- spec 設計（phase-2-design.md Hook filter 擬似コード）とも整合しない

## 検証コマンド

```bash
pnpm --filter @repo/desktop test -- --run useStreamingProgress
pnpm --filter @repo/desktop test -- --run skill-creator
```

期待: TC-E1〜TC-E6 と TC-01〜TC-04 をすべて含めて PASS、AC-8 既存テストも維持。

## 参照

- phase-6-test-expansion.md 拡充シナリオ / エッジケース焦点
- phase-4 test-scenarios.md TC-01〜TC-04
- phase-2-design.md Hook filter 擬似コード
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md`
