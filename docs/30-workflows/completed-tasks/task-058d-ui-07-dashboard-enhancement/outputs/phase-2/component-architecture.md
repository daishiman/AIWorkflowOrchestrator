# Phase 2 成果物: コンポーネント設計

## 変更方針

`DashboardView/index.tsx` を container とし、表示責務は view-local components へ分割する。

## ファイル計画

| 区分 | パス                                                                                      | 役割                               |
| ---- | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| 変更 | `apps/desktop/src/renderer/views/DashboardView/index.tsx`                                 | container、selector 取得、CTA 定義 |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/GreetingHeader.tsx`             | 時間帯挨拶                         |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/DashboardSuggestionSection.tsx` | サジェスチョン一覧                 |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/DashboardSuggestionCard.tsx`    | card 表現の CTA                    |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/RecentTimeline.tsx`             | 直近アクティビティ一覧             |
| 新規 | `apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.ts`            | サジェスチョン導出 helper          |

## コンポーネント階層

```
DashboardView
├─ GreetingHeader
├─ DashboardSuggestionSection
│  └─ DashboardSuggestionCard[]
├─ RecentTimeline
│  └─ RelativeTime
└─ EmptyState (条件分岐)
```

## 重要判断

- `SuggestionBubble` は token/motion 参照元として扱い、直接の UI 形状変更は行わない
- `EmptyState` は既存 atom をそのまま使用する
- タイムラインは view-local organism として閉じ、共通化は Phase 8 判定へ送る
