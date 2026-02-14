# Phase 5: 実装（TDD Green） - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 5                                 |
| Phase名      | 実装（TDD Green）                 |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| タスク名     | IPC ハンドラ二重登録例外の修正    |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| 優先度       | 高                                |
| GitHub Issue | #815                              |
| 関連Pitfall  | P5（リスナー二重登録）            |
| 前提Phase    | Phase 4（テスト作成 / TDD Red）   |
| 後続Phase    | Phase 6（テスト拡充）             |
| ステータス   | 未実施                            |
| 作成日       | 2026-02-14                        |

---

## 目的

Phase 4 で作成した Red 状態のテストを全て Green（成功）にする最小限の実装を行う。`unregisterAllIpcHandlers()` 関数の追加と、`main/index.ts` の activate イベントハンドラの修正により、IPC ハンドラ二重登録例外を解消する。

## 背景

現状、`app.on("activate")` イベントで `registerAllIpcHandlers()` が再実行されると、`ipcMain.handle()` が同一チャンネルへの二重登録を拒否して例外を送出する。修正方針は「再登録前に全ハンドラを解除する」アプローチを採用する。

---

## 実行タスク

- タスク実行: 本Phaseで定義したタスクを上から順に実行し、結果を成果物に記録する。

### タスク 1: mainWindowRef の参照方式確認

`apps/desktop/src/main/index.ts` の `mainWindowRef` がモジュールスコープ変数（行17: `export let mainWindowRef: BrowserWindow | null = null`）として定義されていることを確認し、以下の点を検証する:

- `registerAllIpcHandlers(mainWindow)` の引数がクロージャに閉じ込められるハンドラ登録関数が存在するか
- 再登録時に新しい `mainWindow` 参照が正しく各ハンドラに渡されるか
- 既存の `unregister*` 関数を持つハンドラモジュールのパターンを確認する（`unregisterAuthModeHandlers`, `unregisterSkillHandlers` 等）

**確認対象ファイル**:

| ファイル                             | 確認事項                              |
| ------------------------------------ | ------------------------------------- |
| `apps/desktop/src/main/index.ts`     | mainWindowRef のスコープと参照方式    |
| `apps/desktop/src/main/ipc/index.ts` | registerAllIpcHandlers の引数伝搬     |
| 各ハンドラファイル（26個）           | mainWindow のクロージャキャプチャ有無 |

---

### タスク 2: `ipc/index.ts` に `unregisterAllIpcHandlers()` 関数を追加

**修正ファイル**: `apps/desktop/src/main/ipc/index.ts`

**実装方針**:

1. 既存の個別 `unregister*` 関数（13個が既に存在）を呼び出す
2. 個別 `unregister*` 関数が存在しないハンドラモジュールに対しては、`ipcMain.removeHandler()` を直接呼び出す
3. `ipcMain.on()` で登録されたリスナーは `ipcMain.removeAllListeners()` で解除する
4. `setupThemeWatcher` で登録された `nativeTheme` のリスナーも解除する

**実装すべき関数シグネチャ**:

```typescript
/**
 * 全ての IPC ハンドラを解除する
 * activate イベントでの再登録前に呼び出す
 */
export function unregisterAllIpcHandlers(): void {
  // 1. 既存の unregister 関数を持つモジュールの解除
  // unregisterSkillHandlers()
  // unregisterAgentExecutionHandlers()
  // unregisterPermissionStoreHandlers()
  // unregisterAuthModeHandlers()
  // unregisterSkillCreatorHandlers()
  // unregisterChatEditHandlers()
  // unregisterFileSelectionHandlers()
  // unregisterAuthKeyHandlers()
  // unregisterSlideSettingsHandlers()
  // unregisterSystemPromptHandlers()
  // unregisterPermissionHandlers()
  // unregisterEnvironmentHandlers()
  // unregisterSessionPersistenceHandlers()
  // 2. unregister 関数がないモジュールの直接解除
  // ipcMain.removeHandler(IPC_CHANNELS.FILE_GET_TREE)
  // ipcMain.removeHandler(IPC_CHANNELS.FILE_READ)
  // ... 全チャンネルに対して removeHandler を呼び出す
  // 3. ipcMain.on() で登録されたリスナーの解除（該当がある場合）
  // 4. nativeTheme リスナーの解除
}
```

**既存の unregister 関数が存在するモジュール（13個）**:

