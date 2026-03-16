import { app, Menu } from "electron";

/**
 * macOS 向けメニューテンプレート（Apple HIG 準拠）
 * アプリ名 / 編集 / 表示 / ウィンドウ の 4 メニューを定義する
 */
export function buildMacTemplate(): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "編集",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "表示",
      submenu: [
        { role: "zoomIn" },
        { role: "zoomOut" },
        { role: "resetZoom" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "ウィンドウ",
      submenu: [
        { role: "minimize" },
        { role: "close" },
        { type: "separator" },
        { role: "front" },
      ],
    },
  ];
}

/**
 * Windows / Linux 向けメニューテンプレート（最小構成）
 * 「表示」メニューのみを提供する
 */
export function buildDefaultTemplate(): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "表示",
      submenu: [
        { role: "zoomIn" },
        { role: "zoomOut" },
        { role: "resetZoom" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];
}

/**
 * アプリケーションメニューを作成して設定する
 * macOS では Apple HIG 準拠の 4 メニュー、Windows/Linux では表示メニューのみ
 */
export function createApplicationMenu(): void {
  const template =
    process.platform === "darwin" ? buildMacTemplate() : buildDefaultTemplate();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
