# Phase 1 受け入れ基準

| AC    | 対象            | 判定条件                                                                         | 検証方法                        |
| ----- | --------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| AC-01 | GlobalNavStrip  | 9 項目が 3 セクションで表示される                                                | 単体テスト + 目視               |
| AC-02 | GlobalNavStrip  | expanded で 200px、collapsed で 56px、ラベル表示切替が一致する                   | 単体テスト                      |
| AC-03 | MobileNavBar    | 主要 5 項目 + More 4 項目でモバイル導線を提供する                                | 単体テスト + スクリーンショット |
| AC-04 | MoreMenu        | Portal 描画、Escape、outside click、focus restore が成立する                     | 単体テスト + 手動確認           |
| AC-05 | AppLayout       | desktop / tablet / mobile でナビ配置とコンテンツ余白が崩れない                   | 統合テスト + 手動確認           |
| AC-06 | useNavShortcuts | `Cmd/Ctrl+1..8`, `Cmd/Ctrl+,`, `Cmd/Ctrl+[` が動作する                           | Hook テスト                     |
| AC-07 | useNavShortcuts | `input` / `textarea` / `select` / `contenteditable` ではショートカットが動かない | Hook テスト + 手動確認          |
| AC-08 | uiSlice         | `isNavExpanded` / `isMobileMoreOpen` の state と action が追加される             | Slice テスト                    |
| AC-09 | App 統合        | `VITE_USE_GLOBAL_NAV_STRIP !== "false"` を既定値として新ナビが有効になる         | App 統合確認                    |
| AC-10 | ロールバック    | `VITE_USE_GLOBAL_NAV_STRIP=false` で旧 AppDock に切り戻せる                      | 手動確認                        |
| AC-11 | 既存ビュー      | 9 ViewType すべての既存ビュー表示が維持される                                    | 手動確認 + 既存ビュー疎通       |
| AC-12 | 品質            | `typecheck` / `lint` / 対象テスト / coverage / screenshot 証跡が揃う             | コマンド実行                    |

## 観測点

- 自動観測:
  - `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx`
  - `apps/desktop/src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx`
  - `apps/desktop/src/renderer/components/organisms/AppLayout/AppLayout.test.tsx`
  - `apps/desktop/src/renderer/hooks/useNavShortcuts.test.tsx`
  - `apps/desktop/src/renderer/store/slices/uiSlice.test.ts`
- 手動観測:
  - desktop expanded
  - tablet collapsed
  - mobile default
  - mobile More open
  - shortcut / back / editable guard
