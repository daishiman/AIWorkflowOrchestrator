# Phase 4: テストケース一覧

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-4-2                        |
| フェーズ   | Phase 4                         |
| 作成日     | 2026-01-25                      |
| 機能名     | PermissionResolver IPC Handlers |
| ステータス | 完了                            |

---

## 1. IPC Handlerテスト (permission-handlers.test.ts)

### 1.1 registerPermissionHandlers

| TC-ID  | テスト名                                          | 入力                                  | 期待結果                 |
| ------ | ------------------------------------------------- | ------------------------------------- | ------------------------ |
| PH-001 | should register skill:permission-response handler | mainWindow, permissionResolver        | ipcMain.handleが呼ばれる |
| PH-002 | should call resolveRequest when response received | {requestId, approved: true}           | resolveRequest呼び出し   |
| PH-003 | should validate sender from allowed window        | event.sender = mainWindow.webContents | 正常処理                 |
| PH-004 | should reject sender from unknown window          | event.sender = unknownWebContents     | IPC_VALIDATION_ERROR     |

### 1.2 unregisterPermissionHandlers

| TC-ID  | テスト名                            | 入力 | 期待結果                      |
| ------ | ----------------------------------- | ---- | ----------------------------- |
| PH-005 | should remove handler on unregister | -    | ipcMain.removeHandler呼び出し |

### 1.3 sendPermissionRequest

| TC-ID  | テスト名                           | 入力                    | 期待結果                 |
| ------ | ---------------------------------- | ----------------------- | ------------------------ |
| PH-006 | should send request to renderer    | SkillPermissionRequest  | webContents.send呼び出し |
| PH-007 | should skip if window is destroyed | destroyed window        | 送信スキップ（ログ出力） |
| PH-008 | should include all request fields  | request with all fields | 全フィールドが送信される |

---

## 2. Preload APIテスト (skill-api.permission.test.ts)

### 2.1 onPermissionRequest

| TC-ID  | テスト名                                        | 入力                   | 期待結果                   |
| ------ | ----------------------------------------------- | ---------------------- | -------------------------- |
| PA-001 | should register listener for permission-request | callback               | ipcRenderer.on呼び出し     |
| PA-002 | should return unsubscribe function              | -                      | removeListener呼び出し可能 |
| PA-003 | should call callback when request received      | SkillPermissionRequest | callbackが呼ばれる         |
| PA-004 | should reject non-whitelisted channel           | invalid channel        | エラーログ出力             |

### 2.2 sendPermissionResponse

| TC-ID  | テスト名                                  | 入力                    | 期待結果                   |
| ------ | ----------------------------------------- | ----------------------- | -------------------------- |
| PA-005 | should invoke permission-response channel | SkillPermissionResponse | ipcRenderer.invoke呼び出し |
| PA-006 | should return success result              | valid response          | {success: true}            |

---

## 3. usePermissionDialog Hookテスト (usePermissionDialog.test.ts)

### 3.1 初期化

| TC-ID  | テスト名                                   | 入力 | 期待結果              |
| ------ | ------------------------------------------ | ---- | --------------------- |
| HD-001 | should initialize with null currentRequest | -    | currentRequest = null |
| HD-002 | should initialize with closed state        | -    | isOpen = false        |
| HD-003 | should initialize with empty queue         | -    | requestQueue = []     |

### 3.2 購読管理

| TC-ID  | テスト名                      | 入力    | 期待結果                    |
| ------ | ----------------------------- | ------- | --------------------------- |
| HD-004 | should subscribe on mount     | -       | onPermissionRequest呼び出し |
| HD-005 | should unsubscribe on unmount | unmount | unsubscribe関数呼び出し     |

### 3.3 リクエスト処理

| TC-ID  | テスト名                                 | 入力                   | 期待結果                          |
| ------ | ---------------------------------------- | ---------------------- | --------------------------------- |
| HD-006 | should open dialog when request received | SkillPermissionRequest | isOpen = true, currentRequest設定 |
| HD-007 | should queue multiple requests           | 2 requests             | requestQueue.length = 2           |
| HD-008 | should show next request after response  | respond to first       | currentRequest = second           |

### 3.4 応答処理

