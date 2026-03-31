# Phase 4: Shared Test Plan

## 対象

- `packages/shared/__tests__/build-verification.test.ts`

## AC 対応

| AC   | 観点               | 検証内容                                   |
| ---- | ------------------ | ------------------------------------------ |
| AC-1 | dual output        | `dist/index.js` と `dist/index.cjs` の生成 |
| AC-2 | exports            | `package.json` の `require` 条件           |
| AC-4 | build verification | `.js -> .cjs` 変換整合と require 未欠落    |

## 実測値

- current worktree 再実行: 8/8 PASS
- コマンド: `pnpm --filter @repo/shared exec vitest run __tests__/build-verification.test.ts`
