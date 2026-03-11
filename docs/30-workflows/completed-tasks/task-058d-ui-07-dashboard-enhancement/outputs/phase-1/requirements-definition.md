# Phase 1 成果物: 要件定義書

## 機能要件

| ID    | 要件                                                                            |
| ----- | ------------------------------------------------------------------------------- |
| FR-01 | 画面の h1 と主要説明文で「ダッシュボード」ではなく「ホーム」を使用する          |
| FR-02 | 表示名が取得できる場合、時間帯に応じた挨拶を表示する                            |
| FR-03 | 挨拶の直下に 2〜3 件のおすすめカードを表示する                                  |
| FR-04 | タイムラインは最新 5 件まで表示し、各項目にアイコン・タイトル・相対時刻を含める |
| FR-05 | 「もっと見る」操作で `historySearch` 画面へ遷移できる                           |
| FR-06 | 統計カード、トレンド表示、旧 QuickAction UI はホームから除去する                |
| FR-07 | `activityFeed` が空のときは `EmptyState mood="welcoming"` を表示する            |
| FR-08 | サジェスチョンと EmptyState の CTA は既存 `ViewType` へだけ遷移する             |
| FR-09 | 実装は既存 `dashboardSlice` を再利用し、新規 IPC は追加しない                   |
| FR-10 | `dashboard` という内部 ViewType は維持し、画面内文言だけをホームへ変更する      |

## 非機能要件

| ID     | 要件                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| NFR-01 | 既存 atoms の API を壊さず、view-local component で責務を分離する                    |
| NFR-02 | 色・余白・アニメーションはデザインシステムの CSS 変数を使う                          |
| NFR-03 | CTA はキーボード操作可能で、role とフォーカス状態が明確である                        |
| NFR-04 | テストは UI 層基準として Line 80% / Branch 60% / Function 80% を下回らない設計にする |
| NFR-05 | 共有ナビラベル変更は本タスクに混入させず、`TASK-UI-02` との責務境界を守る            |

## 既存実装からの制約

- 現行 `DashboardView` は `dashboardStats` / `activityFeed` / `isLoading` のみを参照している
- 現行 `SuggestionBubble` は pill 形状の atom であり、square card に直接流用すると API 拡張が過剰になる
- `useDisplayName()` selector が既に存在するため、profile へ直接アクセスする設計は避ける
- `historySearch` は既存 `ViewType` として利用可能である
