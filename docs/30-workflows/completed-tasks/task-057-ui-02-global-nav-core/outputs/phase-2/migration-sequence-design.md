# Phase 2 移行手順設計

## 実装順序

1. `navContract.ts` を拡張して新 UI が参照可能な契約へ揃える
2. `uiSlice` と selector を拡張する
3. `GlobalNavStrip` / `MobileNavBar` / `MoreMenu` / `AppLayout` を追加する
4. `useNavShortcuts` と `windowSize` 同期を追加する
5. `App.tsx` に feature flag 経路を追加する
6. 旧 `AppDock` は rollback 用に残す

## ロールバック条件

| 条件                         | 対応                                   |
| ---------------------------- | -------------------------------------- |
| 新ナビで blocking regression | `VITE_USE_GLOBAL_NAV_STRIP=false`      |
| More メニューが a11y 不達    | Phase 2/4 へ差し戻し                   |
| `uiSlice` 拡張で既存 UI 破壊 | selector 境界を見直して Phase 2 へ戻す |

## Step 3 readiness 条件

- `AppDock` を参照する本番経路が 0
- feature flag 分岐が不要
- 新ナビ経路で QA / manual / rollback review を通過
