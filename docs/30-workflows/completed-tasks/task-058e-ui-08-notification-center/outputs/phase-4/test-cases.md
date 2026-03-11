# Phase 4 テストケース

| ID       | 種別     | ケース                       | 期待結果                                             |
| -------- | -------- | ---------------------------- | ---------------------------------------------------- |
| TC-04-01 | Renderer | Bell 押下で dialog が開く    | `aria-expanded=true` と Portal 描画                  |
| TC-04-02 | Renderer | 初期同期済み通知が表示される | タイトル、badge、relative time が見える              |
| TC-04-03 | Renderer | 項目押下                     | `markRead` が呼ばれ detail が展開される              |
| TC-04-04 | Renderer | `すべて既読`                 | `markAllRead` が 1 回呼ばれる                        |
| TC-04-05 | Renderer | 左スワイプ相当               | delete ボタンが出て `notification.delete` が呼ばれる |
| TC-04-06 | Renderer | empty state                  | `お知らせはありません` を表示する                    |
| TC-04-07 | Renderer | Escape / outside click       | popover が閉じ、focus が trigger へ戻る              |
| TC-04-08 | Store    | delete 後                    | 対象通知削除 + expanded id が null                   |
| TC-04-09 | Store    | history dedupe               | 同一IDが 1 件に正規化される                          |
| TC-04-10 | Main     | delete validation            | `notificationId` 欠落時に `VALIDATION_ERROR`         |
| TC-04-11 | Main     | delete success               | `{ deleted: true }` を返す                           |
| TC-04-12 | Preload  | delete allowlist             | invoke channel に含まれる                            |
