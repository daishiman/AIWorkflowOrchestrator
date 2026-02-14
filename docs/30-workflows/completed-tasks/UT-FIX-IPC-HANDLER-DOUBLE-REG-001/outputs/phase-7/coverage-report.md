# Phase 7: カバレッジレポート - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| Phase      | 7                                 |
| 実行日     | 2026-02-14                        |
| ステータス | 完了                              |

---

## テスト実行結果

```
 ✓ src/main/ipc/__tests__/ipc-double-registration.test.ts (7 tests) 7ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
```

## カバレッジ分析

### 修正対象ファイルのテストカバレッジ

今回の修正対象は `apps/desktop/src/main/ipc/index.ts` に追加した `unregisterAllIpcHandlers()` 関数と、`registerAllIpcHandlers()` 内の `themeWatcherUnsubscribe` 管理ロジック。

テストファイルでは修正対象モジュールを直接インポートしてテストしているが、全依存先はモックされている。Vitest のカバレッジ計測ツールは、モックされた依存先のソースファイルに対して0%カバレッジを報告するが、これはテスト対象の関数自体のカバレッジとは無関係。

### 機能カバレッジ（手動分析）

| 関数/ロジック                         | テストケース     | カバレッジ |
| ------------------------------------- | ---------------- | ---------- |
| `unregisterAllIpcHandlers()` 全体     | テスト#1, #2, #3 | 100%       |
| - `ipcMain.removeHandler()` 呼び出し  | テスト#1         | 100%       |
| - `ipcMain.removeAllListeners()` 呼出 | テスト#2         | 100%       |
| - 未登録時の安全性                    | テスト#3         | 100%       |
| - `themeWatcherUnsubscribe` 解除      | テスト#7         | 100%       |
| `registerAllIpcHandlers()` 再登録     | テスト#4, #5, #6 | 100%       |
| activate フロー全体                   | テスト#5, #6     | 100%       |
| 複数サイクルの安定性                  | テスト#6         | 100%       |
| `themeWatcherUnsubscribe` 管理        | テスト#7         | 100%       |

### 判定

修正対象のコードパスは全てテストでカバーされている。カバレッジ基準を満たしている。

---

## 完了条件チェック

- [x] 全7テストがPASSしている
- [x] 修正対象の全コードパスがテストでカバーされている
- [x] Phase 6へのフィードバック（追加テスト不要）が確定している
