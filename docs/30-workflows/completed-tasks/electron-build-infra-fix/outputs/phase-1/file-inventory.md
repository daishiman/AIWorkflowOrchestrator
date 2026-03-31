# Phase 1: ファイルインベントリ

## 修正対象

| パス                                   | 責務                     | 問題 | 変更内容                                 |
| -------------------------------------- | ------------------------ | ---- | ---------------------------------------- |
| `packages/shared/tsup.config.ts`       | shared ビルド設定        | A    | ESM/CJS dual output に変更               |
| `packages/shared/package.json`         | shared 公開面            | A    | exports に `require` 条件を追加          |
| `apps/desktop/electron.vite.config.ts` | preload bundle 設定      | A    | `@repo/shared` を externalize から除外   |
| `apps/desktop/package.json`            | desktop 依存・スクリプト | B    | Electron 向け rebuild スクリプト追加     |
| `package.json` (root)                  | postinstall 導線         | A+B  | esbuild override 修正 + postinstall 改善 |
| `scripts/setup-native-modules.sh`      | ABI 検査・再ビルド       | B    | Electron ABI 検査を追加                  |
| `apps/desktop/electron-builder.yml`    | パッケージング設定       | B    | afterPack hook 登録                      |

## 新規作成

| パス                                                   | 責務               | 問題 |
| ------------------------------------------------------ | ------------------ | ---- |
| `apps/desktop/scripts/rebuild-native-for-electron.mjs` | afterPack 再ビルド | B    |

## 変更不要

| パス                            | 理由                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/preload/*.ts` | ソースコードの import 文自体は変更不要。ビルド設定側で解決 |
| `apps/desktop/src/main/*.ts`    | better-sqlite3 の使い方自体は正しい。ABI 修正で解決        |
