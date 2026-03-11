# Phase 4 成果物: テストケース一覧

| ID         | Given                         | When                                        | Then                                        |
| ---------- | ----------------------------- | ------------------------------------------- | ------------------------------------------- |
| TC-AUTO-01 | displayName がある            | DashboardView を表示する                    | `ホーム` と時間帯挨拶が表示される           |
| TC-AUTO-02 | 通常状態                      | suggestion button を押す                    | `setCurrentView` が既存 ViewType で呼ばれる |
| TC-AUTO-03 | activityFeed が 6 件ある      | DashboardView を表示する                    | 6 件目は表示されない                        |
| TC-AUTO-04 | timeline が存在する           | `もっと見る` を押す                         | `historySearch` へ遷移する                  |
| TC-AUTO-05 | `isLoading=true`              | DashboardView を表示する                    | loading card が表示される                   |
| TC-AUTO-06 | `activityFeed=[]`             | DashboardView を表示する                    | welcoming EmptyState と CTA が表示される    |
| TC-AUTO-07 | invalid timestamp が含まれる  | DashboardView を表示する                    | `—` が表示される                            |
| TC-AUTO-08 | 画面を Tab / Enter で操作する | suggestion card にフォーカスする            | button として操作できる                     |
| TC-AUTO-09 | helper を単体実行する         | greeting / suggestion / timeline を評価する | 純粋関数が設計通りの値を返す                |
