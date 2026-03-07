# Phase 6 移行状態検証表

| 状態         | 実装経路                                                | 期待結果                                                         | 実測/証跡                                                                | 判定 |
| ------------ | ------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ---- |
| OFF          | `VITE_USE_GLOBAL_NAV_STRIP=false`                       | legacy `AppDock` が desktop/mobile ともに表示される              | `AppDock.test.tsx`、rollback checklist                                   | PASS |
| ON           | `import.meta.env.VITE_USE_GLOBAL_NAV_STRIP !== "false"` | `AppLayout` + `GlobalNavStrip` / `MobileNavBar` が標準経路になる | `AppLayout.test.tsx`、`GlobalNavStrip.test.tsx`、`MobileNavBar.test.tsx` | PASS |
| Step 3 ready | `AppDock` 削除準備のみ                                  | 参照棚卸しができ、戻し先が明確である                             | Phase 8 readiness 判定へ引き継ぎ                                         | HOLD |

## 状態別の注意点

- OFF は rollback safety のため保持している。
- ON が default だが、完全移行ではない。
- Step 3 は `AppDock`・feature flag・ownerView 参照の削除が残るため、本Phaseでは未実施。

## 次の判断ポイント

- Phase 8: `AppDock` 参照が deletion-ready かを棚卸しする。
- Phase 10: Step 3 の Go/No-Go を最終判定する。
