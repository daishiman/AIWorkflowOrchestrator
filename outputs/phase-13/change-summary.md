# Phase 13: 変更サマリー — UT-SKILL-WIZARD-W2-seq-03b

## 変更要約

- `DescribeStep` / `DescribeStepProps` / inline `GenerationMode` を barrel から除去
- `SkillInfoStepProps` を barrel から import 可能にした
- `GenerationMode` を `GenerateStep.tsx` 正本の再転送へ統一した
- deprecated `DescribeStep.tsx` の型依存を整理した
- Phase 11-13 の証跡を current task に再同期した

## ユーザー影響

- UI の見た目は変わらない
- 型 import の正本が明確になり、barrel export の誤用が減る
