# Phase 2 成果物: トレーサビリティマトリクス

| 要件   | 設計要素                               | テスト観点             |
| ------ | -------------------------------------- | ---------------------- |
| FR-01  | GreetingHeader / `h1`                  | heading 表示確認       |
| FR-02  | `getGreeting(displayName, now)` helper | 時間帯別表示           |
| FR-03  | DashboardSuggestionSection             | CTA 数とラベル         |
| FR-04  | RecentTimeline + RelativeTime          | 5件制限、相対時刻      |
| FR-05  | `setCurrentView("historySearch")`      | もっと見る interaction |
| FR-07  | EmptyState welcoming                   | activity 0件時表示     |
| FR-09  | store 再利用のみ                       | IPC 追加なし確認       |
| NFR-01 | view-local components                  | atom 影響なし確認      |
| NFR-03 | button / time / focus-visible          | keyboard / a11y test   |
