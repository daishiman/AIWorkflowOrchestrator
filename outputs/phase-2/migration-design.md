# Phase 2: 移行設計書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| Phase      | 2                                |
| 作成日     | 2026-02-12                       |
| ステータス | 完了                             |

---

## 1. 既存 renderHook パターンの分析結果

### 1.1 authModeSlice/llmSlice の共通パターン

両ファイルで確認された共通パターンを以下に整理する。

#### import パターン

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../index";
```

#### electronAPI モック構造

`createMockElectronAPI()` は authMode + llm + skill の3セクション全体をモックする。

```typescript
function createMockElectronAPI() {
  return {
    authMode: {
      get: vi
        .fn()
        .mockResolvedValue({ success: true, data: { mode: "subscription" } }),
      set: vi.fn().mockResolvedValue({ success: true }),
      status: vi.fn().mockResolvedValue({ success: true, data: null }),
      validate: vi
        .fn()
        .mockResolvedValue({ success: true, data: { isValid: true } }),
      onModeChanged: vi.fn(),
    },
    llm: {
      getProviders: vi.fn().mockResolvedValue([]),
      checkHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
    },
    skill: {
      onStream: vi.fn().mockReturnValue(() => {}),
      onPermissionRequest: vi.fn().mockReturnValue(() => {}),
      sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue({ executionId: "test-exec-id" }),
      abort: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
      getImported: vi.fn().mockResolvedValue([]),
      import: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue(undefined),
      rescan: vi.fn().mockResolvedValue([]),
      onComplete: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
      getExecutionStatus: vi.fn().mockResolvedValue(null),
    },
  };
}
```

#### ストアリセット関数

```typescript
function resetStore() {
  useAppStore.setState({
    // 対象Sliceの全状態フィールドを初期値に戻す
  });
}
```

#### beforeEach/afterEach パターン

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  if (typeof window !== "undefined") {
    const mockAPI = createMockElectronAPI();
    (window as unknown as { electronAPI: object }).electronAPI = mockAPI;
  }
  resetStore();
});

afterEach(() => {
  cleanup(); // renderHookのReactコンポーネントをアンマウント
  vi.restoreAllMocks(); // clearではなくrestoreを使用
});
```

### 1.2 テストカテゴリ別パターン

#### 状態セレクタテスト

```typescript
it("初期状態の検証", () => {
  const { result } = renderHook(() => useAppStore((state) => state.fieldName));
  expect(result.current).toBe(expectedValue);
});
```

#### アクションセレクタ存在テスト

```typescript
it("アクション関数が取得できる", () => {
  const { result } = renderHook(() => useAppStore((state) => state.actionName));
  expect(typeof result.current).toBe("function");
});
```

#### 関数参照安定性テスト

```typescript
it("参照が再レンダリング間で安定している", () => {
  const { result, rerender } = renderHook(() =>
    useAppStore((state) => state.actionName),
  );
  const firstRef = result.current;
  rerender();
  expect(result.current).toBe(firstRef);
});
```

#### 無限ループ防止テスト

```typescript
it("useEffect依存配列に含めても無限ループしない", async () => {
  const renderCount = { current: 0 };
  renderHook(() => {
    renderCount.current++;
    const action = useAppStore((state) => state.actionName);
    const initRef = useRef(false);
    useEffect(() => {
      if (!initRef.current) {
        initRef.current = true;
      }
    }, [action]);
    return { renderCount: renderCount.current };
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
  expect(renderCount.current).toBeLessThan(MAX_RENDERS);
});
```

#### exportテスト

```typescript
it("HookがexportされているName", async () => {
  const mod = await import("../../index");
  expect(typeof mod.useHookName).toBe("function");
});
```

---

## 2. CAT別移行方針

### CAT-01: 状態セレクタ初期値テスト（13件）

**現在のパターン**:

```typescript
const state = testStore.getState();
expect(state.availableSkillsMetadata).toEqual([]);
```

**移行後のパターン**:

```typescript
const { result } = renderHook(() =>
  useAppStore((state) => state.availableSkillsMetadata),
);
expect(result.current).toEqual([]);
```

**変更点**:

- `testStore.getState().field` を `renderHook(() => useAppStore(s => s.field)).result.current` に変換
- React Hookのsubscribeメカニズムを通じた値取得に変わる

### CAT-02: 状態セレクタ値取得テスト（7件）

**現在のパターン**:

