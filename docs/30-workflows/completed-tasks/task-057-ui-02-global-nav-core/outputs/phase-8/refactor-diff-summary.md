# Phase 8 差分要約

## Before / After

| 観点                | Before                                  | After                                                  |
| ------------------- | --------------------------------------- | ------------------------------------------------------ |
| ナビ契約            | `AppDock` 側へ UI都合と shortcut が混在 | `navContract.ts` を正本として UI は参照のみ            |
| desktop/mobile 分岐 | `App.tsx` に偏在                        | `AppLayout` + `GlobalNavStrip` + `MobileNavBar` へ分離 |
| 展開状態            | UI責務として未定義                      | `uiSlice.isNavExpanded` で永続化                       |
| mobile secondary    | 収まりきらない flat nav                 | `MoreMenu` に 4項目を退避                              |
| shortcut            | `App.tsx` に寄りやすい                  | `useNavShortcuts` へ隔離                               |
| rollback            | 新旧切替が想像上                        | `VITE_USE_GLOBAL_NAV_STRIP` で明示分岐                 |

## 今回あえて残したもの

| 項目                                 | 理由                             |
| ------------------------------------ | -------------------------------- |
| `AppDock` import/テスト              | rollback path を維持するため     |
| feature flag 分岐                    | Step 3 を別判定に分離するため    |
| `sliceBaseline.ts` の ownerView 記述 | 後続タスクとの整合を崩さないため |
