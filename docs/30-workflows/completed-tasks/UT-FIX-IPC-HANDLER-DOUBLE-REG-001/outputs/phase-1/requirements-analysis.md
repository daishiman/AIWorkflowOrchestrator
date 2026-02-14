# Phase 1: 要件分析結果 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| Phase      | 1                                 |
| 実行日     | 2026-02-14                        |
| ステータス | 完了                              |

---

## Task 1: エラー再現条件の特定

### 再現手順

1. アプリケーション起動 → `app.whenReady()` → `registerAllIpcHandlers(mainWindowRef)` が1回目実行
2. 全ウィンドウを閉じる → `window-all-closed` イベント発火、macOS では `process.platform === "darwin"` により `app.quit()` が呼ばれない
3. ドックアイコンをクリック → `app.on("activate")` イベント発火
4. `BrowserWindow.getAllWindows().length === 0` の条件が `true` → 分岐内に進入
5. `mainWindowRef = createWindow()` で新ウィンドウ作成
6. `registerAllIpcHandlers(mainWindowRef)` が2回目実行
7. 内部の `ipcMain.handle("file:get-tree", handler)` が例外送出: `Error: Attempted to register a second handler for 'file:get-tree'`

### エラー発生箇所

- **ファイル**: `apps/desktop/src/main/index.ts:277`
- **コード**: `registerAllIpcHandlers(mainWindowRef);`（activate ハンドラ内）

### 根本原因

`ipcMain.handle()` はプロセスレベルでハンドラを登録する。全ウィンドウを閉じてもプロセスは生き残り（macOS）、ハンドラも残存する。activate で `registerAllIpcHandlers()` を再実行すると、既に登録済みのチャンネルに2回目のハンドラ登録を試みて例外が発生する。

---

## Task 2: 影響範囲の調査

### registerAllIpcHandlers() 内から呼び出される全ハンドラ登録関数

| #   | 関数名                              | mainWindow引数 | ipcMain.handle()回数 | ファイル                     |
| --- | ----------------------------------- | -------------- | -------------------- | ---------------------------- |
| 1   | `registerFileHandlers()`            | 不要           | 4                    | fileHandlers.ts              |
| 2   | `registerStoreHandlers()`           | 不要           | 4                    | storeHandlers.ts             |
| 3   | `registerDashboardHandlers()`       | 不要           | 2                    | dashboardHandlers.ts         |
| 4   | `registerGraphHandlers()`           | 不要           | 2                    | graphHandlers.ts             |
| 5   | `registerAIHandlers()`              | 不要           | 3                    | aiHandlers.ts                |
| 6   | `registerThemeHandlers()`           | 不要           | 3                    | themeHandlers.ts             |
| 7   | `registerWorkspaceHandlers()`       | 不要           | 6                    | workspaceHandlers.ts         |
| 8   | `registerSearchHandlers()`          | 不要           | 7                    | searchHandlers.ts            |
| 9   | `registerFileSelectionHandlers()`   | 不要           | 4                    | fileSelectionHandlers.ts     |
| 10  | `registerLLMHandlers()`             | 不要           | 5                    | handlers/llm.ts              |
| 11  | `registerCommunityHandlers()`       | 不要           | 6                    | communityHandlers.ts         |
| 12  | `registerWindowHandlers()`          | 必要           | 2                    | windowHandlers.ts            |
| 13  | `registerDialogHandlers()`          | 必要           | 2                    | dialogHandlers.ts            |
| 14  | `registerAuthHandlers()`            | 必要(条件付)   | 5                    | authHandlers.ts              |
| 15  | `registerProfileHandlers()`         | 必要(条件付)   | 11                   | profileHandlers.ts           |
| 16  | `registerAvatarHandlers()`          | 必要(条件付)   | 3                    | avatarHandlers.ts            |
| 17  | `registerAuthFallbackHandlers()`    | 不要(条件付)   | 5                    | ipc/index.ts内               |
| 18  | `registerApiKeyHandlers()`          | 必要           | 4                    | apiKeyHandlers.ts            |
| 19  | `registerHistoryHandlers()`         | 必要           | 4                    | historyHandlers.ts           |
| 20  | `registerAgentExecutionHandlers()`  | 必要           | 8                    | agentHandlers.ts             |
| 21  | `registerSkillHandlers()`           | 必要           | 14                   | skillHandlers.ts             |
| 22  | `registerPermissionStoreHandlers()` | 不要           | 3                    | permission-store-handlers.ts |
| 23  | `registerAuthModeHandlers()`        | 必要           | 4                    | authModeHandlers.ts          |
| 24  | `registerSkillCreatorHandlers()`    | 必要           | 5                    | skillCreatorHandlers.ts      |
| 25  | `registerClaudeCliHandlers()`       | 必要           | 7                    | claude-cli/ipc-handler.ts    |
| 26  | `registerChatEditHandlers()`        | 必要           | 4                    | chatEditHandlers.ts          |

### 集計結果

| 項目                                        | 数値 |
| ------------------------------------------- | ---- |
| ハンドラ登録関数の総数                      | 26   |
| ipcMain.handle() の総呼び出し回数           | 131  |
| mainWindow 引数を必要とする登録関数         | 15   |
| mainWindow 引数を不要とする登録関数         | 11   |
| ipcMain.on() の呼び出し回数                 | 0    |
| IPC_CHANNELS 定数に定義されたチャンネル総数 | 170+ |

