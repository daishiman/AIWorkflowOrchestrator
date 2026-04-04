# Phase 4: Desktop Test Plan

## 対象

- `apps/desktop/__tests__/preload-bundle-verification.test.ts`
- `apps/desktop/__tests__/native-module-verification.test.ts`

## AC 対応

| AC   | 観点                 | 検証内容                                               |
| ---- | -------------------- | ------------------------------------------------------ |
| AC-3 | preload bundle       | `externalizeDepsPlugin({ exclude: ["@repo/shared"] })` |
| AC-5 | ABI rebuild          | setup script / rebuild script / afterPack hook         |
| AC-6 | desktop verification | static verification 19 テスト                          |

## 実測値

- current worktree 再実行: 19/19 PASS
- コマンド: `pnpm --filter @repo/desktop exec vitest run __tests__/preload-bundle-verification.test.ts __tests__/native-module-verification.test.ts`
