# Phase 12: 実装ガイド — TASK-FIX-ELECTRON-APP-MENU-ZOOM-001

## タスク情報

- タスクID: TASK-FIX-ELECTRON-APP-MENU-ZOOM-001
- 実行日: 2026-03-16
- 対象機能: Electron アプリケーションメニュー初期化（ズームショートカット対応）

---

## Part 1: 概念説明（中学生向け）

### メニューは「レストランのメニュー表」

レストランに入ったとき、メニュー表がないとお客さんは「何を注文できるか」分かりません。店員さんに聞けばハンバーグを出してくれるかもしれませんが、それを知っている常連さんだけが注文できる状態です。

Electron アプリも同じです。`Menu.buildFromTemplate()` に空の配列（`[]`）を渡していたため、アプリに「メニュー表」がありませんでした。だから `Cmd+-` を押しても「ズームアウト注文」を受け付ける窓口がなく、何も起きませんでした。

今回の修正では、アプリにメニュー表（`createApplicationMenu()`）を追加しました。これにより:

1. **OS がキーボードショートカットを受け取る** → メニュー表を見る → 対応する項目（`role: "zoomOut"` など）を見つけて処理する
2. **メニューバーをクリック** → 「表示」メニューから「縮小」を選べる

macOS には「アプリ名メニュー」「編集」「表示」「ウィンドウ」の 4 つのメニューがあります（Apple の決めたルール＝HIG）。Windows/Linux には「表示」メニューだけを用意しました。お店ごとに異なるメニュー表を用意するようなものです。

### なぜ「role」だけで動くの？

Electron の `role` は「この項目は OS が元々知っている機能だよ」という宣言です。たとえば `role: "zoomIn"` と書くだけで:

- macOS: 自動的に `Cmd+=` が割り当てられ、メニューに「拡大」と日本語で表示される
- Windows/Linux: 自動的に `Ctrl+=` が割り当てられる

自分でキーボードショートカットを設定したり、ズーム処理のコードを書く必要はありません。OS に「お任せ」するだけです。

---

## Part 2: 開発者向け実装詳細

### 変更ファイル

| ファイル                                       | 変更種別 | 行数                                       |
| ---------------------------------------------- | -------- | ------------------------------------------ |
| `apps/desktop/src/main/menu.ts`                | 新規作成 | 83行                                       |
| `apps/desktop/src/main/index.ts`               | 修正     | import追加 + createApplicationMenu()呼出し |
| `apps/desktop/src/main/__tests__/menu.test.ts` | 新規作成 | 253行（20テスト）                          |

### menu.ts の構造

```typescript
import { app, Menu } from "electron";

// macOS 用（Apple HIG 準拠、4メニュー）
export function buildMacTemplate(): Electron.MenuItemConstructorOptions[];

// Windows/Linux 用（最小構成、表示メニューのみ）
export function buildDefaultTemplate(): Electron.MenuItemConstructorOptions[];

// platform分岐してメニューを設定
export function createApplicationMenu(): void;
```

#### buildMacTemplate() — macOS 用

| メニュー                  | 項目                                         |
| ------------------------- | -------------------------------------------- |
| アプリ名（app.getName()） | about, hide, hideOthers, unhide, quit        |
| 編集                      | undo, redo, cut, copy, paste, selectAll      |
| 表示                      | zoomIn, zoomOut, resetZoom, togglefullscreen |
| ウィンドウ                | minimize, close, front                       |

#### buildDefaultTemplate() — Windows/Linux 用

| メニュー | 項目                                         |
| -------- | -------------------------------------------- |
| 表示     | zoomIn, zoomOut, resetZoom, togglefullscreen |

#### createApplicationMenu()

```typescript
export function createApplicationMenu(): void {
  const template =
    process.platform === "darwin" ? buildMacTemplate() : buildDefaultTemplate();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
```

### index.ts の変更

```typescript
// 追加: menu.ts からインポート
import { createApplicationMenu } from "./menu";

// app.whenReady() 内、createWindow() の前に呼出し
createApplicationMenu();
```

### 設計判断

1. **menu.ts に分離した理由**: index.ts は認証・IPC・プロトコル設定等で293行あり、テスト時にトップレベル副作用（`setupCustomProtocol` 等）が実行される。menu.ts を独立させてテスト容易性を確保（SRP準拠）。

2. **role ベースのみを使用した理由**: Electron の `role` は OS のネイティブ処理に委譲するため、IPC や Renderer のコードが不要。カスタム `click` ハンドラも不要で、実装コストが最小。

3. **セキュリティへの影響なし**: `Menu` は Main Process の API であり、`BrowserWindow.webPreferences`（`contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`）とは独立。CSPヘッダーにも影響なし。

4. **createWindow() の前に実行する理由**: `Menu.setApplicationMenu()` はウィンドウ表示前に呼ぶことで、メニューバーが最初のフレームから正しく表示される。

### テスト戦略

- **モック**: `vi.mock("electron")` で Menu と app をモック化
- **platform 分岐**: `vi.spyOn(process, "platform", "get").mockReturnValue("darwin" | "win32" | "linux")`
- **検証方法**: `Menu.buildFromTemplate` のモック呼出し引数を検査してメニュー構造を検証
- **テストケース**: TC-1〜TC-20（20件全PASS）

### カバレッジ

| 指標      | 結果 | 基準 |
| --------- | ---- | ---- |
| Line      | 100% | 80%  |
| Branch    | 100% | 60%  |
| Function  | 100% | 80%  |
| Statement | 100% | -    |

### セキュリティ影響

| 設定項目           | 影響 | 根拠                                                                |
| ------------------ | ---- | ------------------------------------------------------------------- |
| `contextIsolation` | なし | Menu API は Main Process 内で完結し、Renderer に影響しない          |
| `nodeIntegration`  | なし | Menu の role は Electron 内部の webContents メソッドを直接呼び出す  |
| `sandbox`          | なし | Menu 操作は Chromium サンドボックス外の Main Process で処理される   |
| `CSP`              | なし | Menu.buildFromTemplate() は HTTP ヘッダーや script-src に影響しない |
