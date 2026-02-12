# Phase 2: テスト構造設計書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| Phase      | 2                                |
| 作成日     | 2026-02-12                       |
| ステータス | 完了                             |

---

## 1. 移行後のファイル構造

### 1.1 ファイル全体像

```typescript
/**
 * @file agentSlice セレクタテスト（renderHook移行版）
 * @description UT-STORE-HOOKS-TEST-REFACTOR-001: getState()パターンからrenderHookパターンへの移行
 * @testIds TS-STORE-01〜TS-STORE-48
 * @feature zustand-store-hooks-refactor
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../index";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";

// ==========================================================================
// モックデータ（既存のまま維持）
// ==========================================================================

// createMockSkillMetadata, mockAvailableSkills, mockImportedSkills

// ==========================================================================
// ヘルパー関数（新規）
// ==========================================================================

// createMockElectronAPI()  -- authMode + llm + skill 3セクション
// resetStore()             -- AgentSlice状態の初期化

// ==========================================================================
// テストスイート
// ==========================================================================

describe("agentSlice - セレクタテスト（UT-STORE-HOOKS-TEST-REFACTOR-001）", () => {
  // beforeEach: clearAllMocks + electronAPI設定 + resetStore
  // afterEach: cleanup + restoreAllMocks
  // CAT-01: 状態セレクタ初期値テスト（13件）
  // CAT-02: 状態セレクタ値取得テスト（7件）
  // CAT-03: アクションセレクタ存在テスト（10件）
  // CAT-04: アクション実行テスト（3件）
  // CAT-05: 関数参照安定性テスト（4件）
  // CAT-06: セレクタ再レンダー最適化テスト（2件）
  // CAT-07: 無限ループ防止テスト（P31対策）（3件）
  // CAT-08: 非同期アクションテスト（4件）
  // CAT-09: エラーハンドリングテスト（2件）
});
```

---

## 2. セクション別詳細構造

### 2.1 モックデータ（変更なし）

既存の `createMockSkillMetadata`, `mockAvailableSkills`, `mockImportedSkills` をそのまま維持する。

```typescript
const createMockSkillMetadata = (name: string): SkillMetadata => ({
  name,
  description: `${name}の説明`,
  path: `~/.claude/skills/${name}`,
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
});

const mockAvailableSkills: SkillMetadata[] = [
  createMockSkillMetadata("test-skill-1"),
  createMockSkillMetadata("test-skill-2"),
];

const mockImportedSkills: ImportedSkill[] = [
  {
    ...mockAvailableSkills[0],
    importedAt: new Date("2026-01-10"),
    status: "active",
  },
];
```

### 2.2 createMockElectronAPI()（新規）

