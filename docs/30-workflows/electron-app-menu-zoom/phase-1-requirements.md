# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                |
| Phase      | 1 / 13                                                             |
| 作成日     | 2026-03-16                                                         |
| 担当       | spec-designer                                                      |
| 依存 Phase | なし（起点）                                                       |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md` |

---

## 目的

Electron デスクトップアプリにおいて、アプリケーションメニューが未定義のため `Cmd+-`（ズームアウト）および `Cmd+0`（ズームリセット）のキーボードショートカットが動作しない。`Menu.buildFromTemplate()` を使用して role ベースのメニューを定義し、ズーム操作を含む標準ショートカットを有効にする。

---

## 実行タスク

| No. | タスク名               | 目的                                               |
| --- | ---------------------- | -------------------------------------------------- |
| 1   | 問題の現状確認         | `index.ts` のメニュー定義の欠如を確認する          |
| 2   | 機能要件の定義         | ズーム操作に必要な role を特定する                 |
| 3   | 非機能要件の定義       | セキュリティ・プラットフォーム互換性要件を定義する |
| 4   | 受入基準の策定         | 検証可能な完了条件を番号付きで定義する             |
| 5   | スコープ定義（IN/OUT） | 修正対象と対象外を明確にする                       |

---

## 参照資料

| 資料                                                                                                    | 参照理由                                          |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `apps/desktop/src/main/index.ts`                                                                        | 修正対象ファイル、現状の `createWindow()` 実装    |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                       | BrowserWindow セキュリティ設定要件                |
| `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                            | Electron 3プロセスモデル（Main/Preload/Renderer） |
| `.claude/rules/04-electron-security.md`                                                                 | Electron セキュリティ原則（contextIsolation 等）  |
| [Electron Menu API 公式ドキュメント](https://www.electronjs.org/docs/latest/api/menu)                   | `Menu.buildFromTemplate()` API 仕様               |
| [Electron Menu Item roles 公式ドキュメント](https://www.electronjs.org/docs/latest/api/menu-item#roles) | `zoomIn`/`zoomOut`/`resetZoom` role 仕様          |

---

## 実行手順

### Step 1: 現状調査

1. `apps/desktop/src/main/index.ts` を読み込み、`createWindow()` の実装を確認する。
2. `import` 文に `Menu` が含まれていないことを確認する（L1: `import { app, BrowserWindow, shell, session } from "electron"`）。
3. `autoHideMenuBar: true`（L56）の設定を確認する。
4. `optimizer.watchWindowShortcuts(window)`（L266）がF12のDevToolsのみ対応していることを確認する。

### Step 2: 問題の根本原因の特定

- Electron では `Menu.buildFromTemplate()` を明示的に呼ばない場合、デフォルトの Application Menu が生成されない。
- `autoHideMenuBar: true` はメニューバーをUIから非表示にするが、メニュー自体の定義は削除しない。
- role ベースのメニュー項目（`zoomIn`, `zoomOut`, `resetZoom`）は、Electron 内部の webContents の `setZoomFactor` / `setZoomLevel` を呼ぶため、IPC や Renderer 側のコードは不要。
- メニューが未定義の状態では、これらのショートカットは OS からも Electron からも処理されない。

### Step 3: 要件策定

- 機能要件・非機能要件・受入基準を以下の各セクションで定義する。
- スコープ（IN/OUT）を確定し、今回の変更範囲を明確にする。

---

## 機能要件

| ID   | 要件                                                                                                       | 優先度 |
| ---- | ---------------------------------------------------------------------------------------------------------- | ------ |
| FR-1 | `Cmd++`（macOS）/ `Ctrl++`（Windows/Linux）でページコンテンツをズームインできること                        | 必須   |
| FR-2 | `Cmd+-`（macOS）/ `Ctrl+-`（Windows/Linux）でページコンテンツをズームアウトできること                      | 必須   |
| FR-3 | `Cmd+0`（macOS）/ `Ctrl+0`（Windows/Linux）でズームレベルを 100% にリセットできること                      | 必須   |
| FR-4 | macOS 向けには、Apple HIG に準拠した標準メニュー（アプリ名メニュー、編集、表示、ウィンドウ）を提供すること | 必須   |
| FR-5 | Windows / Linux 向けには、標準的な「表示」メニューを提供すること                                           | 必須   |
| FR-6 | `Menu.setApplicationMenu(menu)` でアプリケーション全体にメニューを設定すること                             | 必須   |
| FR-7 | `autoHideMenuBar: true` を維持し、Alt キーでメニューバーを表示できること（Windows/Linux のみ）             | 必須   |

---

## 非機能要件

| ID    | 要件                                                                                               | 基準                                           |
| ----- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| NFR-1 | セキュリティ: `contextIsolation: true`、`nodeIntegration: false`、`sandbox: true` を変更しない     | 既存の BrowserWindow 設定を一切変更しない      |
| NFR-2 | セキュリティ: メニューの追加が CSP ポリシーに影響を与えないこと                                    | `getCSPPolicy()` 関数に変更なし                |
| NFR-3 | プラットフォーム互換性: `process.platform === 'darwin'` で macOS 固有メニューを分岐させること      | macOS / Windows / Linux の各環境で動作確認済み |
| NFR-4 | パフォーマンス: `createWindow()` の実行時間が 100ms 増加しないこと                                 | メニュー設定は同期処理のみ（非同期 I/O なし）  |
| NFR-5 | 保守性: メニューテンプレートは `index.ts` 内の独立した関数として定義し、100 行以内に収める         | 単一責務の関数分離                             |
| NFR-6 | IPC への影響なし: `registerAllIpcHandlers()` / `unregisterAllIpcHandlers()` の呼び出しを変更しない | 既存の IPC ハンドラ登録フローに変更なし        |

---

## 受入基準

| ID   | 受入基準                                                                                   | 検証方法                                        |
| ---- | ------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| AC-1 | macOS で `Cmd++` を押下すると、ウィンドウ内コンテンツが拡大する                            | 手動: アプリ起動後にキー操作で確認              |
| AC-2 | macOS で `Cmd+-` を押下すると、ウィンドウ内コンテンツが縮小する                            | 手動: アプリ起動後にキー操作で確認              |
| AC-3 | macOS で `Cmd+0` を押下すると、ズームレベルが元の 100% に戻る                              | 手動: ズーム後にキー操作で確認                  |
| AC-4 | macOS のメニューバーに「表示」メニューが存在し、「拡大」「縮小」「実際のサイズ」項目を含む | 手動: メニューバーの「表示」メニューを開く      |
| AC-5 | Windows で `Ctrl++` / `Ctrl+-` / `Ctrl+0` が同様に動作する                                 | 手動 or CI: Windows 環境で確認                  |
| AC-6 | `pnpm typecheck` が PASS すること（型エラーなし）                                          | 自動: TypeScript コンパイル                     |
| AC-7 | `pnpm lint` が PASS すること（ESLint エラーなし）                                          | 自動: ESLint                                    |
| AC-8 | 既存の認証フロー・IPC ハンドラ・CSP 設定が変更されていないこと（`git diff` で確認可能）    | 自動: `git diff apps/desktop/src/main/index.ts` |

---

## スコープ定義

### IN スコープ（修正対象）

- `apps/desktop/src/main/index.ts`
  - `Menu` の import 追加
  - `createApplicationMenu()` 関数の新規追加
  - `app.whenReady()` 内での `Menu.setApplicationMenu()` 呼び出し追加

### OUT スコープ（修正対象外）

- `apps/desktop/src/preload/index.ts`（Preload スクリプト — 変更なし）
- `apps/desktop/src/renderer/`（Renderer プロセス — 変更なし）
- `apps/desktop/src/main/ipc/`（IPC ハンドラ群 — 変更なし）
- CSP ポリシー（`getCSPPolicy()` — 変更なし）
- BrowserWindow の `webPreferences` 設定（変更なし）
- カスタムショートカットの追加（ズーム操作以外のショートカット — 今回は対象外）
- ズームレベルの永続化（アプリ再起動後のズーム設定の保存 — 今回は対象外）

---

## 成果物

| 成果物                                                             | 種別            |
| ------------------------------------------------------------------ | --------------- |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md` | 本仕様書        |
| `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`       | 次 Phase 成果物 |

---

## 完了条件

- [ ] 問題の根本原因（`Menu.buildFromTemplate()` 未定義）が本文中に明記されている
- [ ] 機能要件（FR-1 〜 FR-7）が番号付きで定義されている
- [ ] 非機能要件（NFR-1 〜 NFR-6）が番号付きで定義されている
- [ ] 受入基準（AC-1 〜 AC-8）が検証方法を含めて定義されている
- [ ] スコープ（IN/OUT）が明確に分離されている
- [ ] 参照資料にシステム仕様（`aiworkflow-requirements`）が含まれている
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が含まれていない

---

## 次 Phase

Phase 2（設計）へ進む。
前提条件: 本 Phase の完了条件チェックリストが全て満たされていること。
