# Phase 11 Manual Test Checklist

## テスト方式

- 種別: `NON_VISUAL`
- 主証跡: command / log / documentation walkthrough
- validator 互換: `screenshot-plan.json` と placeholder evidence を inventory として保持

## チェック項目

- [ ] `node -p "process.platform + '-' + process.arch"` を実行した
- [ ] `file "$(which node)"` を実行した
- [ ] `pnpm ls esbuild @esbuild/darwin-arm64 @esbuild/darwin-x64` を実行した
- [ ] 対象テストを 1 回実行で再実行した
- [ ] docs の追試可否を確認した
- [ ] blocker / note を `discovered-issues.md` に反映した
