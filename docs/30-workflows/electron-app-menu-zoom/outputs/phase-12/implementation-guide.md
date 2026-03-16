# implementation-guide

## Part 1: 中学生向けの説明（たとえ話）

アプリのメニューは、お店の「注文表」に近い役割です。

- 注文表がないと、店員さんに「これを出して」と伝えるルートがありません。
- Electron アプリでも同じで、メニューに項目がないとショートカットの処理先が見つかりにくくなります。
- 今回は Main Process で `Menu.setApplicationMenu(...)` を呼び、メニューを登録する土台を追加しました。

これにより、今後 `zoomIn` / `zoomOut` / `resetZoom` などを template に追加したとき、OS 側の標準ショートカットと結びつけやすくなります。

## Part 2: 開発者向け実装詳細

対象ファイル: `apps/desktop/src/main/index.ts`

### 変更点

1. `electron` import に `Menu` を追加

```ts
import { app, BrowserWindow, Menu, shell, session } from "electron";
```

2. `app.whenReady()` 内でアプリケーションメニューを設定

```ts
const template: Electron.MenuItemConstructorOptions[] = [];
Menu.setApplicationMenu(Menu.buildFromTemplate(template));
```

### 意図

- Main Process 側でメニュー初期化の呼び出しポイントを確定する。
- 後続で menu template を段階的に拡張できる構成を先に作る。

### 現状の制約

- `template` は空配列のため、ズーム系 role はまだ未追加。

### セキュリティ影響

- `BrowserWindow` の `contextIsolation`, `nodeIntegration`, `sandbox` には変更なし。
- `Menu` 追加は Main Process 側のみで IPC 契約への変更なし。
