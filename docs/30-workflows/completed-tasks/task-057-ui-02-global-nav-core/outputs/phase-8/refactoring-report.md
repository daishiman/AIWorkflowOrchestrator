# Phase 8 リファクタリングレポート

## 結論

- 構造改善は **実施済み**。
- 追加の挙動変更は入れていない。
- 本Phaseでは「実装時に先行反映した構造改善」を棚卸しし、Step 3 readiness を評価した。

## 実施済みの改善

| 改善項目       | 内容                                                                 | 反映先                                                    |
| -------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| 契約一元化     | ナビ項目/shortcut/mobile primary を `navContract.ts` に集約          | `navigation/navContract.ts`                               |
| レイアウト分離 | `App.tsx` から大きいレイアウト責務を `AppLayout` へ抽出              | `components/organisms/AppLayout/index.tsx`                |
| organism 分離  | desktop/tablet と mobile を `GlobalNavStrip` / `MobileNavBar` に分離 | `components/organisms/GlobalNavStrip/*`, `MobileNavBar/*` |
| overlay 分離   | More メニューを `MoreMenu.tsx` として切り出し                        | `MobileNavBar/components/MoreMenu.tsx`                    |
| shortcut 分離  | keydown ロジックを `useNavShortcuts.ts` に移した                     | `hooks/useNavShortcuts.ts`                                |
| selector 分離  | `uiSlice` 状態を store hooks へ整理                                  | `store/index.ts`                                          |

## 挙動変更の有無

| 観点             | 結果                    |
| ---------------- | ----------------------- |
| feature flag OFF | legacy `AppDock` を維持 |
| feature flag ON  | 新ナビが標準経路        |
| Step 3 削除      | 未実施                  |

## 回帰確認

| コマンド                                                        | 結果              |
| --------------------------------------------------------------- | ----------------- |
| `pnpm --dir apps/desktop test:run ...`（Phase 6 対象7ファイル） | PASS（100 tests） |
| `pnpm --dir apps/desktop typecheck`                             | PASS              |

## 評価

- SoC は Phase 5 開始時点より明確になった。
- ただし `AppDock` rollback path は意図的に残しており、完全移行の構造簡素化は未完了。
