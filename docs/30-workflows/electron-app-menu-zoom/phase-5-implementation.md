# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                  |
| Phase      | 5 / 13                                                               |
| 作成日     | 2026-03-16                                                           |
| 担当       | implementer                                                          |
| 依存 Phase | Phase 4（テスト作成）— 完了済み（TC-1〜TC-12 が Red 状態）           |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-5-implementation.md` |

---

## 目的

Phase 2 の設計に基づき、`apps/desktop/src/main/index.ts` に `Menu` import の追加・`buildMacTemplate()` / `buildDefaultTemplate()` / `createApplicationMenu()` 関数の実装・`app.whenReady()` への統合を行う。Phase 4 で作成した TC-1〜TC-12 が全件 PASS（Green）になることを完了条件とする。

---

## 実行タスク

| No. | タスク名                           | 目的                                                                    |
| --- | ---------------------------------- | ----------------------------------------------------------------------- |
| 1   | `index.ts` の現状確認              | 修正対象ファイルの現在の import 文と `app.whenReady()` の実装を確認する |
| 2   | `Menu` import の追加               | `electron` の import に `Menu` を追加する                               |
| 3   | `buildMacTemplate()` の実装        | macOS 向けメニューテンプレート関数を定義する                            |
| 4   | `buildDefaultTemplate()` の実装    | Windows/Linux 向けメニューテンプレート関数を定義する                    |
| 5   | `createApplicationMenu()` の実装   | プラットフォーム分岐と `Menu.setApplicationMenu()` 呼び出しを実装する   |
| 6   | `app.whenReady()` への統合         | `createApplicationMenu()` を `createWindow()` より前に呼び出す          |
| 7   | `pnpm typecheck` の実行            | TypeScript 型エラーが 0 件であることを確認する                          |
| 8   | `pnpm lint` の実行                 | ESLint エラーが 0 件であることを確認する                                |
| 9   | Phase 4 テストの実行（Green 確認） | TC-1〜TC-12 が全件 PASS することを確認する                              |

---

## 参照資料

| 資料                                                                | 参照理由                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md`  | FR-1〜FR-7（実装すべき機能要件）の参照                             |
| `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`        | メニュー構造テーブル・実装イメージコード・統合位置の参照           |
| `docs/30-workflows/electron-app-menu-zoom/phase-4-test-creation.md` | TC-1〜TC-12（テスト対象の関数シグネチャと export 要件）の参照      |
| `apps/desktop/src/main/index.ts`                                    | 修正対象ファイル（現在の実装を読み込んだ上で変更箇所を特定する）   |
| `.claude/rules/02-code-quality.md`                                  | TypeScript 型安全原則（`any` 禁止・strict mode 準拠）              |
| `.claude/rules/04-electron-security.md`                             | セキュリティ設定変更禁止（contextIsolation / sandbox / CSP）の確認 |

---

## 実行手順

### Step 1: `index.ts` の現状確認

`apps/desktop/src/main/index.ts` を Read ツールで読み込む。以下の2点を確認する。

1. L1 の import 文: `import { app, BrowserWindow, shell, session } from "electron"` に `Menu` が含まれていないことを確認する。
2. `app.whenReady().then(...)` ブロックの先頭付近を確認し、`createWindow()` の呼び出し位置を特定する。

### Step 2: `Menu` import の追加

L1 の import 文を以下に変更する（Edit ツールを使用）。

```typescript
// 変更前
import { app, BrowserWindow, shell, session } from "electron";

// 変更後
import { app, BrowserWindow, shell, session, Menu } from "electron";
```

### Step 3: `buildMacTemplate()` 関数の実装

`app.whenReady().then(...)` より前の位置に以下の関数を追加する。

```typescript
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
```

**型注釈**: 戻り値の型は `Electron.MenuItemConstructorOptions[]` を明示する（TypeScript strict mode 対応、NFR-1 / NFR-5 準拠）。

**export の理由**: Phase 4 のテスト（`menu.test.ts`）から直接インポートするため `export` を付与する。

### Step 4: `buildDefaultTemplate()` 関数の実装

`buildMacTemplate()` の直後に以下の関数を追加する。

```typescript
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
```

**Windows / Linux 共通**: `process.platform === "win32"` と `"linux"` のどちらも同一テンプレートを返す。分岐は `createApplicationMenu()` で行う。

### Step 5: `createApplicationMenu()` 関数の実装

`buildDefaultTemplate()` の直後に以下の関数を追加する。

