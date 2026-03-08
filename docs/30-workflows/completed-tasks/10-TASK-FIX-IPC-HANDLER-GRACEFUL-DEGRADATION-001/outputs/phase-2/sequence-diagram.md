# シーケンス図: IPC Handler Graceful Degradation

## メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| タスクID | 10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| Phase    | 2 - 設計                                         |
| 作成日   | 2026-03-08                                       |

## 1. 正常系シーケンス（全ハンドラ登録成功）

```
main.ts                    registerAllIpcHandlers          safeRegister             registerXxxHandlers
  |                               |                            |                         |
  |-- registerAllIpcHandlers() -->|                            |                         |
  |                               |-- safeRegister("File") --->|                         |
  |                               |                            |-- registerFileHandlers() -->|
  |                               |                            |<-- (success) --------------|
  |                               |<-- null -------------------|                         |
  |                               |                            |                         |
  |                               |-- safeRegister("Store") -->|                         |
  |                               |                            |-- registerStoreHandlers() ->|
  |                               |                            |<-- (success) --------------|
  |                               |<-- null -------------------|                         |
  |                               |                            |                         |
  |                               |   ... (残り約28個のハンドラ) ...                      |
  |                               |                            |                         |
  |                               |-- console.info("All 30 handler groups registered") --|
  |                               |                            |                         |
  |<-- IpcHandlerRegistrationResult { successCount: 30, failureCount: 0, failures: [] } |
  |                               |                            |                         |
```

## 2. 異常系シーケンス（一部ハンドラ登録失敗）

```
main.ts                    registerAllIpcHandlers          safeRegister             registerXxxHandlers
  |                               |                            |                         |
  |-- registerAllIpcHandlers() -->|                            |                         |
  |                               |-- safeRegister("File") --->|                         |
  |                               |                            |-- registerFileHandlers() -->|
  |                               |                            |<-- (success) --------------|
  |                               |<-- null -------------------|                         |
  |                               |                            |                         |
  |                               |-- safeRegister("Skill") -->|                         |
  |                               |                            |-- registerSkillHandlers() ->|
  |                               |                            |<-- THROW Error! ------------|
  |                               |                            |                         |
  |                               |                            |-- console.error(          |
  |                               |                            |     "[IPC] Failed to      |
  |                               |                            |      register: Skill")    |
  |                               |                            |                         |
  |                               |<-- HandlerRegistrationFailure { ... } -------------|
  |                               |-- failures.push(failure)   |                         |
  |                               |                            |                         |
  |                               |-- safeRegister("Chain") -->|                         |
  |                               |                            |-- registerSkillChainHandlers() ->|
  |                               |                            |<-- (success) -------------------|
  |                               |<-- null -------------------|                         |
  |                               |                            |                         |
  |                               |-- console.warn("1/30 handler groups failed") -------|
  |                               |                            |                         |
  |<-- IpcHandlerRegistrationResult { successCount: 29, failureCount: 1, failures: [..] } |
  |                               |                            |                         |
```

## 3. 依存関係失敗の連鎖シーケンス

```
main.ts                    registerAllIpcHandlers          safeRegister
  |                               |                            |
  |-- registerAllIpcHandlers() -->|                            |
  |                               |                            |
  |                               |  --- authKeyService 初期化 ---
  |                               |-- safeRegister             |
  |                               |   ("initAuthKeyService") ->|
  |                               |                            |-- createAuthKeyStorage()
  |                               |                            |<-- THROW Error!
  |                               |                            |-- console.error(...)
  |                               |<-- failure (authKeyService = null) ---|
  |                               |                            |
  |                               |  --- Skill ハンドラ登録（authKeyService 依存） ---
  |                               |-- safeRegister             |
  |                               |   ("registerSkillHandlers") ->|
  |                               |                            |-- new SkillService(...)
  |                               |                            |-- registerSkillHandlers(mainWindow, skillService, authKeyService!)
  |                               |                            |   ^^ authKeyService is null → TypeError
  |                               |                            |<-- THROW TypeError!
  |                               |                            |-- console.error(...)
  |                               |<-- failure ----------------|
  |                               |                            |
  |                               |  --- 独立ハンドラ（影響なし） ---
  |                               |-- safeRegister             |
  |                               |   ("registerPermissionStore") ->|
  |                               |                            |-- registerPermissionStoreHandlers(...)
  |                               |                            |<-- (success)
  |                               |<-- null -------------------|
  |                               |                            |
  |                               |-- console.warn("2/30 handler groups failed") ---|
  |                               |                            |
  |<-- IpcHandlerRegistrationResult { successCount: 28, failureCount: 2, failures: [...] } |
```

## 4. themeWatcher 個別管理シーケンス

```
main.ts                    registerAllIpcHandlers          setupThemeWatcher
  |                               |                            |
  |-- registerAllIpcHandlers() -->|                            |
  |                               |                            |
  |                               |  --- themeWatcher（safeRegister 外） ---
  |                               |-- try {                    |
  |                               |     setupThemeWatcher() -->|
  |                               |                            |-- nativeTheme.on(...)
  |                               |                            |<-- unsubscribe function
  |                               |     themeWatcherUnsubscribe = unsubscribe
  |                               |   }                        |
  |                               |                            |
  |                               |  --- 失敗ケース ---
  |                               |-- try {                    |
  |                               |     setupThemeWatcher() -->|
  |                               |                            |<-- THROW Error!
  |                               |   } catch {                |
  |                               |     console.error(...)     |
  |                               |     failures.push(...)     |
  |                               |     // themeWatcherUnsubscribe は null のまま
  |                               |   }                        |
  |                               |                            |
  |                               |  --- 後続ハンドラは正常に継続 ---
```

## 5. unregisterAllIpcHandlers との連携（変更なし）

```
main.ts                    unregisterAllIpcHandlers        ipcMain
  |                               |                            |
  |-- unregisterAllIpcHandlers() ->|                           |
  |                               |-- unregisterAuthKeyHandlers() |
  |                               |                            |
  |                               |-- for (channel of IPC_CHANNELS) {
  |                               |     removeHandler(channel) ->|
  |                               |                            |<-- OK (未登録でもエラーなし)
  |                               |     removeAllListeners(ch) ->|
  |                               |                            |<-- OK
  |                               |   }                        |
  |                               |                            |
  |                               |-- if (themeWatcherUnsubscribe) {
  |                               |     themeWatcherUnsubscribe()  // null の場合はスキップ
  |                               |   }                        |
  |                               |                            |
  |<-- (void) ------------------- |                            |
```
