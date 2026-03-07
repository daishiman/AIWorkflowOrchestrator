# Phase 11 ナビ導線ウォークスルー

| モード  | 開始画面         | 操作                                  | 観測結果                                            | 証跡                                           |
| ------- | ---------------- | ------------------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| desktop | dashboard        | rail の `履歴検索` を shortcut で選択 | active state が切り替わり、back button が有効になる | `TC-11-04-desktop-history-search-shortcut.png` |
| desktop | history search   | `Cmd/Ctrl+[`                          | `viewHistory` に従って dashboard へ戻る             | NON_VISUAL                                     |
| tablet  | dashboard        | ArrowDown / ArrowUp / Home / End      | collapsed rail 上で focus が移動する                | `TC-11-02-tablet-collapsed-focus.png`          |
| mobile  | dashboard        | More をタップ                         | secondary 4項目の menu が開く                       | `TC-11-03-mobile-more-menu.png`                |
| mobile  | More open        | `履歴検索` を選択                     | menu が閉じて view が切り替わる                     | `TC-11-03-mobile-more-menu.png`                |
| desktop | input focus 状態 | `Cmd/Ctrl+2`                          | shortcut が無効化され誤遷移しない                   | NON_VISUAL                                     |

## コメント

- 主要導線は desktop/tablet/mobile の全モードで到達可能。
- 迷いやすい mobile secondary は More に分離したことで理解しやすくなった。
