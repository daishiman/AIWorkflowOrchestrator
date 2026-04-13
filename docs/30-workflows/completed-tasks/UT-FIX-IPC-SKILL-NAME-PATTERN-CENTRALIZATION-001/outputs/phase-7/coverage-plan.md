# Phase 7: カバレッジ計画

## 目的

`skillName.ts` とその利用箇所の変更行を漏れなくカバーする。

## 対象

| 対象                                                 | 観点                           |
| ---------------------------------------------------- | ------------------------------ |
| `packages/shared/src/constants/skillName.ts`         | 正常系 / 異常系 / 境界値       |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | 64 / 65 文字、path traversal   |
| `.claude/skills/skill-creator/scripts/init_skill.js` | runtime import 成功 / 失敗分岐 |
