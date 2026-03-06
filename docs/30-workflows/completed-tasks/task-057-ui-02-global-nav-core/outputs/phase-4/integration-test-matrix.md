# Phase 4 統合テストマトリクス

| 接続面                                 | 観測点                         | テスト                       |
| -------------------------------------- | ------------------------------ | ---------------------------- |
| `App.tsx` -> `AppLayout`               | feature flag 既定値 / fallback | TC-04-15                     |
| `AppLayout` -> `GlobalNavStrip`        | desktop / tablet ナビ表示      | TC-04-08                     |
| `AppLayout` -> `MobileNavBar`          | mobile ナビ表示                | TC-04-09                     |
| `GlobalNavStrip` -> `navContract`      | 項目順、shortcut 表示          | TC-04-01, TC-04-02           |
| `MobileNavBar` -> `MoreMenu`           | portal / overlay / close       | TC-04-05, TC-04-06, TC-04-07 |
| `useNavShortcuts` -> `navigationSlice` | setCurrentView / goBack        | TC-04-10, TC-04-11           |
| `uiSlice` -> `GlobalNavStrip`          | expanded 切替                  | TC-04-04, TC-04-13, TC-04-14 |

## 移行状態観測

| 状態             | 観測                                                      |
| ---------------- | --------------------------------------------------------- |
| OFF              | AppDock が使われる                                        |
| ON               | AppLayout + GlobalNavStrip / MobileNavBar が使われる      |
| Step 3 readiness | AppDock 参照の残存数と rollback 条件を Phase 8〜10 で判定 |
