# テーマ機能 - バックエンド要件定義書（IPC/永続化）

**バージョン**: 1.0.0
**作成日**: 2024-12-08
**最終更新**: 2024-12-08
**作成者**: .claude/agents/req-analyst.md
**ステータス**: Draft

---

## 1. 概要

### 1.1 目的

本ドキュメントは、Knowledge Studioデスクトップアプリケーションにおけるテーマ機能のバックエンド要件（IPC通信、永続化、システムテーマ検出）を定義する。フロントエンド要件定義書（spec-frontend.md）と連携し、実装者が迷わず設計・実装できる詳細レベルで要件を記述する。

### 1.2 背景

#### フロントエンド要件との関係

| フロントエンド要件 | バックエンド責務                                       |
| ------------------ | ------------------------------------------------------ |
| FR-TH-001          | テーマ設定の永続化（electron-store）                   |
| FR-TH-002          | システムテーマ検出（nativeTheme API）                  |
| FR-TH-004          | IPC経由でのテーマ読み書き                              |
| UC-TH-003          | 起動時のテーマ復元（Mainプロセスからの初期テーマ提供） |

#### 既存IPC実装パターン

本機能は既存の`storeHandlers.ts`パターンに準拠して実装する。

| 既存パターン   | ファイル                                     | 特徴                                 |
| -------------- | -------------------------------------------- | ------------------------------------ |
| チャネル定義   | `apps/desktop/src/preload/channels.ts`       | `IPC_CHANNELS`オブジェクトで一元管理 |
| 型定義         | `apps/desktop/src/preload/types.ts`          | Request/Response型を明示的に定義     |
| ハンドラー登録 | `apps/desktop/src/main/ipc/storeHandlers.ts` | `ipcMain.handle`で非同期処理         |
| API公開        | `apps/desktop/src/preload/index.ts`          | `contextBridge`経由で安全に公開      |
| ホワイトリスト | `apps/desktop/src/preload/channels.ts`       | `ALLOWED_INVOKE_CHANNELS`で制限      |

### 1.3 スコープ

**含まれるもの**:

- テーマ設定のIPC通信（取得/保存）
- electron-storeによるテーマ永続化
- nativeTheme APIによるシステムテーマ検出
- システムテーマ変更時のRenderer通知
- 起動時の初期テーマ提供機構

**含まれないもの**:

- フロントエンドのUIコンポーネント（spec-frontend.mdで定義）
- CSS変数の管理（spec-frontend.mdで定義）
- Zustand storeの詳細（spec-frontend.mdで定義）

### 1.4 用語定義

| 用語           | 定義                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| ThemeMode      | ユーザーが選択するテーマモード。`'light'` / `'dark'` / `'system'`の3値 |
| ResolvedTheme  | 実際に適用されるテーマ。`'light'` / `'dark'`の2値                      |
| nativeTheme    | Electronが提供するシステムテーマ検出API（Mainプロセスのみ）            |
| electron-store | Electronアプリ向けの永続化ライブラリ                                   |
| IPC            | Inter-Process Communication。Main/Renderer間の通信機構                 |
| contextBridge  | セキュアにRenderer側にAPIを公開するElectronの仕組み                    |

---

## 2. アーキテクチャ要件

### 2.1 Electronプロセスモデル

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Main Process                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ electron-store  │  │   nativeTheme   │  │   themeHandlers.ts      │  │
│  │ (永続化)        │  │ (システムテーマ)│  │   - THEME_GET           │  │
│  │                 │  │                 │  │   - THEME_SET           │  │
│  │ theme: {        │  │ .shouldUseDark  │  │   - THEME_GET_SYSTEM    │  │
│  │   mode: 'system'│  │  Colors         │  │                         │  │
│  │ }               │  │ .themeSource    │  │   ipcMain.handle()      │  │
│  └────────┬────────┘  │ .on('updated')  │  └───────────┬─────────────┘  │
│           │           └────────┬────────┘              │                 │
│           │                    │                       │                 │
│           └────────────────────┼───────────────────────┘                 │
│                                │                                         │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │ IPC
┌────────────────────────────────┼─────────────────────────────────────────┐
│                           Preload Script                                 │
│  ┌─────────────────────────────┴─────────────────────────────────────┐  │
│  │                      contextBridge.exposeInMainWorld              │  │
│  │                                                                   │  │
│  │  window.electronAPI.theme = {                                     │  │
│  │    get: () => Promise<ThemeGetResponse>                           │  │
│  │    set: (request) => Promise<ThemeSetResponse>                    │  │
│  │    getSystem: () => Promise<ThemeGetSystemResponse>               │  │
│  │    onSystemChanged: (callback) => () => void                      │  │
│  │  }                                                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼─────────────────────────────────────────┐
│                           Renderer Process                               │
│  ┌─────────────────────────────┴─────────────────────────────────────┐  │
│  │                      window.electronAPI.theme                      │  │
│  │                                                                    │  │
│  │  // テーマ取得                                                     │  │
│  │  const { data } = await window.electronAPI.theme.get();            │  │
│  │                                                                    │  │
│  │  // テーマ保存                                                     │  │
│  │  await window.electronAPI.theme.set({ mode: 'dark' });             │  │
│  │                                                                    │  │
│  │  // システムテーマ変更監視                                          │  │
│  │  const unsubscribe = window.electronAPI.theme.onSystemChanged(     │  │
│  │    (isDark) => { /* 処理 */ }                                      │  │
│  │  );                                                                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 プロセス間責務分離

