# Phase 4 テストケース一覧

| TC-ID    | 区分         | 対象                  | 観点                                      |
| -------- | ------------ | --------------------- | ----------------------------------------- |
| TC-04-01 | 正常         | notificationSlice     | 追加と未読件数更新                        |
| TC-04-02 | 正常         | notificationSlice     | markAsRead/markAllAsRead                  |
| TC-04-03 | 境界         | notificationSlice     | 100件上限（既読優先削除）                 |
| TC-04-04 | 境界         | notificationSlice     | 既読なし時に未読最古削除                  |
| TC-04-05 | 正常         | historySearchSlice    | applySearchResponseでpagination/stats更新 |
| TC-04-06 | 異常         | historySearchSlice    | failSearchでerror保持                     |
| TC-04-07 | 正常         | notificationHandlers  | get-history 応答                          |
| TC-04-08 | 異常         | notificationHandlers  | mark-read 未認証拒否                      |
| TC-04-09 | 異常         | notificationHandlers  | mark-read ID未指定                        |
| TC-04-10 | 正常         | historySearchHandlers | history:search 成功                       |
| TC-04-11 | 異常         | historySearchHandlers | history:search query空                    |
| TC-04-12 | セキュリティ | handlers              | invalid sender 拒否                       |
| TC-04-13 | 契約         | channels.ts           | 新規チャネル定義/許可集合                 |
