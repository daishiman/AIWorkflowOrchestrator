# useTheme フック設計書

## ドキュメント情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | T-01-4                                        |
| ステータス   | 完了                                          |
| 作成日       | 2025-12-08                                    |
| 対象ファイル | `apps/desktop/src/renderer/hooks/useTheme.ts` |

---

## 1. 設計概要

### 1.1 目的

`useTheme` フックは、テーマ機能に関する以下の責務をカプセル化する：

1. **Zustand状態へのアクセス**: `themeMode`, `resolvedTheme` の取得
2. **テーマ変更アクション**: `setThemeMode` の提供
3. **システムテーマ監視**: OS テーマ変更の検知と自動追従
4. **初期化処理**: アプリ起動時のテーマ復元

### 1.2 設計方針

```
┌─────────────────────────────────────────────────────────────────┐
│                       useTheme Hook                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  入力                                                      │ │
│  │  ├─ Zustand: themeMode, resolvedTheme, setThemeMode       │ │
│  │  └─ IPC: theme.onSystemChanged                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  処理                                                      │ │
│  │  ├─ useEffect: システムテーマ変更の監視                    │ │
│  │  └─ setTheme: モード変更とDOM更新                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  出力                                                      │ │
│  │  ├─ themeMode: ThemeMode                                  │ │
│  │  ├─ resolvedTheme: ResolvedTheme                          │ │
│  │  ├─ setTheme: (mode) => Promise<void>                     │ │
│  │  └─ isDark: boolean                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. インターフェース設計

### 2.1 戻り値型

```typescript
interface UseThemeReturn {
  // 現在のテーマモード（ユーザー選択）
  themeMode: ThemeMode; // 'light' | 'dark' | 'system'

  // 実際に適用されているテーマ
  resolvedTheme: ResolvedTheme; // 'light' | 'dark'

  // テーマを変更する
  setTheme: (mode: ThemeMode) => Promise<void>;

  // ダークモードかどうか（便利ヘルパー）
  isDark: boolean;
}
```

### 2.2 使用例

```tsx
// コンポーネントでの使用
function ThemeSelector() {
  const { themeMode, resolvedTheme, setTheme, isDark } = useTheme();

  return (
    <div>
      <p>現在のモード: {themeMode}</p>
      <p>適用テーマ: {resolvedTheme}</p>
      <p>ダークモード: {isDark ? "Yes" : "No"}</p>

      <button onClick={() => setTheme("light")}>ライト</button>
      <button onClick={() => setTheme("dark")}>ダーク</button>
      <button onClick={() => setTheme("system")}>システム</button>
    </div>
  );
}
```

---

## 3. 実装設計

### 3.1 フック本体

```typescript
// apps/desktop/src/renderer/hooks/useTheme.ts

import { useEffect, useCallback } from "react";
import { useAppStore } from "../store";
import type { ThemeMode, ResolvedTheme } from "../store/types";