| モジュール                     | unregister 関数名                        |
| ------------------------------ | ---------------------------------------- |
| skillHandlers.ts               | `unregisterSkillHandlers()`              |
| agentHandlers.ts               | `unregisterAgentExecutionHandlers()`     |
| agentHandlers.ts               | `unregisterEnvironmentHandlers()`        |
| permission-store-handlers.ts   | `unregisterPermissionStoreHandlers()`    |
| session-persistence-handler.ts | `unregisterSessionPersistenceHandlers()` |
| slideSettingsHandlers.ts       | `unregisterSlideSettingsHandlers()`      |
| systemPromptHandlers.ts        | `unregisterSystemPromptHandlers()`       |
| authModeHandlers.ts            | `unregisterAuthModeHandlers()`           |
| skillCreatorHandlers.ts        | `unregisterSkillCreatorHandlers()`       |
| chatEditHandlers.ts            | `unregisterChatEditHandlers()`           |
| fileSelectionHandlers.ts       | `unregisterFileSelectionHandlers()`      |
| authKeyHandlers.ts             | `unregisterAuthKeyHandlers()`            |
| permission-handlers.ts         | `unregisterPermissionHandlers()`         |

**unregister 関数が存在しないモジュール（直接 removeHandler が必要）**:

| モジュール           | 対象チャンネル（IPC_CHANNELS 定数参照）                      |
| -------------------- | ------------------------------------------------------------ |
| fileHandlers.ts      | FILE_GET_TREE, FILE_READ, FILE_WRITE, FILE_RENAME 等         |
| storeHandlers.ts     | STORE_GET, STORE_SET, STORE_GET_SECURE, STORE_SET_SECURE     |
| dashboardHandlers.ts | DASHBOARD_GET_STATS, DASHBOARD_GET_ACTIVITY                  |
| graphHandlers.ts     | GRAPH_GET, GRAPH_REFRESH                                     |
| aiHandlers.ts        | AI_CHAT, AI_CHECK_CONNECTION, AI_INDEX                       |
| themeHandlers.ts     | THEME_GET, THEME_SET, THEME_GET_SYSTEM                       |
| workspaceHandlers.ts | WORKSPACE_LOAD, WORKSPACE_SAVE 等                            |
| searchHandlers.ts    | SEARCH_FILE_EXECUTE, SEARCH_WORKSPACE_EXECUTE 等             |
| llm/index.ts         | LLM_GET_PROVIDERS, LLM_CHECK_HEALTH, LLM_SEND_CHAT 等        |
| communityHandlers.ts | COMMUNITY_GET_ALL, COMMUNITY_GET_BY_LEVEL 等                 |
| windowHandlers.ts    | WINDOW_GET_STATE, APP_GET_VERSION                            |
| dialogHandlers.ts    | DIALOG_SHOW_OPEN, DIALOG_SHOW_SAVE                           |
| authHandlers.ts      | AUTH_LOGIN, AUTH_LOGOUT, AUTH_GET_SESSION 等                 |
| profileHandlers.ts   | PROFILE_GET, PROFILE_UPDATE 等                               |
| avatarHandlers.ts    | AVATAR_UPLOAD, AVATAR_USE_PROVIDER, AVATAR_REMOVE            |
| apiKeyHandlers.ts    | API_KEY_SAVE, API_KEY_DELETE, API_KEY_VALIDATE, API_KEY_LIST |
| historyHandlers.ts   | HISTORY_GET_FILE_HISTORY 等                                  |
| claude-cli/index.ts  | CLAUDE_CLI_CHECK_INSTALLATION 等                             |

---

### タスク 3: `main/index.ts` の activate イベントハンドラ修正

**修正ファイル**: `apps/desktop/src/main/index.ts`（行274-278）

**現在のコード（行274-278）**:

```typescript
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindowRef = createWindow();
    registerAllIpcHandlers(mainWindowRef);
  }
});
```

**修正後のコード**:

```typescript
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    unregisterAllIpcHandlers();
    mainWindowRef = createWindow();
    registerAllIpcHandlers(mainWindowRef);
  }
});
```

**修正のポイント**:

- `registerAllIpcHandlers()` の前に `unregisterAllIpcHandlers()` を呼び出す
- `import { registerAllIpcHandlers, unregisterAllIpcHandlers } from "./ipc"` に import を追加する
- 新ウィンドウ作成（`createWindow()`）の前に解除を行う（ハンドラ解除中にウィンドウが存在しない状態を許容する）

---

### タスク 4: 既知 Pitfall 対策の実装

