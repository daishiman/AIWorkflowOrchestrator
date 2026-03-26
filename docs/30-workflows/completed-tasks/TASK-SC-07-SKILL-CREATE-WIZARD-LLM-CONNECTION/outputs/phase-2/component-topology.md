# Phase 2: コンポーネントトポロジ

SkillCreateWizard（状態オーナー）
├─ DescribeStep（description + generationMode選択）
├─ ConfigureStep（templateモード時のみ）
├─ GenerateStep（generationProgress + plan結果 + 実行/キャンセル）
└─ CompleteStep（既存）
