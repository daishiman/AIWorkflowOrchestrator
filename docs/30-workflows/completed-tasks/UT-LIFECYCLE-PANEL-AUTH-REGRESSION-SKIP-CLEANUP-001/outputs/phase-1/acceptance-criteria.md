# Phase 1: 受け入れ基準

| ID   | 受け入れ基準                                                | 検証方法                                               | 優先度 |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------ | ------ |
| AC-1 | 対象ファイルの `describe.skip` が 0件になっている           | `grep -c "describe\.skip" <ファイルパス>` の結果が 0   | Must   |
| AC-2 | TC-08 が describe に昇格し PASS する                        | vitest run でTC-08のテストが PASS                      | Must   |
| AC-3 | `auth:login` IPC を検証するテストが最低 1件有効化されている | TC-08が activeな describe ブロックとして PASS する     | Must   |
| AC-4 | `pnpm --filter @repo/desktop test:run` が全件 PASS する     | CI相当のコマンドが 0 failure                           | Must   |
| AC-5 | TypeScript 型チェックが 0 error である                      | `pnpm --filter @repo/desktop typecheck` が exit code 0 | Must   |
