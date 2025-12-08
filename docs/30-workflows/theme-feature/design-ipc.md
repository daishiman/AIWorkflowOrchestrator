# IPC チャネル設計書

## ドキュメント情報

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | T-01-2                                                                               |
| ステータス   | 完了                                                                                 |
| 作成日       | 2025-12-08                                                                           |
| 関連ファイル | `apps/desktop/src/preload/channels.ts`, `apps/desktop/src/main/ipc/themeHandlers.ts` |

---

## 1. 設計概要

### 1.1 設計方針

既存の `storeHandlers.ts` パターンに完全準拠し、以下の原則を維持:

1. **チャネルホワイトリスト方式**: `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` への明示的登録
2. **型安全なIPC**: Request/Response型を `types.ts` で定義
3. **contextBridge経由の安全なAPI公開**: `window.electronAPI.theme` 名前空間で提供
4. **遅延初期化パターン**: 既存の `getStore()` を再利用

### 1.2 IPCチャネル一覧

| チャネルID | チャネル名             | 方向            | 用途                     |
| ---------- | ---------------------- | --------------- | ------------------------ |
| IPC-TH-001 | `theme:get`            | Renderer → Main | 保存されたテーマ設定取得 |
| IPC-TH-002 | `theme:set`            | Renderer → Main | テーマ設定保存           |
| IPC-TH-003 | `theme:get-system`     | Renderer → Main | システムテーマ取得       |
| IPC-TH-004 | `theme:system-changed` | Main → Renderer | システムテーマ変更通知   |

---

## 2. チャネル詳細設計

### 2.1 THEME_GET (`theme:get`)

#### 概要

electron-store から保存されたテーマ設定を取得する。

#### 型定義

```typescript
// リクエスト（パラメータなし）
type ThemeGetRequest = void;

// レスポンス
interface ThemeGetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode; // 'light' | 'dark' | 'system'
    resolvedTheme: ResolvedTheme; // 'light' | 'dark'
  };
  error?: string;
}
```

#### シーケンス図

```
Renderer                 Preload                  Main
   |                        |                       |
   |-- theme.get() -------->|                       |
   |                        |-- invoke('theme:get')->|
   |                        |                       |-- getStore().get('theme.mode')
   |                        |                       |-- resolveTheme(mode)
   |                        |<-- { success, data } -|
   |<-- Promise<Response> --|                       |
```

#### 実装コード

**Main側 (`themeHandlers.ts`)**:

```typescript
ipcMain.handle(IPC_CHANNELS.THEME_GET, async (): Promise<ThemeGetResponse> => {
  try {
    const mode = getStore().get("theme.mode", "system") as ThemeMode;
    const resolvedTheme = resolveTheme(mode);
    return { success: true, data: { mode, resolvedTheme } };
  } catch (error) {
    console.error("[Theme] Failed to get theme:", error);
    // フォールバック: デフォルト値を返却
    return {
      success: true,
      data: { mode: "system", resolvedTheme: resolveTheme("system") },
    };
  }
});
```

**Preload側 (`index.ts`)**:

```typescript
theme: {
  get: () => safeInvoke<ThemeGetResponse>(IPC_CHANNELS.THEME_GET),
  // ...
}
```

---

### 2.2 THEME_SET (`theme:set`)

#### 概要

ユーザーが選択したテーマ設定を electron-store に保存する。

#### 型定義

```typescript
// リクエスト
interface ThemeSetRequest {
  mode: ThemeMode; // 'light' | 'dark' | 'system'
}

// レスポンス
interface ThemeSetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}
```

#### シーケンス図

```
Renderer                 Preload                  Main
   |                        |                       |
   |-- theme.set({mode}) -->|                       |
   |                        |-- invoke('theme:set', req)->|
   |                        |                       |-- validateThemeMode(req.mode)
   |                        |                       |   [invalid] -> { success: false }
   |                        |                       |-- getStore().set('theme.mode', mode)
   |                        |                       |-- resolveTheme(mode)
   |                        |<-- { success, data } -|
   |<-- Promise<Response> --|                       |
```

#### 入力検証

```typescript
const VALID_THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

function validateThemeMode(mode: unknown): ValidationResult {
  if (typeof mode !== "string") {
    return { valid: false, error: "Theme mode must be a string" };
  }
  if (!VALID_THEME_MODES.includes(mode as ThemeMode)) {
    return {
      valid: false,
      error: `Invalid theme mode: ${mode}. Must be one of: ${VALID_THEME_MODES.join(", ")}`,
    };
  }
  return { valid: true };
}
```

