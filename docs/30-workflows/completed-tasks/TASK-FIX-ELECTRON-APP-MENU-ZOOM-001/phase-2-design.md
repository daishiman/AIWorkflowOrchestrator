# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                          |
| Phase      | 2 / 13                                                       |
| 作成日     | 2026-03-16                                                   |
| 担当       | spec-designer                                                |
| 依存 Phase | Phase 1（要件定義）— 完了済み                                |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md` |

---

## 目的

Phase 1 で定義した要件（FR-1〜FR-7、NFR-1〜NFR-6）を実現するためのアーキテクチャ設計および実装設計を行う。`Menu.buildFromTemplate()` を使用したメニューテンプレートの構造、プラットフォーム別分岐設計、および既存コードへの統合方式を決定する。

---

## 実行タスク

| No. | タスク名                    | 目的                                                         |
| --- | --------------------------- | ------------------------------------------------------------ |
| 1   | Electron Menu API role 選定 | ズーム操作に必要な role を特定する                           |
| 2   | メニュー構造設計            | プラットフォーム別のメニュー構造テーブルを作成する           |
| 3   | コード配置設計              | 既存 `index.ts` への追加方式を決定する                       |
| 4   | プラットフォーム分岐設計    | macOS / Windows / Linux の差異を設計する                     |
| 5   | セキュリティ影響分析        | メニュー追加が既存セキュリティ設定に影響しないことを確認する |
| 6   | 統合テスト連携設計          | テスト可能な設計であることを確認する                         |
| 7   | 多角的チェック観点の整理    | レビュー観点を事前に洗い出す                                 |

---

## 参照資料

| 資料                                                                              | 参照理由                                                  |
| --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md`                | 要件（FR/NFR/AC）の参照                                   |
| `apps/desktop/src/main/index.ts`                                                  | 修正対象ファイルの現在の実装                              |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | BrowserWindow セキュリティ設定（変更不可要件の確認）      |
| `.claude/rules/04-electron-security.md`                                           | Electron セキュリティ原則（contextIsolation, sandbox 等） |
| `.claude/rules/02-code-quality.md`                                                | TypeScript 型安全、単一責務原則（SRP）                    |

---

## 実行手順

### Step 1: Electron Menu API role 一覧と採用 role の選定

Electron の `MenuItemConstructorOptions` で `role` に指定できる値から、ズーム関連および標準メニューに必要な role を選定する。

| role               | 動作                                                     | accelerator（macOS） | accelerator（Win/Linux） |
| ------------------ | -------------------------------------------------------- | -------------------- | ------------------------ |
| `zoomIn`           | ウィンドウコンテンツを拡大（webContents.zoomLevel +0.5） | `Cmd+=` / `Cmd++`    | `Ctrl+=` / `Ctrl++`      |
| `zoomOut`          | ウィンドウコンテンツを縮小（webContents.zoomLevel -0.5） | `Cmd+-`              | `Ctrl+-`                 |
| `resetZoom`        | ズームレベルを 0 にリセット（zoomLevel=0 は 100%）       | `Cmd+0`              | `Ctrl+0`                 |
| `togglefullscreen` | フルスクリーン切替                                       | `Ctrl+Cmd+F`         | `F11`                    |
| `copy`             | 選択テキストをコピー                                     | `Cmd+C`              | `Ctrl+C`                 |
| `paste`            | クリップボードから貼り付け                               | `Cmd+V`              | `Ctrl+V`                 |
| `cut`              | 選択テキストを切り取り                                   | `Cmd+X`              | `Ctrl+X`                 |
| `selectAll`        | 全選択                                                   | `Cmd+A`              | `Ctrl+A`                 |
| `undo`             | 元に戻す                                                 | `Cmd+Z`              | `Ctrl+Z`                 |
| `redo`             | やり直す                                                 | `Cmd+Shift+Z`        | `Ctrl+Y`                 |
| `quit`             | アプリ終了                                               | `Cmd+Q`              | `Alt+F4`                 |
| `hide`             | アプリを隠す（macOS のみ有効）                           | `Cmd+H`              | —                        |
| `hideOthers`       | 他のアプリを隠す（macOS のみ有効）                       | `Cmd+Option+H`       | —                        |
| `front`            | 全ウィンドウを前面に（macOS のみ有効）                   | —                    | —                        |
| `minimize`         | ウィンドウを最小化                                       | `Cmd+M`              | —                        |
| `close`            | ウィンドウを閉じる                                       | `Cmd+W`              | `Ctrl+W`                 |

