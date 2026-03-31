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

## 実行規約

| 項目             | 規約                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| 正本ディレクトリ | `docs/30-workflows/electron-build-infra-fix/`                                                                 |
| 状態定義         | `pending`=未着手、`in_progress`=実行中、`blocked`=ユーザー承認待ち、`completed`=当該Phaseの成果物と検証が完了 |
| 検証順序         | Phase 2 で A/B の実装レーンを分け、Phase 4-7 で Red→Green→coverage を並列に収束させる                         |
| 分析フレーム     | 30種の思考法を用いて skill 準拠検証とエレガント改善を分離する                                                 |
| Phase 13         | `commit` / `PR` 作成はユーザーの明示承認後のみ実施する。承認前は `blocked` 扱い                               |

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

`@electron/rebuild` を `apps/desktop` の devDependency に追加し、`scripts/setup-native-modules.sh` を Electron 対応に修正する。ネイティブモジュール bootstrap の owner は root `postinstall` に一本化し、`apps/desktop/package.json` には手動復旧用の `rebuild:electron` を定義する。加えて `electron-builder.yml` に `afterPack` フックを追加する。

## Phase 一覧

| Phase | 名称                  | 成果物                                               |
| ----- | --------------------- | ---------------------------------------------------- |
| 1     | 要件定義              | 要件一覧、影響範囲分析                               |
| 2     | 設計                  | 設計書（問題A/B の修正設計）                         |
| 3     | 設計レビュー          | レビュー結果、リスク分析                             |
| 4     | テスト作成            | Red テスト（バンドル検証、モジュール読み込みテスト） |
| 5     | 実装                  | コード変更（設定ファイル、スクリプト）               |
| 6     | テスト拡充            | エッジケーステスト追加                               |
| 7     | カバレッジ確認        | カバレッジレポート                                   |
| 8     | リファクタリング      | コード整理                                           |
| 9     | 品質保証              | lint / typecheck / 全テスト通過                      |
| 10    | 最終レビュー          | 差分レビュー、チェックリスト                         |
| 11    | 手動テスト            | Electron アプリ起動確認                              |
| 12    | ドキュメント更新      | 6つの Phase 12 成果物 + root / system spec 同期      |
| 13    | PR 作成（承認後のみ） | Pull Request                                         |

## Phase リンク

- [Phase 1](./phase-1-requirements.md)
- [Phase 2](./phase-2-design.md)
- [Phase 3](./phase-3-design-review.md)
- [Phase 4](./phase-4-test-creation.md)
- [Phase 5](./phase-5-implementation.md)
- [Phase 6](./phase-6-test-expansion.md)
- [Phase 7](./phase-7-coverage-check.md)
- [Phase 8](./phase-8-refactoring.md)
- [Phase 9](./phase-9-quality-assurance.md)
- [Phase 10](./phase-10-final-review.md)
- [Phase 11](./phase-11-manual-test.md)
- [Phase 12](./phase-12-documentation.md)
- [Phase 13](./phase-13-pr-creation.md)
