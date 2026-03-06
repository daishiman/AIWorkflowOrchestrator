# Phase 1 要件定義書

## 対象

- 機能: `task-057-ui-02-global-nav-core`
- 対象コード:
  - `apps/desktop/src/renderer/App.tsx`
  - `apps/desktop/src/renderer/navigation/navContract.ts`
  - `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`
  - `apps/desktop/src/renderer/store/slices/uiSlice.ts`
  - `apps/desktop/src/renderer/store/slices/navigationSlice.ts`

## 機能要件

| ID    | 区分             | 要件                                                                                                                                          |
| ----- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | ナビ構造         | 9 ViewType を 3 セクション `main` / `sub` / `footer` で描画できること                                                                         |
| FR-02 | レスポンシブ     | desktop は `GlobalNavStrip`、mobile は `MobileNavBar`、tablet は collapsed 表示で動作すること                                                 |
| FR-03 | 状態管理         | `currentView` / `viewHistory` は `navigationSlice`、`isNavExpanded` / `isMobileMoreOpen` は `uiSlice` に分離すること                          |
| FR-04 | ショートカット   | `Cmd/Ctrl+1..8`, `Cmd/Ctrl+,`, `Cmd/Ctrl+[` をグローバルで扱い、編集要素上では無効化すること                                                  |
| FR-05 | 移行             | `VITE_USE_GLOBAL_NAV_STRIP` で AppDock と新ナビを切替可能にすること                                                                           |
| FR-06 | レイアウト       | `AppLayout` がナビ、DynamicIsland、通知、戻る導線、メインコンテンツを責務分離して保持すること                                                 |
| FR-07 | モバイル導線     | `MobileNavBar` は主要 5 項目を直接表示し、残り 4 項目を More メニューへ退避すること                                                           |
| FR-08 | アクセシビリティ | `navigation` ランドマーク、`group`、`aria-current="page"`、Escape / outside click / focus restore を満たすこと                                |
| FR-09 | テスト性         | `GlobalNavStrip` / `MobileNavBar` / `AppLayout` / `useNavShortcuts` / `uiSlice` を個別に検証できること                                        |
| FR-10 | 既存導線維持     | `dashboard` / `workspace` / `editor` / `chat` / `graph` / `agent` / `skillCenter` / `historySearch` / `settings` の既存表示を退行させないこと |

## 非機能要件

| ID     | 要件                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| NFR-01 | `navContract.ts` を唯一のナビ契約正本として維持し、UI 側の重複定義を持たない |
| NFR-02 | `responsiveMode` は `window.innerWidth` 同期で実機表示に追従する             |
| NFR-03 | More メニューは stacking context の影響を受けず最前面に表示される            |
| NFR-04 | 既存 `AppDock` を残したまま Phase 8 で削除準備可否を判定できる               |
| NFR-05 | `apps/desktop` 直下の happy-dom 環境でユニット/統合テストを再現できる        |

## 移行要件

| ID    | 要件                                                                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MR-01 | Step 1 は新旧ナビ共存を許容し、即時ロールバック可能であること                                                                                                                    |
| MR-02 | Step 2 は `AppLayout` 抽出と新ナビ既定化を行うが、旧 AppDock は削除しないこと                                                                                                    |
| MR-03 | Step 3 は Phase 8〜10 の readiness 判定後にのみ着手すること                                                                                                                      |
| MR-04 | 既に `WorkspaceView` / `SkillCenterView` / `HistorySearchView` は実装済みのため、`ComingSoonView` は将来の未実装導線用フォールバックとして実装し、既存実ビューを置き換えないこと |

## 依存要件

| ID    | 依存元                                  | 内容                                                    |
| ----- | --------------------------------------- | ------------------------------------------------------- |
| DR-01 | `task-056-ui-01-store-ipc-architecture` | ViewType 拡張、`navContract` 正本化、`viewHistory` 前提 |
| DR-02 | `ui-ux-navigation.md`                   | 9 項目導線、ショートカット、編集要素除外ルール          |
| DR-03 | `arch-state-management.md`              | P31 対応、個別 selector 方針                            |
| DR-04 | `ui-ux-portal-patterns.md`              | More メニューの portal / Escape / outside click         |

## 判定メモ

- `AppDock` はすでに 9 項目化済みだが、3 セクション・collapsed / expanded・More メニュー・`AppLayout` 抽出が未実施。
- 親タスク本文の `ComingSoonView` 想定は後続タスク完了前提の古い想定であり、現行ブランチでは実ビューが存在するため、退行防止を優先する。
