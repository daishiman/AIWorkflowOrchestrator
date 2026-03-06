# Phase 2 アーキテクチャ設計

## 目標構成

```text
App.tsx
  ├─ useWindowSize sync
  ├─ useNavShortcuts
  └─ AppLayout (feature flag ON)
       ├─ GlobalNavStrip (desktop/tablet)
       │   ├─ NavLogo
       │   ├─ NavSection(main/sub)
       │   └─ NavCollapseToggle
       ├─ HeaderArea
       │   ├─ Back button
       │   ├─ DynamicIsland
       │   └─ NotificationCenter
       ├─ main
       └─ MobileNavBar (mobile)
            └─ MoreMenu (portal)
```

## 責務分離

| 要素              | 責務                                                           |
| ----------------- | -------------------------------------------------------------- |
| `App.tsx`         | ルーティング、feature flag、window size 同期、currentView 選択 |
| `AppLayout`       | ナビ配置、ヘッダー、メインコンテンツ余白の統合                 |
| `GlobalNavStrip`  | desktop / tablet の縦ナビ描画                                  |
| `MobileNavBar`    | mobile の下部ナビ描画                                          |
| `MoreMenu`        | mobile の二次導線表示、overlay / focus 制御                    |
| `useNavShortcuts` | グローバルキーボードコマンドの登録解除                         |
| `uiSlice`         | ナビ UI 状態の保持                                             |
| `navigationSlice` | 画面遷移履歴と戻る導線                                         |

## データフロー

| 入力               | 供給元                      | 消費先                                      |
| ------------------ | --------------------------- | ------------------------------------------- |
| `NAV_SECTIONS`     | `navigation/navContract.ts` | `GlobalNavStrip`, `MobileNavBar`, `AppDock` |
| `currentView`      | `navigationSlice`           | `App.tsx`, `AppLayout`, ナビ UI             |
| `viewHistory`      | `navigationSlice`           | `goBack`, `AppLayout` 戻るボタン            |
| `responsiveMode`   | `uiSlice`                   | `AppLayout`, `GlobalNavStrip`               |
| `isNavExpanded`    | `uiSlice`                   | `GlobalNavStrip`, `NavCollapseToggle`       |
| `isMobileMoreOpen` | `uiSlice`                   | `MobileNavBar`, `MoreMenu`                  |

## 設計判断

- `navContract.ts` を単一正本として温存し、`GlobalNavStrip/constants.ts` は正本参照と寸法定数のみを持つ。
- `ComingSoonView` は実ビュー未実装時のフォールバックとして追加するが、現行 `WorkspaceView` / `SkillCenterView` / `HistorySearchView` はそのまま利用する。
- `AppDock` は feature flag OFF 経路として残し、Step 3 readiness を Phase 8 で判定する。
