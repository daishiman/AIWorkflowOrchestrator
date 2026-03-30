# Electron ビルドインフラ修正

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| タスクID | TASK-ELECTRON-BUILD-FIX                                |
| タスク名 | electron-build-infra-fix                               |
| 分類     | バグ修正 / インフラ改善                                |
| 優先度   | 高                                                     |
| 規模     | 中規模                                                 |
| 作成日   | 2026-03-30                                             |
| 対象機能 | Electron preload ビルド + ネイティブモジュールリビルド |

## 概要

Electron デスクトップアプリのビルドインフラに存在する2つの問題を修正し、`pnpm install && pnpm --filter @repo/desktop dev` だけでアプリが起動する状態を確立する。

## 問題定義

### 問題A: Preload スクリプトのモジュール解決エラー

- **症状**: `Error: module not found: @repo/shared/src/ipc/channels`
- **原因**: `electron.vite.config.ts` の `externalizeDepsPlugin()` が `@repo/shared` を外部依存として扱い、ランタイムの `require()` として残す。`packages/shared` は ESM のみ（`format: ["esm"]`）でビルドされ、CJS エントリがないため、CJS 形式で出力される preload スクリプトからの `require()` が解決不能になる
- **現状の回避策**: `vite-tsconfig-paths` プラグインがソースを直接参照して解決しているが、ビルド順序に依存する不安定な状態

### 問題B: better-sqlite3 ネイティブモジュールバージョン不整合

- **症状**: `NODE_MODULE_VERSION 127 (Node.js v22) != NODE_MODULE_VERSION 140 (Electron 39.x)`
- **原因**: `pnpm install` で Node.js v22 向けにビルドされたネイティブモジュールが Electron のランタイムで使えない。`scripts/setup-native-modules.sh` は Node.js 向けにリビルドするが、Electron 向けではない
- **不足要素**: `@electron/rebuild` が devDependency に含まれていない、`electron-builder.yml` に `afterPack` フックがない

## 影響ファイル

| ファイル                               | 問題 | 変更種別                 |
| -------------------------------------- | ---- | ------------------------ |
| `apps/desktop/electron.vite.config.ts` | A    | 修正                     |
| `packages/shared/tsup.config.ts`       | A    | 修正（CJS 追加）         |
| `packages/shared/package.json`         | A    | 修正（CJS exports 追加） |
| `apps/desktop/src/preload/channels.ts` | A    | 確認（import パス）      |
| `scripts/setup-native-modules.sh`      | B    | 修正                     |
| `apps/desktop/package.json`            | B    | 修正（スクリプト追加）   |
| `apps/desktop/electron-builder.yml`    | B    | 修正（afterPack 追加）   |
| `package.json`（root）                 | B    | 修正（postinstall）      |
| `.npmrc`                               | B    | 確認                     |

## 最終ゴール

1. `pnpm install && pnpm --filter @repo/desktop dev` だけで、preload モジュール解決エラーなしにアプリが起動する
2. better-sqlite3 が Electron の Node.js バージョンに合致して DB 初期化が成功する
3. ビルド順序に依存しない堅牢なモジュール解決が確立される

## 修正方針

### 問題A の修正方針

`electron.vite.config.ts` の preload ビルド設定で `@repo/shared` を `externalizeDepsPlugin` の除外対象にして、バンドルに含める。加えて、`packages/shared` の `tsup.config.ts` に `format: ["esm", "cjs"]` を追加し、`package.json` の exports に `require` エントリを追加する。

### 問題B の修正方針

`@electron/rebuild` を `apps/desktop` の devDependency に追加し、`scripts/setup-native-modules.sh` を Electron 対応に修正する。`apps/desktop/package.json` に postinstall スクリプトを追加し、`electron-builder.yml` に `afterPack` フックを追加する。

## Phase 一覧

| Phase | 名称             | 成果物                                               |
| ----- | ---------------- | ---------------------------------------------------- |
| 1     | 要件定義         | 要件一覧、影響範囲分析                               |
| 2     | 設計             | 設計書（問題A/B の修正設計）                         |
| 3     | 設計レビュー     | レビュー結果、リスク分析                             |
| 4     | テスト作成       | Red テスト（バンドル検証、モジュール読み込みテスト） |
| 5     | 実装             | コード変更（設定ファイル、スクリプト）               |
| 6     | テスト拡充       | エッジケーステスト追加                               |
| 7     | カバレッジ確認   | カバレッジレポート                                   |
| 8     | リファクタリング | コード整理                                           |
| 9     | 品質保証         | lint / typecheck / 全テスト通過                      |
| 10    | 最終レビュー     | 差分レビュー、チェックリスト                         |
| 11    | 手動テスト       | Electron アプリ起動確認                              |
| 12    | ドキュメント更新 | CHANGELOG、設定ガイド                                |
| 13    | PR 作成          | Pull Request                                         |
