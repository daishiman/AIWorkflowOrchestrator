# Phase 7 契約一致チェック

| チェック項目     | 期待                          | 実測                                                | 判定 |
| ---------------- | ----------------------------- | --------------------------------------------------- | ---- |
| ナビ項目数       | 9項目                         | `navContract.ts` / UI 実装とも 9項目                | PASS |
| セクション数     | 3                             | main / sub / footer                                 | PASS |
| mobile primary   | 5                             | Dashboard / Workspace / Chat / Agent / Skill Center | PASS |
| mobile secondary | 4                             | History Search / Graph / Editor / Settings          | PASS |
| shortcut map     | `Cmd/Ctrl+1..8`, `Cmd/Ctrl+,` | `useNavShortcuts.ts` と `navContract.ts` が一致     | PASS |
| go back shortcut | `Cmd/Ctrl+[`                  | `isGoBackNavigationShortcut` で実装                 | PASS |
| aria current     | active item に付与            | `GlobalNavStrip` / `MobileNavBar` で付与            | PASS |
| feature flag     | OFF/ON の 2経路               | `App.tsx` に分岐あり                                | PASS |
| state ownership  | 展開/More は `uiSlice`        | `uiSlice` + store hooks で一元管理                  | PASS |
| legacy alias     | `skill-center` 互換           | 契約で維持                                          | PASS |

## 結論

- `navContract`、`GlobalNavStrip`、`MobileNavBar`、`AppLayout` の契約不一致は検出されなかった。
- Step 3 未実施に伴う legacy path 残存は契約逸脱ではなく、段階移行方針どおり。
