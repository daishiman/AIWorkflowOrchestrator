# Phase 6 成果物: 拡張テスト計画

## 追加した境界ケース

- `activityFeed.length > 5`
- `activityFeed=[]`
- `isLoading=true`
- invalid timestamp
- displayName あり / なし / 汎用値
- keyboard navigation

## 追加対象

| ファイル                   | 追加内容                                                   |
| -------------------------- | ---------------------------------------------------------- |
| `DashboardView.test.tsx`   | empty/loading/invalid timestamp/keyboard/redirect          |
| `dashboardContent.test.ts` | morning/evening greeting、pending優先、timeline icon/label |

## 回帰意図

- 旧 Dashboard の統計カード期待値が再混入しないこと
- `historySearch` handoff が future task に侵食されないこと
- empty state でも suggestion card が維持されること
