# Phase 2: 解決方針

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

`current state` がすでに整合しているかを判定し、整合済みなら no-op、ズレがあるなら最小差分で修正する。

## 方針

| 観点        | 方針                                                                       |
| ----------- | -------------------------------------------------------------------------- |
| 定数の定義  | `packages/shared/src/constants/skillName.ts` を正とする                    |
| export 経路 | `packages/shared/src/constants/index.ts` を使う                            |
| consumer    | `SkillScanner.ts` と `init_skill.js` を対象とする                          |
| root barrel | `packages/shared/src/index.ts` は使わない                                  |
| 旧記述      | `SKILL_NAME_MAX_LENGTH` や `SkillService.ts` の旧前提は task spec から削る |

## 分岐

### A. 既に整合済み

- コード変更はしない
- 証跡と docs sync のみ行う

### B. drift が残っている

- `SkillScanner.ts` の参照を shared constants に揃える
- `init_skill.js` の参照経路を `@repo/shared/constants` に揃える
- task spec と canonical docs を同期する

## 変更候補

| ファイル                                             | 変更要否                  |
| ---------------------------------------------------- | ------------------------- |
| `packages/shared/src/constants/skillName.ts`         | 変更なし                  |
| `packages/shared/src/constants/index.ts`             | 変更なし                  |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | drift がある場合のみ修正  |
| `.claude/skills/skill-creator/scripts/init_skill.js` | drift がある場合のみ修正  |
| `.agents/skills/skill-creator/scripts/init_skill.js` | mirror として必要なら修正 |
| `docs/30-workflows/ut-skill-name-pattern-001/*`      | 古い記述があれば修正      |

## 完了条件

- [ ] no-op か patch かの分岐が決定している
- [ ] root barrel 方式を採用しない方針が明確
- [ ] `MAX_SKILL_NAME_LENGTH` と `@repo/shared/constants` に統一されている

## 次のPhase

Phase 3: 設計レビュー
