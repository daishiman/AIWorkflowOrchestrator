# 回帰ガードテスト仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 6（テスト拡充）                                                                                                                                                                                                                                            |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                                                                                                                                    |
| 作成日     | 2026-03-16                                                                                                                                                                                                                                                 |
| 入力成果物 | `outputs/phase-4/*.md`, `outputs/phase-5/*.md`, `.claude/rules/06-known-pitfalls.md`                                                                                                                                                                       |
| テスト状態 | Red（Phase 5 実装後に Green へ移行）                                                                                                                                                                                                                       |
| 実装先     | `apps/desktop/src/renderer/store/slices/__tests__/lifecycleHistorySlice.regression.test.ts`, `apps/desktop/src/renderer/store/slices/__tests__/feedbackSlice.regression.test.ts`, `packages/shared/src/skill/lifecycle/__tests__/regression-guard.test.ts` |

---

## 1. 目的

プロジェクトの既知の落とし穴（P31, P42, P48, P9）が本タスクの実装で再発しないことを回帰テストで保証する。Phase 4 テスト仕様では各パターンへの「対策方針」を記載したが、明示的な回帰ガードテストケースが不足していた。

---

## 2. テストケース一覧

### 2-1. P31 回帰ガード: Zustand 個別セレクタの参照安定性

| テストID    | テストケース                                                      | 入力・シナリオ                                                                                         | 期待結果                                                        | 分類 |
| ----------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ---- |
| REG-P31-001 | `useRecordLifecycleEvent` セレクタが安定した参照を返す            | `renderHook(() => useRecordLifecycleEvent())` を2回レンダリング                                        | 1回目と2回目の result.current が `Object.is` で同一（参照安定） | 回帰 |
| REG-P31-002 | `useSyncLifecycleFromPersistence` セレクタが安定した参照を返す    | `renderHook(() => useSyncLifecycleFromPersistence())` を2回レンダリング                                | 1回目と2回目の result.current が同一参照                        | 回帰 |
| REG-P31-003 | `useAddFeedback` セレクタが安定した参照を返す                     | `renderHook(() => useAddFeedback())` を2回レンダリング                                                 | 同一参照                                                        | 回帰 |
| REG-P31-004 | `useApplyFeedback` セレクタが安定した参照を返す                   | `renderHook(() => useApplyFeedback())` を2回レンダリング                                               | 同一参照                                                        | 回帰 |
| REG-P31-005 | `useDismissFeedback` セレクタが安定した参照を返す                 | `renderHook(() => useDismissFeedback())` を2回レンダリング                                             | 同一参照                                                        | 回帰 |
| REG-P31-006 | アクションセレクタを useEffect 依存配列に含めても無限ループしない | `useEffect(() => { recordEvent(event); }, [recordEvent])` を含むコンポーネントを renderHook でマウント | 無限ループにならない（レンダリング回数が有限: 5回以内）         | 回帰 |

### 2-2. P42 回帰ガード: IPC 文字列引数の3段バリデーション