```typescript
export function createApplicationMenu(): void {
  const template =
    process.platform === "darwin" ? buildMacTemplate() : buildDefaultTemplate();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
```

**設計の注意点**:

- `process.platform === "darwin"` の単一条件で macOS / それ以外を分岐する（Phase 2 設計準拠）。
- `Menu.buildFromTemplate()` と `Menu.setApplicationMenu()` はどちらも同期処理のため `await` は不要（NFR-4 準拠）。
- 戻り値は `void`（`Menu.setApplicationMenu()` の副作用のみが目的）。

### Step 6: `app.whenReady()` への統合

`app.whenReady().then(...)` ブロック内の先頭付近（`electronApp.setAppUserModelId(...)` の直後・`createWindow()` の前）に `createApplicationMenu()` の呼び出しを追加する。

```typescript
app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.aiworkflow.orchestrator");

  // メニューを設定（createWindow より前に実行する）
  createApplicationMenu();

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  mainWindowRef = createWindow();
  registerAllIpcHandlers(mainWindowRef);

  // ... 既存の activate ハンドラは変更しない ...
});
```

**制約**: `createWindow()` の呼び出しより前に `createApplicationMenu()` を置く（Phase 2 設計・AC-8 の「既存コード変更なし」確認のため）。

### Step 7: `pnpm typecheck` の実行

```bash
pnpm --filter @repo/desktop typecheck
```

期待される出力: エラー 0 件。

TypeScript エラーが発生した場合は以下を確認する。

- `Electron.MenuItemConstructorOptions` 型が electron パッケージから解決されているか
- `role` フィールドの値が `Electron.MenuItemConstructorOptions['role']` 型に合致しているか（例: `"about"` / `"quit"` 等は Electron の型定義で許可された値）

### Step 8: `pnpm lint` の実行

```bash
pnpm --filter @repo/desktop lint
```

期待される出力: エラー・警告 0 件。

ESLint エラーが発生した場合は以下を確認する。

- `any` 型の使用がないか
- 未使用 import がないか
- `export` した関数が ESLint の `import/no-unused-modules` ルールに引っかかっていないか（テストファイルから使用されているため問題なし）

### Step 9: Phase 4 テストの実行（Green 確認）

```bash
cd apps/desktop && pnpm vitest run src/main/__tests__/menu.test.ts
```

期待される出力: TC-1〜TC-12 の全 12 テストが PASS（`✓ 12 tests passed`）。

テストが失敗した場合の対処方針:

- TC-4〜TC-9（buildMacTemplate 関連）が失敗: `buildMacTemplate()` の submenu 内の role 定義を確認する
- TC-10〜TC-11（buildDefaultTemplate 関連）が失敗: `buildDefaultTemplate()` の submenu と配列長を確認する
- TC-1〜TC-3（プラットフォーム分岐）が失敗: `createApplicationMenu()` の `process.platform === "darwin"` 条件を確認する
- TC-12（統合テスト）が失敗: `Menu.setApplicationMenu()` が呼ばれているか、`vi.mock("electron")` の設定を確認する

---

## コード成果物パス

| 成果物                           | 種別             |
| -------------------------------- | ---------------- |
| `apps/desktop/src/main/index.ts` | 修正対象（既存） |

---

## 完了条件

- [ ] `apps/desktop/src/main/index.ts` の import 文に `Menu` が追加されている
- [ ] `buildMacTemplate()` 関数が `export` 付きで定義されており、戻り値型が `Electron.MenuItemConstructorOptions[]` である
- [ ] `buildDefaultTemplate()` 関数が `export` 付きで定義されており、戻り値型が `Electron.MenuItemConstructorOptions[]` である
- [ ] `createApplicationMenu()` 関数が `export` 付きで定義されており、`process.platform === "darwin"` で分岐している
- [ ] `app.whenReady().then(...)` 内で `createApplicationMenu()` が `createWindow()` より前に呼ばれている
- [ ] `pnpm typecheck` が PASS（エラー 0 件）
- [ ] `pnpm lint` が PASS（エラー 0 件）
- [ ] TC-1〜TC-12 の全 12 テストが PASS（Green）
- [ ] `contextIsolation` / `nodeIntegration` / `sandbox` の設定が変更されていない（`git diff apps/desktop/src/main/index.ts` で確認）
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が含まれていない

---

## 次 Phase

Phase 6（テスト拡充）へ進む。
前提条件: 本 Phase の完了条件チェックリストが全て満たされていること。
