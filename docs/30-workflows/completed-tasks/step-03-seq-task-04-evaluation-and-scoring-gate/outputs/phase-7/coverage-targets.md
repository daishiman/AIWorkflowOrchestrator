# Phase 7: Coverage Targets

## Task04 対象モジュール

| モジュール                                              | 目標                                | 実測 / 根拠                                       |
| ------------------------------------------------------- | ----------------------------------- | ------------------------------------------------- |
| `src/renderer/store/skillEvaluation.ts`                 | Lines >= 85, Branch >= 60           | Lines 89.06, Branch 62.50                         |
| `src/renderer/store/slices/skillEvaluationSlice.ts`     | Lines >= 75, Branch >= 60           | Lines 77.10, Branch 64.70                         |
| `src/renderer/views/SkillCenterView/index.tsx`          | Lines >= 80, Branch >= 70           | Lines 83.41, Branch 75.00                         |
| `src/renderer/components/skill/SkillLifecyclePanel.tsx` | checkpoint の主要 DOM 分岐          | `SkillLifecyclePanel.test.tsx` + TC-11-01〜05     |
| `src/renderer/components/skill/SkillAnalysisView.tsx`   | re-evaluate / improve flow          | `SkillAnalysisView.test.tsx` + TC-11-05           |
| `src/renderer/components/skill/ScoreDisplay.tsx`        | gate badge / delta / score boundary | `ScoreDisplay.test.tsx`                           |
| preload `skill-api.ts`                                  | `evaluatePrompt` 契約               | `skill-api.test.ts`, `skill-api.contract.test.ts` |

## coverage 実行メモ

- 実行コマンド:

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/renderer/store/slices/__tests__/skillEvaluationSlice.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx \
  src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx
```

- 備考:
  - repo 全体の global coverage threshold は未対象ファイルを多数含むため FAIL。
  - Task04 の判断には対象ファイル単位の coverage と targeted test を採用した。
