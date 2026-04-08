# Phase 11 成果物: 手動テストチェックリスト

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 |
| Phase    | 11 — 手動テスト（NON_VISUAL）                  |
| 作成日   | 2026-04-08                                     |

---

## チェック項目

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
- `pnpm --filter @repo/desktop exec vitest run --coverage src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --coverage.include="**/wizard/ConversationRoundStep.tsx"`
- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop lint`
- `buildInitialAnswers()` の semantic default 正規化と null フォールバックをコードレビューで再確認

## 備考

- NON_VISUAL のためスクリーンショットは不要
- 主証跡は vitest / typecheck / lint / coverage の automation evidence
