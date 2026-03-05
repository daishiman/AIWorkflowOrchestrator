# Phase 1 受け入れ基準

| AC-ID | 受け入れ基準                                                               | 検証方法                                                      | 判定 |
| ----- | -------------------------------------------------------------------------- | ------------------------------------------------------------- | ---- |
| AC-01 | `AUTH_STATE_CHANGED.user` が Renderer 契約形状で送信される                 | `profileHandlers.test.ts` の `PROFILE_UNLINK_PROVIDER` ケース | PASS |
| AC-02 | `linkedProviders` が非配列でも `fetchLinkedProviders` が `[]` に正規化する | `authSlice.test.ts` 追加ケース                                | PASS |
| AC-03 | 壊れた `linkedProviders` 状態から `linkProvider` が回復できる              | `authSlice.test.ts` 追加ケース                                | PASS |
| AC-04 | 契約崩れがあっても Store 操作で `iterable` 例外を起こさない                | 追加ケース + 既存ケース群                                     | PASS |
| AC-05 | 既存UI挙動（AccountSection Portalテスト）が回帰しない                      | `AccountSection.portal.test.tsx`                              | PASS |
| AC-06 | 型整合性が維持される                                                       | `pnpm --filter @repo/desktop typecheck`                       | PASS |

## 判定

- 全ACを充足。
