# Phase 4: テスト仕様書

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| Phase    | 4                                                |
| タスクID | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001 |
| 状態     | completed                                        |

## サマリー

- `SKILL_NAME_PATTERN` の正常系・異常系を単体テストで固定した。
- `SkillScanner.validateSkillName()` の境界値と経路汚染も追加した。
- `init_skill.js` は runtime で shared 定数を読める前提に更新した。

## 主要ケース

| ID           | 観点                | 期待                            |
| ------------ | ------------------- | ------------------------------- |
| TC-01〜TC-09 | `skillName.ts`      | kebab-case と禁止パターンの判定 |
| TC-10        | `validateSkillName` | 64 文字境界が通る               |
| TC-11        | `validateSkillName` | 65 文字境界が落ちる             |
| TC-12        | `validateSkillName` | 大文字入力が落ちる              |

## 参照ファイル

- `packages/shared/src/constants/skillName.test.ts`
- `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts`
- `.claude/skills/skill-creator/scripts/init_skill.js`
