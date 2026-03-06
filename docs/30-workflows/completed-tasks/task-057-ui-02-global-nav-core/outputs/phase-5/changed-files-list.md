# Phase 5 変更ファイル一覧

## 変更マトリクス

| ファイル                                                                                         | 種別     | 関心ごと             | 対応 TC-ID                   | 備考                                                       |
| ------------------------------------------------------------------------------------------------ | -------- | -------------------- | ---------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/renderer/navigation/navContract.ts`                                            | modified | ナビ契約             | TC-04-01, 03, 10, 11, 15     | 9項目/3セクション、mobile primary、go back shortcut を追加 |
| `apps/desktop/src/renderer/navigation/navContract.test.ts`                                       | modified | 契約テスト           | TC-04-10, 11                 | ショートカット/契約整合を拡張                              |
| `apps/desktop/src/renderer/store/slices/uiSlice.ts`                                              | modified | 状態管理             | TC-04-13, 14                 | `isNavExpanded` / `isMobileMoreOpen` を追加                |
| `apps/desktop/src/renderer/store/slices/uiSlice.test.ts`                                         | modified | 状態管理テスト       | TC-04-13, 14                 | action/初期値/モード遷移を検証                             |
| `apps/desktop/src/renderer/store/index.ts`                                                       | modified | selector/export      | TC-04-13, 14                 | 個別 hook と persistence を追加                            |
| `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`                                      | modified | アイコン基盤         | TC-04-01, 05, 08             | `puzzle` / `file-code` / `chevron-left` を追加             |
| `apps/desktop/src/renderer/components/atoms/index.ts`                                            | modified | atoms export         | TC-04-08                     | `ComingSoonView` を再 export                               |
| `apps/desktop/src/renderer/components/atoms/ComingSoonView/index.tsx`                            | added    | fallback view        | TC-04-15                     | 新導線の仮表示用                                           |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/types.ts`                         | added    | 型定義               | TC-04-01, 02, 03             | section/item props 定義                                    |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/constants.ts`                     | added    | ナビ構成             | TC-04-01, 02, 05             | セクション定義と幅定数                                     |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/components/NavItem.tsx`           | added    | ナビ要素             | TC-04-01, 02, 03             | active/focus/tooltip 対応                                  |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/components/NavSection.tsx`        | added    | セクション描画       | TC-04-01                     | 3セクション表示                                            |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/components/NavCollapseToggle.tsx` | added    | 展開切替             | TC-04-04                     | expand/collapse トグル                                     |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/components/NavLogo.tsx`           | added    | ブランド/戻り導線    | TC-04-01, 08                 | dashboard へ戻る導線                                       |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/index.tsx`                        | added    | desktop/tablet ナビ  | TC-04-01, 02, 03, 04         | 56px/200px、keyboard nav 実装                              |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx`          | added    | コンポーネントテスト | TC-04-01, 02, 03, 04         | expanded/collapsed/keyboard を検証                         |
| `apps/desktop/src/renderer/components/organisms/MobileNavBar/components/MoreMenu.tsx`            | added    | mobile secondary     | TC-04-06, 07                 | portal/menu/close/focus を実装                             |
| `apps/desktop/src/renderer/components/organisms/MobileNavBar/index.tsx`                          | added    | mobile primary       | TC-04-05, 06, 07             | primary 5 + More を実装                                    |
| `apps/desktop/src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx`              | added    | mobile テスト        | TC-04-05, 06, 07             | default/open/close/active を検証                           |
| `apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx`                             | added    | レイアウト統合       | TC-04-08, 09                 | header/main/nav の統合                                     |
| `apps/desktop/src/renderer/components/organisms/AppLayout/AppLayout.test.tsx`                    | added    | レイアウトテスト     | TC-04-08, 09, 15             | desktop/mobile と back button を検証                       |
| `apps/desktop/src/renderer/components/organisms/AppDock/AppDock.test.tsx`                        | modified | rollback path        | TC-04-15                     | legacy path 維持を確認                                     |
| `apps/desktop/src/renderer/components/organisms/index.ts`                                        | modified | export 更新          | TC-04-08, 09                 | 新 organisms を公開                                        |
| `apps/desktop/src/renderer/hooks/useNavShortcuts.ts`                                             | added    | ショートカット       | TC-04-10, 11, 12             | ctrl/meta + guard + go back                                |
| `apps/desktop/src/renderer/hooks/useNavShortcuts.test.ts`                                        | added    | hook テスト          | TC-04-10, 11, 12             | 正常/guard/back を検証                                     |
| `apps/desktop/src/renderer/App.tsx`                                                              | modified | 統合/feature flag    | TC-04-08, 09, 10, 11, 12, 15 | resize 同期、new/legacy 分岐、renderView 更新              |
| `apps/desktop/scripts/capture-task-057-phase11-screenshots.mjs`                                  | added    | Phase 11 証跡        | TC-11-01, 02, 03, 04         | preview ベースの撮影スクリプト                             |

## 変更の境界

- 既存 `AppDock` 実装本体は削除していない。
- `AppDock` は rollback path と比較対象として維持した。
- Step 3 で削除予定の `AppDock` 依存は Phase 8 で readiness 判定へ回した。
