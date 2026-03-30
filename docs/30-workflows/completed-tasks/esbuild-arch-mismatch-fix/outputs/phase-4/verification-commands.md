# Phase 4: 検証コマンドスイート

## 環境検証コマンド (T-04-1)

| #   | コマンド                                      | 期待結果                          | Red 状態での予想             |
| --- | --------------------------------------------- | --------------------------------- | ---------------------------- |
| 1   | `node -e "console.log(process.arch)"`         | `x64`（現環境で一貫）             | `x64`（Volta x64 Node）      |
| 2   | `uname -m`                                    | `x86_64`                          | `x86_64`（Rosetta 2 シェル） |
| 3   | `ls node_modules/.pnpm/@esbuild+darwin-x64*/` | darwin-x64 バイナリが存在         | node_modules 未構築で不在    |
| 4   | `file $(which node)`                          | Universal binary (x86_64 + arm64) | 同一（Volta シム）           |
| 5   | `sysctl -n hw.optional.arm64`                 | `1`（Apple Silicon）              | 同一                         |

## vitest 検証コマンド (T-04-2)

| #   | コマンド                                                                                                                          | 期待結果                           | Red 状態での予想                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| 1   | `pnpm vitest run --reporter=verbose 2>&1 \| head -20`                                                                             | esbuild エラーなし、テスト実行開始 | node_modules 未構築で esbuild ロードエラー |
| 2   | `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` | PASS/FAIL の判定結果が得られる     | esbuild ロードエラーで実行不可             |

## 品質ゲートコマンド (T-04-3)

| #   | コマンド         | 期待結果    | Red 状態での予想                          |
| --- | ---------------- | ----------- | ----------------------------------------- |
| 1   | `pnpm typecheck` | エラー 0 件 | node_modules 未構築で型解決エラー         |
| 2   | `pnpm lint`      | エラー 0 件 | node_modules 未構築でプラグイン解決エラー |

## TDD 状態

| 項目         | 値                                                    |
| ------------ | ----------------------------------------------------- |
| IS_TDD_PHASE | true                                                  |
| IS_RED       | false（pnpm install 実行済みのため Green に遷移済み） |
| IS_GREEN     | true                                                  |

**注**: Red → Green 遷移は Phase 5 の `pnpm install` 実行で達成。
worktree に node_modules が存在しなかった状態が Red、`pnpm install` 後が Green。

## 統合テスト連携

本コマンドスイートは Phase 5 以降で繰り返し使用され、環境修正の成功を検証する基準となる。
全 8 コマンドが期待結果と一致することで Green 状態を確認する。
