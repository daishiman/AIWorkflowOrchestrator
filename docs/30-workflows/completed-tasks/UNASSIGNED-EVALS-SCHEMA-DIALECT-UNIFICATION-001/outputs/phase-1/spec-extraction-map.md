# Phase 1: 正本抽出マップ

## P50 チェック結果

### コマンド

```bash
rg -n "currentLevel|current_level|totalUsageCount|total_usage_count|lastEvaluated|last_evaluated" \
  .claude/skills \
  .agents/skills \
  apps/desktop/src
```

### 発見一覧

| ファイル                                                            | フィールド                                         | 方言       | 対象スキル                                 | 要更新     |
| ------------------------------------------------------------------- | -------------------------------------------------- | ---------- | ------------------------------------------ | ---------- |
| `.claude/skills/skill-creator/assets/evals-template.json`           | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | skill-creator                              | YES        |
| `.agents/skills/skill-creator/assets/evals-template.json`           | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | skill-creator (mirror)                     | YES        |
| `.claude/skills/task-specification-creator/EVALS.json`              | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | task-specification-creator                 | YES        |
| `.agents/skills/task-specification-creator/EVALS.json`              | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | task-specification-creator (mirror)        | YES        |
| `.claude/skills/int-test-skill/EVALS.json`                          | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | int-test-skill                             | YES        |
| `.agents/skills/int-test-skill/EVALS.json`                          | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | int-test-skill (mirror)                    | YES        |
| `.claude/skills/github-issue-manager/EVALS.json`                    | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | github-issue-manager                       | YES        |
| `.agents/skills/github-issue-manager/EVALS.json`                    | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | github-issue-manager (mirror)              | YES        |
| `.claude/skills/skill-creator/scripts/collect_feedback.js`          | `totalUsageCount`, `currentLevel`                  | camelCase  | skill-creator (reader/writer)              | YES        |
| `.claude/skills/skill-creator/schemas/feedback-record.json`         | `totalUsageCount`, `currentLevel`                  | camelCase  | skill-creator (schema)                     | YES        |
| `.claude/skills/task-specification-creator/scripts/log-usage.js`    | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | task-specification-creator (reader/writer) | YES        |
| `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | `skill_name` fixture 前提                          | snake_case | desktop fixture test                       | KEEP       |
| `apps/desktop/src/main/services/skill/SkillScanner.ts`              | `EVALS.json` の存在検知                            | neutral    | desktop static reader                      | KEEP       |
| `.agents/skills/automation-30/EVALS.json`                           | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | automation-30                              | **対象外** |
| `.claude/skills/automation-30/EVALS.json`                           | `currentLevel`, `totalUsageCount`, `lastEvaluated` | camelCase  | automation-30                              | **対象外** |

### snake_case 済み（変更不要）

| ファイル                                                                          | 方言       | スキル                  |
| --------------------------------------------------------------------------------- | ---------- | ----------------------- |
| `.claude/skills/aiworkflow-requirements/EVALS.json`                               | snake_case | aiworkflow-requirements |
| `.agents/skills/aiworkflow-requirements/EVALS.json`                               | snake_case | aiworkflow-requirements |
| `.claude/skills/skill-fixture-runner/EVALS.json`                                  | snake_case | skill-fixture-runner    |
| `.agents/skills/skill-fixture-runner/EVALS.json`                                  | snake_case | skill-fixture-runner    |
| `.claude/skills/skill-creator/EVALS.json`                                         | snake_case | skill-creator           |
| `.agents/skills/skill-creator/EVALS.json`                                         | snake_case | skill-creator           |
| `.claude/skills/aiworkflow-requirements/scripts/log_usage.js`                     | snake_case | aiworkflow-requirements |
| `.claude/skills/skill-creator/scripts/log_usage.js`                               | snake_case | skill-creator           |
| `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` | snake_case | desktop fixture         |

## root 契約確認

| 確認項目                       | 結果       |
| ------------------------------ | ---------- |
| 正本root = `.claude/skills`    | ✓ 確認済み |
| mirror root = `.agents/skills` | ✓ 確認済み |
| `.claude` → `.agents` 一方向   | ✓ 確認済み |

## 依存タスク git log 確認

```bash
git log --oneline -- .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

先行タスク `UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001` は
`docs/30-workflows/completed-tasks/` に存在。Phase 5 着手条件を満たす。
