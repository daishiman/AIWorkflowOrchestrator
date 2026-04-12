# Phase 7: カバレッジ計画 — UT-SKILL-WIZARD-W2-seq-03b

## カバレッジ目標

| 対象                   | 目標 | 計測対象                                                                                                                      |
| ---------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| 変更契約の確認         | 100% | DescribeStep / DescribeStepProps / inline GenerationMode / SkillInfoStepProps / 再転送 GenerationMode                         |
| 回帰ガードの確認       | 100% | ConfigureStep / WizardOptions が依然として非公開であること                                                                    |
| 維持エクスポートの確認 | 100% | StepIndicator / SkillInfoStep / ConversationRoundStep / InterviewProgressBar / ApplySummaryCard / GenerateStep / CompleteStep |

## 計測コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/wizard-exports.test.ts
pnpm --filter @repo/desktop typecheck
```
