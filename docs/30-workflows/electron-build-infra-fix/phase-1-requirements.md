# Phase 1: 要件定義

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| Phase     | 1                                    |
| 名称      | 要件定義                             |
| 前提Phase | なし                                 |
| 成果物    | 要件一覧、影響範囲分析、現状調査結果 |

## 目的

問題A（Preload モジュール解決エラー）と問題B（better-sqlite3 ABI 不整合）の根本原因を確認し、修正に必要な要件を固定する。

## タスク分類

| 項目           | 値                             |
| -------------- | ------------------------------ |
| タスク種別     | バグ修正 / インフラ改善        |
| UI task        | No                             |
| docs-only task | No                             |
| コード変更     | Yes（ビルド設定 + スクリプト） |

## 実行タスク

### Task 1-1: 問題A の再現確認

1. `pnpm --filter @repo/shared build` を実行し、`packages/shared/dist/` 配下に `.js`（ESM）ファイルのみが生成されることを確認する
2. `ls packages/shared/dist/src/ipc/channels.*` を実行し、`channels.js`（ESM）のみ存在し `channels.cjs` が存在しないことを確認する
3. `apps/desktop/electron.vite.config.ts` の L39-56 を読み、preload 設定で `externalizeDepsPlugin()` が引数なしで呼ばれていることを確認する
4. `apps/desktop/src/preload/channels.ts` の L3-6 を読み、`@repo/shared/src/ipc/channels` からの import が存在することを確認する
5. `pnpm --filter @repo/desktop build` を実行し、`out/preload/index.js` 内に `require("@repo/shared/src/ipc/channels")` が残ることを確認する（grep で検証）

**期待結果**: preload バンドルに `require("@repo/shared/...")` がランタイム依存として残り、Electron 起動時に解決不能になることが確認できる

### Task 1-2: 問題A の原因チェーン分析

以下の因果チェーンを確認する：

| 順序 | 事実                                                                      | 確認方法                                                   |
| ---- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1    | `packages/shared/tsup.config.ts` で `format: ["esm"]` のみ指定            | ファイル L44 を読む                                        |
| 2    | `packages/shared/package.json` の exports に `require` エントリがない     | 各 exports エントリに `require` キーがないことを確認       |
| 3    | `externalizeDepsPlugin()` が `@repo/shared` を external 扱いする          | electron-vite のソースコードまたはドキュメントで動作を確認 |
| 4    | preload は `format: "cjs"` で出力される                                   | `electron.vite.config.ts` L50-53 を読む                    |
| 5    | CJS の `require("@repo/shared/...")` が ESM-only パッケージを解決できない | Node.js の ESM/CJS 相互運用仕様                            |

### Task 1-3: 問題B の再現確認

1. `node -p "process.versions.modules"` を実行し、現在の Node.js ABI バージョンを記録する（期待値: 127 = Node.js v22）
2. `apps/desktop/package.json` の `electron` バージョンを読み取る（現在: `^39.2.4`）
3. `npx electron -e "console.log(process.versions.modules)"` を実行し、Electron の ABI バージョンを記録する（期待値: 140）
4. `scripts/setup-native-modules.sh` を読み、`pnpm rebuild better-sqlite3` が Node.js 向けリビルドであることを確認する（`@electron/rebuild` を使用していないことを確認）
5. `pnpm --filter @repo/desktop exec node -e "require('better-sqlite3')"` を Electron コンテキスト外で実行し、成功することを確認する
6. `pnpm --filter @repo/desktop dev` を実行し、Electron 起動時に `NODE_MODULE_VERSION` 不整合エラーが出ることを確認する

**期待結果**: Node.js v22 向けにビルドされた better-sqlite3 バイナリが Electron 39.x のランタイムで読み込めないことが確認できる

### Task 1-4: 問題B の原因チェーン分析

| 順序 | 事実                                                                        | 確認方法                                                                                                               |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1    | `.npmrc` に `build-from-source=true` が設定されている                       | `.npmrc` L3 を読む                                                                                                     |
| 2    | `pnpm install` 時に Node.js v22 (ABI 127) 向けにビルドされる                | `file node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build/Release/better_sqlite3.node` で ABI を確認 |
| 3    | `scripts/setup-native-modules.sh` は `pnpm rebuild better-sqlite3` を使用   | スクリプト L84 を読む                                                                                                  |
| 4    | `pnpm rebuild` は Node.js 向けにリビルドする（Electron ヘッダーを使わない） | pnpm rebuild のドキュメント                                                                                            |
| 5    | `@electron/rebuild` が devDependency に含まれていない                       | `apps/desktop/package.json` の devDependencies に `@electron/rebuild` がないことを確認                                 |
| 6    | `electron-builder.yml` に `afterPack` フックがない                          | ファイル末尾まで読んで `afterPack` がないことを確認                                                                    |

