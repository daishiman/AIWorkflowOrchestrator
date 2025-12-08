# SettingsSlice 拡張設計書

## ドキュメント情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | T-01-3                                                    |
| ステータス   | 完了                                                      |
| 作成日       | 2025-12-08                                                |
| 対象ファイル | `apps/desktop/src/renderer/store/slices/settingsSlice.ts` |

---

## 1. 設計概要

### 1.1 設計方針

既存の `settingsSlice.ts` を**非破壊的に拡張**し、テーマ関連の状態とアクションを追加する。

#### 拡張内容

| 追加項目          | 型                          | 説明                                      |
| ----------------- | --------------------------- | ----------------------------------------- |
| `themeMode`       | `ThemeMode`                 | ユーザー選択のテーマ（light/dark/system） |
| `resolvedTheme`   | `ResolvedTheme`             | 実際に適用されるテーマ（light/dark）      |
| `setThemeMode`    | `(mode: ThemeMode) => void` | テーマを変更し、永続化                    |
| `initializeTheme` | `() => Promise<void>`       | 起動時のテーマ初期化                      |

### 1.2 データフロー

```
┌─────────────────────────────────────────────────────────────────┐
│                       Renderer Process                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    settingsSlice                         │   │
│  │  ┌──────────────┐  ┌────────────────┐                   │   │
│  │  │ themeMode    │  │ resolvedTheme  │                   │   │
│  │  │ 'system'     │  │ 'dark'         │                   │   │
│  │  └──────┬───────┘  └────────┬───────┘                   │   │
│  │         │                   │                            │   │
│  │  ┌──────┴───────────────────┴───────┐                   │   │
│  │  │         setThemeMode()           │                   │   │
│  │  │  1. 状態更新                      │                   │   │
│  │  │  2. DOM更新 (data-theme)          │                   │   │
│  │  │  3. IPC経由で永続化               │                   │   │
│  │  └──────────────────────────────────┘                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              │ IPC                              │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                        Main Process                             │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────────┐ │
│  │                    electron-store                          │ │
│  │               theme.mode: 'system'                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 型定義

### 2.1 新規型（types.ts に追加）

```typescript
// apps/desktop/src/renderer/store/types.ts

// テーマモード型（ユーザー選択）
export type ThemeMode = "light" | "dark" | "system";

// 解決済みテーマ型（実際に適用される）
export type ResolvedTheme = "light" | "dark";
```

### 2.2 SettingsSlice インターフェース拡張

```typescript
// apps/desktop/src/renderer/store/slices/settingsSlice.ts

import type { ThemeMode, ResolvedTheme } from "../types";

export interface SettingsSlice {
  // 既存 State
  userProfile: UserProfile;
  apiKey: string;
  autoSyncEnabled: boolean;

  // 新規追加: Theme State
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;

  // 既存 Actions
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setApiKey: (key: string) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;

  // 新規追加: Theme Actions
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  initializeTheme: () => Promise<void>;
}
```

---

## 3. 状態設計

### 3.1 初期状態

```typescript
const initialThemeState = {
  themeMode: "system" as ThemeMode,
  resolvedTheme: "dark" as ResolvedTheme, // デフォルトはダーク（FOUC防止）
};
```

### 3.2 状態遷移

```
初期状態
  │
  ▼
initializeTheme() ─── IPC: theme:get ───► electron-store
  │                                          │
  │◄─────────────── { mode, resolvedTheme } ─┘
  │
  ▼
setThemeMode('dark')
  │
  ├─► 1. set({ themeMode: 'dark', resolvedTheme: 'dark' })
  │
  ├─► 2. applyThemeToDOM('dark')
  │      document.documentElement.setAttribute('data-theme', 'dark')
  │
  └─► 3. IPC: theme:set({ mode: 'dark' }) ───► electron-store
```

---

## 4. アクション設計

### 4.1 setThemeMode

**目的**: ユーザーがテーマを変更した際に呼び出す

```typescript
setThemeMode: async (mode: ThemeMode) => {
  // 1. 解決済みテーマを計算
  let resolved: ResolvedTheme;
  if (mode === "system") {
    const systemResponse = await window.electronAPI.theme.getSystem();
    resolved = systemResponse.data?.resolvedTheme ?? "dark";
  } else {
    resolved = mode;
  }

  // 2. Zustand状態を更新
  set({ themeMode: mode, resolvedTheme: resolved });

  // 3. DOMに適用（トランジション付き）
  applyThemeToDOM(resolved);

  // 4. electron-storeに永続化（fire-and-forget）
  window.electronAPI.theme.set({ mode }).catch((error) => {
    console.error("[Theme] Failed to persist theme:", error);
  });
};
```

### 4.2 setResolvedTheme

**目的**: システムテーマ変更時に resolvedTheme のみを更新（mode は変更しない）

```typescript
setResolvedTheme: (theme: ResolvedTheme) => {
  set({ resolvedTheme: theme });
  applyThemeToDOM(theme);
};
```

### 4.3 initializeTheme

**目的**: アプリ起動時にelectron-storeからテーマを復元

```typescript
initializeTheme: async () => {
  try {
    const response = await window.electronAPI.theme.get();
    if (response.success && response.data) {
      const { mode, resolvedTheme } = response.data;
      set({ themeMode: mode, resolvedTheme });
      applyThemeToDOM(resolvedTheme);
    }
  } catch (error) {
    console.error("[Theme] Failed to initialize theme:", error);
    // フォールバック: 現在の状態を維持
  }
};
```

---

## 5. DOM操作ヘルパー

### 5.1 applyThemeToDOM

```typescript
// apps/desktop/src/renderer/utils/theme.ts

