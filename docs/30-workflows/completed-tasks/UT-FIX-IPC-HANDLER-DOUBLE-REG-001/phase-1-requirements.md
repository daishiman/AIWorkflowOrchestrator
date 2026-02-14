# Phase 1: 要件定義 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 1                                 |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| タスク名     | IPC ハンドラ二重登録例外の修正    |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| 優先度       | 高                                |
| GitHub Issue | #815                              |
| 関連Pitfall  | P5（リスナー二重登録）            |
| 作成日       | 2026-02-14                        |

## 目的

macOS で全ウィンドウ閉鎖後にドックアイコンをクリックした際、`app.on("activate")` イベントが `registerAllIpcHandlers()` を再実行し、`ipcMain.handle()` が同一チャンネルへの二重登録を拒否して例外が発生するバグの要件を分析・定義する。

## 実行タスク

### Task 1: エラー再現条件の特定

- macOS 環境で以下のシナリオを確認する:
  1. アプリケーション起動 → `registerAllIpcHandlers()` が1回目実行される
  2. 全ウィンドウを閉じる（`window-all-closed` イベント発火、macOS では `app.quit()` しない）
  3. ドックアイコンをクリック → `app.on("activate")` イベント発火
  4. `BrowserWindow.getAllWindows().length === 0` の条件分岐を通過
  5. `registerAllIpcHandlers(mainWindowRef)` が2回目実行される
  6. `ipcMain.handle()` が `Error: Attempted to register a second handler for 'file:get-tree'` を送出

### Task 2: 影響範囲の調査

- `registerAllIpcHandlers()` 内から呼び出される全ハンドラ登録関数を列挙する
- 各ハンドラ登録関数内の `ipcMain.handle()` 呼び出し回数を集計する
- `ipcMain.on()` を使用しているハンドラがある場合、それは二重登録で例外が発生しないが、リスナーが二重になるため別途影響があることを記録する

#### 調査対象ハンドラ登録関数（registerAllIpcHandlers 内で呼出）

| 関数名                              | mainWindow 引数  | ipcMain.handle 回数 |
| ----------------------------------- | ---------------- | ------------------- |
| `registerFileHandlers()`            | 不要             | 要調査              |
| `registerStoreHandlers()`           | 不要             | 要調査              |
| `registerDashboardHandlers()`       | 不要             | 要調査              |
| `registerGraphHandlers()`           | 不要             | 要調査              |
| `registerAIHandlers()`              | 不要             | 要調査              |
| `registerThemeHandlers()`           | 不要             | 要調査              |
| `registerWorkspaceHandlers()`       | 不要             | 要調査              |
| `registerSearchHandlers()`          | 不要             | 要調査              |
| `registerFileSelectionHandlers()`   | 不要             | 要調査              |
| `registerLLMHandlers()`             | 不要             | 要調査              |
| `registerCommunityHandlers()`       | 不要             | 要調査              |
| `registerWindowHandlers()`          | 必要             | 要調査              |
| `registerDialogHandlers()`          | 必要             | 要調査              |
| `registerAuthHandlers()`            | 必要             | 要調査              |
| `registerProfileHandlers()`         | 必要             | 要調査              |
| `registerAvatarHandlers()`          | 必要             | 要調査              |
| `registerApiKeyHandlers()`          | 必要             | 要調査              |
| `registerHistoryHandlers()`         | 必要             | 要調査              |
| `registerAgentExecutionHandlers()`  | 必要             | 要調査              |
| `registerSkillHandlers()`           | 必要             | 要調査              |
| `registerPermissionStoreHandlers()` | 不要             | 要調査              |
| `registerAuthModeHandlers()`        | 必要             | 要調査              |
| `registerSkillCreatorHandlers()`    | 必要             | 要調査              |
| `registerClaudeCliHandlers()`       | 必要             | 要調査              |
| `registerChatEditHandlers()`        | 必要             | 要調査              |
| `registerAuthFallbackHandlers()`    | 不要（条件分岐） | 要調査              |

### Task 3: mainWindowRef の参照方式の確認

