/**
 * フレームレスウィンドウテンプレート
 *
 * カスタムタイトルバーを持つフレームレスウィンドウの実装例
 */

import { BrowserWindow, ipcMain } from 'electron';
import path from 'path';

export function createFramelessWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,

    // フレームレス設定
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,

    // macOS: トラフィックライトの位置調整
    trafficLightPosition: { x: 15, y: 15 },

    // 透明背景（オプション）
    transparent: false,
    backgroundColor: '#ffffff',

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // ウィンドウ操作のIPCハンドラー
  setupWindowControls(win);

  return win;
}

function setupWindowControls(win: BrowserWindow): void {
  ipcMain.handle('window:minimize', () => {
    win.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    win.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return win.isMaximized();
  });

  // 最大化状態の変更を通知
  win.on('maximize', () => {
    win.webContents.send('window:maximized', true);
  });

  win.on('unmaximize', () => {
    win.webContents.send('window:maximized', false);
  });
}

// =====================================
// Preload API (preload.ts に追加)
// =====================================

/*
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_: any, isMaximized: boolean) => callback(isMaximized);
    ipcRenderer.on('window:maximized', handler);
    return () => ipcRenderer.removeListener('window:maximized', handler);
  },
});
*/

// =====================================
// React TitleBar Component
// =====================================

/*
// components/TitleBar.tsx
import { useEffect, useState } from 'react';
import './TitleBar.css';

export function TitleBar({ title }: { title: string }) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // 初期状態を取得
    window.windowControls.isMaximized().then(setIsMaximized);

    // 変更を監視
    const cleanup = window.windowControls.onMaximizedChange(setIsMaximized);
    return cleanup;
  }, []);

  return (
    <div className="titlebar">
      <div className="titlebar-drag-region">
        <span className="title">{title}</span>
      </div>

      <div className="titlebar-controls">
        <button
          className="titlebar-button"
          onClick={() => window.windowControls.minimize()}
          aria-label="最小化"
        >
          <svg viewBox="0 0 10 1">
            <path d="M0 0h10v1H0z" />
          </svg>
        </button>

        <button
          className="titlebar-button"
          onClick={() => window.windowControls.maximize()}
          aria-label={isMaximized ? '元に戻す' : '最大化'}
        >
          {isMaximized ? (
            <svg viewBox="0 0 10 10">
              <path d="M2 0v2H0v8h8V8h2V0H2zm1 9H1V3h2v5h4V3H4v6H3V3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 10 10">
              <path d="M0 0v10h10V0H0zm1 1h8v8H1V1z" />
            </svg>
          )}
        </button>

        <button
          className="titlebar-button close"
          onClick={() => window.windowControls.close()}
          aria-label="閉じる"
        >
          <svg viewBox="0 0 10 10">
            <path d="M1 0L0 1l4 4-4 4 1 1 4-4 4 4 1-1-4-4 4-4-1-1-4 4-4-4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
*/

// =====================================
// TitleBar CSS
// =====================================

/*
// components/TitleBar.css
.titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  background: var(--titlebar-bg, #f0f0f0);
  user-select: none;
}

.titlebar-drag-region {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 12px;
  -webkit-app-region: drag;
}

.title {
  font-size: 12px;
  color: var(--titlebar-text, #333);
}

.titlebar-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.titlebar-button {
  width: 46px;
  height: 32px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.titlebar-button svg {
  width: 10px;
  height: 10px;
  fill: var(--titlebar-icon, #333);
}

.titlebar-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.titlebar-button.close:hover {
  background: #e81123;
}

.titlebar-button.close:hover svg {
  fill: white;
}

@media (prefers-color-scheme: dark) {
  .titlebar {
    --titlebar-bg: #2d2d2d;
    --titlebar-text: #fff;
    --titlebar-icon: #fff;
  }
}
*/