interface UseThemeReturn {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

export function useTheme(): UseThemeReturn {
  // Zustand から状態を取得
  const themeMode = useAppStore((state) => state.themeMode);
  const resolvedTheme = useAppStore((state) => state.resolvedTheme);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const setResolvedTheme = useAppStore((state) => state.setResolvedTheme);

  // システムテーマ変更の監視
  useEffect(() => {
    // IPC リスナーを登録
    const unsubscribe = window.electronAPI.theme.onSystemChanged((event) => {
      // システムモードの場合のみ、UIを更新
      if (themeMode === "system") {
        setResolvedTheme(event.resolvedTheme);
      }
    });

    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, [themeMode, setResolvedTheme]);

  // setTheme ラッパー（メモ化）
  const setTheme = useCallback(
    async (mode: ThemeMode) => {
      await setThemeMode(mode);
    },
    [setThemeMode],
  );

  // isDark 計算
  const isDark = resolvedTheme === "dark";

  return {
    themeMode,
    resolvedTheme,
    setTheme,
    isDark,
  };
}
```

### 3.2 初期化フック

アプリ起動時に一度だけテーマを初期化するフック:

```typescript
// apps/desktop/src/renderer/hooks/useThemeInitializer.ts

import { useEffect, useRef } from "react";
import { useAppStore } from "../store";

/**
 * アプリ起動時にテーマを初期化するフック
 * App.tsx など、アプリのルートコンポーネントで一度だけ呼び出す
 */
export function useThemeInitializer(): void {
  const initializeTheme = useAppStore((state) => state.initializeTheme);
  const initialized = useRef(false);

  useEffect(() => {
    // 二重初期化を防止
    if (initialized.current) return;
    initialized.current = true;

    // 非同期で初期化
    initializeTheme().catch((error) => {
      console.error("[Theme] Initialization failed:", error);
    });
  }, [initializeTheme]);
}
```

### 3.3 使用例（App.tsx）

```tsx
// apps/desktop/src/renderer/App.tsx

import { useThemeInitializer } from "./hooks/useThemeInitializer";

function App() {
  // テーマの初期化（一度だけ実行）
  useThemeInitializer();

  return <div className="app">{/* アプリケーションコンテンツ */}</div>;
}
```

---

## 4. システムテーマ監視の詳細

### 4.1 監視フロー

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  OS          │     │  Main Process     │     │  Renderer        │
│  テーマ変更   │────►│  nativeTheme.on  │────►│  onSystemChanged │
└──────────────┘     │  ('updated')      │     │  callback        │
                     └──────────────────┘     └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  themeMode ===   │
                                              │  'system' ?      │
                                              └────────┬─────────┘
                                                       │
                                    ┌──────────────────┴──────────────────┐
                                    │                                      │
                                    ▼ Yes                                  ▼ No
                          ┌──────────────────┐                  ┌──────────────────┐
                          │ setResolvedTheme │                  │ 何もしない        │
                          │ (event.resolved) │                  │                  │
                          └──────────────────┘                  └──────────────────┘
```

### 4.2 条件分岐

| 現在の themeMode | OSテーマ変更時の動作                   |
| ---------------- | -------------------------------------- |
| `'light'`        | 無視（ユーザーが明示的にライトを選択） |
| `'dark'`         | 無視（ユーザーが明示的にダークを選択） |
| `'system'`       | `resolvedTheme` を更新してUIに反映     |

### 4.3 メモリリーク防止

```typescript
useEffect(() => {
  const unsubscribe = window.electronAPI.theme.onSystemChanged((event) => {
    // ...
  });

  // コンポーネントアンマウント時にリスナーを解除
  return () => {
    unsubscribe();
  };
}, [themeMode, setResolvedTheme]);
```

**重要**: `onSystemChanged` から返される `unsubscribe` 関数を必ずクリーンアップで呼び出す。

---

## 5. パフォーマンス最適化

### 5.1 セレクターの分離

```typescript
// 個別のセレクターで不要な再レンダリングを防止
const themeMode = useAppStore((state) => state.themeMode);
const resolvedTheme = useAppStore((state) => state.resolvedTheme);
const setThemeMode = useAppStore((state) => state.setThemeMode);
const setResolvedTheme = useAppStore((state) => state.setResolvedTheme);
```

### 5.2 useCallback によるメモ化

```typescript
const setTheme = useCallback(
  async (mode: ThemeMode) => {
    await setThemeMode(mode);
  },
  [setThemeMode], // setThemeMode は安定参照
);
```

### 5.3 useRef による二重初期化防止

```typescript
const initialized = useRef(false);

useEffect(() => {
  if (initialized.current) return;
  initialized.current = true;
  // ...
}, []);
```

---

## 6. エラーハンドリング

### 6.1 システムテーマ取得エラー

```typescript
setTheme: async (mode: ThemeMode) => {
  let resolved: ResolvedTheme;

  if (mode === "system") {
    try {
      const response = await window.electronAPI.theme.getSystem();
      resolved = response.data?.resolvedTheme ?? "dark";
    } catch (error) {
      console.error("[useTheme] Failed to get system theme:", error);
      resolved = "dark"; // フォールバック
    }
  } else {
    resolved = mode;
  }

  // ...
};
```

### 6.2 永続化エラー

```typescript
// fire-and-forget パターン
// UIは即座に更新し、永続化エラーはログのみ
window.electronAPI.theme.set({ mode }).catch((error) => {
  console.error("[useTheme] Failed to persist theme:", error);
  // UIには影響を与えない
});
```

---

## 7. テスト設計

### 7.1 ユニットテスト

```typescript
// apps/desktop/src/renderer/hooks/useTheme.test.ts

import { renderHook, act, waitFor } from "@testing-library/react";
import { useTheme } from "./useTheme";
import { useAppStore } from "../store";

// Mock
const mockOnSystemChanged = vi.fn();
const mockUnsubscribe = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", {
    electronAPI: {
      theme: {
        onSystemChanged: (callback: (event: unknown) => void) => {
          mockOnSystemChanged.mockImplementation(callback);
          return mockUnsubscribe;
        },
        getSystem: vi.fn().mockResolvedValue({
          success: true,
          data: { isDark: true, resolvedTheme: "dark" },
        }),
        set: vi.fn().mockResolvedValue({ success: true }),
      },
    },
  });

  // Reset store
  useAppStore.setState({
    themeMode: "system",
    resolvedTheme: "dark",
  });
});

describe("useTheme", () => {
  it("should return current theme state", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeMode).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("should set theme mode", async () => {
    const { result } = renderHook(() => useTheme());

    await act(async () => {
      await result.current.setTheme("light");
    });

    expect(result.current.themeMode).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
    expect(result.current.isDark).toBe(false);
  });

  it("should respond to system theme changes when in system mode", async () => {
    const { result } = renderHook(() => useTheme());

    // 初期状態: system モード
    expect(result.current.themeMode).toBe("system");

    // システムテーマ変更をシミュレート
    act(() => {
      mockOnSystemChanged({ isDark: false, resolvedTheme: "light" });
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("light");
    });
  });

  it("should ignore system theme changes when not in system mode", async () => {
    const { result } = renderHook(() => useTheme());

    // ダークモードを明示的に選択
    await act(async () => {
      await result.current.setTheme("dark");
    });

    // システムテーマ変更をシミュレート
    act(() => {
      mockOnSystemChanged({ isDark: false, resolvedTheme: "light" });
    });

    // resolvedTheme は変わらない
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("should unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useTheme());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
```

### 7.2 テストケース一覧

| テストケース                 | 検証内容                                  |
| ---------------------------- | ----------------------------------------- |
| 初期状態の取得               | themeMode, resolvedTheme, isDark が正しい |
| setTheme('light')            | ライトテーマへの切り替え                  |
| setTheme('dark')             | ダークテーマへの切り替え                  |
| setTheme('system')           | システムテーマへの切り替え                |
| システムモード時のOS変更追従 | resolvedTheme が更新される                |
| 固定テーマ時のOS変更無視     | resolvedTheme が変わらない                |
| アンマウント時のリスナー解除 | unsubscribe が呼ばれる                    |
| IPC エラー時のフォールバック | ダークモードにフォールバック              |

---

## 8. 完了条件チェックリスト

### T-01-4 完了条件

- [x] useTheme フックのインターフェースが定義されている
  - `themeMode`, `resolvedTheme`, `setTheme`, `isDark`
- [x] システムテーマ変更監視が設計されている
  - `onSystemChanged` リスナーの登録と解除
- [x] 初期化フロー（useThemeInitializer）が設計されている
  - アプリ起動時の一度だけの初期化
- [x] テストケースが設計されている
  - 正常系・異常系・エッジケース

---

## 9. 関連ドキュメント

| ドキュメント        | パス                                                       | 関係        |
| ------------------- | ---------------------------------------------------------- | ----------- |
| SettingsSlice設計書 | `docs/30-workflows/theme-feature/design-settings-slice.md` | Zustand連携 |
| IPC設計書           | `docs/30-workflows/theme-feature/design-ipc.md`            | IPC連携     |
| CSS変数設計書       | `docs/30-workflows/theme-feature/design-css-variables.md`  | DOM操作連携 |

---

## 変更履歴

| バージョン | 日付       | 変更者                 | 変更内容 |
| ---------- | ---------- | ---------------------- | -------- |
| 1.0.0      | 2025-12-08 | @custom-hooks-patterns | 初版作成 |