- `apps/desktop/src/main/index.ts` 行17: `export let mainWindowRef: BrowserWindow | null = null` がモジュールスコープで定義されている
- 各ハンドラ登録関数が `mainWindow` 引数をどのように使用しているか確認する:
  - **クロージャキャプチャ**: 関数内で `mainWindow` をクロージャ変数として保持（新ウィンドウ作成時に古い参照が残る）
  - **直接引数渡し**: `mainWindow.webContents.send()` を関数引数として受け取る（再登録時に新しい参照が渡される）
- `registerAllIpcHandlers()` の引数 `mainWindow: BrowserWindow` は関数呼び出し時の値が閉じ込められるため、ウィンドウ再作成時にハンドラが古いウィンドウ参照を持つリスクがある

### Task 4: 受入基準の明確化

以下の全条件を満たすことを検証する。

## 参照資料

| 資料名                | パス                                    | 説明                               |
| --------------------- | --------------------------------------- | ---------------------------------- |
| Main Process エントリ | `apps/desktop/src/main/index.ts`        | activate イベント処理（行274-278） |
| IPC 登録集約          | `apps/desktop/src/main/ipc/index.ts`    | registerAllIpcHandlers 関数        |
| IPC チャネル定義      | `apps/desktop/src/preload/channels.ts`  | ホワイトリスト定義                 |
| セキュリティ原則      | `.claude/rules/04-electron-security.md` | 4層防御・IPC セキュリティ原則      |
| 既知の落とし穴 P5     | `.claude/rules/06-known-pitfalls.md#P5` | リスナー二重登録の教訓             |
| GitHub Issue          | GitHub Issue #815                       | バグ報告                           |

---

## 機能要件（FR）

### FR-1: activate イベントでの安全な IPC ハンドラ管理

| ID     | 要件                                                                             | 優先度 |
| ------ | -------------------------------------------------------------------------------- | ------ |
| FR-1.1 | macOS で全ウィンドウ閉鎖後にドックアイコンをクリックした際、例外が発生しないこと | 高     |
| FR-1.2 | activate イベント後に新しいウィンドウが作成され、IPC 通信が正常に動作すること    | 高     |
| FR-1.3 | 新ウィンドウ作成後、全 IPC ハンドラが新しい `mainWindow` 参照を使用すること      | 高     |

### FR-2: IPC ハンドラのライフサイクル管理

| ID     | 要件                                                              | 優先度 |
| ------ | ----------------------------------------------------------------- | ------ |
| FR-2.1 | `ipcMain.handle()` で登録されたハンドラの二重登録が発生しないこと | 高     |
| FR-2.2 | `ipcMain.on()` で登録されたリスナーの二重登録が発生しないこと     | 高     |
| FR-2.3 | ハンドラ解除時に登録済みの全チャンネルが確実に解除されること      | 中     |

---

## 非機能要件（NFR）

### NFR-1: セキュリティ

| ID      | 要件                                                                                                         | 優先度 |
| ------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| NFR-1.1 | 修正後も4層防御（L1ホワイトリスト, L2 Sender検証, L3引数バリデーション, L4エラーサニタイズ）が維持されること | 高     |
| NFR-1.2 | ハンドラの解除・再登録中に未認証のリクエストが処理されないこと                                               | 高     |

### NFR-2: 品質

| ID      | 要件                                       | 優先度 |
| ------- | ------------------------------------------ | ------ |
| NFR-2.1 | TypeScript コンパイルエラーがないこと      | 高     |
| NFR-2.2 | 既存テストが全て PASS すること             | 高     |
| NFR-2.3 | 修正に対する単体テストが追加されていること | 高     |

### NFR-3: 互換性

| ID      | 要件                                                  | 優先度 |
| ------- | ----------------------------------------------------- | ------ |
| NFR-3.1 | Windows / Linux で既存の動作に影響がないこと          | 高     |
| NFR-3.2 | 初回起動時の IPC ハンドラ登録フローが変更されないこと | 中     |

---

## 受入基準（AC）

### AC-1: 二重登録例外の解消

