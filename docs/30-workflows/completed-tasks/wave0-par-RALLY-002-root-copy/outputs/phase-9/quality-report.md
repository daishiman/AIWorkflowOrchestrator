# Quality Report

| 項目      | 結果    | 備考                                                                                                |
| --------- | ------- | --------------------------------------------------------------------------------------------------- |
| typecheck | PASS    | `pnpm --filter @repo/desktop typecheck`                                                             |
| eslint    | PASS    | `pnpm --filter @repo/desktop exec eslint src/renderer/components/skill/ConversationalInterview.tsx` |
| vitest    | BLOCKED | esbuild host/binary mismatch                                                                        |

- 総括: RALLY-002 スコープでは文書・依存・静的整合は PASS。自動テストは環境制約あり。
