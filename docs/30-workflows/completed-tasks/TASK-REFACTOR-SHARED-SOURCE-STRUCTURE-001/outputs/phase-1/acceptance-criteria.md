# 受入基準一覧 — packages/shared ソースディレクトリ構造統一

| ID    | 受入基準                                                                                                                        | 対応要件    | テスト方法            | 検証ステータス |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------- | -------------- |
| AC-01 | `packages/shared/src/types/auth.ts` が存在し、元の `types/auth.ts` と同一内容である                                             | FR-1        | ファイル内容比較      | [ ]            |
| AC-02 | `packages/shared/src/types/api-keys.ts` が存在し、元の `types/api-keys.ts` と同一内容である                                     | FR-1        | ファイル内容比較      | [ ]            |
| AC-03 | `packages/shared/src/types/common.ts` が存在し、元の `types/common.ts` と同一内容である                                         | FR-1        | ファイル内容比較      | [ ]            |
| AC-04 | `packages/shared/src/types/file-selection.ts` が存在する                                                                        | FR-1        | ファイル存在確認      | [ ]            |
| AC-05 | `packages/shared/src/types/workflow.ts` が存在し、元の `types/workflow.ts` と同一内容である                                     | FR-1        | ファイル内容比較      | [ ]            |
| AC-06 | `import { AuthUser } from "@repo/shared/types/auth"` が `apps/desktop` でコンパイル成功する                                     | FR-2, NFR-1 | TypeScript コンパイル | [ ]            |
| AC-07 | `import { ApiKeyInfo } from "@repo/shared/types/api-keys"` が `apps/desktop` でコンパイル成功する                               | FR-2, NFR-1 | TypeScript コンパイル | [ ]            |
| AC-08 | `package.json` の `exports["./types/auth"]` が `./dist/src/types/auth.d.ts` を指す                                              | FR-2        | JSON 値検証           | [ ]            |
| AC-09 | `package.json` の `typesVersions["*"]["types/auth"]` が `./src/types/auth.ts` を指す                                            | FR-3        | JSON 値検証           | [ ]            |
| AC-10 | `tsup.config.ts` の `entry` に `"src/types/auth.ts"` と `"src/types/api-keys.ts"` が含まれ、旧 `"types/auth.ts"` 等が含まれない | FR-4        | 設定値検証            | [ ]            |
| AC-11 | `src/types/index.ts` が `workflow`、`common`、`auth`、`api-keys` の re-export を含む                                            | FR-5        | ファイル内容検証      | [ ]            |
| AC-12 | `src/types/__tests__/auth.test.ts` が存在し、テストが PASS する                                                                 | FR-6        | `vitest run` 実行     | [ ]            |
| AC-13 | `packages/shared/types/` ディレクトリが存在しない                                                                               | FR-7        | ディレクトリ存在確認  | [ ]            |
| AC-14 | `pnpm --filter @repo/shared build` が成功する                                                                                   | NFR-2       | ビルド実行            | [ ]            |