| TC-ID  | テスト名                             | 入力          | 期待結果            |
| ------ | ------------------------------------ | ------------- | ------------------- |
| HD-009 | should send approved response        | respond(true) | approved: true送信  |
| HD-010 | should send denied response on close | close()       | approved: false送信 |

---

## 4. PermissionDialogテスト (PermissionDialog.test.tsx)

### 4.1 表示制御

| TC-ID  | テスト名                                 | 入力          | 期待結果          |
| ------ | ---------------------------------------- | ------------- | ----------------- |
| PD-001 | should not render when isOpen is false   | isOpen: false | role="dialog"なし |
| PD-002 | should render dialog when isOpen is true | isOpen: true  | role="dialog"あり |
| PD-003 | should not render when request is null   | request: null | 何も表示されない  |

### 4.2 コンテンツ表示

| TC-ID  | テスト名                                     | 入力              | 期待結果           |
| ------ | -------------------------------------------- | ----------------- | ------------------ |
| PD-004 | should display tool name                     | toolName: "Bash"  | "Bash"が表示される |
| PD-005 | should display args as JSON                  | args: {cmd: "ls"} | JSON形式で表示     |
| PD-006 | should display reason when provided          | reason: "Test"    | "Test"が表示される |
| PD-007 | should hide reason section when not provided | reason: undefined | 理由セクションなし |

### 4.3 ユーザー操作

| TC-ID  | テスト名                                      | 入力           | 期待結果        |
| ------ | --------------------------------------------- | -------------- | --------------- |
| PD-008 | should call onAllow when allow button clicked | click 許可     | onAllow呼び出し |
| PD-009 | should call onDeny when deny button clicked   | click 拒否     | onDeny呼び出し  |
| PD-010 | should call onDeny on Escape key              | keydown Escape | onDeny呼び出し  |
| PD-011 | should call onClose on overlay click          | click overlay  | onClose呼び出し |

### 4.4 アクセシビリティ

| TC-ID  | テスト名                              | 入力         | 期待結果                     |
| ------ | ------------------------------------- | ------------ | ---------------------------- |
| PD-012 | should have aria-modal attribute      | -            | aria-modal="true"            |
| PD-013 | should have aria-labelledby attribute | -            | aria-labelledby設定          |
| PD-014 | should focus allow button on open     | isOpen: true | 許可ボタンにフォーカス       |
| PD-015 | should trap focus within dialog       | Tab key      | ダイアログ内でフォーカス循環 |

---

## 5. 統合テスト (permission-integration.test.ts)

### 5.1 正常フロー

| TC-ID  | テスト名                                   | 入力                   | 期待結果                            |
| ------ | ------------------------------------------ | ---------------------- | ----------------------------------- |
| PI-001 | should send request to Renderer via IPC    | SkillPermissionRequest | webContents.send呼び出し            |
| PI-002 | should resolve with approved=true on allow | allow response         | Promise resolve with approved=true  |
| PI-003 | should resolve with approved=false on deny | deny response          | Promise resolve with approved=false |

### 5.2 エラーハンドリング

| TC-ID  | テスト名                                  | 入力                | 期待結果       |
| ------ | ----------------------------------------- | ------------------- | -------------- |
| PI-004 | should reject with timeout error          | timeout超過         | TimeoutError   |
| PI-005 | should cancel request when signal aborted | AbortSignal.abort() | キャンセル処理 |

### 5.3 複数リクエスト

| TC-ID  | テスト名                                 | 入力                      | 期待結果          |
| ------ | ---------------------------------------- | ------------------------- | ----------------- |
| PI-006 | should handle multiple requests in order | 3 concurrent requests     | FIFO順で処理      |
| PI-007 | should show next request after response  | respond to first of 2     | 2件目が表示される |
| PI-008 | should handle rapid responses            | quick allow/deny sequence | 全て正常処理      |

---

## 6. テストケースサマリー

| カテゴリ    | テスト数 |
| ----------- | -------- |
| IPC Handler | 8        |
| Preload API | 6        |
| Hook        | 10       |
| Component   | 15       |
| Integration | 8        |
| **合計**    | **47**   |

---

## 7. 完了チェックリスト

- [x] 全テストケースがTDD: Red状態で実装される
- [x] 境界値テストが含まれている
- [x] エラーハンドリングテストが含まれている
- [x] アクセシビリティテストが含まれている
- [x] **本Phase内のテストケース定義タスクを100%実行完了**
