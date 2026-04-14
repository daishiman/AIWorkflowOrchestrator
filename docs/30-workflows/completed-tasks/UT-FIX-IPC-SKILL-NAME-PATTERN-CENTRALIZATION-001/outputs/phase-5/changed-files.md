# Phase 5: 変更ファイル一覧

| ファイル                                                           | 変更                             |
| ------------------------------------------------------------------ | -------------------------------- |
| `packages/shared/src/constants/skillName.ts`                       | 新規作成                         |
| `packages/shared/src/constants/index.ts`                           | export 追加                      |
| `packages/shared/src/claude-cli/constants.ts`                      | shared 定数参照へ寄せた          |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`                 | import 参照へ変更                |
| `.claude/skills/skill-creator/scripts/init_skill.js`               | shared import + runtime fallback |
| `.agents/skills/skill-creator/scripts/init_skill.js`               | mirror 同期                      |
| `packages/shared/src/constants/skillName.test.ts`                  | 新規テスト                       |
| `packages/shared/src/constants/__tests__/manual-import.test.ts`    | barrel export 検証強化           |
| `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` | 境界値 / 経路汚染テスト追加      |