| プロセス | 責務                                                     | 禁止事項                    |
| -------- | -------------------------------------------------------- | --------------------------- |
| Main     | electron-store読み書き、nativeTheme API呼び出し、IPC応答 | DOM操作、React状態管理      |
| Preload  | contextBridge経由でのAPI公開、型安全なラッパー提供       | 直接的なNode.js API呼び出し |
| Renderer | UI描画、Zustand状態管理、IPC呼び出し                     | electron-store直接アクセス  |

### 2.3 セキュリティ設計原則

| 原則                   | 実装方法                                                     |
| ---------------------- | ------------------------------------------------------------ |
| チャネルホワイトリスト | `ALLOWED_INVOKE_CHANNELS`に登録されたチャネルのみ許可        |
| 入力検証               | Main側でThemeModeの値を検証（`'light'`/`'dark'`/`'system'`） |
| contextIsolation       | `contextBridge`経由でのみAPIを公開                           |
| nodeIntegration無効    | Renderer側からNode.js APIへの直接アクセスを禁止              |

---

## 3. IPC要件

### 3.1 IPCチャネル一覧

| チャネルID                       | 方向            | 用途                       | 優先度      |
| -------------------------------- | --------------- | -------------------------- | ----------- |
| IPC-TH-001: THEME_GET            | Renderer → Main | 保存されたテーマ設定を取得 | Must have   |
| IPC-TH-002: THEME_SET            | Renderer → Main | テーマ設定を保存           | Must have   |
| IPC-TH-003: THEME_GET_SYSTEM     | Renderer → Main | 現在のシステムテーマを取得 | Must have   |
| IPC-TH-004: THEME_SYSTEM_CHANGED | Main → Renderer | システムテーマ変更を通知   | Should have |

---

### IPC-TH-001: テーマ設定取得（THEME_GET）

**チャネル名**: `theme:get`

**概要**: electron-storeから保存されたテーマ設定を取得する

**リクエスト型**:

```typescript
// リクエストパラメータなし（void）
type ThemeGetRequest = void;
```

**レスポンス型**:

```typescript
interface ThemeGetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode; // 'light' | 'dark' | 'system'
    resolvedTheme: ResolvedTheme; // 'light' | 'dark'（systemの場合は実際のテーマ）
  };
  error?: string;
}
```

**処理フロー**:

```
1. Rendererが window.electronAPI.theme.get() を呼び出す
2. Preloadが ipcRenderer.invoke('theme:get') を実行
3. Mainの themeHandlers.ts が electron-store から 'theme.mode' を読み込む
4. mode が 'system' の場合:
   4a. nativeTheme.shouldUseDarkColors で実際のテーマを判定
   4b. resolvedTheme = shouldUseDarkColors ? 'dark' : 'light'
5. mode が 'light' または 'dark' の場合:
   5a. resolvedTheme = mode
6. { success: true, data: { mode, resolvedTheme } } を返却
```

**エラーハンドリング**:

| エラー条件                 | 処理                                         |
| -------------------------- | -------------------------------------------- |
| electron-store読み込み失敗 | デフォルト値（mode: 'system'）を返却         |
| 保存データが不正な形式     | デフォルト値にフォールバック、データを上書き |
| nativeTheme API利用不可    | resolvedTheme: 'dark' をデフォルトとして返却 |

**受け入れ基準**:

**AC-IPC-001-1: 保存されたテーマの取得**

- **Given**: electron-storeに`theme.mode: 'light'`が保存されている
- **When**: `window.electronAPI.theme.get()`を呼び出す
- **Then**:
  - `success: true`が返却される
  - `data.mode`が`'light'`である
  - `data.resolvedTheme`が`'light'`である

**AC-IPC-001-2: システムテーマの解決**

- **Given**: electron-storeに`theme.mode: 'system'`が保存されている、OSはダークモード
- **When**: `window.electronAPI.theme.get()`を呼び出す
- **Then**:
  - `data.mode`が`'system'`である
  - `data.resolvedTheme`が`'dark'`である

**AC-IPC-001-3: 初回起動時のデフォルト値**

- **Given**: electron-storeにテーマデータが存在しない
- **When**: `window.electronAPI.theme.get()`を呼び出す
- **Then**:
  - `data.mode`が`'system'`（デフォルト値）である
  - `data.resolvedTheme`がOSテーマに従った値である

---

### IPC-TH-002: テーマ設定保存（THEME_SET）

**チャネル名**: `theme:set`

**概要**: ユーザーが選択したテーマ設定をelectron-storeに保存する

**リクエスト型**:

```typescript
interface ThemeSetRequest {
  mode: ThemeMode; // 'light' | 'dark' | 'system'
}

type ThemeMode = "light" | "dark" | "system";
```

