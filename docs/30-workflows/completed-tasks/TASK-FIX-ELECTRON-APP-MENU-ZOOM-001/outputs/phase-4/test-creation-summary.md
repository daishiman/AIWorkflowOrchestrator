# Phase 4: テスト作成 - 結果サマリー

## タスク情報

- タスクID: TASK-FIX-ELECTRON-APP-MENU-ZOOM-001
- 実行日: 2026-03-16

## 結果

### テストファイル

`apps/desktop/src/main/__tests__/menu.test.ts`

### テスト環境

| 項目                   | 値                                              |
| ---------------------- | ----------------------------------------------- |
| テストフレームワーク   | Vitest                                          |
| テスト環境             | happy-dom（vitest.config.ts 設定）              |
| モック方式             | `vi.mock("electron")` で Menu/app をモック      |
| プラットフォームモック | `vi.spyOn(process, "platform", "get")`          |
| afterEach              | `vi.restoreAllMocks()` で状態リセット（P9対策） |

### テストケース一覧 (TC-1 から TC-12)

#### createApplicationMenu のテスト

| TC番号 | 説明                                    | 検証内容                                                  |
| ------ | --------------------------------------- | --------------------------------------------------------- |
| TC-1   | darwin では buildMacTemplate を使う     | `Menu.buildFromTemplate` に渡すテンプレート配列の長さが 4 |
| TC-2   | win32 では buildDefaultTemplate を使う  | `Menu.buildFromTemplate` に渡すテンプレート配列の長さが 1 |
| TC-3   | linux では buildDefaultTemplate を使う  | `Menu.buildFromTemplate` に渡すテンプレート配列の長さが 1 |
| TC-12  | Menu.setApplicationMenu が 1 回呼ばれる | `Menu.setApplicationMenu` の呼び出し回数が 1              |

#### buildMacTemplate のテスト

| TC番号 | 説明                                          | 検証内容                                                             |
| ------ | --------------------------------------------- | -------------------------------------------------------------------- |
| TC-4   | zoomIn role を含む                            | 「表示」サブメニューに `zoomIn` role が存在する                      |
| TC-5   | zoomOut role を含む                           | 「表示」サブメニューに `zoomOut` role が存在する                     |
| TC-6   | resetZoom role を含む                         | 「表示」サブメニューに `resetZoom` role が存在する                   |
| TC-7   | 編集メニューに標準編集操作を含む              | 「編集」サブメニューに undo/redo/cut/copy/paste/selectAll が存在する |
| TC-8   | アプリ名メニューに quit role を含む           | テンプレート先頭メニューのサブメニューに `quit` role が存在する      |
| TC-9   | ウィンドウメニューに minimize と close を含む | 「ウィンドウ」サブメニューに `minimize` と `close` role が存在する   |

#### buildDefaultTemplate のテスト

| TC番号 | 説明                                 | 検証内容                                            |
| ------ | ------------------------------------ | --------------------------------------------------- |
| TC-10  | zoomIn/zoomOut/resetZoom role を含む | 「表示」サブメニューに 3 つのズーム role が存在する |
| TC-11  | メニューが 1 件のみ                  | テンプレート配列の長さが 1、かつラベルが「表示」    |

### ヘルパー関数

| 関数名                                | 用途                                                  |
| ------------------------------------- | ----------------------------------------------------- |
| `collectRoles(items)`                 | submenu から role を再帰的に収集する                  |
| `findSubmenuByLabel(template, label)` | 指定ラベルのメニュー項目の submenu を取得する         |
| `mockPlatform(platform)`              | `process.platform` を指定プラットフォームにモックする |

### TDD 状態

Phase 4 時点では Red（失敗）状態。Phase 5 実装後に Green となる。

## 判定

PASS
