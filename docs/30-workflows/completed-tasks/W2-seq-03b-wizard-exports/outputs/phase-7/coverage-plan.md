# カバレッジ計画

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b

## 計測対象

`apps/desktop/src/renderer/components/skill/wizard/index.ts`

## カバレッジ目標

| 種別               | 目標                                             |
| ------------------ | ------------------------------------------------ |
| エクスポート宣言行 | 100%                                             |
| 型エクスポート     | コンパイル検証にて代替（実行時カバレッジ対象外） |

## カバレッジ戦略

`index.ts` はバレルファイルであり、実行可能なロジックを持たない。
そのため行カバレッジよりも「全エクスポートシンボルが参照されるテストが存在するか」を重視する。

### エクスポートシンボルとテスト対応

| シンボル                     | テストケース   |
| ---------------------------- | -------------- |
| `StepIndicator`              | 維持確認テスト |
| `stepStateStyles`            | 維持確認テスト |
| `SkillInfoStep`              | 追加確認テスト |
| `SkillInfoStepProps`         | 型確認テスト   |
| `ConversationRoundStep`      | 追加確認テスト |
| `ConversationRoundStepProps` | 型確認テスト   |
| `InterviewProgressBar`       | 維持確認テスト |
| `ApplySummaryCard`           | 維持確認テスト |
| `GenerateStep`               | 維持確認テスト |
| `CompleteStep`               | 維持確認テスト |

## 計測コマンド

```bash
pnpm --filter @repo/desktop test --coverage \
  apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts
```
