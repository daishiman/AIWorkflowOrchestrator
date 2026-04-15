# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 11                                 |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## NON_VISUAL 宣言

このタスクは UI 変更を伴わないため NON_VISUAL である。
証跡は build / typecheck / test / grep の結果で十分であり、スクリーンショットは不要。

## 確認項目

| 項目                 | 証跡                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- | --------------- |
| shared build         | `pnpm --filter @repo/shared build`                                                       |
| desktop typecheck    | `pnpm --filter @repo/desktop typecheck`                                                  |
| targeted test        | `pnpm --filter @repo/shared exec vitest run src/constants/skillName.test.ts`             |
| scanner regression   | `pnpm --filter @repo/desktop test -- --grep "validateSkillName                           | skill-scanner"` |
| stale reference grep | `packages/shared/src/index.ts` / `SKILL_NAME_MAX_LENGTH` が task spec に残っていないこと |

## 完了条件

- [ ] NON_VISUAL であることが明記されている
- [ ] 代替証跡が揃っている
- [ ] `SkillScanner.ts` と `init_skill.js` の current facts が崩れていない

## 次のPhase

Phase 12: ドキュメント更新
