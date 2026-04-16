# 変更ファイル一覧 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## 変更ファイル

| ファイル                                                                     | 変更種別 | 変更内容                             |
| ---------------------------------------------------------------------------- | -------- | ------------------------------------ |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | 接続コード追加・generateSkillMd 追加 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 修正     | TC-SC-CONNECT-01〜03 テスト追加      |

## SkillCreatorService.ts の変更概要

1. `void structurePlan;` 行を削除
2. `skillDir` 計算後に接続コード（4行）を追加
3. インライン SKILL.md 生成を `if (!skillMdGeneratedByStructurePlan)` でガード
4. `generateSkillMd(skillDir, structurePlan)` private メソッドを追加（約50行）

## 変更なしファイル

- `apps/desktop/src/main/services/skill/ScriptExecutor.ts` — 変更不要
- `apps/desktop/src/main/services/skill/ResourceLoader.ts` — 変更不要
- `apps/desktop/src/main/services/skill/constants.ts` — 変更不要
- `.agents/skills/skill-creator/scripts/generate_skill_md.js` — 変更不要（依存タスク完了済み）