```gherkin
Scenario: macOS で全ウィンドウ閉鎖後にドックアイコンをクリックしても例外が発生しない
  Given アプリケーションが起動済みで IPC ハンドラが登録済みである
  And   全てのウィンドウが閉じられている（macOS でアプリは終了していない）
  When  ドックアイコンをクリックする（activate イベント発火）
  Then  新しいウィンドウが作成されること
  And   "Attempted to register a second handler" 例外が発生しないこと
  And   全ての IPC チャンネルが正常に応答すること
```

### AC-2: 新ウィンドウへの参照更新

```gherkin
Scenario: activate で作成された新ウィンドウで IPC 通信が動作する
  Given activate イベントで新しいウィンドウが作成された
  When  Renderer プロセスから IPC メッセージを送信する
  Then  ハンドラ内の mainWindow 参照が新しいウィンドウを指していること
  And   mainWindow.webContents.send() が新しいウィンドウに送信されること
```

### AC-3: 初回起動フローの維持

```gherkin
Scenario: 初回起動時の IPC ハンドラ登録が正常に動作する
  Given アプリケーションが初めて起動される
  When  app.whenReady() が解決する
  Then  registerAllIpcHandlers() が1回だけ呼ばれること
  And   全チャンネルのハンドラが正常に登録されること
```

### AC-4: 全プラットフォーム互換性

```gherkin
Scenario: Windows / Linux で既存動作に影響がない
  Given Windows または Linux 環境である
  When  アプリケーションを起動する
  Then  IPC ハンドラが正常に登録されること
  And   window-all-closed で app.quit() が呼ばれること（activate は発火しない）
```

### AC-5: セキュリティ維持

```gherkin
Scenario: 修正後も IPC セキュリティが維持される
  Given IPC ハンドラが登録済みである
  When  ホワイトリストに含まれないチャンネルでリクエストする
  Then  リクエストが拒否されること
  And   4層防御の各レイヤーが機能していること
```

---

## エラーの技術的分析

### 発生メカニズム

```
[初回起動]
app.whenReady() → createWindow() → registerAllIpcHandlers(mainWindow)
  → ipcMain.handle("file:get-tree", handler)  ← 成功（初回登録）

[activate イベント（macOS ドックアイコンクリック）]
app.on("activate") → BrowserWindow.getAllWindows().length === 0
  → createWindow() → registerAllIpcHandlers(mainWindow)
    → ipcMain.handle("file:get-tree", handler)  ← 例外発生（二重登録）
```

### Electron API の仕様

| API                | 二重登録時の挙動                      |
| ------------------ | ------------------------------------- |
| `ipcMain.handle()` | 例外送出（同一チャンネルに2つ目不可） |
| `ipcMain.on()`     | 許可（リスナーが複数登録される）      |

### 影響範囲の概算

- `registerAllIpcHandlers()` 内で呼び出される登録関数: 約26個
- `ipcMain.handle()` の総呼び出し回数（全ハンドラファイル合算）: 約171箇所
- mainWindow 引数を必要とする登録関数: 約15個

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/manual-test-result.md` の手動テスト観点に反映する。
- `app.on("activate")` 再初期化シナリオ（unregister → createWindow → register）の確認観点を維持する。

## 成果物

| 成果物     | パス                                       | 説明                           |
| ---------- | ------------------------------------------ | ------------------------------ |
| 要件分析書 | `outputs/phase-1/requirements-analysis.md` | 本ドキュメントの実行結果を記録 |

---

## 完了条件

- [ ] エラー再現条件（Task 1）が特定されている
- [ ] 全ハンドラ登録関数の一覧（Task 2）が完成し、ipcMain.handle() の総数が確定している
- [ ] mainWindowRef の参照方式（Task 3）がクロージャ/直接引数のいずれかが全関数で確認済みである
- [ ] FR-1, FR-2 の全要件が抽出されている
- [ ] NFR-1, NFR-2, NFR-3 の全要件が抽出されている
- [ ] AC-1 ~ AC-5 の受入基準が検証可能な形式で定義されている
- [ ] 4層防御への影響が分析されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 2: 設計
