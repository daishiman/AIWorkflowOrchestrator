# T-01-3: IPC検証設計検証レポート

## 検証概要

| 項目             | 内容                                                             |
| ---------------- | ---------------------------------------------------------------- |
| タスクID         | T-01-3                                                           |
| 検証日           | 2025-12-09                                                       |
| 対象ファイル     | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` |
| 使用エージェント | .claude/agents/electron-security.md                                               |
| 判定             | **PASS**                                                         |

---

## 完了条件チェックリスト

| 完了条件                                                             | 判定 | 確認箇所                       |
| -------------------------------------------------------------------- | :--: | ------------------------------ |
| webContentsからBrowserWindowが取得できることを検証していることを確認 |  ✅  | `validateIpcSender()` L186-203 |
| DevToolsからの呼び出しが拒否されることを確認                         |  ✅  | L207-226                       |
| 許可ウィンドウリストとの照合が行われることを確認                     |  ✅  | L228-246                       |
| セキュリティログが出力されることを確認                               |  ✅  | `logSecurityEvent()` L107-129  |

---

## 設計検証詳細

### 1. BrowserWindow検証

#### 検証結果: ✅ PASS

**コード確認** (`validateIpcSender()` L186-203):

```typescript
// Step 1: webContentsからBrowserWindowを取得
const sourceWindow = BrowserWindow.fromWebContents(sender);

if (!sourceWindow) {
  const result = createFailureResult(
    IPC_ERROR_CODES.UNAUTHORIZED,
    IPC_ERROR_MESSAGES.NO_BROWSER_WINDOW,
    webContentsId,
    null,
  );
  logSecurityEvent(
    options.logger,
    channel,
    result,
    LOG_REASONS.NO_BROWSER_WINDOW,
  );
  return result;
}
```

**検証ポイント**:

- `BrowserWindow.fromWebContents()` でソースウィンドウを特定 ✅
- ウィンドウが見つからない場合は `IPC_UNAUTHORIZED` エラー ✅
- セキュリティログ出力 ✅

---

### 2. DevTools検証

#### 検証結果: ✅ PASS

**コード確認** (`validateIpcSender()` L207-226):

```typescript
// Step 2: DevToolsからの呼び出しチェック
if (sender.getType() === "webview" || sender.isDevToolsOpened()) {
  const isFromDevTools = sourceWindow.webContents.id !== webContentsId;

  if (isFromDevTools) {
    const result = createFailureResult(
      IPC_ERROR_CODES.FORBIDDEN,
      IPC_ERROR_MESSAGES.FROM_DEVTOOLS,
      webContentsId,
      windowId,
    );
    logSecurityEvent(
      options.logger,
      channel,
      result,
      LOG_REASONS.FROM_DEVTOOLS,
    );
    return result;
  }
}
```

**検証ロジック**:

| 条件               | 検証方法                                        | 結果       |
| ------------------ | ----------------------------------------------- | ---------- |
| webview タイプ     | `sender.getType() === "webview"`                | 追加検証へ |
| DevTools開いている | `sender.isDevToolsOpened()`                     | 追加検証へ |
| ID不一致           | `sourceWindow.webContents.id !== webContentsId` | 拒否       |

**重要**: DevToolsが開いていても、メインウィンドウからの呼び出し（ID一致）は許可される

---

### 3. 許可ウィンドウリスト検証

#### 検証結果: ✅ PASS

**コード確認** (`validateIpcSender()` L228-246):

```typescript
// Step 3: 許可されたウィンドウリストとの照合
const allowedWindows = options.getAllowedWindows();
const isAllowed = allowedWindows.some((w) => w.id === windowId);

if (!isAllowed) {
  const result = createFailureResult(
    IPC_ERROR_CODES.FORBIDDEN,
    IPC_ERROR_MESSAGES.UNAUTHORIZED_WINDOW,
    webContentsId,
    windowId,
  );
  logSecurityEvent(
    options.logger,
    channel,
    result,
    LOG_REASONS.NOT_IN_ALLOWED_LIST,
  );
  return result;
}
```

**検証ポイント**:

- `getAllowedWindows()` コールバックで許可ウィンドウを動的取得 ✅
- ウィンドウIDベースでの照合 ✅
- 許可リストにない場合は `IPC_FORBIDDEN` エラー ✅

---

### 4. セキュリティログ出力

#### 検証結果: ✅ PASS

**コード確認** (`logSecurityEvent()` L107-129):

```typescript
function logSecurityEvent(
  logger: SecurityLogger | undefined,
  channel: string,
  result: IPCValidationResult,
  reason: string,
): void {
  if (!logger) return;

  const event: SecurityLogEvent = {
    timestamp: new Date().toISOString(),
    level: "warn",
    category: "security",
    event: "ipc_validation_failed",
    details: {
      channel,
      webContentsId: result.webContentsId ?? -1,
      windowId: result.windowId ?? null,
      reason,
    },
  };

  logger.warn(`[Security] IPC call rejected: ${channel}`, event.details);
}
```

**ログ内容**:

| フィールド    | 説明                  | 例                                  |
| ------------- | --------------------- | ----------------------------------- |
| timestamp     | ISO形式タイムスタンプ | `2025-12-09T10:30:00.000Z`          |
| level         | ログレベル            | `warn`                              |
| category      | カテゴリ              | `security`                          |
| event         | イベント種別          | `ipc_validation_failed`             |
| channel       | IPCチャンネル名       | `auth:login`                        |
| webContentsId | 呼び出し元ID          | `100`                               |
| windowId      | ウィンドウID          | `1` or `null`                       |
| reason        | 拒否理由              | `No associated BrowserWindow found` |

---

## 検証フロー図

```
┌─────────────────────────────────────────────────────────┐
│                    IPC Call                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Step 1: BrowserWindow.fromWebContents(sender)          │
│  → BrowserWindowが取得できるか？                         │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌───────────┴───────────┐
         │                       │
         ▼ null                  ▼ window