```typescript
testStore.setState({ availableSkillsMetadata: mockAvailableSkills });
const state = testStore.getState();
expect(state.availableSkillsMetadata).toEqual(mockAvailableSkills);
```

**移行後のパターン**:

```typescript
const { result } = renderHook(() =>
  useAppStore((state) => state.availableSkillsMetadata),
);
act(() => {
  useAppStore.setState({ availableSkillsMetadata: mockAvailableSkills });
});
expect(result.current).toEqual(mockAvailableSkills);
```

**変更点**:

- `testStore.setState()` を `act(() => useAppStore.setState())` に変換
- Zustandのsubscribeが正しくトリガーされ、Hookの返却値が更新されることを検証

### CAT-03: アクションセレクタ存在テスト（10件）

**現在のパターン**:

```typescript
const state = testStore.getState();
expect(typeof state.fetchSkills).toBe("function");
```

**移行後のパターン**:

```typescript
const { result } = renderHook(() => useAppStore((state) => state.fetchSkills));
expect(typeof result.current).toBe("function");
```

**変更点**:

- CAT-01と同じ変換パターン

### CAT-04: アクション実行テスト（3件）

**現在のパターン**:

```typescript
testStore.getState().selectSkillByName("new-skill");
expect(testStore.getState().selectedSkillName).toBe("new-skill");
```

**移行後のパターン**:

```typescript
const { result } = renderHook(() => ({
  selectSkillByName: useAppStore((state) => state.selectSkillByName),
  selectedSkillName: useAppStore((state) => state.selectedSkillName),
}));
await act(async () => {
  result.current.selectSkillByName("new-skill");
});
expect(result.current.selectedSkillName).toBe("new-skill");
```

**変更点**:

- アクション実行を `act()` で囲む（React状態更新のバッチ処理）
- アクションと状態を同一renderHook内で取得

### CAT-05: 関数参照安定性テスト（4件）

**現在のパターン**:

```typescript
const ref1 = testStore.getState().fetchSkills;
const ref2 = testStore.getState().fetchSkills;
expect(ref1).toBe(ref2);
```

**移行後のパターン**:

```typescript
const { result, rerender } = renderHook(() =>
  useAppStore((state) => state.fetchSkills),
);
const firstRef = result.current;
rerender();
expect(result.current).toBe(firstRef);
```

**変更点**:

- `getState()` の2回呼び出しを `rerender()` に変換
- 状態変更後の参照安定性テストは `act(() => useAppStore.setState({...}))` 後に確認

### CAT-06: セレクタ再レンダー最適化テスト（2件）

**現在のパターン**: 基本的に維持

**移行後のパターン**:

```typescript
it("異なる状態フィールドの更新で対象外フィールドは影響を受けない", () => {
  const { result } = renderHook(() =>
    useAppStore((state) => state.selectedSkillName),
  );
  const initialValue = result.current;
  act(() => {
    useAppStore.setState({ isExecuting: true });
  });
  expect(result.current).toBe(initialValue);
});
```

**変更点**:

- renderHookベースに変換し、Zustandのsubscribeが対象外フィールドでトリガーされないことを検証

### CAT-07: 無限ループ防止テスト（3件）

**現在のパターン**:

```typescript
// forループでgetState()を100回呼び、参照が同一であることを確認
for (let i = 0; i < maxCalls; i++) {
  const currentFetchSkills = testStore.getState().fetchSkills;
  if (currentFetchSkills === fetchSkills) {
    callCount++;
  }
}
```

**移行後のパターン**:

```typescript
const renderCount = { current: 0 };
renderHook(() => {
  renderCount.current++;
  const fetchSkills = useAppStore((state) => state.fetchSkills);
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
    }
  }, [fetchSkills]);
  return { renderCount: renderCount.current };
});
await act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});
expect(renderCount.current).toBeLessThan(MAX_RENDERS);
```

**重要な意味的変化**:

- 現在: Zustand API直接テスト（getState()関数の戻り値の安定性）
- 移行後: Reactライフサイクルテスト（useEffect依存配列にアクション関数を含めた場合の再レンダリング回数）
- この変更により、P31（無限ループ問題）の実際の発生シナリオに近いテストとなる

### CAT-08: 非同期アクションテスト（4件）

**現在のパターン**:

```typescript
await testStore.getState().fetchSkills();
const state = testStore.getState();
expect(state.availableSkillsMetadata).toEqual(mockAvailableSkills);
```

**移行後のパターン**:

