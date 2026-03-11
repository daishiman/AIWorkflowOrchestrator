# Phase 5 成果物: 実装計画

## 実装方針

- `DashboardView/index.tsx` を container に縮小し、表示ロジックを view-local component へ移す。
- サジェスチョン導出と挨拶生成は `dashboardContent.ts` に閉じ込めて純粋関数化する。
- `EmptyState` / `RelativeTime` を再利用し、新規 IPC や store 拡張は行わない。

## 実装ファイル

| 種別 | パス                                                                                      | 内容                                     |
| ---- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| 更新 | `apps/desktop/src/renderer/views/DashboardView/index.tsx`                                 | container、branching、navigation handoff |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/GreetingHeader.tsx`             | h1 / greeting / overview cards           |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/DashboardSuggestionSection.tsx` | suggestion section                       |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/DashboardSuggestionCard.tsx`    | button card UI                           |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/RecentTimeline.tsx`             | 5件タイムライン                          |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.ts`            | greeting / suggestion / timeline helper  |
| 更新 | `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx`                    | 旧UI期待値置換                           |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.test.ts`       | helper unit test                         |

## 非採用

- `SuggestionBubble` の square card 化
- 新規 `ViewType` / Main / Preload / IPC の追加
- global nav ラベルの文言変更
