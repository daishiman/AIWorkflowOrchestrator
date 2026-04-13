# テスト拡充確認結果

## wizard-exports.test.ts の内容確認

ファイル: `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts`

含まれているテスト：

- [x] `DescribeStep がエクスポートされていないこと`
- [x] `DescribeStepProps がエクスポートされていないこと`
- [x] 既存エクスポート（StepIndicator / SkillInfoStep / ConversationRoundStep / InterviewProgressBar / ApplySummaryCard / GenerateStep / CompleteStep）が正常にエクスポートされていること

**追加テスト必要性の判断**: 不要。wizard-exports.test.ts の9テストで AC-5 を満たしている。
