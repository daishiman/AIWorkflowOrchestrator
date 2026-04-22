# Validation Command Matrix

| コマンド                                                                                            | 目的              | 結果                            |
| --------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                             | 型整合            | 実行済み PASS                   |
| `pnpm --filter @repo/desktop exec eslint src/renderer/components/skill/ConversationalInterview.tsx` | 対象ファイル lint | 実行済み PASS                   |
| `pnpm --filter @repo/desktop exec vitest run ...`                                                   | 対象テスト確認    | esbuild version mismatch で未完 |
