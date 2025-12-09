# IPC sender検証要件定義書

## 概要

| 項目           | 内容                           |
| -------------- | ------------------------------ |
| ドキュメントID | SEC-IPC                        |
| 対象タスク     | T-00-3: IPC sender検証要件定義 |
| 作成日         | 2025-12-09                     |
| ステータス     | 完了                           |

## 目的

IPC通信の呼び出し元検証要件を明文化し、不正なウィンドウからのアクセスを防止するための仕様を定義する。これにより、悪意のあるwebContentsからのIPC呼び出しによるセキュリティリスクを軽減する。

## 現状分析

### 既存実装の確認

現在の`apps/desktop/src/main/ipc/authHandlers.ts`では、IPC handlersで`event.sender`の検証が行われていない：

```typescript
ipcMain.handle(
  IPC_CHANNELS.AUTH_LOGIN,
  async (
    _, // event は使用されていない
    { provider }: { provider: string },
  ): Promise<IPCResponse<void>> => {
    // sender検証なしで処理を実行
    // ...
  },
);
```

### 問題点

| ID      | 問題                                     | リスク                                      |
| ------- | ---------------------------------------- | ------------------------------------------- |
| IPC-P01 | IPC呼び出し元のwebContents検証がない     | 悪意のあるスクリプトからのIPC呼び出しが可能 |
| IPC-P02 | メインウィンドウ以外からのアクセスを許可 | サブウィンドウやDevToolsからの不正操作      |
| IPC-P03 | 不正アクセス時のログ出力がない           | セキュリティインシデントの検出が困難        |
| IPC-P04 | sender検証の共通化がない                 | 各ハンドラーでの重複実装リスク              |

## 機能要件

### 必須要件

| ID         | 要件                                 | 優先度 | 根拠                               |
| ---------- | ------------------------------------ | ------ | ---------------------------------- |
| SEC-IPC-01 | IPC呼び出し元のwebContents検証       | 必須   | 不正なスクリプトからの呼び出し防止 |
| SEC-IPC-02 | 不正な呼び出し元からのリクエスト拒否 | 必須   | セキュリティ境界の確立             |
| SEC-IPC-03 | 認証関連全channelへの検証適用        | 必須   | 認証機能の保護                     |

### 推奨要件

| ID         | 要件                       | 優先度 | 根拠                         |
| ---------- | -------------------------- | ------ | ---------------------------- |
| SEC-IPC-04 | セキュリティログ出力       | 推奨   | インシデント検出・監視       |
| SEC-IPC-05 | 全IPC handlersへの検証適用 | 推奨   | 一貫したセキュリティポリシー |

## 検証対象IPC Channels

### 認証関連（必須）

| Channel名              | ハンドラーファイル   | 優先度 |
| ---------------------- | -------------------- | ------ |
| `auth:login`           | `authHandlers.ts`    | 必須   |
| `auth:logout`          | `authHandlers.ts`    | 必須   |
| `auth:get-session`     | `authHandlers.ts`    | 必須   |
| `auth:refresh`         | `authHandlers.ts`    | 必須   |
| `auth:check-online`    | `authHandlers.ts`    | 推奨   |
| `profile:get`          | `profileHandlers.ts` | 必須   |
| `profile:update`       | `profileHandlers.ts` | 必須   |
| `profile:getProviders` | `profileHandlers.ts` | 推奨   |
| `profile:linkProvider` | `profileHandlers.ts` | 必須   |

### その他（将来対応）

| Channel名 | ハンドラーファイル | 優先度 |
| --------- | ------------------ | ------ |
| `file:*`  | `fileHandlers.ts`  | 将来   |
| `ai:*`    | `aiHandlers.ts`    | 将来   |

## 検証ロジック仕様

### 検証フロー

