# Phase 1 スコープ定義

## 実施範囲

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| ナビ UI  | `GlobalNavStrip`, `MobileNavBar`, `MoreMenu`, `AppLayout`, `ComingSoonView` を追加する |
| 契約     | `navContract.ts` を拡張し、新 UI は正本参照のみで描画する                              |
| Store    | `uiSlice` と selector を拡張し、`navigationSlice` は既存責務を維持する                 |
| App 統合 | `App.tsx` に feature flag, window size sync, layout 切替を追加する                     |
| テスト   | 新 UI / hook / slice / AppLayout / 回帰の自動テストを追加する                          |
| Phase 11 | スクリーンショット取得と視覚レビューを実施する                                         |

## 委譲範囲

| 項目                       | 委譲先                          |
| -------------------------- | ------------------------------- |
| Step 3 の AppDock 物理削除 | Phase 8〜10 の readiness 判定後 |
| 各ビュー内部の機能改善     | `TASK-UI-03` 以降の個別タスク   |
| 通知バッジの実データ接続   | 後続通知/履歴系タスク           |

## 対象外

| 項目                                                                 | 理由                                 |
| -------------------------------------------------------------------- | ------------------------------------ |
| React Router の URL ルーティング再設計                               | ViewType ベース導線と別責務          |
| `WorkspaceView` / `SkillCenterView` / `HistorySearchView` の中身変更 | 本タスクは入口基盤の差し替えが主目的 |
| Electron main/preload 側の IPC 変更                                  | 本タスクで必要な新 IPC はない        |

## 境界判断

- `navigationSlice`:
  - 維持: `currentView`, `viewHistory`, `goBack`
  - 追加しない: ナビの開閉状態、More メニュー状態
- `uiSlice`:
  - 追加: `isNavExpanded`, `isMobileMoreOpen`
  - 維持: `responsiveMode`, `windowSize`, `dynamicIsland`