| テストID    | テストケース                                                                   | 入力                                                      | 期待結果                                                  | 分類 |
| ----------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------- | ---- |
| REG-P42-001 | `toSkillName` に対する3段バリデーション: typeof チェック                       | `toSkillName(123 as any)`                                 | Error throw（Stage 1: 型チェック失敗）                    | 回帰 |
| REG-P42-002 | `toSkillName` に対する3段バリデーション: 空文字列チェック                      | `toSkillName("")`                                         | Error throw（Stage 2: 空文字列）                          | 回帰 |
| REG-P42-003 | `toSkillName` に対する3段バリデーション: トリム空文字列チェック                | `toSkillName("   ")`                                      | Error throw（Stage 3: スペースのみ）                      | 回帰 |
| REG-P42-004 | `createLifecycleEvent` の skillVersion に対する3段バリデーション: 空文字列     | `createLifecycleEvent({...defaults, skillVersion: ""})`   | Error throw                                               | 回帰 |
| REG-P42-005 | `createLifecycleEvent` の skillVersion に対する3段バリデーション: スペースのみ | `createLifecycleEvent({...defaults, skillVersion: "  "})` | Error throw                                               | 回帰 |
| REG-P42-006 | `createFeedback` の skillId に対する3段バリデーション: スペースのみ            | `createFeedback({skillId: "   ", ...defaults})`           | Error throw                                               | 回帰 |
| REG-P42-007 | `createFeedback` の sourceEventId に対する3段バリデーション: スペースのみ      | `createFeedback({sourceEventId: "   ", ...defaults})`     | Error throw                                               | 回帰 |
| REG-P42-008 | IPC `skill:getLifecycleEvents` ハンドラの skillName: スペースのみ拒否          | `handleGetLifecycleEvents(event, "   ")`                  | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 回帰 |
| REG-P42-009 | IPC `skill:feedback:submit` ハンドラの skillName: スペースのみ拒否             | `handleFeedbackSubmit(event, { skillName: "   ", ...})`   | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 回帰 |
| REG-P42-010 | IPC `skill:getPublishReadiness` ハンドラの skillName: スペースのみ拒否         | `handleGetPublishReadiness(event, "   ")`                 | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 回帰 |
| REG-P42-011 | IPC `skill:getSkillHealthReport` ハンドラの skillName: スペースのみ拒否        | `handleGetSkillHealthReport(event, "   ")`                | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 回帰 |

### 2-3. P48 回帰ガード: 派生セレクタの useShallow 適用

| テストID    | テストケース                                                                | 入力・シナリオ                                | 期待結果                                                              | 分類 |
| ----------- | --------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------- | ---- |
| REG-P48-001 | `useLifecycleEventsBySkill` が useShallow 適用で同一データに同一参照を返す  | State 変更なしで2回連続セレクタ呼び出し       | 1回目と2回目の参照が shallow 比較で同一                               | 回帰 |
| REG-P48-002 | `useLifecycleEventsByCategory` が useShallow 適用で同一参照を返す           | State 変更なしで2回連続呼び出し               | 同一参照                                                              | 回帰 |
| REG-P48-003 | `useRecentLifecycleEvents` が useShallow 適用で同一参照を返す               | State 変更なしで2回連続呼び出し               | 同一参照                                                              | 回帰 |
| REG-P48-004 | `usePendingFeedbacks` が useShallow 適用で同一参照を返す                    | State 変更なしで2回連続呼び出し               | 同一参照                                                              | 回帰 |
| REG-P48-005 | `useFeedbackActions` が useShallow 適用で同一参照を返す                     | State 変更なしで2回連続呼び出し               | 同一参照                                                              | 回帰 |
| REG-P48-006 | `useCriticalFeedbackActions` が useShallow 適用で filter 後も同一参照を返す | State 変更なしで2回連続呼び出し               | 同一参照（filter() で新規配列を生成するが useShallow で安定化される） | 回帰 |
| REG-P48-007 | State 変更後に `useLifecycleEventsBySkill` が新しい参照を返す               | recordEvent で対象 skillId のイベントを追加   | 新しい参照が返される（shallow 比較で不一致）                          | 回帰 |
| REG-P48-008 | 無関係な State 変更で `useLifecycleEventsBySkill` の参照が変わらない        | recordEvent で**別 skillId** のイベントを追加 | 同一参照が返される（対象 skillId のイベントは変化していない）         | 回帰 |

### 2-4. P9 回帰ガード: テスト間 State 非共有