**採用 role**: `zoomIn`、`zoomOut`、`resetZoom`、`togglefullscreen`（FR-1〜FR-3 を満たす必須 role）

---

## メニュー構造設計

### macOS メニュー構造

macOS では Apple HIG に従い、以下の構造でメニューを定義する。

| メニュー名（macOS）      | サブメニュー項目   | role               | 備考                |
| ------------------------ | ------------------ | ------------------ | ------------------- |
| アプリ名（`AIWorkflow`） | このアプリについて | `about`            | macOS 固有          |
|                          | セパレーター       | —                  |                     |
|                          | 環境設定...        | `preferences`      | macOS 固有（Cmd+,） |
|                          | セパレーター       | —                  |                     |
|                          | 隠す               | `hide`             | macOS 固有          |
|                          | ほかを隠す         | `hideOthers`       | macOS 固有          |
|                          | すべてを表示       | `unhide`           | macOS 固有          |
|                          | セパレーター       | —                  |                     |
|                          | 終了               | `quit`             |                     |
| 編集（Edit）             | 取り消す           | `undo`             |                     |
|                          | やり直す           | `redo`             |                     |
|                          | セパレーター       | —                  |                     |
|                          | カット             | `cut`              |                     |
|                          | コピー             | `copy`             |                     |
|                          | ペースト           | `paste`            |                     |
|                          | すべてを選択       | `selectAll`        |                     |
| 表示（View）             | 拡大               | `zoomIn`           | **FR-1 を実現**     |
|                          | 縮小               | `zoomOut`          | **FR-2 を実現**     |
|                          | 実際のサイズ       | `resetZoom`        | **FR-3 を実現**     |
|                          | セパレーター       | —                  |                     |
|                          | フルスクリーン     | `togglefullscreen` |                     |
| ウィンドウ（Window）     | 最小化             | `minimize`         |                     |
|                          | 閉じる             | `close`            |                     |
|                          | セパレーター       | —                  |                     |
|                          | すべてを前面へ     | `front`            | macOS 固有          |

### Windows / Linux メニュー構造

Windows/Linux では最小構成の「表示」メニューのみを提供する（FR-5 に対応）。

| メニュー名   | サブメニュー項目 | role               | 備考            |
| ------------ | ---------------- | ------------------ | --------------- |
| 表示（View） | 拡大             | `zoomIn`           | **FR-1 を実現** |
|              | 縮小             | `zoomOut`          | **FR-2 を実現** |
|              | 実際のサイズ     | `resetZoom`        | **FR-3 を実現** |
|              | セパレーター     | —                  |                 |
|              | フルスクリーン   | `togglefullscreen` |                 |

---

## コード配置設計

### 判断基準

| 選択肢                            | メリット                           | デメリット                        |
| --------------------------------- | ---------------------------------- | --------------------------------- |
| A: `index.ts` に直接追加          | ファイル数が増えない、変更が最小限 | `index.ts` の行数が増える         |
| B: `menu.ts` を新規ファイルで分離 | 単一責務の徹底、テスト容易性が高い | ファイルが増える、import が増える |

**採用: 選択肢 A（`index.ts` に直接追加）**

理由:

1. メニューテンプレートは 50 行以内に収まり、NFR-5（100 行以内）を満たす。
2. 新規ファイルを作成すると import の管理コストが増える一方、メニュー定義は `app.whenReady()` と密接に連携するため `index.ts` に置くことが自然。
3. 今後メニューが大規模になる場合はその時点でファイル分離を検討する（現時点での over-engineering を回避）。

### 実装イメージ

```typescript
// apps/desktop/src/main/index.ts
import { app, BrowserWindow, shell, session, Menu } from "electron";

// メニューテンプレートを返す関数（プラットフォーム分岐あり）
function createApplicationMenu(): Menu {
  const isMac = process.platform === "darwin";
  const template: Electron.MenuItemConstructorOptions[] = isMac
    ? buildMacTemplate()
    : buildDefaultTemplate();
  return Menu.buildFromTemplate(template);
}

function buildMacTemplate(): Electron.MenuItemConstructorOptions[] {
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

function buildDefaultTemplate(): Electron.MenuItemConstructorOptions[] {
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
```

### `app.whenReady()` への統合