#### 実装コード

**Main側 (`themeHandlers.ts`)**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.THEME_SET,
  async (_event, request: ThemeSetRequest): Promise<ThemeSetResponse> => {
    // 入力検証
    const validation = validateThemeMode(request.mode);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      getStore().set("theme.mode", request.mode);
      const resolvedTheme = resolveTheme(request.mode);
      return { success: true, data: { mode: request.mode, resolvedTheme } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save theme",
      };
    }
  },
);
```

**Preload側 (`index.ts`)**:

```typescript
theme: {
  set: (request: ThemeSetRequest) =>
    safeInvoke<ThemeSetResponse>(IPC_CHANNELS.THEME_SET, request),
  // ...
}
```

---

### 2.3 THEME_GET_SYSTEM (`theme:get-system`)

#### 概要

現在のOSテーマ設定（ダーク/ライト）を取得する。

#### 型定義

```typescript
// リクエスト（パラメータなし）
type ThemeGetSystemRequest = void;

// レスポンス
interface ThemeGetSystemResponse {
  success: boolean;
  data?: {
    isDark: boolean; // nativeTheme.shouldUseDarkColors の値
    resolvedTheme: ResolvedTheme; // 'light' | 'dark'
  };
  error?: string;
}
```

#### 実装コード

**Main側 (`themeHandlers.ts`)**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.THEME_GET_SYSTEM,
  async (): Promise<ThemeGetSystemResponse> => {
    try {
      const isDark = nativeTheme.shouldUseDarkColors;
      return {
        success: true,
        data: { isDark, resolvedTheme: isDark ? "dark" : "light" },
      };
    } catch (error) {
      // フォールバック: ダークモードをデフォルト
      return {
        success: true,
        data: { isDark: true, resolvedTheme: "dark" },
      };
    }
  },
);
```

---

### 2.4 THEME_SYSTEM_CHANGED (`theme:system-changed`)

#### 概要

OSのテーマ設定が変更された際に Renderer に通知する（Main → Renderer 方向）。

#### イベントデータ型

```typescript
interface ThemeSystemChangedEvent {
  isDark: boolean;
  resolvedTheme: ResolvedTheme;
}
```

#### シーケンス図

```
OS                      Main                     Preload               Renderer
 |                        |                        |                      |
 |-- theme change ------->|                        |                      |
 |                        |-- nativeTheme.on('updated')                   |
 |                        |-- BrowserWindow.forEach()                     |
 |                        |---- webContents.send('theme:system-changed', event)
 |                        |                        |<-- event ------------|
 |                        |                        |-- callback(event) -->|
 |                        |                        |                      |-- update UI
```

#### 実装コード

**Main側 (`themeHandlers.ts`)**:

```typescript
export function setupThemeWatcher(): void {
  nativeTheme.on("updated", () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    const event: ThemeSystemChangedEvent = {
      isDark,
      resolvedTheme: isDark ? "dark" : "light",
    };

    // 全ウィンドウに通知
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.THEME_SYSTEM_CHANGED, event);
      }
    });
  });
}
```

**Preload側 (`index.ts`)**:

```typescript
theme: {
  onSystemChanged: (callback: (event: ThemeSystemChangedEvent) => void) =>
    safeOn<ThemeSystemChangedEvent>(IPC_CHANNELS.THEME_SYSTEM_CHANGED, callback),
}
```

**Renderer側での使用例**:

```typescript
useEffect(() => {
  const unsubscribe = window.electronAPI.theme.onSystemChanged((event) => {
    if (themeMode === "system") {
      applyTheme(event.resolvedTheme);
    }
  });

  return unsubscribe;
}, [themeMode]);
```

---

## 3. ファイル変更一覧

### 3.1 `channels.ts` への追加

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // 既存チャネル
  FILE_GET_TREE: "file:get-tree",
  // ... 省略 ...

  // Theme operations（新規追加）
  THEME_GET: "theme:get",
  THEME_SET: "theme:set",
  THEME_GET_SYSTEM: "theme:get-system",
  THEME_SYSTEM_CHANGED: "theme:system-changed",
} as const;

