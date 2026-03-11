# Phase 4 成果物: テスト仕様書

## 方針

- 旧 `DashboardView` の統計カード前提を破棄し、ホーム導線中心の期待値へ置換する。
- 画面テストは `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx` に集約する。
- 純粋関数は `apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.test.ts` で分離検証する。

## 対象ファイル

| 種別        | パス                                                                                | 目的                                          |
| ----------- | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| View test   | `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx`              | 挨拶、導線、タイムライン、empty/loading、a11y |
| Helper test | `apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.test.ts` | greeting / suggestion / timeline の純粋関数   |

## 旧期待値の置換

| 旧期待値                          | 新期待値                                       |
| --------------------------------- | ---------------------------------------------- |
| `ダッシュボード` 見出し           | `ホーム` 見出し                                |
| 統計カード 4 枚                   | 挨拶 + サジェスチョン 3 枚 + タイムライン      |
| `アクティビティはありません` のみ | welcoming EmptyState + CTA                     |
| 統計リージョンの存在確認          | suggestion / timeline 見出しと `button` 操作性 |

## 重点観点

1. 時間帯別挨拶と display name 反映
2. `workspace` / `skillCenter` / `agent` / `historySearch` への既存 ViewType 遷移
3. タイムライン最大 5 件制限
4. `activityFeed=[]` 時の welcoming EmptyState
5. invalid timestamp のフォールバック
6. キーボード操作と見出し構造
