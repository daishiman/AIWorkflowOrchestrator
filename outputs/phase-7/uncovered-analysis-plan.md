# Phase 7: 未到達分析 — UT-SKILL-WIZARD-W2-seq-03b

## エクスポート網羅チェック

| エクスポート                      | テストあり | 型テストあり     | 判定 |
| --------------------------------- | ---------- | ---------------- | ---- |
| `DescribeStep` 削除               | ✅         | ✅               | OK   |
| `ConfigureStep` 削除              | ✅         | —                | OK   |
| `WizardOptions` 削除              | ✅         | —                | OK   |
| `SkillInfoStep` 追加              | ✅         | ✅（型チェック） | OK   |
| `SkillInfoStepProps` 追加         | —          | ✅（型チェック） | OK   |
| `ConversationRoundStep` 追加      | ✅         | ✅（型チェック） | OK   |
| `ConversationRoundStepProps` 追加 | —          | ✅（型チェック） | OK   |
| `StepIndicator` 維持              | ✅         | —                | OK   |
| `GenerateStep` 維持               | ✅         | —                | OK   |
| `CompleteStep` 維持               | ✅         | ✅               | OK   |
| `GenerationMode` 再転送           | —          | ✅（型チェック） | OK   |

## 判定

全エクスポートがテストまたは型チェックでカバーされている。未到達なし。
