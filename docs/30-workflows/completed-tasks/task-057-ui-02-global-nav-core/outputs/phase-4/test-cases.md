# Phase 4 テストケース一覧

| TC-ID    | 種別        | 対象              | 条件           | 期待結果                                           |
| -------- | ----------- | ----------------- | -------------- | -------------------------------------------------- |
| TC-04-01 | component   | GlobalNavStrip    | expanded       | 9 項目 / 3 セクション / aria-current               |
| TC-04-02 | component   | GlobalNavStrip    | collapsed      | 56px / ラベル非表示 / tooltip 保持                 |
| TC-04-03 | component   | GlobalNavStrip    | keyboard       | ArrowUp/Down, Home/End, Enter/Space                |
| TC-04-04 | component   | NavCollapseToggle | desktop        | expanded state を切替できる                        |
| TC-04-05 | component   | MobileNavBar      | mobile default | primary 5 + More ボタン                            |
| TC-04-06 | component   | MoreMenu          | open           | 4 secondary 項目、portal、menu role                |
| TC-04-07 | component   | MoreMenu          | close          | item click / outside click / Escape                |
| TC-04-08 | component   | AppLayout         | desktop        | 左ナビ + header + main                             |
| TC-04-09 | component   | AppLayout         | mobile         | bottom nav + bottom padding                        |
| TC-04-10 | hook        | useNavShortcuts   | meta/ctrl      | view change が発火する                             |
| TC-04-11 | hook        | useNavShortcuts   | goBack         | `Cmd/Ctrl+[` で `onGoBack`                         |
| TC-04-12 | hook        | useNavShortcuts   | editable guard | input / textarea / select / contenteditable で無効 |
| TC-04-13 | slice       | uiSlice           | state追加      | `isNavExpanded` / `isMobileMoreOpen` 初期値        |
| TC-04-14 | slice       | uiSlice           | action         | toggle / set / close が動く                        |
| TC-04-15 | integration | feature flag      | OFF / ON       | AppDock と新ナビを切替可能                         |

## 手動検証へ渡す TC

- `TC-11-01`: desktop expanded
- `TC-11-02`: tablet collapsed
- `TC-11-03`: mobile default + More
- `TC-11-04`: shortcuts
- `TC-11-05`: editable guard
- `TC-11-06`: back flow
- `TC-11-07`: feature flag OFF/ON/readiness
