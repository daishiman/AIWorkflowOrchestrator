# Phase 1: 影響範囲マップ — UT-SKILL-WIZARD-W2-seq-03b

## 削除エクスポートの影響範囲

| 削除エクスポート                   | 参照元                                                                     | 影響                                                |
| ---------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| `DescribeStep`                     | `wizard/index.ts` のみ（`SkillCreateWizard.tsx` はすでに不使用）           | 削除しても `SkillCreateWizard.tsx` への影響なし     |
| `DescribeStepProps`                | 型参照箇所なし                                                             | 削除しても影響なし                                  |
| `GenerationMode`（インライン定義） | `SkillCreateWizard.tsx`（`import type { GenerationMode } from "./wizard"`) | `GenerateStep.tsx` から再エクスポートで継続利用可能 |

## 追加エクスポートの影響範囲

| 追加エクスポート     | 利用先                        | 影響                                   |
| -------------------- | ----------------------------- | -------------------------------------- |
| `SkillInfoStepProps` | 型参照箇所（型安全な import） | 型安全なコンポーネント利用が可能になる |

## 維持エクスポートの確認

| 維持エクスポート                       | 影響                                              |
| -------------------------------------- | ------------------------------------------------- |
| `StepIndicator` / `StepIndicatorProps` | 変更なし                                          |
| `GenerateStep` / `GenerateStepProps`   | 変更なし（`GenerationMode` 再エクスポートが追加） |
| `CompleteStep` / `CompleteStepProps`   | 変更なし                                          |
| `InterviewProgressBar` / 関連型        | 変更なし（仕様外だが維持）                        |
| `ApplySummaryCard` / 関連型            | 変更なし（仕様外だが維持）                        |

## 循環参照リスク

`DescribeStep.tsx` が `import type { GenerationMode } from "./index"` で循環インポートしているが、
`GenerationMode` を `GenerateStep.tsx` 経由で再エクスポートするため、
`DescribeStep.tsx` の既存インポートは引き続き機能する。