authModeSlice/llmSliceテストの共通パターンを踏襲し、3セクション全体をモックする。

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
      list: vi.fn().mockResolvedValue(mockAvailableSkills),
      getImported: vi.fn().mockResolvedValue(mockImportedSkills),
      rescan: vi.fn().mockResolvedValue(mockAvailableSkills),
      import: vi.fn().mockResolvedValue(mockImportedSkills[0]),
      remove: vi.fn().mockResolvedValue(undefined),
      execute: vi
        .fn()
        .mockResolvedValue({ executionId: "exec-123", success: true }),
      abort: vi.fn().mockResolvedValue(undefined),
      sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
      onStream: vi.fn().mockReturnValue(() => {}),
      onComplete: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
      onPermissionRequest: vi.fn().mockReturnValue(() => {}),
      getExecutionStatus: vi.fn().mockResolvedValue(null),
    },
  };
}
```

**差分**: 既存のagentSliceテストのskill mockデータ（`mockAvailableSkills`, `mockImportedSkills`）を維持しつつ、authMode/llmテストで使用されている `getExecutionStatus` 等の追加メソッドも含める。

### 2.3 resetStore()（新規）

```typescript
function resetStore() {
  useAppStore.setState({
    // AgentSlice全13状態フィールドを初期値にリセット
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

### 2.4 beforeEach/afterEach（新規）

```typescript
beforeEach(() => {
  vi.clearAllMocks();

  // グローバルwindowオブジェクトにelectronAPIを設定
  if (typeof window !== "undefined") {
    const mockAPI = createMockElectronAPI();
    (window as unknown as { electronAPI: object }).electronAPI = mockAPI;
  }

  // ストアをリセット
  resetStore();
});

afterEach(() => {
  // React Testing Libraryのクリーンアップ
  cleanup();
  vi.restoreAllMocks();
});
```

---

## 3. CAT別テスト構造

### 3.1 CAT-01: 状態セレクタ初期値テスト（13件）

```typescript
describe("CAT-01: 状態セレクタ初期値テスト", () => {
  it("TS-STORE-01: availableSkillsMetadata初期値は空配列", () => {
    const { result } = renderHook(() =>
      useAppStore((state) => state.availableSkillsMetadata),
    );
    expect(result.current).toEqual([]);
  });

  it("TS-STORE-02: importedSkills初期値は空配列", () => { ... });
  it("TS-STORE-03: selectedSkillName初期値はnull", () => { ... });
  it("TS-STORE-04: isExecuting初期値はfalse", () => { ... });
  it("TS-STORE-05: executionId初期値はnull", () => { ... });
  it("TS-STORE-06: skillExecutionStatus初期値はnull", () => { ... });
  it("TS-STORE-07: streamingMessages初期値は空配列", () => { ... });
  it("TS-STORE-08: pendingPermission初期値はnull", () => { ... });
  it("TS-STORE-09: skillError初期値はnull", () => { ... });
  it("TS-STORE-10: isLoadingSkills初期値はfalse", () => { ... });
  it("TS-STORE-11: isScanning初期値はfalse", () => { ... });
  it("TS-STORE-12: isImporting初期値はfalse", () => { ... });
  it("TS-STORE-13: importingSkillName初期値はnull", () => { ... });
});
```

### 3.2 CAT-02: 状態セレクタ値取得テスト（7件）

```typescript
describe("CAT-02: 状態セレクタ値取得テスト", () => {
  it("TS-STORE-14: availableSkillsMetadataが正しく取得できる", () => {
    const { result } = renderHook(() =>
      useAppStore((state) => state.availableSkillsMetadata),
    );
    act(() => {
      useAppStore.setState({ availableSkillsMetadata: mockAvailableSkills });
    });
    expect(result.current).toEqual(mockAvailableSkills);
  });

  it("TS-STORE-15: importedSkillsが正しく取得できる", () => { ... });
  it("TS-STORE-16: selectedSkillNameが正しく取得できる", () => { ... });
  it("TS-STORE-17: isExecutingが正しく取得できる", () => { ... });
  it("TS-STORE-18: executionIdが正しく取得できる", () => { ... });
  it("TS-STORE-19: skillExecutionStatusが正しく取得できる", () => { ... });
  it("TS-STORE-20: skillErrorが正しく取得できる", () => { ... });
});
```

### 3.3 CAT-03: アクションセレクタ存在テスト（10件）

```typescript
describe("CAT-03: アクションセレクタ存在テスト", () => {
  it("TS-STORE-21: fetchSkillsアクションが存在する", () => {
    const { result } = renderHook(() =>
      useAppStore((state) => state.fetchSkills),
    );
    expect(typeof result.current).toBe("function");
  });

  it("TS-STORE-22: rescanSkillsアクションが存在する", () => { ... });
  it("TS-STORE-23: importSkillアクションが存在する", () => { ... });
  it("TS-STORE-24: removeSkillアクションが存在する", () => { ... });
  it("TS-STORE-25: selectSkillByNameアクションが存在する", () => { ... });
  it("TS-STORE-26: executeSkillアクションが存在する", () => { ... });
  it("TS-STORE-27: abortExecutionアクションが存在する", () => { ... });
  it("TS-STORE-28: respondToSkillPermissionアクションが存在する", () => { ... });
  it("TS-STORE-29: clearSkillErrorアクションが存在する", () => { ... });
  it("TS-STORE-30: clearStreamingMessagesアクションが存在する", () => { ... });
});
```

### 3.4 CAT-04: アクション実行テスト（3件）

```typescript
describe("CAT-04: アクション実行テスト", () => {
  it("TS-STORE-31: selectSkillByNameで選択状態が更新される", () => {
    const { result } = renderHook(() => ({
      selectSkillByName: useAppStore((state) => state.selectSkillByName),
      selectedSkillName: useAppStore((state) => state.selectedSkillName),
    }));
    act(() => {
      result.current.selectSkillByName("new-skill");
    });
    expect(result.current.selectedSkillName).toBe("new-skill");
  });

  it("TS-STORE-32: clearSkillErrorでエラーがクリアされる", () => { ... });
  it("TS-STORE-33: clearStreamingMessagesでメッセージがクリアされる", () => { ... });
});
```

### 3.5 CAT-05: 関数参照安定性テスト（4件）

```typescript
describe("CAT-05: 関数参照安定性テスト", () => {
  it("TS-STORE-34: fetchSkillsの参照は再レンダリング間で安定している", () => {
    const { result, rerender } = renderHook(() =>
      useAppStore((state) => state.fetchSkills),
    );
    const firstRef = result.current;
    rerender();
    expect(result.current).toBe(firstRef);
  });

  it("TS-STORE-35: selectSkillByNameの参照は再レンダリング間で安定している", () => { ... });

  it("TS-STORE-36: 状態更新後もアクション参照は変わらない", () => {
    const { result } = renderHook(() =>
      useAppStore((state) => state.fetchSkills),
    );
    const refBefore = result.current;
    act(() => {
      useAppStore.setState({ selectedSkillName: "updated-skill" });
    });
    expect(result.current).toBe(refBefore);
  });

  it("TS-STORE-37: 複数のアクション参照が全て安定している", () => {
    // 各アクションを個別にrenderHookで取得し、状態変更後も同一参照を確認
  });
});
```

### 3.6 CAT-06: セレクタ再レンダー最適化テスト（2件）

```typescript
describe("CAT-06: セレクタ再レンダー最適化テスト", () => {
  it("TS-STORE-38: 異なる状態フィールドの更新で対象外フィールドは影響を受けない", () => {
    const { result } = renderHook(() =>
      useAppStore((state) => state.selectedSkillName),
    );
    const initialValue = result.current;
    act(() => {
      useAppStore.setState({ isExecuting: true });
    });
    expect(result.current).toBe(initialValue);
  });

  it("TS-STORE-39: 個別セレクタで必要なフィールドのみ取得可能", () => { ... });
});
```

### 3.7 CAT-07: 無限ループ防止テスト（3件）

```typescript
describe("CAT-07: 無限ループ防止テスト（P31対策）", () => {
  const MAX_RENDERS = 10;

  it("TS-STORE-40: アクション関数をuseEffect依存配列に含めても無限ループしない", async () => {
    const renderCount = { current: 0 };
    renderHook(() => {
      renderCount.current++;
      const fetchSkills = useAppStore((state) => state.fetchSkills);
      const initRef = useRef(false);
      useEffect(() => {
        if (!initRef.current) { initRef.current = true; }
      }, [fetchSkills]);
      return { renderCount: renderCount.current };
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(renderCount.current).toBeLessThan(MAX_RENDERS);
  });

  it("TS-STORE-41: 個別セレクタは状態が変わらない限り同一値を返す", async () => { ... });

  it("TS-STORE-42: 合成Hookパターンの問題点を個別セレクタで回避", async () => {
    // 複数のアクションセレクタをuseEffect依存配列に含めても安定
    const renderCount = { current: 0 };
    renderHook(() => {
      renderCount.current++;
      const fetchSkills = useAppStore((state) => state.fetchSkills);
      const selectSkillByName = useAppStore((state) => state.selectSkillByName);
      const executeSkill = useAppStore((state) => state.executeSkill);
      const initRef = useRef(false);
      useEffect(() => {
        if (!initRef.current) { initRef.current = true; }
      }, [fetchSkills, selectSkillByName, executeSkill]);
      return { renderCount: renderCount.current };
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(renderCount.current).toBeLessThan(MAX_RENDERS);
  });
});
```

### 3.8 CAT-08: 非同期アクションテスト（4件）

```typescript
describe("CAT-08: 非同期アクションテスト", () => {
  it("TS-STORE-43: fetchSkillsが正しくデータを取得する", async () => {
    const { result } = renderHook(() => ({
      fetchSkills: useAppStore((state) => state.fetchSkills),
      availableSkillsMetadata: useAppStore((state) => state.availableSkillsMetadata),
      importedSkills: useAppStore((state) => state.importedSkills),
      isLoadingSkills: useAppStore((state) => state.isLoadingSkills),
    }));
    await act(async () => {
      await result.current.fetchSkills();
    });
    expect(result.current.availableSkillsMetadata).toEqual(mockAvailableSkills);
    expect(result.current.importedSkills).toEqual(mockImportedSkills);
    expect(result.current.isLoadingSkills).toBe(false);
  });

  it("TS-STORE-44: rescanSkillsが正しくデータを再取得する", async () => { ... });
  it("TS-STORE-45: importSkillが正しくスキルをインポートする", async () => { ... });
  it("TS-STORE-46: executeSkillが正しく実行状態を更新する", async () => { ... });
});
```

### 3.9 CAT-09: エラーハンドリングテスト（2件）

```typescript
describe("CAT-09: エラーハンドリングテスト", () => {
  it("TS-STORE-47: fetchSkillsエラー時にskillErrorが設定される", async () => {
    // electronAPIのskill.listをエラーに差し替え
    if (typeof window !== "undefined") {
      const errorAPI = createMockElectronAPI();
      errorAPI.skill.list = vi.fn().mockRejectedValue(new Error("Network error"));
      (window as unknown as { electronAPI: object }).electronAPI = errorAPI;
    }

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
  });

  it("TS-STORE-48: importSkillエラー時に状態がリセットされる", async () => { ... });
});
```

---

## 4. 3ファイル間のパターン比較

| 要素                 | authModeSlice                               | llmSlice                                    | agentSlice（移行後）                        |
| -------------------- | ------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| import               | renderHook, cleanup, act, useEffect, useRef | renderHook, cleanup, act, useEffect, useRef | renderHook, cleanup, act, useEffect, useRef |
| ストア               | `useAppStore`                               | `useAppStore`                               | `useAppStore`                               |
| electronAPIモック    | authMode + llm + skill                      | authMode + llm + skill                      | authMode + llm + skill                      |
| resetStore対象       | AuthMode 6フィールド                        | LLM 6フィールド                             | Agent 13フィールド                          |
| beforeEach           | clearAllMocks + electronAPI + resetStore    | clearAllMocks + electronAPI + resetStore    | clearAllMocks + electronAPI + resetStore    |
| afterEach            | cleanup + restoreAllMocks                   | cleanup + restoreAllMocks                   | cleanup + restoreAllMocks                   |
| 状態セレクタテスト   | 7件                                         | 6件                                         | 13件                                        |
| アクションセレクタ   | 10件                                        | 8件                                         | 10件                                        |
| 参照安定性テスト     | 10件                                        | 8件                                         | 4件（既存維持、拡張は検討）                 |
| 無限ループ防止テスト | 5件                                         | 5件                                         | 3件（既存維持、拡張は検討）                 |
| exportテスト         | 17件                                        | 16件                                        | なし（Phase 6で追加検討）                   |

---

## 5. テストID対応表

全48件のテストID（TS-STORE-01 -- TS-STORE-48）は移行前後で維持する。

| テストID        | CAT    | テスト内容                | 移行パターン                                             |
| --------------- | ------ | ------------------------- | -------------------------------------------------------- |
| TS-STORE-01〜13 | CAT-01 | 状態セレクタ初期値        | getState() -> renderHook                                 |
| TS-STORE-14〜20 | CAT-02 | 状態セレクタ値取得        | setState + getState -> act + renderHook                  |
| TS-STORE-21〜30 | CAT-03 | アクションセレクタ存在    | getState() -> renderHook                                 |
| TS-STORE-31〜33 | CAT-04 | アクション実行            | getState().action() -> act + renderHook                  |
| TS-STORE-34〜37 | CAT-05 | 関数参照安定性            | getState() x2 -> renderHook + rerender                   |
| TS-STORE-38〜39 | CAT-06 | 再レンダー最適化          | getState() -> renderHook + act                           |
| TS-STORE-40〜42 | CAT-07 | 無限ループ防止（P31対策） | forループ -> renderHook + useEffect + useRef             |
| TS-STORE-43〜46 | CAT-08 | 非同期アクション          | await getState().action() -> await act + renderHook      |
| TS-STORE-47〜48 | CAT-09 | エラーハンドリング        | mock + await getState() -> mock + await act + renderHook |
