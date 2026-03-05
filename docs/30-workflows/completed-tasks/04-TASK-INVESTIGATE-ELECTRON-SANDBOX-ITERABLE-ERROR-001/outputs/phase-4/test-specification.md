# Phase 4 テスト仕様

## Redで固定した追加ケース

1. `authSlice.fetchLinkedProviders` が非配列payloadを受けても `[]` に正規化する。
2. `authSlice.linkProvider` が壊れた state (`linkedProviders` 非配列) から復旧する。
3. `profileHandlers` の `PROFILE_UNLINK_PROVIDER` が `AUTH_STATE_CHANGED.user` を `AuthUser` 形状で通知する。

## 既存回帰確認

- `AccountSection.portal.test.tsx` を同時実行し、UI側挙動の退行を抑止する。
