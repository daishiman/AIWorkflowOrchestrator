# Phase 2: 設計 - 結果サマリー

## タスク情報

- タスクID: TASK-FIX-ELECTRON-APP-MENU-ZOOM-001
- 実行日: 2026-03-16

## 結果

### 採用 role 一覧

FR-1 から FR-3 を実現するために選定した Electron Menu role:

| role               | 動作                                   | accelerator（macOS） | accelerator（Win/Linux） |
| ------------------ | -------------------------------------- | -------------------- | ------------------------ |
| `zoomIn`           | webContents.zoomLevel を +0.5          | `Cmd+=` / `Cmd++`    | `Ctrl+=` / `Ctrl++`      |
| `zoomOut`          | webContents.zoomLevel を -0.5          | `Cmd+-`              | `Ctrl+-`                 |
| `resetZoom`        | zoomLevel を 0 にリセット（100% 相当） | `Cmd+0`              | `Ctrl+0`                 |
| `togglefullscreen` | フルスクリーン切替                     | `Ctrl+Cmd+F`         | `F11`                    |

### メニュー構造設計

**macOS（`buildMacTemplate()`）** - 4メニュー構成:

| メニュー名   | role セット                                     | FR 対応        |
| ------------ | ----------------------------------------------- | -------------- |
| アプリ名     | about / hide / hideOthers / unhide / quit       | Apple HIG 準拠 |
| 編集（Edit） | undo / redo / cut / copy / paste / selectAll    | -              |
| 表示（View） | zoomIn / zoomOut / resetZoom / togglefullscreen | FR-1/2/3       |
| ウィンドウ   | minimize / close / front                        | Apple HIG 準拠 |

**Windows / Linux（`buildDefaultTemplate()`）** - 1メニュー構成:

| メニュー名   | role セット                                     | FR 対応  |
| ------------ | ----------------------------------------------- | -------- |
| 表示（View） | zoomIn / zoomOut / resetZoom / togglefullscreen | FR-1/2/3 |

### コード配置判断

menu.ts を index.ts から分離した設計を採用。3関数構成:

- `buildMacTemplate()`: macOS 向けメニューテンプレート構築
- `buildDefaultTemplate()`: Windows/Linux 向けメニューテンプレート構築
- `createApplicationMenu()`: プラットフォーム判定 + Menu 設定

### プラットフォーム分岐ロジック

`const isMac = process.platform === "darwin"` の単一フラグで判定。`createWindow()` の前に `createApplicationMenu()` を配置する設計。

### セキュリティ影響分析

| 影響項目                                 | 影響の有無 | 理由                                                                  |
| ---------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `contextIsolation: true`                 | 影響なし   | `Menu` は Main Process の API。`webPreferences` とは独立              |
| `nodeIntegration: false`                 | 影響なし   | `nodeIntegration` は Renderer Process の設定。メニュー定義と無関係    |
| `sandbox: true`                          | 影響なし   | Chromium サンドボックスは Renderer Process に適用される設定           |
| CSP（Content Security Policy）           | 影響なし   | `Menu.buildFromTemplate()` は HTTP ヘッダーや script-src に影響しない |
| IPC ハンドラ（`registerAllIpcHandlers`） | 影響なし   | role は Electron 内部の webContents を直接呼び出す。IPC 経由ではない  |
| XSS リスク                               | 影響なし   | メニューラベルはハードコード文字列（ユーザー入力なし）                |
| `webSecurity: true`                      | 影響なし   | Same-Origin ポリシーはネットワークリクエストに関する設定              |

全項目「影響なし」。既存のセキュリティ設定に変更は一切不要。

## 判定

PASS
