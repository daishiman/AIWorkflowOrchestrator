# Phase 8: 責務境界マップ

| 層                                                 | 責務                      |
| -------------------------------------------------- | ------------------------- |
| `packages/shared/src/constants/skillName.ts`       | ルールの唯一の定義        |
| `packages/shared/src/claude-cli/constants.ts`      | claude-cli で使う共有定数 |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts` | スキル名の検証            |
| `.claude` / `.agents` `init_skill.js`              | スキル生成時の検証        |