```typescript
const { result } = renderHook(() => ({
  fetchSkills: useAppStore((state) => state.fetchSkills),
  availableSkillsMetadata: useAppStore(
    (state) => state.availableSkillsMetadata,
  ),
  isLoadingSkills: useAppStore((state) => state.isLoadingSkills),
}));
await act(async () => {
  await result.current.fetchSkills();
});
expect(result.current.availableSkillsMetadata).toEqual(mockAvailableSkills);
expect(result.current.isLoadingSkills).toBe(false);
```

**変更点**:

- 非同期アクション実行を `await act(async () => {...})` で囲む
- 複数の状態フィールドを同一renderHook内で取得

### CAT-09: エラーハンドリングテスト（2件）

**現在のパターン**:

```typescript
(global as unknown as {...}).window = { electronAPI: { skill: { list: vi.fn().mockRejectedValue(...) } } };
await testStore.getState().fetchSkills();
expect(testStore.getState().skillError).toContain("スキル一覧の取得に失敗");
```

**移行後のパターン**:

```typescript
// electronAPIのmockを差し替え
(
  window as unknown as {
    electronAPI: { skill: { list: () => Promise<never> } };
  }
).electronAPI = {
  ...createMockElectronAPI(),
  skill: {
    ...createMockElectronAPI().skill,
    list: vi.fn().mockRejectedValue(new Error("Network error")),
  },
};

const { result } = renderHook(() => ({
  fetchSkills: useAppStore((state) => state.fetchSkills),
  skillError: useAppStore((state) => state.skillError),
  isLoadingSkills: useAppStore((state) => state.isLoadingSkills),
}));
await act(async () => {
  await result.current.fetchSkills();
});
expect(result.current.skillError).toContain("スキル一覧の取得に失敗");
expect(result.current.isLoadingSkills).toBe(false);
```

**変更点**:

- `global.window` の差し替えを `window` ベースに統一（happy-dom環境）
- エラー発生後の状態確認を `result.current` 経由に変更

---

## 3. 重要な変更点まとめ

### 3.1 ストアの変更

| 項目       | 移行前                          | 移行後                                        |
| ---------- | ------------------------------- | --------------------------------------------- |
| ストア生成 | `create<AgentSlice>()`（独立）  | `useAppStore`（統合）                         |
| 状態取得   | `testStore.getState().field`    | `renderHook(() => useAppStore(s => s.field))` |
| 状態設定   | `testStore.setState({...})`     | `act(() => useAppStore.setState({...}))`      |
| アクション | `testStore.getState().action()` | `act(() => result.current.action())`          |

### 3.2 electronAPI モックの変更

| 項目       | 移行前                           | 移行後                                         |
| ---------- | -------------------------------- | ---------------------------------------------- |
| モック範囲 | `window.electronAPI.skill` のみ  | `authMode` + `llm` + `skill` の3セクション全体 |
| 設定方法   | `(global as ...).window = {...}` | `(window as ...).electronAPI = {...}`          |

### 3.3 テストライフサイクルの変更

| 項目       | 移行前                                                     | 移行後                                                  |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| beforeEach | `testStore = createTestStore()` + `setupMockElectronAPI()` | `vi.clearAllMocks()` + electronAPI設定 + `resetStore()` |
| afterEach  | `vi.clearAllMocks()`                                       | `cleanup()` + `vi.restoreAllMocks()`                    |

### 3.4 resetStore() の AgentSlice 初期値

```typescript
function resetStore() {
  useAppStore.setState({
    // AgentSlice状態をリセット
    availableSkillsMetadata: [],
    importedSkills: [],
    selectedSkillName: null,
    isExecuting: false,
    executionId: null,
    skillExecutionStatus: null,
    streamingMessages: [],
    pendingPermission: null,
    skillError: null,
    isLoadingSkills: false,
    isScanning: false,
    isImporting: false,
    importingSkillName: null,
  });
}
```

---

## 4. リスク軽減策

| リスク                                                | 対策                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| renderHook環境でelectronAPIモックが正しく参照されない | authMode/llmテストで同じモックパターンが動作済み                 |
| 非同期テストのact()ワーニング                         | `await act(async () => {...})` パターンで対応                    |
| テスト間のState共有（P9）                             | beforeEachで `resetStore()` 実行 + afterEachで `cleanup()`       |
| テスト実行時間の増加                                  | renderHookのオーバーヘッドは軽微（authMode/llmテストで実績あり） |
| CAT-07の意味的変化                                    | テスト名を「Reactライフサイクルでの検証」と明示                  |
