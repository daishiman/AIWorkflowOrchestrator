# ネイティブUI要素

## ダイアログ

### ファイルダイアログ

```typescript
import { dialog, BrowserWindow } from "electron";

// ファイルを開く
async function openFile(win: BrowserWindow): Promise<string[] | null> {
  const result = await dialog.showOpenDialog(win, {
    title: "ファイルを選択",
    defaultPath: app.getPath("documents"),
    buttonLabel: "開く",
    filters: [
      { name: "テキストファイル", extensions: ["txt", "md"] },
      { name: "すべてのファイル", extensions: ["*"] },
    ],
    properties: ["openFile", "multiSelections", "showHiddenFiles"],
  });

  return result.canceled ? null : result.filePaths;
}

// ファイルを保存
async function saveFile(
  win: BrowserWindow,
  defaultName: string,
): Promise<string | null> {
  const result = await dialog.showSaveDialog(win, {
    title: "ファイルを保存",
    defaultPath: path.join(app.getPath("documents"), defaultName),
    filters: [{ name: "テキストファイル", extensions: ["txt"] }],
  });

  return result.canceled ? null : result.filePath!;
}

// フォルダを選択
async function selectFolder(win: BrowserWindow): Promise<string | null> {
  const result = await dialog.showOpenDialog(win, {
    title: "フォルダを選択",
    properties: ["openDirectory", "createDirectory"],
  });

  return result.canceled ? null : result.filePaths[0];
}
```

### メッセージダイアログ

```typescript
// 確認ダイアログ
async function confirm(
  win: BrowserWindow,
  message: string,
  detail?: string,
): Promise<boolean> {
  const result = await dialog.showMessageBox(win, {
    type: "question",
    buttons: ["キャンセル", "OK"],
    defaultId: 1,
    cancelId: 0,
    title: "確認",
    message,
    detail,
  });

  return result.response === 1;
}

// 警告ダイアログ
async function warn(win: BrowserWindow, message: string): Promise<void> {
  await dialog.showMessageBox(win, {
    type: "warning",
    buttons: ["OK"],
    title: "警告",
    message,
  });
}

// エラーダイアログ
function showError(title: string, content: string): void {
  dialog.showErrorBox(title, content);
}
```

## メニュー

### アプリケーションメニュー（完全版）

```typescript
import { Menu, app, shell, BrowserWindow } from "electron";

function createMenu(win: BrowserWindow): Menu {
  const isMac = process.platform === "darwin";

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOSアプリメニュー
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const, label: `${app.name}について` },
              { type: "separator" as const },
              {
                label: "環境設定...",
                accelerator: "Cmd+,",
                click: () => win.webContents.send("menu:preferences"),
              },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const, label: `${app.name}を隠す` },
              { role: "hideOthers" as const, label: "他を隠す" },
              { role: "unhide" as const, label: "すべて表示" },
              { type: "separator" as const },
              { role: "quit" as const, label: `${app.name}を終了` },
            ],
          },
        ]
      : []),

    // ファイルメニュー
    {
      label: "ファイル",
      submenu: [
        {
          label: "新規作成",
          accelerator: "CmdOrCtrl+N",
          click: () => win.webContents.send("menu:new"),
        },
        {
          label: "開く...",
          accelerator: "CmdOrCtrl+O",
          click: () => win.webContents.send("menu:open"),
        },
        { type: "separator" },
        {
          label: "保存",
          accelerator: "CmdOrCtrl+S",
          click: () => win.webContents.send("menu:save"),
        },
        {
          label: "名前を付けて保存...",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => win.webContents.send("menu:saveAs"),
        },
        { type: "separator" },
        isMac
          ? { role: "close", label: "ウィンドウを閉じる" }
          : { role: "quit", label: "終了" },
      ],
    },

    // 編集メニュー
    {
      label: "編集",
      submenu: [
        { role: "undo", label: "元に戻す" },
        { role: "redo", label: "やり直す" },
        { type: "separator" },
        { role: "cut", label: "切り取り" },
        { role: "copy", label: "コピー" },
        { role: "paste", label: "貼り付け" },
        ...(isMac
          ? [
              {
                role: "pasteAndMatchStyle" as const,
                label: "ペーストしてスタイルを合わせる",
              },
              { role: "delete" as const, label: "削除" },
              { role: "selectAll" as const, label: "すべて選択" },
              { type: "separator" as const },
              {
                label: "スピーチ",
                submenu: [
                  { role: "startSpeaking" as const, label: "読み上げを開始" },
                  { role: "stopSpeaking" as const, label: "読み上げを停止" },
                ],
              },
            ]
          : [
              { role: "delete" as const, label: "削除" },
              { type: "separator" as const },
              { role: "selectAll" as const, label: "すべて選択" },
            ]),
      ],
    },

    // 表示メニュー
    {
      label: "表示",
      submenu: [
        { role: "reload", label: "再読み込み" },
        { role: "forceReload", label: "強制再読み込み" },
        { role: "toggleDevTools", label: "開発者ツール" },
        { type: "separator" },
        { role: "resetZoom", label: "実際のサイズ" },
        { role: "zoomIn", label: "拡大" },
        { role: "zoomOut", label: "縮小" },
        { type: "separator" },
        { role: "togglefullscreen", label: "フルスクリーン" },
      ],
    },

    // ウィンドウメニュー
    {
      label: "ウィンドウ",
      submenu: [
        { role: "minimize", label: "最小化" },
        { role: "zoom", label: "拡大/縮小" },
        ...(isMac
          ? [
              { type: "separator" as const },
              { role: "front" as const, label: "すべてを前面に" },
            ]
          : [{ role: "close" as const, label: "閉じる" }]),
      ],
    },

    // ヘルプメニュー
    {
      label: "ヘルプ",
      submenu: [
        {
          label: "ドキュメント",
          click: () => shell.openExternal("https://docs.example.com"),
        },
        {
          label: "問題を報告",
          click: () =>
            shell.openExternal("https://github.com/user/repo/issues"),
        },
        { type: "separator" },
        ...(isMac ? [] : [{ role: "about" as const, label: "バージョン情報" }]),
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
```

## 通知

```typescript
import { Notification, nativeImage } from "electron";

// 基本的な通知
function showNotification(title: string, body: string): void {
  const notification = new Notification({
    title,
    body,
    silent: false,
  });

  notification.show();
}

// アクション付き通知
function showActionNotification(
  title: string,
  body: string,
  onClick: () => void,
): void {
  const notification = new Notification({
    title,
    body,
    actions: [{ type: "button", text: "詳細を見る" }],
  });

  notification.on("click", onClick);
  notification.on("action", (event, index) => {
    if (index === 0) onClick();
  });

  notification.show();
}

// 進捗通知（macOS）
function showProgressNotification(title: string, progress: number): void {
  const notification = new Notification({
    title,
    body: `${Math.round(progress * 100)}% 完了`,
  });

  notification.show();
}
```

## システムトレイ

```typescript
import { Tray, Menu, nativeImage, app } from "electron";

function createTray(showWindow: () => void): Tray {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "tray-icon.png"),
  );

  // macOSではテンプレート画像を使用
  if (process.platform === "darwin") {
    icon.setTemplateImage(true);
  }

  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "ウィンドウを表示", click: showWindow },
    { type: "separator" },
    {
      label: "設定",
      click: () => {
        /* 設定画面を開く */
      },
    },
    { type: "separator" },
    { label: "終了", click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("My App");

  // ダブルクリックでウィンドウ表示
  tray.on("double-click", showWindow);

  return tray;
}
```
