# feat(skill-wizard): W1-par-02b ConversationRoundStep.tsx 実装（Step 1: 会話ラリー質問 / ConfigureStep 置換 / semantic default 正規化）

## 概要

- `ConversationRoundStep.tsx` を新規追加し、6問固定・2ページの会話ラリーを実装した
- `ConfigureStep.tsx` を削除し、`WizardOptions` 参照を除去した
- `buildInitialAnswers()` で `自分だけ` などの semantic default を canonical label に正規化した
- `wizard/index.ts` に `ConversationRoundStep` / `buildInitialAnswers` / `QUESTIONS` / `ConversationRoundStepProps` を export した
- `InterviewProgressBar.tsx` を再利用し、進捗表示の重複を避けた
- `ConversationRoundStep.test.tsx` を 19 tests まで拡張し、canonical / alias の両経路を固定した

## 変更ファイル

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/index.ts`
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/__snapshots__/ConversationRoundStep.test.tsx.snap`
- `docs/30-workflows/ut-skill-wizard-w1-conversation-round-step-001/`
- `.claude/skills/aiworkflow-requirements/`

## 検証

- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/desktop lint`: PASS
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --reporter=dot`: PASS
- `pnpm --filter @repo/desktop exec vitest run --coverage src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --coverage.include="**/wizard/ConversationRoundStep.tsx"`: PASS

## 補足

- Phase 13 はユーザー承認待ちのため blocked
