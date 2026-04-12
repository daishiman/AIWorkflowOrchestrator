# Phase 5: 変更ファイル一覧

## 新規作成

- `packages/shared/src/types/skill-wizard-label-map.ts`
  - `QuestionSemanticLabelMap` 型
  - `SEMANTIC_LABEL_MAP` 定数（q1〜q6 マッピング）
  - `resolveSemanticLabel()` 純粋関数

- `packages/shared/src/types/index.ts`
  - `QuestionSemanticLabelMap` / `SEMANTIC_LABEL_MAP` / `resolveSemanticLabel()` を barrel から再公開

- `packages/shared/tsup.config.ts`
  - `src/types/skill-wizard-label-map.ts` を build entry に追加

## 変更

- `packages/shared/package.json`
  - `exports["./types/skillWizard"]` 追加
  - `typesVersions["*"]["types/skillWizard"]` 追加

- `apps/desktop/tsconfig.json`
  - `compilerOptions.paths["@repo/shared/types/skillWizard"]` 追加

- `apps/desktop/vitest.config.ts`
  - `resolve.alias["@repo/shared/types/skillWizard"]` 追加

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
  - `import { resolveSemanticLabel, SEMANTIC_LABEL_MAP, QuestionSemanticLabelMap }` 追加
  - `createQuestionAnswer()`: `questionId` パラメータ追加、`resolveSemanticLabel` 呼び出しに変更
  - `applySmartDefaults()`: `function` → `export function` に変更

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
  - `Markdown` / `JSON` / `Jira` / `notion` の回帰テストを追加
