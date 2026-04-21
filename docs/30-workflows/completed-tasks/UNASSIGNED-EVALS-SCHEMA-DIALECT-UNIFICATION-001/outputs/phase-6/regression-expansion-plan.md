# Phase 6: 回帰拡張計画

## 追加する回帰観点

| ID    | 観点                                                                     | 目的                                        |
| ----- | ------------------------------------------------------------------------ | ------------------------------------------- |
| EC-01 | `collect_feedback.js` の snake_case 読み                                 | skill-creator 内混在を除去できたか確認      |
| EC-02 | `task-specification-creator/scripts/log-usage.js` の snake_case 読み書き | 見落とし consumer を再発させない            |
| EC-03 | desktop fixture / test 維持                                              | `apps/desktop` の fixture 契約 break を防ぐ |
| EC-04 | mirror parity                                                            | `.claude` だけ更新して終わる事故を防ぐ      |
| EC-05 | 対象外 `automation-30` 非干渉                                            | スコープ逸脱を防ぐ                          |

## 追加コマンド

- `rg -n "current_level|total_usage_count|last_evaluated" .claude/skills/task-specification-creator/scripts/log-usage.js`
- `rg -n "skill_name" apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`
- 変更対象ペア限定 `diff`
