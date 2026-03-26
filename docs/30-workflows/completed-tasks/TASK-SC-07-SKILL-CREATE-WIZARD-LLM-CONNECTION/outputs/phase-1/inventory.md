# Phase 1: 現行コードインベントリ

## 変更対象ファイル

| ファイル              | 状態管理                                                | イベントハンドラ | UI要素                           |
| --------------------- | ------------------------------------------------------- | ---------------- | -------------------------------- |
| SkillCreateWizard.tsx | description, options, isGenerating, error, skillPath    | handleGenerate   | StepIndicator + 4ステップ切替    |
| DescribeStep.tsx      | - (Props: description, onDescriptionChange, onNext)     | onNext           | textarea + 次へボタン            |
| GenerateStep.tsx      | - (Props: isGenerating, error)                          | -                | スピナー + エラー表示            |
| ConfigureStep.tsx     | - (Props: options, onOptionsChange, onBack, onGenerate) | onGenerate       | WizardOptions チェックボックス群 |
| wizard/index.ts       | -                                                       | -                | 5コンポーネント re-export        |

## 既存テストカバレッジ

- DescribeStep.test.tsx: 16テスト（基本UI + 境界値）
- GenerateStep.test.tsx: 9テスト（スピナー + エラー表示）
- SkillCreateWizard.test.tsx: 20テスト（遷移 + IPC + バリデーション）