| テストID   | テストケース                                                         | 入力・シナリオ                                                                                  | 期待結果                                                      | 分類 |
| ---------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---- |
| REG-P9-001 | 前のテストで追加したイベントが次のテストに漏れない                   | テストA: recordEvent(event1) → テストB: getState().events を確認                                | テストB の `events.length === 0`（beforeEach でリセット済み） | 回帰 |
| REG-P9-002 | 前のテストで設定した error が次のテストに漏れない                    | テストA: set({ error: "test error" }) → テストB: getState().error を確認                        | テストB の `error === null`                                   | 回帰 |
| REG-P9-003 | 前のテストで設定した aggregateViews が次のテストに漏れない           | テストA: recordEvent で aggregateViews 更新 → テストB: getState().aggregateViews を確認         | テストB の `aggregateViews` が空オブジェクト `{}`             | 回帰 |
| REG-P9-004 | feedbackSlice の前テストの feedbacksBySkillId が次のテストに漏れない | テストA: addFeedback(fb) → テストB: getState().feedbacksBySkillId を確認                        | テストB の `feedbacksBySkillId` が空オブジェクト `{}`         | 回帰 |
| REG-P9-005 | localStorage の前テストのデータが次のテストに漏れない                | テストA: localStorage.setItem("lifecycle-history", data) → テストB: localStorage.getItem を確認 | テストB の localStorage が空（beforeEach で clear 済み）      | 回帰 |

---

## 3. テスト実装方針

### 3-1. テストファイル構成

```
apps/desktop/src/renderer/store/slices/__tests__/
  lifecycleHistorySlice.regression.test.ts  # REG-P31-001~006, REG-P48-001~008, REG-P9-001~003
  feedbackSlice.regression.test.ts          # REG-P31-003~005, REG-P48-004~006, REG-P9-004

packages/shared/src/skill/lifecycle/__tests__/
  regression-guard.test.ts                  # REG-P42-001~007（純粋関数のバリデーション）

apps/desktop/src/main/handlers/__tests__/
  ipc-handlers.regression.test.ts           # REG-P42-008~011（IPC ハンドラのバリデーション）
```

### 3-2. 実装パターン

#### P31 参照安定性テスト

```typescript
// REG-P31-001 の実装パターン
it("REG-P31-001: useRecordLifecycleEvent が安定した参照を返す", () => {
  const { result, rerender } = renderHook(() => useRecordLifecycleEvent());
  const first = result.current;
  rerender();
  const second = result.current;
  expect(Object.is(first, second)).toBe(true);
});
```

#### P48 useShallow テスト

```typescript
// REG-P48-001 の実装パターン
it("REG-P48-001: useLifecycleEventsBySkill が同一参照を返す", () => {
  const { result, rerender } = renderHook(() =>
    useLifecycleEventsBySkill("test-skill"),
  );
  const first = result.current;
  rerender();
  const second = result.current;
  // useShallow 適用により、filter() が新規配列を返しても shallow 比較で安定
  expect(first).toBe(second);
});
```

#### P9 State 非共有テスト

```typescript
// REG-P9-001 の実装パターン
describe("P9 回帰ガード: テスト間 State 非共有", () => {
  beforeEach(() => {
    // Store 状態をリセット
    useLifecycleHistoryStore.setState({
      events: [],
      aggregateViews: {},
      isLoading: false,
      error: null,
      lastSyncedAt: null,
    });
    localStorage.clear();
  });

  it("REG-P9-001: テストA でイベント追加", () => {
    const event = createMockLifecycleEvent();
    useLifecycleHistoryStore.getState().recordEvent(event);
    expect(useLifecycleHistoryStore.getState().events.length).toBe(1);
  });

  it("REG-P9-001: テストB で State が空であること", () => {
    expect(useLifecycleHistoryStore.getState().events.length).toBe(0);
  });
});
```

### 3-3. 既知パターン対策

| パターン | 対策                                                            |
| -------- | --------------------------------------------------------------- |
| P39      | Store テストで UI コンポーネントが必要な場合は fireEvent を使用 |
| P40      | テスト実行は対象パッケージディレクトリから実行                  |

---

## 4. テストケース件数サマリー

| カテゴリ                                 | 件数   |
| ---------------------------------------- | ------ |
| P31 回帰ガード（個別セレクタ参照安定性） | 6      |
| P42 回帰ガード（3段バリデーション）      | 11     |
| P48 回帰ガード（useShallow 適用）        | 8      |
| P9 回帰ガード（テスト間 State 非共有）   | 5      |
| **合計**                                 | **30** |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 6_
