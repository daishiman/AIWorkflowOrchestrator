# Phase 4 成果物: テスト仕様書

## 対象

- Store Slice
- Main IPC Handlers
- Preload Channel Allowlist
- AppDock View遷移

## テストケース

| 区分    | ファイル                                        | 主な観点                            |
| ------- | ----------------------------------------------- | ----------------------------------- |
| Store   | `notificationSlice.test.ts`                     | 追加/既読化/削除/カウント同期       |
| Store   | `historySearchSlice.test.ts`                    | 検索/追補/エラー/リセット           |
| IPC     | `notificationHandlers.test.ts`                  | P42検証、sender拒否、clear/markRead |
| IPC     | `historySearchHandlers.test.ts`                 | P42検証、filter検証、sender拒否     |
| Preload | `channels.ui-01-store-ipc-architecture.test.ts` | invoke/on allowlist登録             |
| UI      | `AppDock.test.tsx`                              | 新ViewType導線                      |

## Red定義

- 実装前に上記ケースが失敗することを確認してから実装へ進む。
