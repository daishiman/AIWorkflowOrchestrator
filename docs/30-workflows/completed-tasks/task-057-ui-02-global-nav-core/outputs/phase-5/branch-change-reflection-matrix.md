# Phase 5 ブランチ変更反映マトリクス

| 要件/設計項目                           | 実装反映                                                                    | テスト/証跡                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 9項目/3セクションの Global Navigation   | `navigation/navContract.ts`、`GlobalNavStrip/*`                             | `GlobalNavStrip.test.tsx`、TC-04-01〜04                                        |
| desktop/tablet/mobile の 3 モード       | `AppLayout/index.tsx`、`GlobalNavStrip/index.tsx`、`MobileNavBar/index.tsx` | `AppLayout.test.tsx`、`MobileNavBar.test.tsx`、TC-04-05, 08, 09                |
| mobile は primary 5 + More 4            | `navContract.ts`、`MobileNavBar/index.tsx`、`MoreMenu.tsx`                  | `MobileNavBar.test.tsx`、TC-04-05〜07                                          |
| `isNavExpanded` の永続化                | `uiSlice.ts`、`store/index.ts`                                              | `uiSlice.test.ts`、TC-04-13, 14                                                |
| キーボードショートカットと戻る導線      | `useNavShortcuts.ts`、`App.tsx`                                             | `useNavShortcuts.test.ts`、TC-04-10〜12                                        |
| feature flag による新旧ナビ切替         | `App.tsx`、`AppDock.test.tsx`                                               | TC-04-15                                                                       |
| 想定外 view の fallback                 | `ComingSoonView/index.tsx`、`App.tsx`                                       | `AppLayout.test.tsx`、手動検証 TC-11 系                                        |
| Apple HIG/WCAG を意識した nav semantics | `aria-current`、`menu`、focus 処理                                          | `GlobalNavStrip.test.tsx`、`MobileNavBar.test.tsx`、Phase 11 screenshot review |

## 分岐の扱い

| ブランチ状態 | 実装方針                                        | 反映状況                   |
| ------------ | ----------------------------------------------- | -------------------------- |
| OFF          | legacy `AppDock` を継続利用                     | 実装済み                   |
| ON           | `AppLayout` + `GlobalNavStrip` / `MobileNavBar` | 実装済み                   |
| Step 3       | `AppDock` 完全削除                              | 未実施、readiness のみ記録 |

## コメント

- 本Phaseでは「新ナビの導入」と「旧ナビの退避経路維持」を同時に成立させた。
- Step 3 の削除を意図的に後ろへ送ったため、branch reflection は「完了」と「準備完了」を分けて扱う。
