# Phase 4: テスト設計 - UT-FIX-IPC-HANDLER-DOUBLE-REG-001

## メタ情報

| 項目           | 値                                                                        |
| -------------- | ------------------------------------------------------------------------- |
| タスクID       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001                                         |
| Phase          | 4 - テスト作成                                                            |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`     |
| テスト数       | 7                                                                         |
| テスト環境     | Vitest (happy-dom / node - Main Process コードのため electron モック使用) |
| TDD ステータス | Red (全7テスト失敗 - `unregisterAllIpcHandlers` が未実装)                 |

---

## テストケース一覧

### 1. unregisterAllIpcHandlers() - removeHandler 呼び出し検証

| 項目     | 内容                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------- |
| テスト名 | 「全チャンネルに対して ipcMain.removeHandler() を呼び出す」                                          |
| 目的     | `unregisterAllIpcHandlers()` が `IPC_CHANNELS` の各値に対して `removeHandler()` を実行することを検証 |
| 検証内容 | `mockIpcMainRemoveHandler` が `file:get-tree`, `file:read`, `store:get` を含む引数で呼ばれること     |
| カテゴリ | 正常系                                                                                               |

### 2. unregisterAllIpcHandlers() - removeAllListeners 呼び出し検証

| 項目     | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| テスト名 | 「全チャンネルに対して ipcMain.removeAllListeners() を呼び出す」                          |
| 目的     | `ipcMain.on()` で登録されたリスナーも `removeAllListeners()` で適切に削除されることを検証 |
| 検証内容 | `mockIpcMainRemoveAllListeners` が `theme:system-changed` を含む引数で呼ばれること        |
| カテゴリ | 正常系                                                                                    |

### 3. unregisterAllIpcHandlers() - 未登録時の安全性

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| テスト名 | 「ハンドラが未登録の状態でも例外を投げない」                                |
| 目的     | ハンドラが1つも登録されていない初期状態で呼んでもクラッシュしないことを検証 |
| 検証内容 | `expect(() => unregisterAllIpcHandlers()).not.toThrow()`                    |
| カテゴリ | 異常系 / 防御的プログラミング                                               |

### 4. registerAllIpcHandlers() - unregister 後の再登録

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| テスト名 | 「unregisterAllIpcHandlers() 後に registerAllIpcHandlers() を呼んでもエラーにならない」     |
| 目的     | 登録 -> 解除 -> 再登録のフローで二重登録例外が発生しないことを検証                          |
| 検証内容 | `register -> unregister -> register` の順で呼び出し、最後の `register` が例外を投げないこと |
| カテゴリ | 統合テスト                                                                                  |

### 5. activate フロー - 基本フロー

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| テスト名 | 「register -> unregister -> register の一連フローが例外なく完了する」                  |
| 目的     | macOS の `app.on("activate")` で実行される実際のフローをシミュレートし、安定動作を検証 |
| 検証内容 | 3 ステップ全てが `not.toThrow()` であること                                            |
| カテゴリ | E2E シミュレーション                                                                   |

### 6. activate フロー - 複数サイクル

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| テスト名 | 「複数回の register -> unregister サイクルでも安定動作する」            |
| 目的     | ユーザーがドックアイコンを複数回クリックしても安定動作することを検証    |
| 検証内容 | 3 サイクルの register/unregister 後、最後にもう一度 register できること |
| カテゴリ | 回帰テスト / ストレステスト                                             |

### 7. setupThemeWatcher - unsubscribe 呼び出し検証

| 項目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| テスト名 | 「再登録時に前回の setupThemeWatcher の unsubscribe が呼ばれる」                                 |
| 目的     | テーマ変更リスナーが二重登録されないよう、unregister 時に前回の unsubscribe が呼ばれることを検証 |
| 検証内容 | `register -> unregister` 後に `mockThemeUnsubscribe` が1回呼ばれること                           |
| カテゴリ | リソースリーク防止                                                                               |

---

## モック構成

### Electron モジュール

| モック対象                   | 設定内容                                            |
| ---------------------------- | --------------------------------------------------- |
| `ipcMain.handle`             | `vi.fn()` - 呼び出し記録のみ                        |
| `ipcMain.removeHandler`      | `vi.fn()` - 呼び出し引数を検証                      |
| `ipcMain.on`                 | `vi.fn()` - 呼び出し記録のみ                        |
| `ipcMain.removeAllListeners` | `vi.fn()` - 呼び出し引数を検証                      |
| `BrowserWindow`              | コンストラクタ + `getAllWindows()` のモック         |
| `nativeTheme`                | `shouldUseDarkColors: false` + イベントリスナモック |
| `app`                        | `getPath`, `getName`, `getVersion` 等               |
| `net`                        | `isOnline: true`                                    |

### IPC_CHANNELS（サブセット）

テスト用に12チャンネルのサブセットをモック:

- `FILE_GET_TREE`, `FILE_READ`, `STORE_GET`
- `THEME_GET`, `THEME_SET`, `THEME_GET_SYSTEM`, `THEME_SYSTEM_CHANGED`
- `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_GET_SESSION`, `AUTH_REFRESH`, `AUTH_CHECK_ONLINE`

### ハンドラ登録関数

全20個のハンドラ登録関数を `vi.fn()` でモック:

- `registerFileHandlers`, `registerStoreHandlers`, `registerDashboardHandlers` 他
- `setupThemeWatcher` は `mockThemeUnsubscribe` を返す関数としてモック

### サービス / インフラ

- `electron-store`: `get`, `set`, `delete` メソッドのモック
- `getSupabaseClient`: `null` を返す（Supabase 未設定シナリオ）
- 各サービスクラス: 空オブジェクトを返すコンストラクタモック

---

## vi.hoisted() の使用理由

`vi.mock()` はファイル先頭にホイスティングされるため、通常の `const` 変数はモックファクトリ内で参照できない。`vi.hoisted()` を使用してモック変数をホイスティング対応にし、`vi.mock()` ファクトリ内から安全に参照できるようにした。

---

## Red フェーズ確認結果

```
Test Files  1 failed (1)
Tests  7 failed (7)
```

全7テストが `TypeError: unregisterAllIpcHandlers is not a function` で失敗。
Phase 5（実装）で `unregisterAllIpcHandlers()` を `ipc/index.ts` に実装することで Green フェーズに移行する。