### Task 1-5: 修正要件の確定

**問題A の修正要件:**

| 要件ID | 要件                                                                                                      | 優先度 |
| ------ | --------------------------------------------------------------------------------------------------------- | ------ |
| REQ-A1 | `packages/shared/tsup.config.ts` の `format` に `"cjs"` を追加する                                        | 必須   |
| REQ-A2 | `packages/shared/package.json` の全 exports エントリに `require` キーを追加する                           | 必須   |
| REQ-A3 | `electron.vite.config.ts` の preload 設定で `externalizeDepsPlugin({ exclude: ['@repo/shared'] })` とする | 必須   |
| REQ-A4 | main プロセス設定でも同様に `@repo/shared` を exclude する                                                | 推奨   |
| REQ-A5 | ビルド後の `out/preload/index.js` に `require("@repo/shared/...")` が残らないことをテストで検証する       | 必須   |

**問題B の修正要件:**

| 要件ID | 要件                                                                                                   | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------ | ------ |
| REQ-B1 | `@electron/rebuild` を `apps/desktop/package.json` の devDependencies に追加する                       | 必須   |
| REQ-B2 | `scripts/setup-native-modules.sh` に Electron 向けリビルドモードを追加する                             | 必須   |
| REQ-B3 | `apps/desktop/package.json` に `postinstall` スクリプトを追加し、Electron 向けリビルドを自動実行する   | 必須   |
| REQ-B4 | `electron-builder.yml` に `afterPack` フックを追加し、本番ビルド時にネイティブモジュールをリビルドする | 必須   |
| REQ-B5 | リビルド後の better-sqlite3 バイナリが Electron ABI に合致することをテストで検証する                   | 必須   |

### Task 1-6: 非スコープの明確化

以下は本タスクのスコープ外とする：

| 除外項目                                                 | 理由                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/shared` の ESM-only を CJS-only に変更すること | Web アプリ側が ESM を前提としているため、ESM + CJS デュアル出力が正解 |
| Electron のバージョンアップ                              | 別タスクとして扱う                                                    |
| better-sqlite3 以外のネイティブモジュール対応            | 現時点で問題が報告されているのは better-sqlite3 のみ                  |
| CI/CD パイプラインの修正                                 | 本タスクはローカル開発環境の修正に限定する                            |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                   | 説明                                   |
| ------------------ | -------------------------------------- | -------------------------------------- |
| アーキテクチャ概要 | `references/architecture-overview.md`  | モノレポ構成と Electron アーキテクチャ |
| Electron サービス  | `references/arch-electron-services.md` | Electron Main/Preload/Renderer の責務  |
| デプロイ           | `references/deployment-electron.md`    | Electron ビルド・配布設定              |
| 技術スタック       | `references/technology-desktop.md`     | Electron / electron-vite の技術選定    |

### プロジェクトファイル

| ファイル                               | 説明                                       |
| -------------------------------------- | ------------------------------------------ |
| `apps/desktop/electron.vite.config.ts` | Electron Vite ビルド設定                   |
| `packages/shared/tsup.config.ts`       | shared パッケージビルド設定                |
| `packages/shared/package.json`         | shared パッケージ exports 定義             |
| `scripts/setup-native-modules.sh`      | ネイティブモジュールセットアップスクリプト |
| `apps/desktop/electron-builder.yml`    | electron-builder 設定                      |

## 成果物

| 成果物     | 配置先                                  | 説明           |
| ---------- | --------------------------------------- | -------------- |
| 要件定義書 | `phase-1-requirements.md`（本ファイル） | 修正要件の確定 |

## 完了条件

- [ ] 問題A が `pnpm --filter @repo/desktop build` で再現できることを確認した
- [ ] 問題A の因果チェーン（5ステップ）を全て検証した
- [ ] 問題B が `pnpm --filter @repo/desktop dev` で再現できることを確認した
- [ ] 問題B の因果チェーン（6ステップ）を全て検証した
- [ ] 問題A の修正要件 REQ-A1〜REQ-A5 を確定した
- [ ] 問題B の修正要件 REQ-B1〜REQ-B5 を確定した
- [ ] 非スコープを明確に定義した
- [ ] **本Phase内の全タスクを100%実行完了**
