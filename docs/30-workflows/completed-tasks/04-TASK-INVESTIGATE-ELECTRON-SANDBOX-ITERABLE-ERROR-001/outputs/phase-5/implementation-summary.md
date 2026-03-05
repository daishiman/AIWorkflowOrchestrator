# Phase 5 実装サマリー

## 実装方針

- 最小差分で契約整合を回復し、`iterable` 例外を未然防止。

## 実装内容

- `authSlice.ts`
  - `isLinkedProvider` / `normalizeLinkedProviders` を追加。
  - `fetchLinkedProviders` / `linkProvider` / `unlinkProvider` / `useProviderAvatar` に防御適用。
- `profileHandlers.ts`
  - unlink通知で `toAuthUser` を適用し、`AUTH_STATE_CHANGED.user` を正規化。

## 実装結果

- 4ファイル変更、`+211 / -12`。
- 契約の主因と副作用ログの分離が可能な形に改善。
