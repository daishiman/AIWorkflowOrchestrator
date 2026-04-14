# Phase 2: 変更ファイル一覧

| ファイル                                             | 変更種別 | 変更内容                                                     |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `packages/shared/src/constants/skillName.ts`         | 新規作成 | `SKILL_NAME_PATTERN` 定数を定義                              |
| `packages/shared/src/constants/index.ts`             | 修正     | `export { SKILL_NAME_PATTERN } from "./skillName"` を追記    |
| `packages/shared/src/claude-cli/constants.ts`        | 修正     | `MAX_SKILL_NAME_LENGTH` を shared 定数へ寄せて再エクスポート |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | 修正     | `SKILL_NAME_PATTERN` をインポートし JSDoc 参照を更新         |
| `.claude/skills/skill-creator/scripts/init_skill.js` | 修正     | インラインリテラルを `SKILL_NAME_PATTERN` 参照に置換         |
| `packages/shared/src/constants/skillName.test.ts`    | 新規作成 | TC-01〜TC-09 の単体テスト                                    |
