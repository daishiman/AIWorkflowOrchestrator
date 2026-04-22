# Local Check Result

| コマンド                                                                                            | 結果    | 備考                     |
| --------------------------------------------------------------------------------------------------- | ------- | ------------------------ |
| `pnpm --filter @repo/desktop typecheck`                                                             | PASS    | 実行済み                 |
| `pnpm --filter @repo/desktop exec eslint src/renderer/components/skill/ConversationalInterview.tsx` | PASS    | 実行済み                 |
| `pnpm --filter @repo/desktop exec vitest run ...`                                                   | BLOCKED | esbuild version mismatch |