**レスポンス型**:

```typescript
interface ThemeSetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}
```

**処理フロー**:

```
1. Rendererが window.electronAPI.theme.set({ mode: 'dark' }) を呼び出す
2. Preloadが ipcRenderer.invoke('theme:set', request) を実行
3. Mainの themeHandlers.ts が入力検証を実行:
   3a. mode が 'light' | 'dark' | 'system' のいずれかであることを確認
   3b. 不正な値の場合はエラーレスポンスを返却
4. electron-store に 'theme.mode' を保存
5. mode に応じて resolvedTheme を計算:
   5a. 'system' の場合: nativeTheme.shouldUseDarkColors で判定
   5b. それ以外: mode をそのまま使用
6. { success: true, data: { mode, resolvedTheme } } を返却
```

**入力検証**:

```typescript
const VALID_THEME_MODES = ["light", "dark", "system"] as const;

function validateThemeMode(mode: unknown): mode is ThemeMode {
  return (
    typeof mode === "string" && VALID_THEME_MODES.includes(mode as ThemeMode)
  );
}
```

**エラーハンドリング**:

| エラー条件                 | 処理                                              |
| -------------------------- | ------------------------------------------------- |
| modeが不正な値             | `{ success: false, error: 'Invalid theme mode' }` |
| electron-store書き込み失敗 | `{ success: false, error: エラーメッセージ }`     |

**受け入れ基準**:

**AC-IPC-002-1: テーマの保存**

- **Given**: 現在のテーマが`'light'`
- **When**: `window.electronAPI.theme.set({ mode: 'dark' })`を呼び出す
- **Then**:
  - `success: true`が返却される
  - electron-storeの`theme.mode`が`'dark'`に更新される
  - 次回`theme.get()`で`'dark'`が返却される

**AC-IPC-002-2: 不正な値の拒否**

- **Given**: 任意の状態
- **When**: `window.electronAPI.theme.set({ mode: 'invalid' as any })`を呼び出す
- **Then**:
  - `success: false`が返却される
  - `error`に`'Invalid theme mode'`が含まれる
  - electron-storeの値は変更されない

**AC-IPC-002-3: システムテーマの保存と解決**

- **Given**: OSがライトモード
- **When**: `window.electronAPI.theme.set({ mode: 'system' })`を呼び出す
- **Then**:
  - `data.mode`が`'system'`である
  - `data.resolvedTheme`が`'light'`である

---

### IPC-TH-003: システムテーマ取得（THEME_GET_SYSTEM）

**チャネル名**: `theme:get-system`

**概要**: 現在のOSテーマ設定（ダーク/ライト）を取得する

**リクエスト型**:

```typescript
// リクエストパラメータなし（void）
type ThemeGetSystemRequest = void;
```

**レスポンス型**:

```typescript
interface ThemeGetSystemResponse {
  success: boolean;
  data?: {
    isDark: boolean; // nativeTheme.shouldUseDarkColors の値
    resolvedTheme: ResolvedTheme; // 'light' | 'dark'
  };
  error?: string;
}
```

**処理フロー**:

```
1. Rendererが window.electronAPI.theme.getSystem() を呼び出す
2. Preloadが ipcRenderer.invoke('theme:get-system') を実行
3. Mainの themeHandlers.ts が nativeTheme.shouldUseDarkColors を取得
4. { success: true, data: { isDark, resolvedTheme } } を返却
```

**エラーハンドリング**:

| エラー条件              | 処理                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| nativeTheme API利用不可 | `{ success: true, data: { isDark: true, resolvedTheme: 'dark' } }` |

**受け入れ基準**:

**AC-IPC-003-1: システムテーマの取得（ダークモード）**

- **Given**: OSがダークモードに設定されている
- **When**: `window.electronAPI.theme.getSystem()`を呼び出す
- **Then**:
  - `data.isDark`が`true`である
  - `data.resolvedTheme`が`'dark'`である

**AC-IPC-003-2: システムテーマの取得（ライトモード）**

- **Given**: OSがライトモードに設定されている
- **When**: `window.electronAPI.theme.getSystem()`を呼び出す
- **Then**:
  - `data.isDark`が`false`である
  - `data.resolvedTheme`が`'light'`である

---

### IPC-TH-004: システムテーマ変更通知（THEME_SYSTEM_CHANGED）

**チャネル名**: `theme:system-changed`

**優先度**: Should have

**概要**: OSのテーマ設定が変更された際にRendererに通知する

**イベントデータ型**:

```typescript
interface ThemeSystemChangedEvent {
  isDark: boolean;
  resolvedTheme: ResolvedTheme;
}
```

**処理フロー**:

```
1. Mainプロセスで nativeTheme.on('updated', callback) を登録
2. OSのテーマが変更されると 'updated' イベントが発火
3. Mainが全BrowserWindowに対して webContents.send('theme:system-changed', event) を送信
4. PreloadのsafeOnでイベントを受信
5. Rendererのコールバックが呼び出される
```

**実装パターン**（Main側）:

