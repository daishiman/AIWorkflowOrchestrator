# Phase 5: 実装サマリー

## 変更ファイル一覧

| ファイル                                                     | 変更種別 | 内容                                                                                    |
| ------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------- |
| `package.json` (root)                                        | 修正     | `@esbuild/darwin-x64` と `@rollup/rollup-darwin-x64` を devDeps から削除                |
| `packages/shared/tsup.config.ts`                             | 修正     | `format: ["esm"]` → `format: ["esm", "cjs"]`                                            |
| `packages/shared/package.json`                               | 修正     | 全34 exports に `require` 条件追加                                                      |
| `apps/desktop/electron.vite.config.ts`                       | 修正     | `externalizeDepsPlugin()` → `externalizeDepsPlugin({ exclude: ["@repo/shared"] })`      |
| `apps/desktop/package.json`                                  | 修正     | `rebuild:electron` スクリプト追加、`@electron/rebuild` 追加                             |
| `apps/desktop/vitest.config.ts`                              | 修正     | デスクトップ検証テストの実行条件を current build-infra 構成に追随                       |
| `scripts/setup-native-modules.sh`                            | 修正     | Electron ABI 検査ブロック追加                                                           |
| `apps/desktop/electron-builder.yml`                          | 修正     | `afterPack` hook 登録                                                                   |
| `apps/desktop/scripts/rebuild-native-for-electron.mjs`       | 新規     | afterPack 再ビルドスクリプト。arch enum 正規化と unpacked `node_modules` 再ビルドに対応 |
| `apps/desktop/scripts/rebuild-sqlite-for-electron.mjs`       | 新規     | 開発環境で Electron バイナリの arch を自動検出して `better-sqlite3` を再ビルド          |
| `packages/shared/__tests__/build-verification.test.ts`       | 修正     | dual output / exports の build verification を固定                                      |
| `apps/desktop/__tests__/preload-bundle-verification.test.ts` | 修正     | preload bundle から `@repo/shared` 外部参照が残らないことを確認                         |
| `apps/desktop/__tests__/native-module-verification.test.ts`  | 修正     | afterPack の arch 正規化回帰テストを追加                                                |

## テストファイル

| ファイル                                                     | テスト数 |
| ------------------------------------------------------------ | -------- |
| `packages/shared/__tests__/build-verification.test.ts`       | 8        |
| `apps/desktop/__tests__/preload-bundle-verification.test.ts` | 5        |
| `apps/desktop/__tests__/native-module-verification.test.ts`  | 15       |
