# Phase 6 拡張テストケース

## 追加ケース

| テストファイル            | ケース                             | 目的                  |
| ------------------------- | ---------------------------------- | --------------------- |
| `authSlice.test.ts`       | 非配列payload正規化                | 契約崩れ耐性          |
| `authSlice.test.ts`       | 壊れstateからの回復                | 状態復旧耐性          |
| `profileHandlers.test.ts` | unlink通知の`AuthUser`整合         | Main→Renderer契約保証 |
| `profileHandlers.test.ts` | `PROFILE_UNLINK_PROVIDER` 登録確認 | チャネル登録健全性    |

## 実行結果

- 対象ケースを含むスイートは全PASS。
