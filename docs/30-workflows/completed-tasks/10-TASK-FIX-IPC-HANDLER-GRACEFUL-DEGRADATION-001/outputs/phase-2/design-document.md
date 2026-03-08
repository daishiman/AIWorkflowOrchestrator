# 設計書: IPC Handler Graceful Degradation

## メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| タスクID | 10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| Phase    | 2 - 設計                                         |
| 作成日   | 2026-03-08                                       |

## 1. safeRegister ヘルパー関数設計

### 1.1 関数シグネチャ

```typescript
function safeRegister(
  handlerName: string,
  registerFn: () => void,
): HandlerRegistrationFailure | null;
```

### 1.2 動作仕様

1. `registerFn()` を try-catch 内で実行する
2. 正常完了時: `null` を返却する
3. 例外発生時:
   a. `console.error` で `[IPC] Failed to register handler: ${handlerName}` とエラー詳細を出力
   b. `HandlerRegistrationFailure` オブジェクトを生成して返却する

### 1.3 実装イメージ

```typescript
function safeRegister(
  handlerName: string,
  registerFn: () => void,
): HandlerRegistrationFailure | null {
  try {
    registerFn();
    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[IPC] Failed to register handler: ${handlerName} -`,
      message,
    );
    return {
      handlerName,
      error,
      errorCode: 4001,
      message,
    };
  }
}
```

### 1.4 設計判断

- **モジュールスコープ関数**: エクスポートしない内部ヘルパー。テスト時は `registerAllIpcHandlers` の戻り値経由で間接的に検証する
- **同期関数**: 全ての `registerXxxHandlers()` は同期関数であるため、`safeRegister` も同期
- **errorCode 固定値**: 全てのハンドラ登録失敗は Infrastructure Error（4001）に分類する。ハンドラごとに異なるコードを振る必要はない（登録処理自体はインフラ操作）

## 2. registerAllIpcHandlers リファクタリング構造

### 2.1 全体構造

```typescript
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
): IpcHandlerRegistrationResult {
  const failures: HandlerRegistrationFailure[] = [];

  const collect = (result: HandlerRegistrationFailure | null): void => {
    if (result !== null) {
      failures.push(result);
    }
  };

  // --- Group 1: 依存なしハンドラ（11個） ---
  collect(safeRegister("registerFileHandlers", () => registerFileHandlers()));
  collect(safeRegister("registerStoreHandlers", () => registerStoreHandlers()));
  // ... 省略（registerDashboardHandlers 〜 registerCommunityHandlers）

  // --- Group 2: mainWindow 依存ハンドラ（2個） ---
  collect(
    safeRegister("registerWindowHandlers", () =>
      registerWindowHandlers(mainWindow),
    ),
  );
  collect(
    safeRegister("registerDialogHandlers", () =>
      registerDialogHandlers(mainWindow),
    ),
  );

  // --- Group 3: themeWatcher（safeRegister 外で個別管理） ---
  try {
    themeWatcherUnsubscribe = setupThemeWatcher(nativeTheme, () =>
      BrowserWindow.getAllWindows(),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[IPC] Failed to setup theme watcher -", message);
    failures.push({
      handlerName: "setupThemeWatcher",
      error,
      errorCode: 4001,
      message,
    });
  }

  // --- Group 4: Supabase 条件分岐 ---
  // getSupabaseClient 自体の例外も隔離
  let supabase: ReturnType<typeof getSupabaseClient> = null;
  try {
    supabase = getSupabaseClient();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[IPC] Failed to get Supabase client -", message);
    failures.push({
      handlerName: "getSupabaseClient",
      error,
      errorCode: 4001,
      message,
    });
  }

  if (supabase) {
    collect(
      safeRegister("registerAuthHandlers", () => {
        /* ... */
      }),
    );
    collect(
      safeRegister("registerProfileHandlers", () => {
        /* ... */
      }),
    );
    collect(
      safeRegister("registerAvatarHandlers", () => {
        /* ... */
      }),
    );
  } else if (!failures.some((f) => f.handlerName === "getSupabaseClient")) {
    // Supabase が構成されていない場合（例外ではなく null 返却の場合）
    collect(
      safeRegister("registerAuthFallbackHandlers", () =>
        registerAuthFallbackHandlers(),
      ),
    );
  }

  // --- Group 5: apiKeyStorage ---
  collect(
    safeRegister("registerApiKeyHandlers", () => {
      /* ... */
    }),
  );

  // --- Group 6: History 系（3個） ---
  collect(
    safeRegister("registerHistoryHandlers", () => {
      /* ... */
    }),
  );
  collect(
    safeRegister("registerHistorySearchHandlers", () => {
      /* ... */
    }),
  );
  collect(
    safeRegister("registerNotificationHandlers", () => {
      /* ... */
    }),
  );

  // --- Group 7: Agent ---
  collect(
    safeRegister("registerAgentExecutionHandlers", () => {
      /* ... */
    }),
  );

  // --- Group 8: AuthKey + Skill 系 ---
  // authKeyService 初期化の例外を隔離
  let authKeyService: AuthKeyService | null = null;
  collect(
    safeRegister("initAuthKeyService", () => {
      const authKeyStorage = createAuthKeyStorage();
      authKeyService = new AuthKeyService(authKeyStorage);
    }),
  );

  // authKeyService 依存ハンドラ: authKeyService が null の場合も
  // safeRegister 内で例外が発生して失敗として記録される
  collect(
    safeRegister("registerSkillHandlers", () => {
      /* skillService 初期化 + 登録 */
    }),
  );
  // ... 省略

  // --- Group 9-15: 残りのハンドラ群 ---
  // 各グループを safeRegister でラップ

  // --- ログ出力 ---
  const totalCount = failures.length + 登録成功数;
  if (failures.length === 0) {
    console.info(
      `[IPC] All ${totalCount} handler groups registered successfully`,
    );
  } else {
    const failedNames = failures.map((f) => f.handlerName).join(", ");
    console.warn(
      `[IPC] ${failures.length}/${totalCount} handler groups failed to register: ${failedNames}`,
    );
  }

  return {
    successCount: totalCount - failures.length,
    failureCount: failures.length,
    failures,
  };
}
```

### 2.2 ハンドラグループ分割方針

現行コードの依存関係に基づき、以下のグループに分割する。各グループ内で共有する初期化処理がある場合は、1つの `safeRegister` ブロックにまとめるか、初期化を先行させて結果を変数に保持する。

| グループ | ハンドラ                                                                                   | 依存                         | safeRegister 単位      |
| -------- | ------------------------------------------------------------------------------------------ | ---------------------------- | ---------------------- |
| G1       | File, Store, Dashboard, Graph, AI, Theme, Workspace, Search, FileSelection, LLM, Community | なし                         | 各1つずつ（11個）      |
| G2       | Window, Dialog                                                                             | mainWindow                   | 各1つずつ（2個）       |
| G3       | setupThemeWatcher                                                                          | nativeTheme                  | 個別 try-catch（1個）  |
| G4       | Auth, Profile, Avatar / AuthFallback                                                       | Supabase                     | 初期化1 + 登録3（4個） |
| G5       | ApiKey                                                                                     | apiKeyStorage                | 1個                    |
| G6       | History, HistorySearch, Notification                                                       | historyService               | 1個（初期化 + 登録3）  |
| G7       | AgentExecution                                                                             | mainWindow                   | 1個                    |
| G8       | authKeyService 初期化                                                                      | authKeyStorage               | 1個                    |
| G9       | Skill, SkillFile, SkillShare, SkillDebug                                                   | authKeyService, skillService | 1個（初期化 + 登録4）  |
| G10      | SkillSchedule                                                                              | skillService                 | 1個                    |
| G11      | SkillDocs                                                                                  | skillFileManager             | 1個                    |
| G12      | SkillAnalytics                                                                             | なし                         | 1個                    |
| G13      | SkillChain                                                                                 | skillService                 | 1個                    |
| G14      | PermissionStore                                                                            | なし                         | 1個                    |
| G15      | AuthKey, AuthMode                                                                          | authKeyService               | 1個                    |
| G16      | SkillCreator                                                                               | なし                         | 1個                    |
| G17      | ClaudeCLI                                                                                  | mainWindow                   | 1個                    |
| G18      | ChatEdit                                                                                   | なし                         | 1個                    |

**合計 safeRegister 呼び出し数**: 約30個（初期化含む）

### 2.3 依存関係のあるグループの処理

依存元の初期化が失敗した場合、依存先のハンドラ登録は必然的に失敗する（`null` 参照エラー等）。この場合も `safeRegister` が例外をキャッチして失敗情報に蓄積する。

明示的な依存スキップは導入しない理由:

- `safeRegister` のキャッチで十分に安全
- スキップロジックを追加すると複雑性が増す
- 失敗理由がログに記録されるため、デバッグに支障はない

ただし、`authKeyService` のように複数のグループで共有される依存は、初期化を独立した `safeRegister` で行い、結果を `let` 変数に保持する。依存先が `null` の場合は `safeRegister` 内で自然にエラーとなる。

## 3. ログ出力設計

### 3.1 ログレベルと出力タイミング

| タイミング             | レベル          | フォーマット                                                                   |
| ---------------------- | --------------- | ------------------------------------------------------------------------------ |
| 個別ハンドラ登録失敗   | `console.error` | `[IPC] Failed to register handler: {handlerName} - {errorMessage}`             |
| 全登録完了（失敗あり） | `console.warn`  | `[IPC] {failCount}/{totalCount} handler groups failed to register: {nameList}` |
| 全登録完了（全成功）   | `console.info`  | `[IPC] All {totalCount} handler groups registered successfully`                |

### 3.2 ログ出力例

```
// 個別失敗
[IPC] Failed to register handler: registerSkillHandlers - Cannot read properties of null (reading 'scanAvailableSkills')

// サマリー（失敗あり）
[IPC] 2/30 handler groups failed to register: registerSkillHandlers, registerSkillScheduleHandlers

// サマリー（全成功）
[IPC] All 30 handler groups registered successfully
```

### 3.3 セキュリティ考慮

- エラーメッセージにはAPIキー、トークン、パスワード等の機密情報を含めない
- `error.message` のみを出力し、`error.stack` は出力しない（開発時のデバッグでは DevTools で確認可能）

## 4. unregisterAllIpcHandlers との整合性

### 4.1 変更不要の根拠

`unregisterAllIpcHandlers()` は以下の動作をする:

1. `unregisterAuthKeyHandlers()` を呼び出す
2. `IPC_CHANNELS` の全チャンネルに対して `ipcMain.removeHandler()` と `ipcMain.removeAllListeners()` を実行
3. `themeWatcherUnsubscribe` を呼び出す

**ポイント**: `ipcMain.removeHandler()` は未登録チャンネルに対しても例外を投げない（Electron の仕様）。そのため、一部のハンドラが未登録であっても安全に全チャンネルを走査できる。

### 4.2 themeWatcherUnsubscribe の整合性

- `setupThemeWatcher` が例外で失敗した場合、`themeWatcherUnsubscribe` は `null` のまま
- `unregisterAllIpcHandlers` は `if (themeWatcherUnsubscribe)` で null チェックしているため安全
- 追加の変更は不要

## 5. エラーコード体系

| コード | カテゴリ             | 用途                                       | リトライ |
| ------ | -------------------- | ------------------------------------------ | -------- |
| 4001   | Infrastructure Error | IPC ハンドラ登録失敗（全てのハンドラ共通） | 可能     |

「リトライ可能」は将来のリトライ機構導入時に活用する情報。本タスクではリトライは実装しない。
