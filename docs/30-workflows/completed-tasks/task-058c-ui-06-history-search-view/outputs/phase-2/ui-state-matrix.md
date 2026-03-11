# Phase 2 UI状態マトリクス

| 状態ID | 条件                                                                  | 表示                 | 補足                           |
| ------ | --------------------------------------------------------------------- | -------------------- | ------------------------------ |
| UI-01  | mount 直後 / `!hasFetchedHistory && isHistorySearching`               | スケルトン 5 枚      | 初回ロード                     |
| UI-02  | `hasFetchedHistory && results.length > 0 && query === ""`             | タイムライン通常表示 | 主役状態                       |
| UI-03  | `query !== "" && results.length > 0`                                  | 検索結果タイムライン | 見出し copy を検索寄りに変える |
| UI-04  | `hasFetchedHistory && results.length === 0 && query === "" && !error` | 初期ゼロステート     | 「まだ記録がありません」       |
| UI-05  | `hasFetchedHistory && results.length === 0 && query !== "" && !error` | 検索結果ゼロ         | clear action を出す            |
| UI-06  | `error !== null`                                                      | エラー state         | retry button を出す            |
| UI-07  | `expandedItemId === item.id`                                          | カード展開           | 種別別 detail 表示             |
| UI-08  | `isHistoryLoadingMore`                                                | footer spinner       | 既存リストは保持               |
| UI-09  | `!hasMore && results.length > 0`                                      | `すべて表示しました` | footer text                    |

## a11y 状態

| 要素                   | 必須属性                         |
| ---------------------- | -------------------------------- |
| 検索 input             | `aria-label="やりとりを検索"`    |
| アコーディオン trigger | `aria-expanded`, `aria-controls` |
| エラー                 | `role="alert"`                   |
| loading                | `role="status"`                  |
