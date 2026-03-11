# Phase 1 成果物: スコープ定義

## 対象

- `apps/desktop/src/renderer/views/DashboardView/index.tsx`
- `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx`
- `views/DashboardView` 配下の view-local components / helpers 追加
- 既存 atoms (`EmptyState`, `RelativeTime`) の再利用

## 対象外

- `ViewType` 自体の新規追加
- Main / Preload / IPC 契約の変更
- Global Navigation の共有ラベル一括変更
- `TASK-UI-06` の検索・フィルタ UI 実装

## 依存

- `TASK-UI-00`: atoms と token が既に利用可能であること
- `TASK-UI-01`: `historySearch` と selector 群が既に利用可能であること
- `TASK-UI-02`: nav 共有ラベル変更を本タスクへ持ち込まないこと

## 設計上の判断

- `SuggestionBubble` を直接 square card 化しない
- `dashboard` は内部 ID として維持する
- ゼロステートの 3 つ目 CTA は未定義ルートを作らず、既存 view に閉じる
