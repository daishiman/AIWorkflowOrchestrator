# Phase 2: 設計

## 判定

PASS

## 実施結果

- 新規共有型を `packages/shared/src/types/skillCreator.ts` の既存 `ScheduleConfig` 直後に配置する設計を確定した。
- `SkillWizardScheduleConfig` は既存 `ScheduleConfig` と名前衝突しないように分離した。
- root `@repo/shared` へ export を追加せず、`@repo/shared/types/skillCreator` の subpath に閉じる設計を確定した。
- JSDoc と型の依存順序を保つことで、後続 wave の import 解釈を単純化した。

## 設計上の確定事項

| 項目           | 結果                                        |
| -------------- | ------------------------------------------- |
| 配置場所       | `packages/shared/src/types/skillCreator.ts` |
| 公開経路       | `@repo/shared/types/skillCreator` のみ      |
| 衝突回避       | `skill.ts` の `SkillCategory` と分離        |
| スケジュール型 | `SkillWizardScheduleConfig` を採用          |