export function applyThemeToDOM(theme: ResolvedTheme): void {
  const root = document.documentElement;

  // トランジションを有効化
  root.classList.add("theme-transition");

  // data-theme 属性を設定
  root.setAttribute("data-theme", theme);

  // トランジション終了後にクラスを削除（200ms = CSS transition duration）
  setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 200);
}
```

### 5.2 getInitialThemeFromDOM

```typescript
// FOUC防止スクリプトで設定された初期テーマを取得
export function getInitialThemeFromDOM(): ResolvedTheme {
  const dataTheme = document.documentElement.getAttribute("data-theme");
  return dataTheme === "light" ? "light" : "dark";
}
```

---

## 6. 完全な実装コード

### 6.1 settingsSlice.ts（拡張版）

```typescript
// apps/desktop/src/renderer/store/slices/settingsSlice.ts

import { StateCreator } from "zustand";
import type { UserProfile, ThemeMode, ResolvedTheme } from "../types";
import { applyThemeToDOM } from "../../utils/theme";

export interface SettingsSlice {
  // State
  userProfile: UserProfile;
  apiKey: string;
  autoSyncEnabled: boolean;
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;

  // Actions
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setApiKey: (key: string) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  initializeTheme: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: "ユーザー",
  email: "",
  avatar: "",
  plan: "free",
};

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set, get) => ({
  // Initial state
  userProfile: defaultProfile,
  apiKey: "",
  autoSyncEnabled: true,
  themeMode: "system",
  resolvedTheme: "dark", // FOUC防止のため、デフォルトはダーク

  // Existing actions
  setUserProfile: (profile) => {
    set({ userProfile: profile });
  },

  updateUserProfile: (updates) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...updates },
    }));
  },

  setApiKey: (key) => {
    set({ apiKey: key });
  },

  setAutoSyncEnabled: (enabled) => {
    set({ autoSyncEnabled: enabled });
  },

  // New theme actions
  setThemeMode: async (mode: ThemeMode) => {
    // 1. 解決済みテーマを計算
    let resolved: ResolvedTheme;
    if (mode === "system") {
      try {
        const systemResponse = await window.electronAPI.theme.getSystem();
        resolved = systemResponse.data?.resolvedTheme ?? "dark";
      } catch {
        resolved = "dark"; // フォールバック
      }
    } else {
      resolved = mode;
    }

    // 2. Zustand状態を更新
    set({ themeMode: mode, resolvedTheme: resolved });

    // 3. DOMに適用
    applyThemeToDOM(resolved);

    // 4. electron-storeに永続化（fire-and-forget）
    try {
      await window.electronAPI.theme.set({ mode });
    } catch (error) {
      console.error("[Theme] Failed to persist theme:", error);
    }
  },

  setResolvedTheme: (theme: ResolvedTheme) => {
    set({ resolvedTheme: theme });
    applyThemeToDOM(theme);
  },

  initializeTheme: async () => {
    try {
      const response = await window.electronAPI.theme.get();
      if (response.success && response.data) {
        const { mode, resolvedTheme } = response.data;
        set({ themeMode: mode, resolvedTheme });
        applyThemeToDOM(resolvedTheme);
      }
    } catch (error) {
      console.error("[Theme] Failed to initialize theme:", error);
      // フォールバック: 現在の状態を維持
    }
  },
});
```

### 6.2 types.ts への追加

```typescript
// apps/desktop/src/renderer/store/types.ts

// 既存の型定義...

// テーマ関連型（新規追加）
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
```

### 6.3 index.ts への追加（セレクター）

```typescript
// apps/desktop/src/renderer/store/index.ts

// 既存のセレクター...

// Theme selectors（新規追加）
export const useThemeMode = () => useAppStore((state) => state.themeMode);
export const useResolvedTheme = () =>
  useAppStore((state) => state.resolvedTheme);

// Theme actions（新規追加）
export const useSetThemeMode = () => useAppStore((state) => state.setThemeMode);
export const useInitializeTheme = () =>
  useAppStore((state) => state.initializeTheme);
```

### 6.4 永続化設定の更新

```typescript
// apps/desktop/src/renderer/store/index.ts