// invoke用ホワイトリスト
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // 既存チャネル
  IPC_CHANNELS.FILE_GET_TREE,
  // ... 省略 ...

  // Theme channels（新規追加）
  IPC_CHANNELS.THEME_GET,
  IPC_CHANNELS.THEME_SET,
  IPC_CHANNELS.THEME_GET_SYSTEM,
];

// on用ホワイトリスト
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // 既存チャネル
  IPC_CHANNELS.FILE_CHANGED,
  // ... 省略 ...

  // Theme channels（新規追加）
  IPC_CHANNELS.THEME_SYSTEM_CHANGED,
];
```

### 3.2 `types.ts` への追加

```typescript
// apps/desktop/src/preload/types.ts

// ===== Theme Types =====

/**
 * ユーザーが選択するテーマモード
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * 実際に適用されるテーマ（systemを解決した結果）
 */
export type ResolvedTheme = "light" | "dark";

/**
 * テーマ設定の永続化データ構造
 */
export interface ThemeSettings {
  mode: ThemeMode;
}

// ===== Theme IPC Request/Response Types =====

export type ThemeGetRequest = void;

export interface ThemeGetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

export interface ThemeSetRequest {
  mode: ThemeMode;
}

export interface ThemeSetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

export type ThemeGetSystemRequest = void;

export interface ThemeGetSystemResponse {
  success: boolean;
  data?: {
    isDark: boolean;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

export interface ThemeSystemChangedEvent {
  isDark: boolean;
  resolvedTheme: ResolvedTheme;
}

// ===== ElectronAPI Extension =====

export interface ElectronAPI {
  // 既存API
  file: {
    /* ... */
  };
  store: {
    /* ... */
  };
  // ... 省略 ...

  // 新規追加: Theme API
  theme: {
    get: () => Promise<ThemeGetResponse>;
    set: (request: ThemeSetRequest) => Promise<ThemeSetResponse>;
    getSystem: () => Promise<ThemeGetSystemResponse>;
    onSystemChanged: (
      callback: (event: ThemeSystemChangedEvent) => void,
    ) => () => void;
  };
}
```

### 3.3 新規ファイル: `themeHandlers.ts`

```typescript
// apps/desktop/src/main/ipc/themeHandlers.ts

import { ipcMain, nativeTheme, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { getStore } from "./storeHandlers";
import type {
  ThemeGetResponse,
  ThemeSetRequest,
  ThemeSetResponse,
  ThemeGetSystemResponse,
  ThemeMode,
  ResolvedTheme,
  ThemeSystemChangedEvent,
} from "../../preload/types";

// ===== Validation =====

const VALID_THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateThemeMode(mode: unknown): ValidationResult {
  if (typeof mode !== "string") {
    return { valid: false, error: "Theme mode must be a string" };
  }
  if (!VALID_THEME_MODES.includes(mode as ThemeMode)) {
    return {
      valid: false,
      error: `Invalid theme mode: ${mode}. Must be one of: ${VALID_THEME_MODES.join(", ")}`,
    };
  }
  return { valid: true };
}

// ===== Helper Functions =====

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") {
    try {
      return nativeTheme.shouldUseDarkColors ? "dark" : "light";
    } catch {
      return "dark"; // フォールバック
    }
  }
  return mode;
}

// ===== IPC Handlers =====

export function registerThemeHandlers(): void {
  // THEME_GET: 保存されたテーマ設定を取得
  ipcMain.handle(
    IPC_CHANNELS.THEME_GET,
    async (): Promise<ThemeGetResponse> => {
      try {
        const mode = getStore().get("theme.mode", "system") as ThemeMode;
        const resolvedTheme = resolveTheme(mode);
        return { success: true, data: { mode, resolvedTheme } };
      } catch (error) {
        console.error("[Theme] Failed to get theme:", error);
        return {
          success: true,
          data: { mode: "system", resolvedTheme: resolveTheme("system") },
        };
      }
    },
  );

  // THEME_SET: テーマ設定を保存
  ipcMain.handle(
    IPC_CHANNELS.THEME_SET,
    async (_event, request: ThemeSetRequest): Promise<ThemeSetResponse> => {
      // 入力検証
      const validation = validateThemeMode(request.mode);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      try {
        getStore().set("theme.mode", request.mode);
        const resolvedTheme = resolveTheme(request.mode);
        return { success: true, data: { mode: request.mode, resolvedTheme } };
      } catch (error) {
        console.error("[Theme] Failed to set theme:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to save theme",
        };
      }
    },
  );

  // THEME_GET_SYSTEM: 現在のシステムテーマを取得
  ipcMain.handle(
    IPC_CHANNELS.THEME_GET_SYSTEM,
    async (): Promise<ThemeGetSystemResponse> => {
      try {
        const isDark = nativeTheme.shouldUseDarkColors;
        return {
          success: true,
          data: { isDark, resolvedTheme: isDark ? "dark" : "light" },
        };
      } catch (error) {
        console.error("[Theme] Failed to get system theme:", error);
        return {
          success: true,
          data: { isDark: true, resolvedTheme: "dark" },
        };
      }
    },
  );
}

// ===== System Theme Watcher =====

export function setupThemeWatcher(): void {
  nativeTheme.on("updated", () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    const event: ThemeSystemChangedEvent = {
      isDark,
      resolvedTheme: isDark ? "dark" : "light",
    };

    // 全BrowserWindowに通知
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.THEME_SYSTEM_CHANGED, event);
      }
    });
  });
}
```

### 3.4 `preload/index.ts` への追加

```typescript
// apps/desktop/src/preload/index.ts