```
┌─────────────────────────────────────────────────────────────┐
│                    IPC Handler Invoked                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. event.sender (webContents) を取得                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. BrowserWindow.fromWebContents(sender) で親ウィンドウ取得 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────┴─────────────────┐
            │         ウィンドウが存在？         │
            └─────────────────┬─────────────────┘
                    ┌─────────┴─────────┐
                   YES                  NO
                    │                    │
                    ▼                    ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│ 3. 許可リストと照合        │  │ ログ出力: Unknown sender  │
│    (メインウィンドウか?)   │  │ エラー返却: Unauthorized  │
└───────────────────────────┘  └───────────────────────────┘
            │
            ▼
  ┌─────────┴─────────┐
  │   許可リストに存在? │
  └─────────┬─────────┘
      ┌─────┴─────┐
     YES         NO
      │           │
      ▼           ▼
┌──────────┐  ┌──────────────────────┐
│ 処理続行  │  │ ログ: Unauthorized   │
│          │  │ エラー返却           │
└──────────┘  └──────────────────────┘
```

### 許可条件

| 条件                                        | 判定   |
| ------------------------------------------- | ------ |
| メインウィンドウのwebContentsからの呼び出し | 許可   |
| webContentsがnull                           | 拒否   |
| 対応するBrowserWindowが存在しない           | 拒否   |
| DevToolsからの呼び出し                      | 拒否   |
| サブウィンドウからの呼び出し                | 要検討 |

## エラーハンドリング仕様

### エラーレスポンス形式

```typescript
interface IPCValidationError {
  success: false;
  error: {
    code: "IPC_UNAUTHORIZED";
    message: "Unauthorized IPC call";
  };
}
```

### エラーコード

| コード             | 説明                                     | HTTP相当 |
| ------------------ | ---------------------------------------- | -------- |
| `IPC_UNAUTHORIZED` | 認証されていないIPC呼び出し              | 401      |
| `IPC_FORBIDDEN`    | 許可されていないウィンドウからの呼び出し | 403      |

## ログ出力仕様

### ログフォーマット

```typescript
interface SecurityLog {
  timestamp: string; // ISO 8601形式
  level: "warn" | "error"; // ログレベル
  category: "security"; // カテゴリ
  event: string; // イベント名
  details: {
    channel: string; // IPC channel名
    webContentsId: number; // webContents ID
    windowId: number | null; // BrowserWindow ID
    reason: string; // 拒否理由
  };
}
```

### ログ出力例

```
[Security] IPC call rejected: auth:login
  - webContentsId: 123
  - windowId: null
  - reason: No associated BrowserWindow found
```

### ログレベル

| ケース                          | レベル  |
| ------------------------------- | ------- |
| 不明なwebContentsからの呼び出し | `warn`  |
| 頻繁な不正アクセス試行          | `error` |
| DevToolsからの呼び出し          | `warn`  |

## テスト要件

### ユニットテスト

| テストID | シナリオ                        | 期待結果          |
| -------- | ------------------------------- | ----------------- |
| IPC-T01  | 有効なwebContentsからの呼び出し | 検証通過（true）  |
| IPC-T02  | 不明なwebContentsからの呼び出し | 検証失敗（false） |
| IPC-T03  | nullのwebContents               | 検証失敗（false） |
| IPC-T04  | BrowserWindowが存在しない       | 検証失敗（false） |
| IPC-T05  | 不正アクセス時のログ出力        | ログが記録される  |

### 統合テスト

| テストID | シナリオ                     | 期待結果                    |
| -------- | ---------------------------- | --------------------------- |
| IPC-I01  | 正常なログインフロー         | 認証が成功する              |
| IPC-I02  | 検証失敗時のエラーレスポンス | IPCResponse形式でエラー返却 |

## 実装上の考慮事項

### パフォーマンス

- 検証は各IPC呼び出しで実行されるため、軽量に保つ
- BrowserWindow.fromWebContents は O(n) のため、ウィンドウ数が多い場合は注意

### 後方互換性

- 既存のIPC呼び出しに影響を与えない
- 検証失敗時は適切なエラーレスポンスを返却

### テスト容易性

- validateIpcSender関数は単体でテスト可能な純粋関数として設計
- モック化しやすいインターフェース

## 完了条件

- [x] 検証すべきIPC channelsが特定されている
- [x] 許可するwebContentsの条件が定義されている
- [x] 不正アクセス時のエラーハンドリングが定義されている
- [x] セキュリティログの出力仕様が定義されている
- [x] テスト要件が定義されている

## 関連ドキュメント

- `apps/desktop/src/main/ipc/authHandlers.ts`
- `apps/desktop/src/main/ipc/profileHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- [Electron Security: IPC](https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages)
