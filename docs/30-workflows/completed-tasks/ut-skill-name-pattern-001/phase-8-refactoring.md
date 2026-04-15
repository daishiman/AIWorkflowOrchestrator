# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 8                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

コードではなく spec の冗長さを削る。`SkillService.ts` 旧前提、`packages/shared/src/index.ts`、`SKILL_NAME_MAX_LENGTH` の記述を除去し、current facts に揃える。

## Before / After

| 対象           | Before                         | After                                    |
| -------------- | ------------------------------ | ---------------------------------------- |
| task spec 全体 | 旧バグ状態の前提が混在         | current facts ベースに統一               |
| barrel 記述    | `packages/shared/src/index.ts` | `packages/shared/src/constants/index.ts` |
| 定数名         | `SKILL_NAME_MAX_LENGTH`        | `MAX_SKILL_NAME_LENGTH`                  |
| consumer 記述  | `SkillService.ts` 中心         | `SkillScanner.ts` / `init_skill.js` 中心 |

## 完了条件

- [ ] 古い前提が task spec から削除されている
- [ ] 変更対象の説明が current facts に一致している

## 次のPhase

Phase 9: 品質保証
