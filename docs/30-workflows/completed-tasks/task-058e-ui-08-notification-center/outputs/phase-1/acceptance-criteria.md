# Phase 1 受け入れ基準

## 受け入れ基準一覧

| ID    | 観点           | 条件                                                                            |
| ----- | -------------- | ------------------------------------------------------------------------------- |
| AC-01 | Trigger        | Bell ボタン押下で `aria-expanded` が `false -> true -> false` と変化する        |
| AC-02 | Header         | ポップオーバーに `お知らせ` が表示され、`すべて削除` が表示されない             |
| AC-03 | Ordering       | 通知一覧は新しい順に表示される                                                  |
| AC-04 | Read state     | 未読項目はドット表示、既読項目はドット非表示かつ減衰表示になる                  |
| AC-05 | Expand         | 項目押下でその項目だけが展開し、他項目は折りたたまれる                          |
| AC-06 | Mark read      | 未読項目押下時に `notification:mark-read` を呼び、成功時に store の未読数が減る |
| AC-07 | Mark all       | `すべて既読` 押下で `notification:mark-all-read` を呼び、全件既読になる         |
| AC-08 | Delete         | 個別削除操作で `notification:delete` を呼び、成功時に該当通知が一覧から消える   |
| AC-09 | Empty state    | 0 件時に `お知らせはありません` と EmptyState が表示される                      |
| AC-10 | Relative time  | 時刻が `2分前` `1時間前` のような相対表現で表示される                           |
| AC-11 | Portal         | ポップオーバーは `document.body` 配下へ描画される                               |
| AC-12 | Keyboard       | Escape で閉じ、close 後に Bell へ focus が戻る                                  |
| AC-13 | Focus trap     | Tab/Shift+Tab でポップオーバー内の操作要素を循環する                            |
| AC-14 | Live region    | unread 数変化が `role=\"status\" aria-live=\"polite\"` に反映される             |
| AC-15 | Security       | `notification:delete` は preload allowlist と main sender 検証を通る            |
| AC-16 | Responsiveness | desktop/tablet/mobile で横幅とアンカー位置が仕様範囲に収まる                    |
| AC-17 | Theme          | light/dark/kanagawa-dragon で unread dot/badge の視認性が維持される             |
| AC-18 | Cleanup        | `onNew` 購読解除が unmount 時に必ず呼ばれる                                     |

## Gate 判定に使う blocker 条件

- `notification:delete` の UI / preload / main のいずれかが未実装
- `すべて削除` が UI に残っている
- `お知らせ` 文言へ未統一
- Portal / Escape / focus return のいずれかが未実装
- renderer test / store test / main IPC test のいずれかに delete 観点がない
