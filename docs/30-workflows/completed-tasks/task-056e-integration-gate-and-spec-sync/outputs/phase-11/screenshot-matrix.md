# Phase 11 スクリーンショットマトリクス

| TC-ID    | 画面                | 状態                           | ファイル                                                 | Apple UI/UX 観点                            | 判定 |
| -------- | ------------------- | ------------------------------ | -------------------------------------------------------- | ------------------------------------------- | ---- |
| TC-11-01 | Dashboard + AppDock | desktop default                | `screenshots/TC-11-01-dashboard-desktop.png`             | primary navigation の情報階層               | PASS |
| TC-11-02 | NotificationCenter  | popover open + detail expanded | `screenshots/TC-11-02-notification-popover-desktop.png`  | unread / timestamp / action の主従          | PASS |
| TC-11-03 | HistorySearchView   | desktop results loaded         | `screenshots/TC-11-03-history-search-desktop.png`        | search / stats / result card の余白と可読性 | PASS |
| TC-11-04 | Chat history route  | empty state                    | `screenshots/TC-11-04-chat-history-route-desktop.png`    | 空状態の説明性と disabled action            | PASS |
| TC-11-05 | HistoryPage         | split layout default           | `screenshots/TC-11-05-version-history-route-desktop.png` | list/detail の役割分離                      | PASS |
| TC-11-06 | HistorySearchView   | mobile responsive              | `screenshots/TC-11-06-history-search-mobile.png`         | bottom nav と本文の密度                     | PASS |

## サマリー

- branch-level integration visual smoke として 6/6 画面を current workflow 配下へ再取得した。
- Apple UI/UX 観点では、blocker / major issue は検出されなかった。
