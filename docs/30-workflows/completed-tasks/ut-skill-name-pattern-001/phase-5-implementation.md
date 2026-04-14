# Phase 5: 実装/同期

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 5                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

Phase 1-3 の結果に応じて、必要な最小差分だけを適用する。current facts に drift がなければ no-op にする。

## 実施方針

| 状況       | 実施内容                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| 整合済み   | コード変更なし、証跡のみ記録                                             |
| drift あり | `SkillScanner.ts` / `init_skill.js` / task spec の旧記述を最小差分で修正 |

## 修正候補

| ファイル                                             | 期待状態                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/shared/src/constants/skillName.ts`         | 変更なし                                                              |
| `packages/shared/src/constants/index.ts`             | 変更なし                                                              |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | `@repo/shared/constants` 参照に統一                                   |
| `.claude/skills/skill-creator/scripts/init_skill.js` | `@repo/shared/constants` 参照に統一                                   |
| `.agents/skills/skill-creator/scripts/init_skill.js` | mirror を維持                                                         |
| `docs/30-workflows/ut-skill-name-pattern-001/*`      | `packages/shared/src/index.ts` / `SKILL_NAME_MAX_LENGTH` の誤記を除去 |

## 参考コマンド

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared exec vitest run src/constants/skillName.test.ts
```

## 完了条件

- [ ] drift があれば最小差分のみ適用されている
- [ ] drift がなければ no-op が記録されている
- [ ] `MAX_SKILL_NAME_LENGTH = 64` と `@repo/shared/constants` が維持されている

## 次のPhase

Phase 6: テスト拡張