import type {
  ThemeSetRequest,
  ThemeGetResponse,
  ThemeSetResponse,
  ThemeGetSystemResponse,
  ThemeSystemChangedEvent,
} from "./types";

// 既存の electronAPI オブジェクトに追加
const electronAPI: ElectronAPI = {
  // 既存API
  file: {
    /* ... */
  },
  store: {
    /* ... */
  },
  // ... 省略 ...

  // Theme API（新規追加）
  theme: {
    get: () => safeInvoke<ThemeGetResponse>(IPC_CHANNELS.THEME_GET),
    set: (request: ThemeSetRequest) =>
      safeInvoke<ThemeSetResponse>(IPC_CHANNELS.THEME_SET, request),
    getSystem: () =>
      safeInvoke<ThemeGetSystemResponse>(IPC_CHANNELS.THEME_GET_SYSTEM),
    onSystemChanged: (callback: (event: ThemeSystemChangedEvent) => void) =>
      safeOn<ThemeSystemChangedEvent>(
        IPC_CHANNELS.THEME_SYSTEM_CHANGED,
        callback,
      ),
  },
};
```

### 3.5 `main/index.ts` への追加

```typescript
// apps/desktop/src/main/index.ts

import { registerThemeHandlers, setupThemeWatcher } from "./ipc/themeHandlers";

// app.whenReady() 内で呼び出し
app.whenReady().then(() => {
  // 既存のハンドラー登録
  registerStoreHandlers();
  // ... 省略 ...

  // テーマハンドラー登録（新規追加）
  registerThemeHandlers();
  setupThemeWatcher();

  // ウィンドウ作成
  createWindow();
});
```

### 3.6 `storeHandlers.ts` のスキーマ拡張

```typescript
// apps/desktop/src/main/ipc/storeHandlers.ts

import type { ThemeSettings } from "../../preload/types";

interface StoreSchema {
  // 既存フィールド
  currentView: string;
  expandedFolders: string[];
  autoSyncEnabled: boolean;
  windowSize: { width: number; height: number };

  // 新規追加: テーマ設定
  theme: ThemeSettings;

  [key: string]: unknown;
}

function getStore(): Store<StoreSchema> {
  if (!store) {
    store = new Store<StoreSchema>({
      name: "knowledge-studio",
      defaults: {
        // 既存のデフォルト値
        currentView: "dashboard",
        expandedFolders: [],
        autoSyncEnabled: true,
        windowSize: { width: 1200, height: 800 },

        // テーマのデフォルト値（新規追加）
        theme: {
          mode: "system",
        },
      },
    });
  }
  return store;
}
```

---

## 4. エラーハンドリング設計

### 4.1 エラー分類と対処

| エラーカテゴリ           | 発生条件            | 対処方針                                      |
| ------------------------ | ------------------- | --------------------------------------------- |
| 入力検証エラー           | 不正なThemeMode値   | `{ success: false, error: '...' }` を返却     |
| ストレージ読み込みエラー | electron-store 破損 | デフォルト値にフォールバック、`success: true` |
| ストレージ書き込みエラー | ディスク容量不足等  | `{ success: false, error: '...' }` を返却     |
| nativeTheme API エラー   | API未対応環境       | ダークモードをデフォルトとして使用            |

### 4.2 エラーレスポンス形式

```typescript
// 共通エラーレスポンス構造
interface ErrorResponse {
  success: false;
  error: string;
}

