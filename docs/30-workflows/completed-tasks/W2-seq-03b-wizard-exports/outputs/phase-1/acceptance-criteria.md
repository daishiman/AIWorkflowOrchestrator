# 受け入れ基準チェックリスト

タスクID: UT-SKILL-WIZARD-W2-seq-03b

## 削除確認（6件）

- [ ] `DescribeStep` が index.ts にエクスポートされていないこと
- [ ] `DescribeStepProps` が index.ts にエクスポートされていないこと
- [ ] `ConfigureStep` が index.ts にエクスポートされていないこと
- [ ] `ConfigureStepProps` が index.ts にエクスポートされていないこと
- [ ] `WizardOptions` が index.ts にエクスポートされていないこと
- [ ] `GenerationMode` の standalone 再エクスポートが index.ts から除去されていること（GenerateStep 経由のものは維持）

## 追加確認（4件）

- [ ] `SkillInfoStep` が index.ts からエクスポートされていること
- [ ] `SkillInfoStepProps` が index.ts から型エクスポートされていること
- [ ] `ConversationRoundStep` が index.ts からエクスポートされていること
- [ ] `ConversationRoundStepProps` が index.ts から型エクスポートされていること

## 維持確認（6グループ）

- [ ] `StepIndicator`, `stepStateStyles` がエクスポートされていること
- [ ] `StepState`, `StepIndicatorProps` が型エクスポートされていること
- [ ] `GenerateStep` がエクスポートされていること
- [ ] `GenerateStepProps`, `GenerationError`, `GenerationMode`, `GenerationStage`, `GenerationErrorCode` が型エクスポートされていること
- [ ] `CompleteStep` がエクスポートされていること
- [ ] `CompleteStepProps` が型エクスポートされていること

## 品質基準

- [ ] `tsc --noEmit` がエラーなく通過すること
- [ ] wizard 配下の全テスト（8ファイル）が PASS すること
- [ ] SkillCreateWizard 関連テスト（4ファイル）が PASS すること
