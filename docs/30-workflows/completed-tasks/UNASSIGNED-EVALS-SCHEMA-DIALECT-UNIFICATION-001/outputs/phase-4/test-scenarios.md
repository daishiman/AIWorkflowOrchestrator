# Phase 4: テストシナリオ

## TC 一覧

| TC    | 種別     | 確認内容                                                                                                 | 期待結果                  | 優先度 |
| ----- | -------- | -------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| TC-01 | 正常系   | `evals-template.json` / `init_skill.js` が `current_level`, `total_usage_count`, `last_evaluated` を使う | snake_case キーのみ存在   | HIGH   |
| TC-02 | 正常系   | 対象スキルの `EVALS.json` が `current_level`, `total_usage_count`, `last_evaluated` を含む               | snake_case キーのみ存在   | HIGH   |
| TC-03 | 正常系   | `collect_feedback.js` / `log-usage.js` が snake_case を read / write する                                | snake_case 参照・書き込み | HIGH   |
| TC-04 | 残存確認 | 対象ファイル限定で旧方言 grep が 0件                                                                     | `rg ...` → 0件            | HIGH   |
| TC-05 | parity   | `.claude` / `.agents` 対象ファイルの diff が 0件                                                         | `diff -q` → 差分なし      | HIGH   |
| TC-06 | 回帰     | `apps/desktop` fixture / test が snake_case 契約のまま通る                                               | fixture assertion 一致    | HIGH   |
| TC-07 | 負例     | camelCase 残存がある場合に grep または fixture test で落ちる                                             | silent break を見逃さない | MEDIUM |

## TC 対対象ファイル対応

| TC    | 対象ファイル                                                                                                                                                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-01 | `.claude/skills/skill-creator/assets/evals-template.json`, `.claude/skills/skill-creator/scripts/init_skill.js`                                                                                                |
| TC-02 | `.claude/skills/task-specification-creator/EVALS.json`, `.claude/skills/int-test-skill/EVALS.json`, `.claude/skills/github-issue-manager/EVALS.json`                                                           |
| TC-03 | `.claude/skills/skill-creator/scripts/collect_feedback.js`, `.claude/skills/task-specification-creator/scripts/log-usage.js`                                                                                   |
| TC-04 | validation-matrix に列挙した対象ファイルのみ                                                                                                                                                                   |
| TC-05 | 変更した全ファイルの `.claude` / `.agents` ペア                                                                                                                                                                |
| TC-06 | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`, `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`, `apps/desktop/src/main/services/skill/SkillScanner.ts` |
| TC-07 | 上記対象一式                                                                                                                                                                                                   |

## 事前条件

- 先行タスク `UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001` 完了済み
- Phase 5 実装完了後に TC-04〜TC-07 を実行する

## 事後条件

- 全 TC が PASS した場合のみ Phase 6 へ進む
- TC-04〜TC-07 のいずれかが FAIL の場合は Phase 5 に戻り修正する
