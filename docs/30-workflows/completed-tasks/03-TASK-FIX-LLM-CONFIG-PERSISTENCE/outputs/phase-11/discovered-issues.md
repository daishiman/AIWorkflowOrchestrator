# Phase 11: Discovered Issues

## 重大な機能不整合

- なし

## 実行環境ブロッカー

- `pnpm --filter @repo/desktop screenshot:task-fix-llm-config-persistence` は current shell の `node=x64` と `@esbuild/darwin-arm64` の不一致で build が停止する。
- dedicated harness / capture script / screenshot plan 自体は生成済みで、機能ロジックの `pnpm --filter @repo/desktop typecheck` は通過している。
- Phase 11 の visual evidence は `node apps/desktop/scripts/capture-llm-config-persistence-phase11-fallback.mjs` で補完し、PNG 4件と `phase11-capture-metadata.json` を生成済み。

## Phase 12 で反映済みの確認事項

- screenshot 実行結果を `manual-test-result.md` と `phase12-task-spec-compliance-check.md` に同期した。
- build blocker を `documentation-changelog.md` と system spec 側の artifact inventory に同期した。
