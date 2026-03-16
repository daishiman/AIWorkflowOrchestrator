# Phase 1: 要件定義 - 結果サマリー

## タスク情報

- タスクID: TASK-FIX-ELECTRON-APP-MENU-ZOOM-001
- 実行日: 2026-03-16

## 結果

### 現状確認

- `apps/desktop/src/main/index.ts` L1: `Menu` は既に import 済み
- L269-272: 空の template で `Menu.setApplicationMenu` が呼ばれている（TODO(human) プレースホルダー）
- L56: `autoHideMenuBar: true` 設定済み
- L266: `optimizer.watchWindowShortcuts(window)` は F12 DevTools のみ対応

### 根本原因

`Menu.buildFromTemplate()` に空の配列が渡されているため、role ベースのメニュー項目（`zoomIn`, `zoomOut`, `resetZoom`）が登録されていない。macOS ではこれらの role がメニューに定義されていない限り、対応するキーボードショートカットは処理されない。

### 機能要件 (FR-1 から FR-7)

| ID   | 要件                                                     | 優先度 |
| ---- | -------------------------------------------------------- | ------ |
| FR-1 | Cmd++/Ctrl++ でズームインできること                      | 必須   |
| FR-2 | Cmd+-/Ctrl+- でズームアウトできること                    | 必須   |
| FR-3 | Cmd+0/Ctrl+0 でズームレベルを 100% にリセットできること  | 必須   |
| FR-4 | macOS 向け Apple HIG 準拠の標準メニューを提供すること    | 必須   |
| FR-5 | Windows/Linux 向け「表示」メニューを提供すること         | 必須   |
| FR-6 | `Menu.setApplicationMenu()` でアプリ全体にメニューを設定 | 必須   |
| FR-7 | `autoHideMenuBar: true` を維持すること                   | 必須   |

### 非機能要件 (NFR-1 から NFR-6)

| ID    | 要件                                                              |
| ----- | ----------------------------------------------------------------- |
| NFR-1 | `contextIsolation`/`nodeIntegration`/`sandbox` を変更しない       |
| NFR-2 | メニュー追加が CSP ポリシーに影響を与えない                       |
| NFR-3 | `process.platform === 'darwin'` で macOS 固有メニューを分岐       |
| NFR-4 | `createWindow()` の実行時間が 100ms 増加しない（同期処理のみ）    |
| NFR-5 | メニューテンプレートは `index.ts` 内の独立した関数（100 行以内）  |
| NFR-6 | IPC ハンドラ登録フロー（`registerAllIpcHandlers` 等）を変更しない |

### 受入基準 (AC-1 から AC-8)

| ID   | 受入基準                                               | 検証方法                       |
| ---- | ------------------------------------------------------ | ------------------------------ |
| AC-1 | macOS で Cmd++ でズームイン動作                        | 手動: アプリ起動後にキー操作   |
| AC-2 | macOS で Cmd+- でズームアウト動作                      | 手動: アプリ起動後にキー操作   |
| AC-3 | macOS で Cmd+0 でズームリセット動作                    | 手動: ズーム後にキー操作       |
| AC-4 | 「表示」メニューに「拡大」「縮小」「実際のサイズ」あり | 手動: メニューバーを開く       |
| AC-5 | Windows で Ctrl++/-/0 が同様に動作                     | 手動 or CI: Windows 環境で確認 |
| AC-6 | `pnpm typecheck` が PASS                               | 自動: TypeScript コンパイル    |
| AC-7 | `pnpm lint` が PASS                                    | 自動: ESLint                   |
| AC-8 | 認証フロー・IPC・CSP 設定が変更されていない            | 自動: `git diff` で確認        |

### スコープ

**IN スコープ**: `apps/desktop/src/main/index.ts` のみ（`Menu` import 追加、`createApplicationMenu()` 関数追加、`Menu.setApplicationMenu()` 呼び出し追加）

**OUT スコープ**: `src/preload/`、`src/renderer/`、`src/main/ipc/`、CSP ポリシー、`webPreferences` 設定、カスタムショートカット追加、ズームレベルの永続化

## 判定

PASS
