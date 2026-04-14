# Phase 4: 統合テスト計画

## 目的

`skillName.ts` を shared の単一信頼源にしたあと、desktop と skill-creator の両方で同じ値を参照できることを確認する。

## 計画

| ID    | テスト                                                      | 期待     |
| ----- | ----------------------------------------------------------- | -------- |
| IT-01 | `SkillScanner.validateSkillName("a".repeat(64))`            | true     |
| IT-02 | `SkillScanner.validateSkillName("a".repeat(65))`            | false    |
| IT-03 | `.claude/skills/skill-creator/scripts/init_skill.js --help` | 起動成功 |
| IT-04 | `.agents/skills/skill-creator/scripts/init_skill.js --help` | 起動成功 |

## 判定基準

- runtime で `@repo/shared/constants` が読めること
- `packages/shared/dist/src/constants/index.js` 経由でも同値が参照できること
- 2 実装のバリデーション結果が一致すること
