# Phase 12 成果物: 実装ガイド

## Part 1（中学生向け）

### まず、なぜ必要か

画面のボタンを押したとき、裏側の処理に正しく伝わらないと「押したのに反応しない」「別の動きになる」が起きます。  
今回はこのズレをなくすために、画面から裏側までの連絡ルールをそろえました。

### 日常の例え

学校の放送に例えると、次の役割分担です。

- 画面: 放送を聞く教室
- preload: 放送室の受付
- main: 放送を実行する職員室

放送室の受付で「誰から来たか」「内容が正しいか」を確認してから職員室に渡すので、いたずら放送や聞き間違いを減らせます。

### この機能でできること

| 機能                   | 説明                             | 例                                            |
| ---------------------- | -------------------------------- | --------------------------------------------- |
| 通知履歴の取得         | 過去の通知を一覧で取れる         | 既読/未読の通知をまとめて確認                 |
| 通知の既読化・全既読化 | 1件または全件を既読にできる      | 「新着通知だけ読む」を実現                    |
| 履歴検索               | 過去データを条件で探せる         | チャット履歴だけを絞る                        |
| 画面切り替え導線       | AppDock から新ビューへ移動できる | `workspace` / `skillCenter` / `historySearch` |

## Part 2（技術者向け）

### 型/インターフェース

```ts
// Main IPC
export interface NotificationHandlerOptions {
  mainWindow?: BrowserWindow;
  validateSender?: (
    event: IpcMainInvokeEvent,
    channel: string,
  ) => IPCValidationResult;
}

export interface HistorySearchHandlerOptions {
  mainWindow?: BrowserWindow;
  validateSender?: (
    event: IpcMainInvokeEvent,
    channel: string,
  ) => IPCValidationResult;
}

// Renderer Store
export interface NotificationSlice {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (input: Omit<Notification, "id" | "isRead">) => void;
}

export interface HistorySearchSlice {
  historySearchQuery: string;
  searchHistory: (query: string, offset?: number) => Promise<void>;
  loadMoreHistory: () => Promise<void>;
}
```

### APIシグネチャ（Main / Preload）

```ts
// Main
registerNotificationHandlers(service, { mainWindow });
registerHistorySearchHandlers(service, { mainWindow });

// Preload
notification.getHistory({ limit?: number, offset?: number });
notification.markRead({ notificationId: string });
notification.markAllRead();
notification.clear();
notification.onNew((event) => void);

historySearch.search({ query, filter, limit, offset });
historySearch.getStats();
```

### エラーハンドリング方針

- sender 検証失敗: `toIPCValidationError` を返却
- 入力値不正: `VALIDATION_ERROR` を返却
- 実行時例外: `sanitizeErrorMessage(error, fallbackMessage)` で内部情報を除去して返却

### エッジケース

- `notificationId` は P42 三段検証（型/空文字/空白文字）
- `query` は空文字・空白のみを「全件検索」として許容
- `filter` は `all | chat | file | skill` のみ許可
- Renderer 側で API 未注入時は `historySearch APIが利用できません` を表示

### 設定可能パラメータ/定数

| 項目                              | 値    | 用途                   |
| --------------------------------- | ----- | ---------------------- |
| `DEFAULT_LIMIT`（notification）   | `50`  | 通知履歴取得の既定件数 |
| `DEFAULT_OFFSET`（notification）  | `0`   | 通知履歴取得の開始位置 |
| `DEFAULT_LIMIT`（history search） | `30`  | 履歴検索の既定件数     |
| `MAX_NOTIFICATIONS`               | `100` | Store 内通知保持の上限 |
