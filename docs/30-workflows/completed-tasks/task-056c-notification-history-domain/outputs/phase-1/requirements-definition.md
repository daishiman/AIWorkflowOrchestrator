# Phase 1 要件定義書

## 実施サマリー

- 実施日: 2026-03-05
- 対象タスク: `TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN`
- 実施方式: 仕様書別 SubAgent 分担（要件/設計/実装/QA）

## 機能要件

| ID    | 要件                                                                                                                                     | 判定方法                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| FR-01 | Renderer Store に `notificationSlice` を追加し、通知一覧・未読件数・フィルタ状態を保持できること                                         | Slice 単体テスト                    |
| FR-02 | 通知履歴は最大100件を保持し、上限超過時は既読優先で削除できること                                                                        | Slice 単体テスト                    |
| FR-03 | Renderer Store に `historySearchSlice` を追加し、検索条件・結果・統計・ページングを保持できること                                        | Slice 単体テスト                    |
| FR-04 | Main IPC に `history:search` / `history:get-stats` を追加できること                                                                      | Handler 単体テスト                  |
| FR-05 | Main IPC に `notification:get-history` / `notification:mark-read` / `notification:mark-all-read` / `notification:clear` を追加できること | Handler 単体テスト                  |
| FR-06 | Preload API で history/notification の invoke API を安全公開できること                                                                   | preload/channels テスト + typecheck |
| FR-07 | 更新系通知IPCは認証未完了時に拒否できること                                                                                              | Handler 単体テスト                  |
| FR-08 | `registerAllIpcHandlers` で新規ハンドラが登録されること                                                                                  | 実装差分レビュー                    |

## 非機能要件

| ID     | 要件                                                          | 備考                                              |
| ------ | ------------------------------------------------------------- | ------------------------------------------------- |
| NFR-01 | IPC は sender 検証を必須とする                                | `INVALID_SENDER` を返却                           |
| NFR-02 | Preload はホワイトリスト経由でのみ公開する                    | `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` |
| NFR-03 | 型安全を維持し `pnpm --filter @repo/desktop typecheck` を通す | PASS済み                                          |
| NFR-04 | 追加実装に対する単体テストを作成し回帰を防止する              | 37 tests PASS                                     |

## 統合要件（Phase 1〜11連携）

- API接続: history/notification の双方向契約を Main-Preload-Renderer で整合させる。
- 認証フロー: 通知更新系 IPC は `AUTH_REQUIRED` を返す。
- データフロー: Notification は event (`notification:new`) と invoke を分離、HistorySearch は invoke 経路に統一。
