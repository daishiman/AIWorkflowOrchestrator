# Phase 5 ドメイン契約書

## 1. 担当SubAgentと責務

| SubAgent                       | 担当                             | 実装反映                                                                |
| ------------------------------ | -------------------------------- | ----------------------------------------------------------------------- |
| SA-01 Notification Domain Lead | 通知状態遷移・既読制御・push連携 | `notificationSlice.ts`, `notificationHandlers.ts`, `NotificationCenter` |
| SA-02 History Domain Lead      | 検索/フィルタ/統計/ページング    | `historySearchSlice.ts`, `HistorySearchView`                            |
| SA-03 Persistence Architect    | 履歴同期・件数制御・復元順       | `setNotificationHistory`, 初期`getHistory`同期                          |
| SA-04 Security Reviewer        | sender検証・入力検証・sanitize   | `notificationHandlers.ts`, `historySearchHandlers.ts`                   |

## 2. IPC契約（7チャネル）

| Channel                      | 方向     | Request                            | Response / Payload                                           | 実装                                      |
| ---------------------------- | -------- | ---------------------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| `notification:get-history`   | invoke   | `{ limit?, offset? }`              | `{ success, data?: { notifications, totalCount }, error? }`  | Main handler + NotificationCenter初期同期 |
| `notification:mark-read`     | invoke   | `{ notificationId }`               | `{ success, data?: { updated }, error? }`                    | Main handler + NotificationCenter既読操作 |
| `notification:mark-all-read` | invoke   | `なし`                             | `{ success, data?: { updatedCount }, error? }`               | Main handler + NotificationCenter全既読   |
| `notification:clear`         | invoke   | `なし`                             | `{ success, data?: { deletedCount }, error? }`               | Main handler + NotificationCenter全削除   |
| `notification:new`           | on(push) | callback登録                       | `{ notification }`                                           | `emitNotificationNew` + `onNew`購読/解除  |
| `history:search`             | invoke   | `{ query, filter, limit, offset }` | `{ success, data?: { items, totalCount, hasMore }, error? }` | Main handler + HistorySearchView検索      |
| `history:get-stats`          | invoke   | `なし`                             | `{ success, data?: { chat, file, skill, total }, error? }`   | Main handler + HistorySearchView統計      |

## 3. Notification状態契約

| 状態                            | 更新アクション                                                                                                                                  | 不変条件                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------ |
| `notifications: Notification[]` | `addNotification`, `ingestNotification`, `setNotificationHistory`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `clearAllNotifications` | 時刻降順、ID重複なし、100件上限                 |
| `unreadCount: number`           | 上記全更新で再計算                                                                                                                              | 常に `isRead=false` 件数と一致                  |
| `isPopoverOpen: boolean`        | `setPopoverOpen`                                                                                                                                | UI開閉のみ担当                                  |
| `expandedNotificationId: string | null`                                                                                                                                           | `setExpandedNotificationId`, delete/clear時解放 | 存在しないIDを保持しない |

### pushイベント契約

1. Mainが `emitNotificationNew` でpayload時刻正規化。
2. Renderer `notification.onNew` で受信。
3. `ingestNotification` を1回実行してStoreを更新。
4. unmount時に`unsubscribe()`を必ず実行。

## 4. HistorySearch状態契約

| 状態                                             | 更新アクション                                           | 不変条件                    |
| ------------------------------------------------ | -------------------------------------------------------- | --------------------------- |
| `historySearchQuery`                             | `setHistorySearchQuery`, `searchHistory`                 | 直近検索クエリと一致        |
| `historySearchFilter`                            | `setHistorySearchFilter`, `searchHistory`                | `all/chat/file/skill` のみ  |
| `historySearchResults`                           | `searchHistory`, `loadMoreHistory`, `resetHistorySearch` | 追補時は連結、resetで空配列 |
| `historySearchTotalCount`                        | `searchHistory`                                          | API返却値に一致             |
| `historySearchHasMore`                           | `searchHistory`, `loadMoreHistory`, `resetHistorySearch` | 表示件数とtotalの整合を維持 |
| `isHistorySearching`                             | `searchHistory`, `loadMoreHistory`                       | 実行中のみ `true`           |
| `historySearchError`                             | `searchHistory`                                          | 失敗時のみ文言を保持        |
| `historySearchStats` / `historySearchStatsError` | `loadHistorySearchStats`                                 | 成功時更新/失敗時エラー保持 |

## 5. エラー契約

- invoke返却は全チャネル `success/data/error` 形式を維持。
- `notificationId` と `query` は P42（型/空文字/trim空白）検証。
- sender不正は `toIPCValidationError` で拒否。
- 内部例外は `sanitizeErrorMessage` で内部情報を隠蔽。

## 6. 実装完了判定

- 7チャネル契約を実装へ反映済み。
- Notification/HistorySearchの状態遷移をコード・UI・テストで整合済み。
- push購読解除（リーク防止）をテストで検証済み。