```typescript
import { nativeTheme, BrowserWindow } from "electron";

function setupThemeWatcher(): void {
  nativeTheme.on("updated", () => {
    const event: ThemeSystemChangedEvent = {
      isDark: nativeTheme.shouldUseDarkColors,
      resolvedTheme: nativeTheme.shouldUseDarkColors ? "dark" : "light",
    };

    // 全ウィンドウに通知
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(IPC_CHANNELS.THEME_SYSTEM_CHANGED, event);
    });
  });
}
```

**実装パターン**（Preload側）:

```typescript
theme: {
  // ... 他のメソッド
  onSystemChanged: (callback: (event: ThemeSystemChangedEvent) => void) =>
    safeOn<ThemeSystemChangedEvent>(IPC_CHANNELS.THEME_SYSTEM_CHANGED, callback),
}
```

**受け入れ基準**:

**AC-IPC-004-1: システムテーマ変更の検知**

- **Given**: アプリが起動中、OSがライトモード
- **When**: ユーザーがOSのテーマをダークモードに変更する
- **Then**:
  - `onSystemChanged`のコールバックが呼び出される
  - `event.isDark`が`true`である
  - `event.resolvedTheme`が`'dark'`である

**AC-IPC-004-2: リスナーの解除**

- **Given**: `onSystemChanged`でリスナーを登録済み
- **When**: 返却された解除関数を呼び出す
- **Then**:
  - OSテーマ変更時にコールバックが呼び出されなくなる
  - メモリリークが発生しない

---

## 4. 永続化要件

### PERSIST-TH-001: electron-storeスキーマ定義

**ストア名**: `knowledge-studio`（既存ストアを拡張）

**スキーマ拡張**:

```typescript
// 既存のStoreSchemaを拡張
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

interface ThemeSettings {
  mode: ThemeMode; // 'light' | 'dark' | 'system'
  // 将来の拡張用（カスタムカラー等）に備えたオブジェクト構造
}

type ThemeMode = "light" | "dark" | "system";
```

**ストレージキー**: `theme.mode`

**受け入れ基準**:

**AC-PERSIST-001-1: スキーマ定義の追加**

- **Given**: 既存のStoreSchemaが定義されている
- **When**: テーマスキーマを追加する
- **Then**:
  - `theme`フィールドが追加される
  - 既存フィールド（`currentView`等）に影響がない
  - TypeScript型チェックが通る

---

### PERSIST-TH-002: デフォルト値

**デフォルト設定**:

```typescript
const themeDefaults: ThemeSettings = {
  mode: "system", // OSテーマに連動
};

// getStore()のdefaultsに追加
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
        // テーマのデフォルト値を追加
        theme: {
          mode: "system",
        },
      },
    });
  }
  return store;
}
```

**受け入れ基準**:

**AC-PERSIST-002-1: 初回起動時のデフォルト値**

- **Given**: electron-storeにテーマデータが存在しない（初回起動）
- **When**: テーマ設定を読み込む
- **Then**:
  - `theme.mode`が`'system'`を返す

**AC-PERSIST-002-2: 既存ユーザーへの影響なし**

- **Given**: 既存ユーザーのelectron-storeにテーマデータがない
- **When**: アプリをアップデートして起動する
- **Then**:
  - 既存設定（`currentView`等）が維持される
  - テーマはデフォルト値`'system'`で初期化される

---

### PERSIST-TH-003: マイグレーション戦略

**現バージョン**: 1.0.0（初期実装）

**将来の拡張に備えたスキーマ設計**:

```typescript
// v1.0.0 - 初期スキーマ
interface ThemeSettingsV1 {
  mode: ThemeMode;
}

// v2.0.0 - カスタムカラー対応（将来）
interface ThemeSettingsV2 {
  mode: ThemeMode;
  customColors?: {
    primary?: string;
    background?: string;
  };
}
```

**マイグレーション実装パターン**:

```typescript
// 将来のマイグレーション例
const store = new Store<StoreSchema>({
  name: "knowledge-studio",
  defaults: {
    /* ... */
  },
  migrations: {
    "2.0.0": (store) => {
      // v1からv2へのマイグレーション
      const currentTheme = store.get("theme");
      if (currentTheme && !currentTheme.customColors) {
        store.set("theme", {
          ...currentTheme,
          customColors: undefined,
        });
      }
    },
  },
});
```

**受け入れ基準**:

**AC-PERSIST-003-1: 後方互換性の確保**

- **Given**: v1.0.0形式のテーマデータが保存されている
- **When**: 将来のバージョンでアプリを起動する
- **Then**:
  - 既存のテーマ設定が維持される
  - 新しいフィールドはデフォルト値で補完される

---

## 5. システムテーマ連動要件

### SYSTEM-TH-001: nativeTheme APIによる検出

**使用API**:

```typescript
import { nativeTheme } from "electron";

// 現在のシステムテーマを取得
const isDark: boolean = nativeTheme.shouldUseDarkColors;

// テーマソースを設定（オプション）
nativeTheme.themeSource = "system" | "light" | "dark";
```

**対応OS**:

| OS      | サポート状況 | 備考                                                 |
| ------- | ------------ | ---------------------------------------------------- |
| macOS   | 完全対応     | システム環境設定 → 外観 のダーク/ライト              |
| Windows | 完全対応     | 設定 → 個人用設定 → 色 のダーク/ライト               |
| Linux   | 部分対応     | GTK/Qt環境依存、検出できない場合はダークをデフォルト |

**受け入れ基準**:

**AC-SYSTEM-001-1: macOSでのシステムテーマ検出**

- **Given**: macOS環境、システム環境設定でダークモードを選択
- **When**: `nativeTheme.shouldUseDarkColors`を取得
- **Then**: `true`が返却される

**AC-SYSTEM-001-2: Windowsでのシステムテーマ検出**

- **Given**: Windows環境、設定でライトモードを選択
- **When**: `nativeTheme.shouldUseDarkColors`を取得
- **Then**: `false`が返却される

**AC-SYSTEM-001-3: Linuxでのフォールバック**

- **Given**: Linux環境、システムテーマ検出不可
- **When**: `nativeTheme.shouldUseDarkColors`を取得
- **Then**: デフォルト値として`true`（ダーク）が使用される

---

### SYSTEM-TH-002: システムテーマ変更の監視

**実装パターン**:

```typescript
import { nativeTheme, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";

export function setupThemeWatcher(): void {
  nativeTheme.on("updated", () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    const event = {
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

**呼び出しタイミング**: アプリ起動時（`app.whenReady()`後）

**受け入れ基準**:

**AC-SYSTEM-002-1: テーマ変更イベントの発火**

- **Given**: アプリが起動中
- **When**: OSのテーマ設定を変更する
- **Then**: `nativeTheme.on('updated')`のコールバックが呼び出される

**AC-SYSTEM-002-2: 複数ウィンドウへの通知**

- **Given**: 複数のBrowserWindowが開いている
- **When**: OSのテーマ設定を変更する
- **Then**: すべてのウィンドウにイベントが送信される

---

### SYSTEM-TH-003: Renderer通知メカニズム

**通知フロー**:

```
OSテーマ変更
    ↓
nativeTheme.on('updated')
    ↓
BrowserWindow.webContents.send('theme:system-changed', event)
    ↓
ipcRenderer.on('theme:system-changed', callback)
    ↓
Rendererのコールバック実行
    ↓
Zustand storeの更新（mode === 'system'の場合のみ）
    ↓
UIの再描画
```

**Renderer側での使用例**:

```typescript
// useTheme.ts 内での使用
useEffect(() => {
  const unsubscribe = window.electronAPI.theme.onSystemChanged((event) => {
    if (themeMode === "system") {
      // システムモードの場合のみUIを更新
      setResolvedTheme(event.resolvedTheme);
      applyTheme(event.resolvedTheme);
    }
  });

  return unsubscribe;
}, [themeMode]);
```

**受け入れ基準**:

**AC-SYSTEM-003-1: システムモード時の自動追従**

- **Given**: ユーザーが`'system'`テーマを選択、OSがライトモード
- **When**: ユーザーがOSのテーマをダークモードに変更
- **Then**:
  - Rendererのコールバックが呼び出される
  - UIがダークテーマに切り替わる
  - `theme.mode`は`'system'`のまま変わらない

**AC-SYSTEM-003-2: 固定テーマ時の変更無視**

- **Given**: ユーザーが`'dark'`テーマを選択
- **When**: ユーザーがOSのテーマをライトモードに変更
- **Then**:
  - Rendererのコールバックは呼び出される（イベント自体は発火）
  - UIはダークテーマのまま変わらない（Renderer側で無視）

---

## 6. 型定義要件

### 6.1 共通型定義

**ファイル**: `apps/desktop/src/preload/types.ts`（追加）

```typescript
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

// ===== Theme IPC Types =====

/**
 * THEME_GET リクエスト（パラメータなし）
 */
export type ThemeGetRequest = void;

/**
 * THEME_GET レスポンス
 */
export interface ThemeGetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

/**
 * THEME_SET リクエスト
 */
export interface ThemeSetRequest {
  mode: ThemeMode;
}

/**
 * THEME_SET レスポンス
 */
export interface ThemeSetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

/**
 * THEME_GET_SYSTEM リクエスト（パラメータなし）
 */
export type ThemeGetSystemRequest = void;

/**
 * THEME_GET_SYSTEM レスポンス
 */