`Menu.setApplicationMenu()` は `app.whenReady()` の内部で `createWindow()` の直前に呼び出す。

```typescript
app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.aiworkflow.orchestrator");

  // メニューを設定（createWindow より前に実行）
  const menu = createApplicationMenu();
  Menu.setApplicationMenu(menu);

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  mainWindowRef = createWindow();
  registerAllIpcHandlers(mainWindowRef);

  // ... 既存の activate ハンドラ ...
});
```

---

## プラットフォーム別分岐設計

| プラットフォーム | 判定条件                                                       | 適用メニュー             | 理由                                                                                                                    |
| ---------------- | -------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| macOS            | `process.platform === "darwin"`                                | `buildMacTemplate()`     | Apple HIG 準拠。macOS 固有 role（hide/front 等）。macOS では autoHideMenuBar は非効果（システムメニューバーに常時表示） |
| Windows          | `process.platform === "win32"`                                 | `buildDefaultTemplate()` | Windows 標準メニュー慣習に合わせた最小構成                                                                              |
| Linux            | それ以外（`process.platform !== "darwin"` かつ `!== "win32"`） | `buildDefaultTemplate()` | Windows と同一テンプレートで統一                                                                                        |

分岐ロジック: `const isMac = process.platform === "darwin"` の単一フラグで macOS か否かを判定し、`isMac ? buildMacTemplate() : buildDefaultTemplate()` で分岐する。

---

## セキュリティ影響分析

| 影響項目                                 | 影響の有無 | 理由                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `contextIsolation: true`                 | 影響なし   | `Menu` は Main Process の API であり、BrowserWindow の `webPreferences` とは独立している                                                                                                                                                                                                                                             |
| `nodeIntegration: false`                 | 影響なし   | 同上。`nodeIntegration` は Renderer Process の設定であり、Main Process のメニュー定義と無関係                                                                                                                                                                                                                                        |
| `sandbox: true`                          | 影響なし   | 同上。Chromium サンドボックスは Renderer Process に適用される設定                                                                                                                                                                                                                                                                    |
| CSP（Content Security Policy）           | 影響なし   | `Menu.buildFromTemplate()` は HTTP ヘッダーや script-src に影響を与えない                                                                                                                                                                                                                                                            |
| IPC ハンドラ（`registerAllIpcHandlers`） | 影響なし   | メニューの role は Electron 内部の webContents メソッドを直接呼び出すため、IPC 経由ではない。Menu.setApplicationMenu() は IPC ハンドラー登録サイクル（registerAllIpcHandlers / unregisterAllIpcHandlers）と独立しており、app.whenReady() の一回限りの呼び出しで十分。ipc-contract-checklist.md は適用除外（新規 IPC チャンネルなし） |
| XSS リスク                               | 影響なし   | メニューラベルはハードコード文字列（ユーザー入力を受け付けない）                                                                                                                                                                                                                                                                     |
| `webSecurity: true`                      | 影響なし   | Same-Origin ポリシーはネットワークリクエストに関する設定であり、メニューとは無関係                                                                                                                                                                                                                                                   |

**結論**: `Menu.buildFromTemplate()` および `Menu.setApplicationMenu()` の追加は、既存のセキュリティ設定（`contextIsolation`、`sandbox`、CSP）に対して影響を与えない。

> **注記**: macOS `activate` イベント時の `Menu.setApplicationMenu()` 再呼び出しは不要。Menu はグローバルステートとして保持され、`ipcMain.handle()` と異なり冪等なため二重登録リスクがない（P5 参照）。

---

## 統合テスト連携

### テスト対象

Phase 4 で以下のテストを作成する（設計時の事前確認）。

| テスト種別       | テスト内容                                                                   | テストファイル候補                             |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| Unit Test        | `createApplicationMenu()` が macOS/Win/Linux で正しいメニューを返すか        | `apps/desktop/src/main/__tests__/menu.test.ts` |
| Unit Test        | `buildMacTemplate()` に `zoomIn`/`zoomOut`/`resetZoom` role が含まれるか     | 同上                                           |
| Unit Test        | `buildDefaultTemplate()` に `zoomIn`/`zoomOut`/`resetZoom` role が含まれるか | 同上                                           |
| Integration Test | `Menu.setApplicationMenu()` が呼ばれること（モック検証）                     | 同上                                           |

### テスト設計上の注意点

