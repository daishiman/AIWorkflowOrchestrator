# Phase 6 テスト拡充レポート

## 追加/拡張したテスト

| 対象                      | 拡張内容                                                                                    | 関連 TC-ID           |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| `GlobalNavStrip.test.tsx` | 9項目/3セクション、collapsed 幅、ArrowUp/Down、Home/End、Enter/Space、tablet 強制 collapsed | TC-04-01〜04         |
| `MobileNavBar.test.tsx`   | primary 5 表示、More active state、menu role、item click、outside click、Escape close       | TC-04-05〜07         |
| `AppLayout.test.tsx`      | desktop header/left nav、mobile bottom nav、bottom padding、back button                     | TC-04-08, 09         |
| `useNavShortcuts.test.ts` | ctrl/meta 両対応、editable guard、goBack shortcut                                           | TC-04-10〜12         |
| `uiSlice.test.ts`         | 初期値、toggle/set、mobile more close、responsive mode 変更時の close                       | TC-04-13, 14         |
| `AppDock.test.tsx`        | legacy path の互換確認                                                                      | TC-04-15             |
| `navContract.test.ts`     | shortcut map と nav section parity                                                          | TC-04-01, 05, 10, 11 |

## 実行結果

| 項目           | 結果 |
| -------------- | ---- |
| 実行ファイル数 | 7    |
| テスト件数     | 100  |
| 結果           | PASS |

## Phase 11 へ渡した観点

| 観点                            | 理由                                         |
| ------------------------------- | -------------------------------------------- |
| expanded/collapsed の視覚的密度 | 自動テストだけでは余白バランスを判定できない |
| mobile More の積層感            | portal/overlay の視覚品質は画像で確認が必要  |
| shortcut 実行後の体験連続性     | view 遷移後の見え方は手動で最終確認する      |

## 補足

- lint script は `apps/desktop/package.json` に存在しないため、Phase 9 では未実施扱いで明記する。
- legacy ViewType 互換は `skill-center` alias を含めて `navContract` 側で維持した。
