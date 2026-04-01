# Phase 5 Implementation Sequencing

1. `SkillExecutor.ts` の `env` 合成を `{ ...process.env, ANTHROPIC_API_KEY: apiKey }` に変更する。
2. `SkillExecutor.auth.test.ts` に PATH / precedence の回帰ケースを追加する。
3. `SkillExecutor.sdk-types.test.ts` を baseline として維持する。
4. `typecheck` と auth suite を再実行する。
