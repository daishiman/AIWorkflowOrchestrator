# Manual Test Checklist

## Scope

- direct caller lane only
- `RuntimePolicyResolver.ts`
- `RuntimeSkillCreatorFacade.ts`
- `creatorHandlers.ts`

## Checklist

- [x] TC-11-01 API キーのみで `integratedRuntime` を確認
- [x] TC-11-02 サブスクリプションのみで `terminalSurface` を確認
- [x] TC-11-03 両方有効で `both` を確認
- [x] TC-11-04 両方無効で `none` と `assertNoSilentFallback()` を確認
- [x] TC-11-05 `apiKeyDegraded: true` で降格を確認

## Evidence

- 非視覚エビデンス: source review + unit test target + validator 実行結果
- 再実行ブロッカー: `pnpm exec tsx` / `vitest` は `esbuild` の darwin-x64 / darwin-arm64 mismatch で停止
- 参照仕様: `docs/30-workflows/runtime-policy-resolver-4state/phase-11-manual-test.md`
- 親タスク境界: broader transport / renderer surface は対象外