#### P5: リスナー二重登録防止

- `unregisterAllIpcHandlers()` で `ipcMain.removeHandler()` と `ipcMain.removeAllListeners()` を使い分ける
- `ipcMain.handle()` で登録されたハンドラは `ipcMain.removeHandler(channel)` で解除
- `ipcMain.on()` で登録されたリスナーは `ipcMain.removeAllListeners(channel)` で解除
- `setupThemeWatcher` の `nativeTheme.on("updated", ...)` リスナーは `nativeTheme.removeAllListeners("updated")` で解除

#### NFR-1.2: セキュリティ維持

- ハンドラ解除→再登録の間は IPC リクエストを処理できないが、この期間はウィンドウが存在しないため Renderer からのリクエストは発生しない
- `unregisterAllIpcHandlers()` と `registerAllIpcHandlers()` は同期的に実行されるため、競合状態は発生しない

---

## 参照資料

| 資料名                   | パス                                                                          | 説明                                |
| ------------------------ | ----------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 要件定義         | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-1-requirements.md` | FR-1, FR-2, AC-1 ~ AC-5             |
| Phase 4 テストファイル   | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`         | Green にすべきテストケース          |
| IPC 登録集約             | `apps/desktop/src/main/ipc/index.ts`                                          | registerAllIpcHandlers 関数         |
| Main Process エントリ    | `apps/desktop/src/main/index.ts`                                              | activate イベント処理（行274-278）  |
| 既存 unregister パターン | `apps/desktop/src/main/ipc/authModeHandlers.ts`（行337-346）                  | unregisterAuthModeHandlers の実装例 |
| 既知の落とし穴 P5        | `.claude/rules/06-known-pitfalls.md#P5`                                       | リスナー二重登録の教訓              |

---

## 実行手順

1. **タスク 1**: `mainWindowRef` の参照方式と各ハンドラの `mainWindow` 使用パターンを確認する
2. **タスク 2**: `apps/desktop/src/main/ipc/index.ts` に `unregisterAllIpcHandlers()` 関数を追加する
   - 既存の `unregister*` 関数を import して呼び出す
   - unregister 関数がないモジュールのチャンネルは `ipcMain.removeHandler()` で直接解除する
   - `nativeTheme` リスナーの解除処理を追加する
3. **タスク 3**: `apps/desktop/src/main/index.ts` の activate イベントハンドラに `unregisterAllIpcHandlers()` の呼び出しを追加する
4. **タスク 4**: P5 対策として `ipcMain.on()` リスナーの解除が漏れていないことを確認する
5. Phase 4 のテストを実行し、全テストが Green であることを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts
   ```
6. 既存テストに影響がないことを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/
   ```
7. TypeScript コンパイルエラーがないことを確認する:
   ```bash
   pnpm typecheck
   ```

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/manual-test-result.md` の手動テスト観点に反映する。
- `app.on("activate")` 再初期化シナリオ（unregister → createWindow → register）の確認観点を維持する。

## 成果物

| 成果物                  | パス                                 | 説明                              |
| ----------------------- | ------------------------------------ | --------------------------------- |
| IPC 登録集約（修正済）  | `apps/desktop/src/main/ipc/index.ts` | unregisterAllIpcHandlers 関数追加 |
| Main エントリ（修正済） | `apps/desktop/src/main/index.ts`     | activate イベントハンドラの修正   |

---

## 完了条件

- [ ] `unregisterAllIpcHandlers()` が `apps/desktop/src/main/ipc/index.ts` に追加されている
- [ ] `unregisterAllIpcHandlers()` が既存の13個の `unregister*` 関数を呼び出している
- [ ] unregister 関数がないモジュールのチャンネルが `ipcMain.removeHandler()` で直接解除されている
- [ ] `apps/desktop/src/main/index.ts` の activate イベントハンドラに `unregisterAllIpcHandlers()` が追加されている
- [ ] `unregisterAllIpcHandlers` が `./ipc` から import されている
- [ ] Phase 4 のテスト（TC-01 ~ TC-08）が全て Green（成功）状態である
- [ ] 既存の IPC ハンドラテスト（`apps/desktop/src/main/ipc/__tests__/` 配下）が全て PASS する
- [ ] `pnpm typecheck` が TypeScript コンパイルエラーなしで完了する
- [ ] P5（リスナー二重登録）対策が実装されている
- [ ] `ipcMain.on()` で登録されたリスナーの解除が漏れていない
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 6: テスト拡充