- `process.platform` は `vi.stubGlobal('process', ...)` または `vi.spyOn(process, 'platform', 'get').mockReturnValue(...)` でモックする。
- `Menu.buildFromTemplate` / `Menu.setApplicationMenu` は Vitest の `vi.mock('electron', ...)` でモックする。
- P39 対策: `happy-dom` 環境では `fireEvent` を使用（今回は Renderer テストではないため非該当）。
- テスト間での `process.platform` 状態リーク防止のため、`afterEach` でモックをリストアする。

---

## 多角的チェック観点

| チェック観点           | 確認内容                                                                                       | 確認時期                 |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------ |
| 要件カバレッジ         | FR-1〜FR-7 がすべてメニュー構造テーブルで実現されているか                                      | Phase 3 レビュー         |
| セキュリティ           | BrowserWindow の `webPreferences` が変更されていないか                                         | Phase 3 レビュー         |
| プラットフォーム互換性 | `process.platform === "darwin"` 分岐が正しく機能するか（macOS / Win / Linux で確認）           | Phase 11 手動テスト      |
| アクセシビリティ       | メニュー項目に label が定義されており、スクリーンリーダーがメニューを読み上げられるか          | Phase 10 レビュー        |
| パフォーマンス         | `createApplicationMenu()` が同期処理のみであり、`app.whenReady()` のブロッキングが発生しないか | Phase 9 品質検証         |
| 型安全                 | `Electron.MenuItemConstructorOptions[]` 型で template を定義しているか                         | Phase 9 型チェック       |
| 保守性                 | `buildMacTemplate()` と `buildDefaultTemplate()` の関数が独立しており、将来の変更が容易か      | Phase 8 リファクタリング |
| 既存コード影響範囲     | `app.whenReady()` 内の既存コード（IPC ハンドラ登録、activate ハンドラ等）が変更されていないか  | Phase 9 品質検証         |

---

## サブタスク管理

| No. | サブタスク                                              | 担当 Phase |
| --- | ------------------------------------------------------- | ---------- |
| 1   | `Menu` import 追加                                      | Phase 5    |
| 2   | `createApplicationMenu()` 関数実装                      | Phase 5    |
| 3   | `buildMacTemplate()` 関数実装                           | Phase 5    |
| 4   | `buildDefaultTemplate()` 関数実装                       | Phase 5    |
| 5   | `app.whenReady()` への `Menu.setApplicationMenu()` 統合 | Phase 5    |
| 6   | Unit テスト実装                                         | Phase 4    |
| 7   | `pnpm typecheck` / `pnpm lint` の通過確認               | Phase 9    |

---

## 成果物

| 成果物 | パス                                                         | 説明                |
| ------ | ------------------------------------------------------------ | ------------------- |
| 設計書 | `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md` | Phase 2の主要成果物 |

---

## タスク100%実行確認【必須】

| No. | タスク名                    | 結果    | 備考 |
| --- | --------------------------- | ------- | ---- |
| 1   | Electron Menu API role 選定 | ✅ 完了 |      |
| 2   | メニュー構造設計            | ✅ 完了 |      |
| 3   | コード配置設計              | ✅ 完了 |      |
| 4   | プラットフォーム分岐設計    | ✅ 完了 |      |
| 5   | セキュリティ影響分析        | ✅ 完了 |      |
| 6   | 統合テスト連携設計          | ✅ 完了 |      |
| 7   | 多角的チェック観点の整理    | ✅ 完了 |      |

---

## 完了条件

- [ ] Electron Menu API の role 一覧と採用 role が明記されている
- [ ] macOS / Windows-Linux 別のメニュー構造テーブルが定義されている
- [ ] `zoomIn`、`zoomOut`、`resetZoom` role が「表示」メニューに含まれている
- [ ] コード配置（`index.ts` への直接追加）の判断理由が記述されている
- [ ] プラットフォーム分岐（`process.platform === "darwin"`）が設計されている
- [ ] セキュリティ影響分析で全設定項目（contextIsolation / sandbox / CSP / IPC）が「影響なし」と判定されている
- [ ] `app.whenReady()` への統合位置（`createWindow()` より前）が明示されている
- [ ] 統合テスト連携でテスト対象とテストファイル候補が記載されている
- [ ] 多角的チェック観点が確認時期を含めて列挙されている
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が含まれていない

---

## 次 Phase

Phase 3（設計レビュー）へ進む。
前提条件: 本 Phase の完了条件チェックリストが全て満たされていること。
