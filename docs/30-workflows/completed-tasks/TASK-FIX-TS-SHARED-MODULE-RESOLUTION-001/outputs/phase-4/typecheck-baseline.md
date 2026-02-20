# Phase 4: typecheck ベースライン

## 実行結果

| 項目                    | 値                                                            |
| ----------------------- | ------------------------------------------------------------- |
| 実行コマンド            | `pnpm --filter @repo/desktop exec tsc --noEmit`               |
| 実行日                  | 2026-02-20                                                    |
| 総エラー数              | 228件                                                         |
| @repo/shared 関連エラー | 169件 (TS2307)                                                |
| その他エラー            | TS7006:30, TS2339:20, TS2358:5, TS18046:2, TS2353:1, TS2322:1 |

## エラー分類

| エラーコード | 件数 | 説明                                             |
| ------------ | ---- | ------------------------------------------------ |
| TS2307       | 169  | Cannot find module '@repo/shared/...'            |
| TS7006       | 30   | Parameter implicitly has 'any' type              |
| TS2339       | 20   | Property does not exist on type                  |
| TS2358       | 5    | Left-hand side of 'instanceof' is not object     |
| TS18046      | 2    | Variable is of type 'unknown'                    |
| TS2353       | 1    | Object literal may only specify known properties |
| TS2322       | 1    | Type is not assignable                           |

## 根本原因

`apps/desktop/tsconfig.json` の `compilerOptions.paths` に `@repo/shared` のサブパスマッピングが未定義。TypeScript の `moduleResolution: "bundler"` がモノレポの workspace 参照でソースファイルを解決できない。
