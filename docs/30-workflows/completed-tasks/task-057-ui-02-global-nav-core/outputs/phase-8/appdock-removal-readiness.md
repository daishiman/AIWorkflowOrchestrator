# Phase 8 AppDock 削除準備チェックリスト

## 判定

- Step 3 readiness: **NO-GO**
- 理由: rollback path と ownerView 参照がまだ意図的に残っているため。

## 依存棚卸し

| 項目                                       | 現状                 | 判定                       |
| ------------------------------------------ | -------------------- | -------------------------- |
| `App.tsx` の `AppDock` import              | 残存                 | 未削除                     |
| feature flag `VITE_USE_GLOBAL_NAV_STRIP`   | 残存                 | 未削除                     |
| `AppDock.test.tsx`                         | 残存                 | rollback safety として維持 |
| `store/sliceBaseline.ts` の ownerView 記述 | 残存                 | 後続同期が必要             |
| `components/organisms/index.ts` の export  | legacy/export を維持 | 後続同期が必要             |

## Step 3 実施前の必須条件

1. `AppDock` 参照が rollback 目的以外で使われていないことを再棚卸しする。
2. feature flag OFF 運用を終了できることを関係者合意する。
3. `grep -rn "AppDock" apps/desktop/src/renderer` が削除計画どおりの件数だけになることを確認する。
4. `grep -rn "VITE_USE_GLOBAL_NAV_STRIP" apps/desktop/src/renderer` の結果が削除対象のみであることを確認する。
5. Step 3 専用の回帰テストを追加する。

## Step 3 実施後に必要な証跡

- `AppDock` 0件確認
- feature flag 0件確認
- typecheck PASS
- targeted tests PASS
- manual screenshot 再取得

## コメント

- readiness は「設計上どこを切ればよいか分かっている」状態まで到達。
- まだ「今すぐ消してよい」状態ではない。
