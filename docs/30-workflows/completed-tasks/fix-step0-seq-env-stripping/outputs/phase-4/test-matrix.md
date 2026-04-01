# Phase 4 Test Matrix

| TC    | 観点                     | 入力                                           | 期待結果                               |
| ----- | ------------------------ | ---------------------------------------------- | -------------------------------------- |
| TC-01 | `PATH` 保持              | `PATH` を sentinel 値に固定                    | `options.env.PATH` が同じ値で渡る      |
| TC-02 | `ANTHROPIC_API_KEY` 付与 | `validApiKey` を使用                           | `options.env.ANTHROPIC_API_KEY` が渡る |
| TC-03 | precedence               | `process.env.ANTHROPIC_API_KEY` に conflict 値 | AuthKeyService の値が優先される        |

## 対象ファイル

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`