export interface ThemeGetSystemResponse {
  success: boolean;
  data?: {
    isDark: boolean;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

/**
 * THEME_SYSTEM_CHANGED イベントデータ
 */
export interface ThemeSystemChangedEvent {
  isDark: boolean;
  resolvedTheme: ResolvedTheme;
}
```

### 6.2 ElectronAPI拡張

**ファイル**: `apps/desktop/src/preload/types.ts`（ElectronAPI拡張）

```typescript
export interface ElectronAPI {
  // 既存のAPI
  file: {
    /* ... */
  };
  store: {
    /* ... */
  };
  ai: {
    /* ... */
  };
  graph: {
    /* ... */
  };
  dashboard: {
    /* ... */
  };
  window: {
    /* ... */
  };
  app: {
    /* ... */
  };

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

---

## 7. セキュリティ要件

### 7.1 IPCホワイトリスト登録

**ファイル**: `apps/desktop/src/preload/channels.ts`

```typescript
export const IPC_CHANNELS = {
  // 既存チャネル
  // ...

  // Theme operations（新規追加）
  THEME_GET: "theme:get",
  THEME_SET: "theme:set",
  THEME_GET_SYSTEM: "theme:get-system",
  THEME_SYSTEM_CHANGED: "theme:system-changed",
} as const;

// invoke用ホワイトリスト（新規追加）
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // 既存チャネル
  // ...

  // Theme channels
  IPC_CHANNELS.THEME_GET,
  IPC_CHANNELS.THEME_SET,
  IPC_CHANNELS.THEME_GET_SYSTEM,
];

// on用ホワイトリスト（新規追加）
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // 既存チャネル
  // ...

  // Theme channels
  IPC_CHANNELS.THEME_SYSTEM_CHANGED,
];
```

### 7.2 入力検証

**ファイル**: `apps/desktop/src/main/ipc/validation.ts`（新規または追加）

```typescript
import type { ThemeMode } from "../../preload/types";

const VALID_THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * ThemeModeの入力検証
 */
export function validateThemeMode(mode: unknown): ValidationResult {
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

### 7.3 contextBridge設計

**原則**:

1. **最小権限の原則**: 必要なAPIのみを公開
2. **型安全性**: TypeScript型でAPI形状を強制
3. **エラーハンドリング**: Renderer側でのエラー処理を容易にする

**受け入れ基準**:

**AC-SEC-001: ホワイトリスト未登録チャネルの拒否**

- **Given**: `ALLOWED_INVOKE_CHANNELS`に登録されていないチャネル
- **When**: `ipcRenderer.invoke`を直接呼び出す
- **Then**: エラーがスローされる

**AC-SEC-002: 不正な入力の拒否**

- **Given**: `theme:set`に不正な値（`mode: 'invalid'`）を送信
- **When**: Main側でハンドラーが実行される
- **Then**:
  - `{ success: false, error: '...' }`が返却される
  - electron-storeは変更されない

---

## 8. エラーハンドリング要件

### 8.1 エラー分類

| エラーカテゴリ           | 例                    | 対処方針                                 |
| ------------------------ | --------------------- | ---------------------------------------- |
| 入力検証エラー           | 不正なThemeMode値     | エラーレスポンスを返却、ログ出力         |
| ストレージ読み込みエラー | electron-store破損    | デフォルト値にフォールバック             |
| ストレージ書き込みエラー | ディスク容量不足      | エラーレスポンスを返却、UIは既に更新済み |
| API利用不可エラー        | nativeTheme未対応環境 | ダークモードをデフォルトとして使用       |

### 8.2 エラーレスポンス形式

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string; // 将来の拡張用
}
```

### 8.3 詳細エラーハンドリング

**electron-store読み込みエラー**:

```typescript
async function handleThemeGet(): Promise<ThemeGetResponse> {
  try {
    const mode = getStore().get("theme.mode", "system") as ThemeMode;
    const resolvedTheme = resolveTheme(mode);
    return { success: true, data: { mode, resolvedTheme } };
  } catch (error) {
    console.error("[Theme] Failed to read theme from store:", error);
    // フォールバック: デフォルト値を返却
    return {
      success: true,
      data: { mode: "system", resolvedTheme: getSystemTheme() },
    };
  }
}
```

**electron-store書き込みエラー**:

```typescript
async function handleThemeSet(
  request: ThemeSetRequest,
): Promise<ThemeSetResponse> {
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
    console.error("[Theme] Failed to write theme to store:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save theme",
    };
  }
}
```

**nativeTheme API利用不可時のフォールバック**:

```typescript
function getSystemTheme(): ResolvedTheme {
  try {
    return nativeTheme.shouldUseDarkColors ? "dark" : "light";
  } catch (error) {
    console.warn("[Theme] nativeTheme API not available, defaulting to dark");
    return "dark"; // フォールバック
  }
}
```

**受け入れ基準**:

**AC-ERR-001: ストレージ破損時のフォールバック**

- **Given**: electron-storeのデータが破損している
- **When**: `theme:get`を呼び出す
- **Then**:
  - `success: true`が返却される
  - デフォルト値（`mode: 'system'`）が使用される
  - エラーがコンソールに出力される

**AC-ERR-002: 書き込みエラー時のUI影響なし**

- **Given**: ディスク書き込みが失敗する状況
- **When**: `theme:set`を呼び出す
- **Then**:
  - `success: false`とエラーメッセージが返却される
  - UIは既に更新されているため、ユーザー体験への影響は最小限
  - 次回起動時は以前の設定が復元される

---

## 9. ユースケース

### UC-BE-TH-001: 保存されたテーマを読み込む

**ID**: UC-BE-TH-001
**アクター**: Rendererプロセス（useThemeフック）
**ゴール**: 永続化されたテーマ設定を取得する

**事前条件**:

- アプリケーションが起動済み
- electron-storeが利用可能

**基本フロー**（正常系）:

1. Rendererが`window.electronAPI.theme.get()`を呼び出す
2. Preloadが`ipcRenderer.invoke('theme:get')`を実行
3. Mainのthemeハンドラーがelectron-storeから`theme.mode`を読み込む
4. `mode`が`'system'`の場合、`nativeTheme.shouldUseDarkColors`で解決
5. `{ success: true, data: { mode, resolvedTheme } }`を返却
6. Rendererが受け取ったデータでZustand storeを初期化

**代替フロー**:

- 3a. テーマデータが存在しない場合:
  - 3a-1. デフォルト値`{ mode: 'system' }`を使用
  - 基本フロー4へ続く

**例外フロー**:

- E1. electron-store読み込みエラー:
  - E1-1. エラーをコンソールに出力
  - E1-2. デフォルト値を返却
  - E1-3. Rendererは正常に動作を継続

**事後条件**:

- Rendererがテーマ設定を受け取っている
- Zustand storeが初期化されている

**関連要件**: IPC-TH-001, PERSIST-TH-001

---

### UC-BE-TH-002: テーマ設定を保存する

**ID**: UC-BE-TH-002
**アクター**: Rendererプロセス（ThemeSelectorコンポーネント）
**ゴール**: ユーザー選択のテーマを永続化する

**事前条件**:

- ユーザーがテーマを選択
- electron-storeが書き込み可能

**基本フロー**（正常系）:

1. ユーザーがThemeSelectorでテーマを選択
2. Rendererが`window.electronAPI.theme.set({ mode: 'dark' })`を呼び出す
3. Preloadが`ipcRenderer.invoke('theme:set', request)`を実行
4. Mainのthemeハンドラーが入力を検証（`'light'`/`'dark'`/`'system'`）
5. electron-storeに`theme.mode`を保存
6. `resolvedTheme`を計算して返却
7. Rendererが成功を確認

**例外フロー**:

- E1. 入力検証エラー:
  - E1-1. `{ success: false, error: 'Invalid theme mode' }`を返却
  - E1-2. electron-storeは変更されない
- E2. 書き込みエラー:
  - E2-1. エラーをコンソールに出力
  - E2-2. `{ success: false, error: 'Failed to save theme' }`を返却
  - E2-3. UIは既に更新済みのため、ユーザー体験への影響は限定的

**事後条件**:

- テーマ設定がelectron-storeに保存されている
- 次回起動時に復元可能

**関連要件**: IPC-TH-002, PERSIST-TH-001

---

### UC-BE-TH-003: システムテーマを検出する

**ID**: UC-BE-TH-003
**アクター**: Rendererプロセス
**ゴール**: 現在のOSテーマ設定を取得する

**事前条件**:

- アプリケーションが起動済み
- nativeTheme APIが利用可能

**基本フロー**（正常系）:

1. Rendererが`window.electronAPI.theme.getSystem()`を呼び出す
2. Mainのthemeハンドラーが`nativeTheme.shouldUseDarkColors`を取得
3. `{ success: true, data: { isDark, resolvedTheme } }`を返却

**例外フロー**:

- E1. nativeTheme API利用不可:
  - E1-1. デフォルト値`{ isDark: true, resolvedTheme: 'dark' }`を返却

**事後条件**:

- Rendererがシステムテーマ情報を受け取っている

**関連要件**: IPC-TH-003, SYSTEM-TH-001

---

### UC-BE-TH-004: システムテーマ変更を検知する

**ID**: UC-BE-TH-004
**アクター**: OS、Mainプロセス、Rendererプロセス
**ゴール**: OSテーマ変更をリアルタイムでRendererに通知する

**事前条件**:

- アプリケーションが起動済み
- `nativeTheme.on('updated')`が登録済み
- Rendererが`onSystemChanged`リスナーを登録済み

**基本フロー**（正常系）:

1. ユーザーがOSのテーマ設定を変更
2. OSが`nativeTheme`の`'updated'`イベントを発火
3. Mainのイベントハンドラーが呼び出される
4. 全BrowserWindowに`theme:system-changed`イベントを送信
5. Preloadのリスナーがイベントを受信
6. Rendererのコールバックが呼び出される
7. `mode === 'system'`の場合、UIが更新される

**代替フロー**:

- 7a. `mode !== 'system'`の場合:
  - 7a-1. イベントは受信するが、UIは更新しない

**事後条件**:

- システムモード選択時: UIがOSテーマに追従
- 固定テーマ選択時: UIは変更されない

**関連要件**: IPC-TH-004, SYSTEM-TH-002, SYSTEM-TH-003

---

## 10. 既存実装との整合性

### 10.1 storeHandlers.tsパターンへの準拠

**既存パターン**（`storeHandlers.ts`）:

```typescript
// 1. 遅延初期化されたストアインスタンス
let store: Store<StoreSchema> | null = null;

function getStore(): Store<StoreSchema> {
  if (!store) {
    store = new Store<StoreSchema>({
      /* ... */
    });
  }
  return store;
}

// 2. ハンドラー登録関数
export function registerStoreHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.STORE_GET, async (_event, request) => {
    // 入力検証 → 処理 → レスポンス
  });
}
```

**テーマハンドラーの実装方針**:

```typescript
// apps/desktop/src/main/ipc/themeHandlers.ts

import { ipcMain, nativeTheme, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { getStore } from "./storeHandlers"; // 既存のストアを再利用
import { validateThemeMode } from "./validation";
import type {
  ThemeGetResponse,
  ThemeSetRequest,
  ThemeSetResponse,
  ThemeGetSystemResponse,
  ThemeMode,
  ResolvedTheme,
} from "../../preload/types";

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") {
    return nativeTheme.shouldUseDarkColors ? "dark" : "light";
  }
  return mode;
}

export function registerThemeHandlers(): void {
  // THEME_GET
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

  // THEME_SET
  ipcMain.handle(
    IPC_CHANNELS.THEME_SET,
    async (_event, request: ThemeSetRequest): Promise<ThemeSetResponse> => {
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
          error:
            error instanceof Error ? error.message : "Failed to save theme",
        };
      }
    },
  );

  // THEME_GET_SYSTEM
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
        return {
          success: true,
          data: { isDark: true, resolvedTheme: "dark" },
        };
      }
    },
  );
}

export function setupThemeWatcher(): void {
  nativeTheme.on("updated", () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    const event = {
      isDark,
      resolvedTheme: (isDark ? "dark" : "light") as ResolvedTheme,
    };

    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.THEME_SYSTEM_CHANGED, event);
      }
    });
  });
}
```

### 10.2 channels.tsへのチャネル追加方式

**追加位置**:

```typescript
export const IPC_CHANNELS = {
  // ... 既存チャネル ...

  // Theme operations（新規追加セクション）
  THEME_GET: "theme:get",
  THEME_SET: "theme:set",
  THEME_GET_SYSTEM: "theme:get-system",
  THEME_SYSTEM_CHANGED: "theme:system-changed",
} as const;
```

### 10.3 types.tsへの型定義追加方式

**追加位置**: ファイル末尾、既存の型定義の後

```typescript
// ===== Theme Types =====
// （セクション6.1の型定義をここに追加）
```

### 10.4 preload/index.tsのAPI公開パターン

**追加位置**:

```typescript
const electronAPI: ElectronAPI = {
  // 既存API
  file: {
    /* ... */
  },
  store: {
    /* ... */
  },
  // ...

  // 新規追加: Theme API
  theme: {
    get: () => safeInvoke(IPC_CHANNELS.THEME_GET),
    set: (request: ThemeSetRequest) =>
      safeInvoke(IPC_CHANNELS.THEME_SET, request),
    getSystem: () => safeInvoke(IPC_CHANNELS.THEME_GET_SYSTEM),
    onSystemChanged: (callback: (event: ThemeSystemChangedEvent) => void) =>
      safeOn<ThemeSystemChangedEvent>(
        IPC_CHANNELS.THEME_SYSTEM_CHANGED,
        callback,
      ),
  },
};
```

---

## 11. 完了条件チェックリスト

T-00-2の完了条件に基づく:

- [x] IPCチャネル定義が完了している
  - `THEME_GET`, `THEME_SET`, `THEME_GET_SYSTEM`, `THEME_SYSTEM_CHANGED`を定義
  - リクエスト/レスポンス型を明確化
  - 処理フローとエラーハンドリングを記述

- [x] electron-storeスキーマが定義されている
  - `theme.mode`フィールドを追加
  - デフォルト値`'system'`を設定
  - 将来の拡張に備えたスキーマ設計

- [x] システムテーマ検出の仕組みが明確になっている
  - `nativeTheme.shouldUseDarkColors`による検出
  - `nativeTheme.on('updated')`による変更監視
  - Renderer通知メカニズム（`webContents.send`）

- [x] エラーハンドリング要件が定義されている
  - 入力検証エラー
  - ストレージ読み書きエラー
  - nativeTheme API利用不可時のフォールバック

---

## 12. 関連ドキュメント

| ドキュメント               | パス                                                    | 関係                |
| -------------------------- | ------------------------------------------------------- | ------------------- |
| テーマ機能タスク実行仕様書 | `docs/30-workflows/theme-feature/task-theme-feature.md` | 親ドキュメント      |
| フロントエンド要件定義書   | `docs/30-workflows/theme-feature/spec-frontend.md`      | 関連（UI/状態管理） |
| 既存IPC実装                | `apps/desktop/src/main/ipc/storeHandlers.ts`            | 実装パターン参照    |
| IPCチャネル定義            | `apps/desktop/src/preload/channels.ts`                  | 拡張対象            |
| IPC型定義                  | `apps/desktop/src/preload/types.ts`                     | 拡張対象            |
| API公開                    | `apps/desktop/src/preload/index.ts`                     | 拡張対象            |
| Electron nativeTheme API   | https://www.electronjs.org/docs/latest/api/native-theme | 外部リファレンス    |

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容 |
| ---------- | ---------- | ------------ | -------- |
| 1.0.0      | 2024-12-08 | .claude/agents/req-analyst.md | 初版作成 |
