# Phase 1: 現状監査

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 1                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

現行コードと正本仕様の current facts を確認し、task spec が古い前提を持っていないかを判定する。

## 監査対象

| ファイル                                             | 確認ポイント                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| `packages/shared/src/constants/skillName.ts`         | `SKILL_NAME_PATTERN` と `MAX_SKILL_NAME_LENGTH` の定義                   |
| `packages/shared/src/constants/index.ts`             | barrel export の有無                                                     |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | `@repo/shared/constants` の参照                                          |
| `.claude/skills/skill-creator/scripts/init_skill.js` | `@repo/shared/constants` の参照と CJS/ESM 互換                           |
| `docs/00-requirements/18-skills.md`                  | 64 文字ルールと kebab-case 正規化の正本                                  |
| `docs/30-workflows/ut-skill-name-pattern-001/`       | `packages/shared/src/index.ts` や `SKILL_NAME_MAX_LENGTH` の誤記がないか |

## 実行手順

1. 共有定数の実在を確認する。
2. `SkillScanner.ts` と `init_skill.js` が shared constants を参照していることを確認する。
3. 既存テスト `packages/shared/src/constants/skillName.test.ts` と
   `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` の境界値が 64 で揃っていることを確認する。
4. task spec 内に `packages/shared/src/index.ts` / `SKILL_NAME_MAX_LENGTH` / `__tests__/skillName.test.ts` の古い記述が残っていないか確認する。

## 参照コマンド

```bash
sed -n '1,80p' packages/shared/src/constants/skillName.ts
sed -n '1,120p' packages/shared/src/constants/index.ts
sed -n '1,80p' apps/desktop/src/main/claude-cli/SkillScanner.ts
sed -n '1,220p' .claude/skills/skill-creator/scripts/init_skill.js
rg -n "packages/shared/src/index.ts|SKILL_NAME_MAX_LENGTH|__tests__/skillName.test.ts" docs/30-workflows/ut-skill-name-pattern-001
```

## 成果物

| 成果物       | パス                                     |
| ------------ | ---------------------------------------- |
| 現状監査結果 | `outputs/phase-1/current-state-audit.md` |
| スコープ नोट | `outputs/phase-1/scope-notes.md`         |

## 完了条件

- [ ] `skillName.ts` と `constants/index.ts` の実在が確認できている
- [ ] `SkillScanner.ts` と `init_skill.js` の参照経路が確認できている
- [ ] `MAX_SKILL_NAME_LENGTH = 64` が正本と一致している
- [ ] task spec に古い前提が残っていない

## 次のPhase

Phase 2: 解決方針