// persist の partialize を更新
partialize: (state) => ({
  // 既存のフィールド
  currentView: state.currentView,
  selectedFile: state.selectedFile,
  expandedFolders: state.expandedFolders,
  userProfile: state.userProfile,
  autoSyncEnabled: state.autoSyncEnabled,
  windowSize: state.windowSize,

  // テーマは electron-store で永続化するため、除外
  // themeMode: state.themeMode,  // ← 追加しない
}),
```

**注意**: `themeMode` は electron-store で永続化されるため、Zustand の persist からは除外する。

---

## 7. システムテーマ変更の監視

### 7.1 useTheme フックでの監視（T-01-4 で詳細設計）

```typescript
// apps/desktop/src/renderer/hooks/useTheme.ts

export function useTheme() {
  const themeMode = useThemeMode();
  const resolvedTheme = useResolvedTheme();
  const setThemeMode = useSetThemeMode();
  const setResolvedTheme = useAppStore((state) => state.setResolvedTheme);

  // システムテーマ変更の監視
  useEffect(() => {
    const unsubscribe = window.electronAPI.theme.onSystemChanged((event) => {
      if (themeMode === "system") {
        // システムモードの場合のみ、UIを更新
        setResolvedTheme(event.resolvedTheme);
      }
    });

    return unsubscribe;
  }, [themeMode, setResolvedTheme]);

  return { themeMode, resolvedTheme, setThemeMode };
}
```

---

## 8. テスト設計

### 8.1 ユニットテスト

```typescript
// apps/desktop/src/renderer/store/slices/settingsSlice.test.ts

import { act, renderHook } from "@testing-library/react";
import { useAppStore } from "../index";

// Mock electronAPI
const mockThemeGet = vi.fn();
const mockThemeSet = vi.fn();
const mockThemeGetSystem = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", {
    electronAPI: {
      theme: {
        get: mockThemeGet,
        set: mockThemeSet,
        getSystem: mockThemeGetSystem,
      },
    },
  });
});

describe("settingsSlice - theme", () => {
  it("should initialize with default theme values", () => {
    const { result } = renderHook(() => useAppStore());

    expect(result.current.themeMode).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("should set theme mode and resolve theme", async () => {
    mockThemeSet.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAppStore());

    await act(async () => {
      await result.current.setThemeMode("light");
    });

    expect(result.current.themeMode).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
    expect(mockThemeSet).toHaveBeenCalledWith({ mode: "light" });
  });

  it("should resolve system theme correctly", async () => {
    mockThemeGetSystem.mockResolvedValue({
      success: true,
      data: { isDark: true, resolvedTheme: "dark" },
    });
    mockThemeSet.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAppStore());

    await act(async () => {
      await result.current.setThemeMode("system");
    });

    expect(result.current.themeMode).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("should initialize theme from electron-store", async () => {
    mockThemeGet.mockResolvedValue({
      success: true,
      data: { mode: "light", resolvedTheme: "light" },
    });

    const { result } = renderHook(() => useAppStore());

    await act(async () => {
      await result.current.initializeTheme();
    });

    expect(result.current.themeMode).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("should handle initialization failure gracefully", async () => {
    mockThemeGet.mockRejectedValue(new Error("IPC failed"));

    const { result } = renderHook(() => useAppStore());

    // 初期状態を設定
    const initialMode = result.current.themeMode;
    const initialResolved = result.current.resolvedTheme;

    await act(async () => {
      await result.current.initializeTheme();
    });

    // 状態が変わっていないことを確認
    expect(result.current.themeMode).toBe(initialMode);
    expect(result.current.resolvedTheme).toBe(initialResolved);
  });
});
```

---

## 9. 完了条件チェックリスト

### T-01-3 完了条件

- [x] SettingsSlice の拡張インターフェースが定義されている
  - `themeMode`, `resolvedTheme` 状態
  - `setThemeMode`, `setResolvedTheme`, `initializeTheme` アクション
- [x] テーマ状態の初期化フローが設計されている
  - electron-store からの読み込み
  - FOUC防止のためのデフォルト値
- [x] IPC連携（theme API呼び出し）が設計されている
  - `theme.get()`, `theme.set()`, `theme.getSystem()` の呼び出し箇所
- [x] persist 設定への影響が考慮されている
  - electron-store と二重永続化を避けるため除外

---

## 10. 関連ドキュメント

| ドキュメント       | パス                                                      | 関係               |
| ------------------ | --------------------------------------------------------- | ------------------ |
| IPC設計書          | `docs/30-workflows/theme-feature/design-ipc.md`           | IPC連携            |
| CSS変数設計書      | `docs/30-workflows/theme-feature/design-css-variables.md` | DOM操作連携        |
| 既存settingsSlice  | `apps/desktop/src/renderer/store/slices/settingsSlice.ts` | 拡張対象           |
| 既存store/index.ts | `apps/desktop/src/renderer/store/index.ts`                | セレクター追加対象 |

---

## 変更履歴

| バージョン | 日付       | 変更者         | 変更内容 |
| ---------- | ---------- | -------------- | -------- |
| 1.0.0      | 2025-12-08 | @state-manager | 初版作成 |