// 例: 入力検証エラー
{ success: false, error: 'Invalid theme mode: invalid. Must be one of: light, dark, system' }

// 例: 書き込みエラー
{ success: false, error: 'Failed to save theme' }
```

---

## 5. セキュリティ設計

### 5.1 ホワイトリスト登録

すべてのテーマ関連チャネルは明示的にホワイトリストに登録:

```typescript
// invoke用（Renderer → Main）
ALLOWED_INVOKE_CHANNELS = ["theme:get", "theme:set", "theme:get-system"];

// on用（Main → Renderer）
ALLOWED_ON_CHANNELS = ["theme:system-changed"];
```

### 5.2 入力検証

Main側で以下を検証:

1. **型チェック**: `mode` が `string` 型であること
2. **値チェック**: `mode` が `'light' | 'dark' | 'system'` のいずれかであること

### 5.3 contextIsolation

`contextBridge.exposeInMainWorld` を通じてのみAPIを公開。直接的な `ipcRenderer` アクセスは不可。

---

## 6. テスト設計

### 6.1 ユニットテスト対象

| 関数                   | テスト内容                       |
| ---------------------- | -------------------------------- |
| `validateThemeMode`    | 有効値/無効値の検証              |
| `resolveTheme`         | 各モードでの解決結果             |
| `handleThemeGet`       | 正常系/異常系のレスポンス        |
| `handleThemeSet`       | 入力検証、保存成功/失敗          |
| `handleThemeGetSystem` | nativeTheme API の結果変換       |
| `setupThemeWatcher`    | イベント登録、ウィンドウへの通知 |

### 6.2 テストケース例

```typescript
describe("validateThemeMode", () => {
  it("should accept valid theme modes", () => {
    expect(validateThemeMode("light")).toEqual({ valid: true });
    expect(validateThemeMode("dark")).toEqual({ valid: true });
    expect(validateThemeMode("system")).toEqual({ valid: true });
  });

  it("should reject invalid theme modes", () => {
    expect(validateThemeMode("invalid")).toEqual({
      valid: false,
      error: expect.stringContaining("Invalid theme mode"),
    });
  });

  it("should reject non-string values", () => {
    expect(validateThemeMode(123)).toEqual({
      valid: false,
      error: "Theme mode must be a string",
    });
  });
});

describe("resolveTheme", () => {
  it("should return mode directly for light/dark", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("should resolve system mode based on nativeTheme", () => {
    // nativeTheme.shouldUseDarkColors をモック
  });
});
```

---

## 7. 完了条件チェックリスト

### T-01-2 完了条件

- [x] 全IPCチャネルのシグネチャが定義されている
  - `theme:get`, `theme:set`, `theme:get-system`, `theme:system-changed`
- [x] 既存パターン（storeHandlers.ts）との整合性が確保されている
  - `ipcMain.handle` パターン準拠
  - `getStore()` 遅延初期化パターン準拠
- [x] エラーハンドリングが設計されている
  - 入力検証、ストレージエラー、API未対応のフォールバック
- [x] セキュリティ要件が満たされている
  - ホワイトリスト登録、入力検証、contextIsolation

---

## 8. 関連ドキュメント

| ドキュメント           | パス                                                      | 関係               |
| ---------------------- | --------------------------------------------------------- | ------------------ |
| CSS変数設計書          | `docs/30-workflows/theme-feature/design-css-variables.md` | フロントエンド連携 |
| バックエンド要件定義書 | `docs/30-workflows/theme-feature/spec-backend.md`         | 要件定義           |
| 既存storeHandlers      | `apps/desktop/src/main/ipc/storeHandlers.ts`              | 実装パターン参照   |
| 既存channels定義       | `apps/desktop/src/preload/channels.ts`                    | 拡張対象           |

---

## 変更履歴

| バージョン | 日付       | 変更者          | 変更内容 |
| ---------- | ---------- | --------------- | -------- |
| 1.0.0      | 2025-12-08 | @api-doc-writer | 初版作成 |
