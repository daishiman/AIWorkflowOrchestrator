# 影響範囲マップ

タスクID: UT-SKILL-WIZARD-W2-seq-03b

## DescribeStep 参照ファイル

| ファイル                                 | 参照方法                                                | index.ts 変更の影響                     |
| ---------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| `wizard/__tests__/DescribeStep.test.tsx` | `import { DescribeStep } from "../DescribeStep"` (直接) | 影響なし                                |
| `wizard/DescribeStep.tsx`                | ファイル自体                                            | ファイルは残存、index.ts からの削除のみ |

## ConfigureStep 参照ファイル

| ファイル                   | 参照方法     | index.ts 変更の影響    |
| -------------------------- | ------------ | ---------------------- |
| `wizard/ConfigureStep.tsx` | ファイル自体 | ファイルは既に削除済み |

## SkillCreateWizard 関連ファイル（index.ts 経由参照）

| ファイル                                                       | 確認事項                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| `skill/SkillCreateWizard.tsx`                                  | DescribeStep/ConfigureStep/WizardOptions の import がないこと |
| `skill/__tests__/SkillCreateWizard.test.tsx`                   | 削除対象エクスポートを使用していないこと                      |
| `skill/__tests__/SkillCreateWizard.W2-seq-03a.test.tsx`        | 削除対象エクスポートを使用していないこと                      |
| `skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`    | 削除対象エクスポートを使用していないこと                      |
| `skill/__tests__/SkillCreateWizard.store-integration.test.tsx` | 削除対象エクスポートを使用していないこと                      |

## 調査結果サマリ

- `SkillCreateWizard.test.tsx` のコメントに `DescribeStep → SkillInfoStep` の移行記録あり（コードではなくコメント）
- 実コードレベルで DescribeStep/ConfigureStep/WizardOptions を index.ts 経由でインポートしているファイルは確認されなかった
- index.ts の変更はコンパイルエラーを発生させないと判断

## リスク評価

| リスク                                | 深刻度 | 対処                                      |
| ------------------------------------- | ------ | ----------------------------------------- |
| DescribeStep.tsx がファイルとして残存 | 低     | index.ts から除外済みであれば外部露出なし |
| 未発見の DescribeStep インポート      | 中     | typecheck で検出可能                      |
