# Phase 2: Consumer Matrix

## 対象 consumer 横断の責務表

| 対象                        | writer                                                                                                       | fixture / 実体       | reader / consumer                                     | test / guard                  | 現状方言             | 更新要否 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------- | ----------------------------- | -------------------- | -------- |
| skill-creator               | `assets/evals-template.json`, `scripts/collect_feedback.js`, `scripts/init_skill.js`, `scripts/log_usage.js` | `EVALS.json`         | `scripts/collect_feedback.js`, `scripts/log_usage.js` | grep / diff / desktop fixture | 混在                 | YES      |
| aiworkflow-requirements     | `scripts/log_usage.js`                                                                                       | `EVALS.json`         | `scripts/log_usage.js`                                | grep / diff                   | snake_case           | NO       |
| task-specification-creator  | `scripts/log-usage.js`                                                                                       | `EVALS.json`         | `scripts/log-usage.js`                                | grep / diff                   | camelCase            | YES      |
| int-test-skill              | なし                                                                                                         | `EVALS.json`         | なし                                                  | grep / diff                   | camelCase            | YES      |
| github-issue-manager        | なし                                                                                                         | `EVALS.json`         | なし                                                  | grep / diff                   | camelCase            | YES      |
| skill-fixture-runner        | なし                                                                                                         | `EVALS.json`         | validator 予定                                        | grep / diff                   | snake_case           | NO       |
| apps/desktop fixture / test | fixture `complete-skill/EVALS.json`                                                                          | fixture `EVALS.json` | `skill-creator.fixture.test.ts`, `SkillScanner.ts`    | vitest                        | snake_case / neutral | KEEP     |

## Writer 詳細

| writer ファイル                                   | 対象                        | 書き込む / 初期化するフィールド                        | 現状       | 要更新 |
| ------------------------------------------------- | --------------------------- | ------------------------------------------------------ | ---------- | ------ |
| `skill-creator/assets/evals-template.json`        | 新規 skill fixture          | `currentLevel`, `totalUsageCount`, `lastEvaluated`     | camelCase  | YES    |
| `skill-creator/scripts/init_skill.js`             | 新規 skill 作成             | `currentLevel`, `totalUsageCount`, `lastEvaluated`     | camelCase  | YES    |
| `skill-creator/scripts/collect_feedback.js`       | skill-creator feedback 集計 | `totalUsageCount`, `currentLevel`                      | camelCase  | YES    |
| `task-specification-creator/scripts/log-usage.js` | task-specification-creator  | `currentLevel`, `totalUsageCount`, `lastEvaluated`     | camelCase  | YES    |
| `aiworkflow-requirements/scripts/log_usage.js`    | aiworkflow-requirements     | `total_usage_count`, `last_evaluated`, `current_level` | snake_case | NO     |
| `skill-creator/scripts/log_usage.js`              | skill-creator               | `total_usage_count`, `last_evaluated`, `current_level` | snake_case | NO     |

## Reader 詳細

| reader / consumer ファイル                                          | 読み込むフィールド                                                 | 現状       | 要更新 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- | ------ |
| `skill-creator/scripts/collect_feedback.js`                         | `existingEvals.currentLevel`                                       | camelCase  | YES    |
| `task-specification-creator/scripts/log-usage.js`                   | `currentLevel`, `metrics.totalUsageCount`, `metrics.lastEvaluated` | camelCase  | YES    |
| `aiworkflow-requirements/scripts/log_usage.js`                      | `current_level`, `metrics.total_usage_count`                       | snake_case | NO     |
| `skill-creator/scripts/log_usage.js`                                | `current_level`, `metrics.total_usage_count`                       | snake_case | NO     |
| `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | `skill_name`                                                       | snake_case | KEEP   |
| `apps/desktop/src/main/services/skill/SkillScanner.ts`              | `EVALS.json` の存在                                                | neutral    | KEEP   |

## 対象外だが誤検知しやすい consumer

| ファイル                                  | 理由                             | 扱い                     |
| ----------------------------------------- | -------------------------------- | ------------------------ |
| `.claude/skills/automation-30/EVALS.json` | camelCase 残存だが本タスク対象外 | grep / diff 対象から除外 |
| `.agents/skills/automation-30/EVALS.json` | 上と同じ                         | grep / diff 対象から除外 |