┌─────────────────┐    ┌─────────────────────────────────┐
│ UNAUTHORIZED    │    │  Step 2: DevTools Check          │
│ エラー返却       │    │  → DevToolsからの呼び出し？       │
│ + ログ出力      │    └─────────────────────────────────┘
└─────────────────┘              │
                      ┌─────────┴─────────┐
                      │                   │
                      ▼ Yes (ID不一致)     ▼ No
         ┌─────────────────┐    ┌─────────────────────────┐
         │ FORBIDDEN       │    │  Step 3: 許可リスト照合  │
         │ エラー返却       │    │  → 許可リストに含まれる？ │
         │ + ログ出力      │    └─────────────────────────┘
         └─────────────────┘              │
                               ┌─────────┴─────────┐
                               │                   │
                               ▼ No                ▼ Yes
              ┌─────────────────┐    ┌─────────────────┐
              │ FORBIDDEN       │    │ 検証成功         │
              │ エラー返却       │    │ valid: true     │
              │ + ログ出力      │    └─────────────────┘
              └─────────────────┘
```

---

## ユーティリティ機能

### toIPCValidationError()

検証結果をIPCResponse形式に変換:

```typescript
export function toIPCValidationError(result: IPCValidationResult): {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
```

### withValidation()

既存handlerにラップして検証を追加:

```typescript
export function withValidation<T extends unknown[], R>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: T) => Promise<R>,
  options: IPCValidationOptions,
): (
  event: IpcMainInvokeEvent,
  ...args: T
) => Promise<R | ReturnType<typeof toIPCValidationError>>;
```

**使用例**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.AUTH_LOGIN,
  withValidation(
    IPC_CHANNELS.AUTH_LOGIN,
    async (event, { provider }) => {
      // 認証処理
    },
    { getAllowedWindows: () => [mainWindow] },
  ),
);
```

---

## Electronセキュリティベストプラクティス適合

### Electron公式ガイドライン準拠

| ガイドライン                                                                                                                               | 準拠状況 | 実装方法                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ | :------: | -------------------------------- |
| [17. IPCメッセージの送信者を検証する](https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages) |    ✅    | `validateIpcSender()`            |
| DevToolsからの呼び出し拒否                                                                                                                 |    ✅    | webContents ID比較               |
| 許可ウィンドウの明示的指定                                                                                                                 |    ✅    | `getAllowedWindows` コールバック |

### 追加セキュリティ対策

| 対策                 | 実装状況 | 効果                   |
| -------------------- | :------: | ---------------------- |
| セキュリティログ出力 |    ✅    | 不正アクセス検知・監査 |
| 構造化ログイベント   |    ✅    | ログ分析・アラート     |
| handlerラッパー      |    ✅    | 検証の一貫した適用     |

---

## テスト網羅性

### テストファイル: `ipc-validator.test.ts`

| テストカテゴリ                | テスト数 | 網羅状況 |
| ----------------------------- | :------: | :------: |
| 正常系 - 許可されたウィンドウ |    3     |    ✅    |
| 異常系 - BrowserWindow不在    |    2     |    ✅    |
| 異常系 - 許可リスト外         |    2     |    ✅    |
| 異常系 - DevTools             |    4     |    ✅    |
| セキュリティログ              |    2     |    ✅    |
| toIPCValidationError          |    3     |    ✅    |
| withValidation                |    6     |    ✅    |
| 型エクスポート                |    4     |    ✅    |
| セキュリティ要件              |    2     |    ✅    |

**特に重要なテストケース**:

1. **DevTools拒否テスト** (L211-258):
   - DevToolsからの呼び出しはFORBIDDENエラー
   - webviewタイプからの呼び出し検証
   - DevToolsが開いていてもメインウィンドウからは許可

2. **認証系channel全てでの検証テスト** (L596-626):
   - auth:login, auth:logout, auth:get-session, auth:refresh
   - profile:get, profile:update, profile:linkProvider

---

## エラーコード定義

| コード             | 説明             | 発生条件                    |
| ------------------ | ---------------- | --------------------------- |
| `IPC_UNAUTHORIZED` | 認証されていない | BrowserWindowが見つからない |
| `IPC_FORBIDDEN`    | アクセス禁止     | DevTools、未許可ウィンドウ  |

---

## 判定結果

### 総合判定: **PASS**

全ての完了条件を満たしており、Electronセキュリティガイドライン[17]に準拠しています。

| 判定項目           | 結果 |
| ------------------ | :--: |
| BrowserWindow検証  |  ✅  |
| DevTools拒否       |  ✅  |
| 許可リスト照合     |  ✅  |
| セキュリティログ   |  ✅  |
| テスト網羅性       |  ✅  |
| ユーティリティ提供 |  ✅  |
