# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| タスクID   | UT-LLM-MOD-01-005 |
| テスト分類 | NON_VISUAL        |
| 実施日     | 2026-03-25        |

## チェックリスト

| TC-ID    | 観点         | 実施内容                                                                                                       | 証跡                                     | 結果 |
| -------- | ------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---- |
| TC-11-01 | typecheck    | `pnpm --filter @repo/shared typecheck` / `pnpm --filter @repo/desktop typecheck` を実行し、型エラー 0 件を確認 | `outputs/phase-11/manual-test-result.md` | PASS |
| TC-11-02 | schemas test | `pnpm vitest run packages/shared/src/types/llm/schemas/__tests__/` を実行し、323 テスト全 PASS を確認          | `outputs/phase-11/manual-test-result.md` | PASS |
| TC-11-03 | SSoT grep    | `PROVIDER_CONFIGS` / `inferProviderId` / `LLMProviderIdSchema` の定義箇所が一意であることを grep で確認        | `outputs/phase-11/manual-test-result.md` | PASS |
| TC-11-04 | lint         | changed files に対する ESLint を実行し、error / warning 0 件を確認                                             | `outputs/phase-11/manual-test-result.md` | PASS |

## 備考

- 本タスクは docs-only ではなく code refactor だが、Phase 11 は NON_VISUAL で完了した
- validator の補助成果物要件に合わせ、`screenshot-plan.json` と `screenshots/non-visual-placeholder.png` を配置した
- 上記 PNG は UI 証跡ではなく、NON_VISUAL タスクであることを明示するプレースホルダーである
