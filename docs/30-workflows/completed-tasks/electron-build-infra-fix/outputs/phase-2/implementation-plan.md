# Phase 2: 実装計画

## 変更ファイル一覧

### 修正

| #   | パス                                   | 変更内容                                                     | 問題 | 依存 |
| --- | -------------------------------------- | ------------------------------------------------------------ | ---- | ---- |
| M1  | `packages/shared/tsup.config.ts`       | `format: ["esm", "cjs"]` に変更                              | A    | なし |
| M2  | `packages/shared/package.json`         | 全 exports に `require` 条件追加                             | A    | M1   |
| M3  | `apps/desktop/electron.vite.config.ts` | preload の externalize から @repo/shared を除外              | A    | M1   |
| M4  | `apps/desktop/package.json`            | `rebuild:electron` スクリプト追加 + `@electron/rebuild` 追加 | B    | なし |
| M5  | `package.json` (root)                  | `@esbuild/darwin-x64` 削除、postinstall 改善                 | A+B  | なし |
| M6  | `scripts/setup-native-modules.sh`      | Electron ABI 検査追加                                        | B    | M4   |
| M7  | `apps/desktop/electron-builder.yml`    | `afterPack` 登録                                             | B    | N1   |

### 新規作成

| #   | パス                                                   | 内容                         | 問題 | 依存 |
| --- | ------------------------------------------------------ | ---------------------------- | ---- | ---- |
| N1  | `apps/desktop/scripts/rebuild-native-for-electron.mjs` | afterPack 再ビルドスクリプト | B    | M4   |

## 実行順序

### 問題A（直列）

1. M5: esbuild 衝突解消 → ビルド基盤の復旧
2. M1: shared dual output
3. M2: shared exports 更新
4. M3: preload externalize 修正
5. ビルド確認: `pnpm --filter @repo/shared build` → `pnpm --filter @repo/desktop build`

### 問題B（直列）

1. M4: electron-rebuild 追加 + rebuild スクリプト
2. M6: setup-native-modules.sh の Electron 対応
3. N1: afterPack スクリプト新規作成
4. M7: electron-builder.yml に afterPack 登録
5. ABI 確認: `ELECTRON_RUN_AS_NODE=1 electron -e "require('better-sqlite3')"`

### 問題A と問題B は並列実行可能

M5 の完了後、問題A（M1→M2→M3）と問題B（M4→M6→N1→M7）は独立して進められる。

## 検証コマンド

| AC   | コマンド                                                                                                                                                |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `pnpm --filter @repo/shared build && ls packages/shared/dist/index.js packages/shared/dist/index.cjs`                                                   |
| AC-2 | `node -e "const p=require('./packages/shared/package.json');console.log(p.exports['.'])"`                                                               |
| AC-3 | `pnpm --filter @repo/desktop build && grep -r '@repo/shared' apps/desktop/out/preload/ \|\| echo 'PASS: no external ref'`                               |
| AC-4 | `pnpm --filter @repo/shared test:run`                                                                                                                   |
| AC-5 | `ELECTRON_RUN_AS_NODE=1 ./node_modules/.pnpm/electron@*/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron -e "require('better-sqlite3')"` |
| AC-6 | `pnpm --filter @repo/desktop test:run`                                                                                                                  |
| AC-7 | `pnpm --filter @repo/desktop dev` (手動)                                                                                                                |
| AC-8 | `pnpm lint`                                                                                                                                             |
| AC-9 | `pnpm typecheck`                                                                                                                                        |
