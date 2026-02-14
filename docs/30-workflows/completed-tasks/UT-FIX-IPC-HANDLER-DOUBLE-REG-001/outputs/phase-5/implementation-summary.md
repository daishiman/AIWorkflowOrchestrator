# Phase 5: 実装サマリー - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| Phase      | 5                                 |
| 実行日     | 2026-02-14                        |
| ステータス | 完了                              |

---

## 変更ファイル一覧

| ファイル                             | 変更内容                                                          |
| ------------------------------------ | ----------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts` | `unregisterAllIpcHandlers()` 関数の新規追加、themeWatcher管理追加 |
| `apps/desktop/src/main/index.ts`     | activate ハンドラに `unregisterAllIpcHandlers()` 呼び出し追加     |

---

## 実装詳細

### 1. `unregisterAllIpcHandlers()` - ipc/index.ts

- `IPC_CHANNELS` の全値を走査し、各チャンネルに対して `ipcMain.removeHandler()` と `ipcMain.removeAllListeners()` を実行
- `setupThemeWatcher` の unsubscribe 関数をモジュールスコープで保持し、解除時に呼び出し
- `themeWatcherUnsubscribe` を `null` にリセットして二重解除を防止

### 2. `registerAllIpcHandlers()` の修正 - ipc/index.ts

- `setupThemeWatcher()` の戻り値をモジュールスコープの `themeWatcherUnsubscribe` に保持するよう変更

### 3. activate ハンドラの修正 - index.ts

- `import` に `unregisterAllIpcHandlers` を追加
- `registerAllIpcHandlers()` の前に `unregisterAllIpcHandlers()` を呼び出す

---

## テスト結果

```
 ✓ src/main/ipc/__tests__/ipc-double-registration.test.ts (7 tests) 7ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
```

全7テスト PASS。TDD Green フェーズ完了。

---

## 完了条件チェック

- [x] `unregisterAllIpcHandlers()` が実装されている
- [x] activate ハンドラが修正されている
- [x] setupThemeWatcher の二重呼び出し対策が実装されている
- [x] 全テストが PASS している