### 備考

- `registerAuthHandlers()` / `registerAuthFallbackHandlers()` は Supabase 設定有無で排他的に呼び出される（条件分岐）
- `setupThemeWatcher()` はハンドラ登録ではないが、`registerAllIpcHandlers()` 内で呼ばれており、再登録時の二重呼び出しに注意が必要
- 全ハンドラが `ipcMain.handle()` を使用し、`ipcMain.on()` は使用されていない → 二重登録で全て例外が発生する

---

## Task 3: mainWindowRef の参照方式の確認

### モジュールスコープの mainWindowRef

- `apps/desktop/src/main/index.ts:17`: `export let mainWindowRef: BrowserWindow | null = null`
- activate イベント内で `mainWindowRef = createWindow()` により更新される

### ハンドラ登録関数の mainWindow 使用方式

全15個の mainWindow 引数を受け取る関数は、**クロージャキャプチャ方式**を使用している:

```typescript
export function registerXxxHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle("channel", async (event, args) => {
    // mainWindow をクロージャ変数として参照
    mainWindow.webContents.send("response-channel", data);
  });
}
```

この方式では、関数呼び出し時の `mainWindow` 値がクロージャに閉じ込められるため:

- **初回登録時**: 正しいウィンドウ参照が保持される
- **activate 後に再登録しない場合**: 古い（破棄済み）ウィンドウを参照し続ける → `webContents.send()` が失敗する
- **unregister → register する場合**: 新しいウィンドウ参照が再キャプチャされる → 正常動作

### 結論

mainWindow のクロージャキャプチャ方式により、A案（既存ハンドラ削除後に再登録）が必須。B案（フラグガード）では mainWindow 参照が更新されない。

---

## Task 4: 受入基準の検証

### 機能要件（FR）

| ID     | 要件                                                                         | 抽出済み |
| ------ | ---------------------------------------------------------------------------- | -------- |
| FR-1.1 | macOS で全ウィンドウ閉鎖後にドックアイコンクリック時に例外が発生しないこと   | ✅       |
| FR-1.2 | activate イベント後に新しいウィンドウが作成され IPC 通信が正常に動作すること | ✅       |
| FR-1.3 | 新ウィンドウ作成後、全 IPC ハンドラが新しい mainWindow 参照を使用すること    | ✅       |
| FR-2.1 | ipcMain.handle() で登録されたハンドラの二重登録が発生しないこと              | ✅       |
| FR-2.2 | ipcMain.on() で登録されたリスナーの二重登録が発生しないこと                  | ✅       |
| FR-2.3 | ハンドラ解除時に登録済みの全チャンネルが確実に解除されること                 | ✅       |

### 非機能要件（NFR）

| ID      | 要件                                                   | 抽出済み |
| ------- | ------------------------------------------------------ | -------- |
| NFR-1.1 | 4層防御（L1-L4）が維持されること                       | ✅       |
| NFR-1.2 | ハンドラ解除・再登録中に未認証リクエストが処理されない | ✅       |
| NFR-2.1 | TypeScript コンパイルエラーがないこと                  | ✅       |
| NFR-2.2 | 既存テストが全て PASS すること                         | ✅       |
| NFR-2.3 | 修正に対する単体テストが追加されていること             | ✅       |
| NFR-3.1 | Windows / Linux で既存の動作に影響がないこと           | ✅       |
| NFR-3.2 | 初回起動時の IPC ハンドラ登録フローが変更されないこと  | ✅       |

### 受入基準（AC）

| AC   | シナリオ                               | 定義済み |
| ---- | -------------------------------------- | -------- |
| AC-1 | macOS ドックアイコンクリックで例外なし | ✅       |
| AC-2 | activate 新ウィンドウで IPC 通信が動作 | ✅       |
| AC-3 | 初回起動時の登録フローが正常           | ✅       |
| AC-4 | Windows / Linux で既存動作に影響なし   | ✅       |
| AC-5 | IPC セキュリティが維持                 | ✅       |

---

## 4層防御への影響分析

| 防御層                 | 影響 | 理由                                             |
| ---------------------- | ---- | ------------------------------------------------ |
| L1: ホワイトリスト     | なし | IPC_CHANNELS 定数は変更しない                    |
| L2: Sender検証         | なし | 各ハンドラ内の検証ロジックは変更しない           |
| L3: 引数バリデーション | なし | 各ハンドラ内のバリデーションロジックは変更しない |
| L4: エラーサニタイズ   | なし | エラーレスポンスの形式は変更しない               |

---

## 完了条件チェック

- [x] エラー再現条件（Task 1）が特定されている
- [x] 全ハンドラ登録関数の一覧（Task 2）が完成し、ipcMain.handle() の総数が確定している（131箇所）
- [x] mainWindowRef の参照方式（Task 3）が全関数で確認済み（クロージャキャプチャ方式）
- [x] FR-1, FR-2 の全要件が抽出されている
- [x] NFR-1, NFR-2, NFR-3 の全要件が抽出されている
- [x] AC-1 ~ AC-5 の受入基準が検証可能な形式で定義されている
- [x] 4層防御への影響が分析されている
- [x] 本Phase内の全タスクを100%実行完了
