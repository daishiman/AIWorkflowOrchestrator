# Phase 1: 要件サマリー

## 受け入れ基準（AC-1〜AC-9）

| AC   | 条件                                                           | 検証方法                                                                   | 現状                       |
| ---- | -------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------- |
| AC-1 | `packages/shared` が ESM/CJS の両形式を出力する                | `pnpm --filter @repo/shared build` 後に dist/_.js と dist/_.cjs の存在確認 | FAIL: format: ["esm"] のみ |
| AC-2 | shared の公開面に CJS 解決経路がある                           | `packages/shared/package.json` の exports に `require` 条件確認            | FAIL: import のみ          |
| AC-3 | preload bundle に `@repo/shared` への外部 `require` が残らない | preload build 出力で grep 確認                                             | 未確認（ビルド不可）       |
| AC-4 | shared 側のビルド検証テストが全件 PASS                         | vitest                                                                     | 未確認（ビルド不可）       |
| AC-5 | `better-sqlite3` が Electron ABI でロード成功する              | `ELECTRON_RUN_AS_NODE=1 electron -e "require('better-sqlite3')"`           | FAIL: モジュール未発見     |
| AC-6 | desktop 側のビルド検証テストが全件 PASS                        | vitest                                                                     | 未確認                     |
| AC-7 | `pnpm --filter @repo/desktop dev` が起動開始点まで進む         | 手動確認                                                                   | FAIL: ビルドエラー         |
| AC-8 | `pnpm lint` が通る                                             | lint                                                                       | 未確認                     |
| AC-9 | `pnpm typecheck` が通る                                        | typecheck                                                                  | 未確認                     |

## 問題の境界

### 問題A: shared/preload モジュール解決

- **根本原因**: `packages/shared` が ESM のみ出力し、preload（CJS）の `require` 解決に失敗
- **影響範囲**: preload の全 `@repo/shared` インポート（30+ 箇所）
- **副次問題**: esbuild バージョン不整合（root の `@esbuild/darwin-x64: "0.21.5"` vs esbuild 0.27.2）

### 問題B: better-sqlite3 ABI 不整合

- **根本原因**: `better-sqlite3` が Node.js ABI でビルドされ、Electron ABI と不一致
- **影響範囲**: main プロセスの database 関連機能（conversationRepository, conversationDatabase）
- **Electron バージョン**: 39.8.5

## スコープ

### In Scope

- `packages/shared` の ESM/CJS dual output 対応
- preload 側の `@repo/shared` 解決経路修正
- `better-sqlite3` の Electron ABI 再ビルド導線整備
- esbuild バージョン不整合の解消
- ビルド検証テスト・品質 gate

### Out of Scope

- Electron バージョン変更
- `better-sqlite3` の機能追加
- renderer 機能追加
- commit、push、PR作成
