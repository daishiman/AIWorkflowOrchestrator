# Phase 2: Validation Matrix

## 検証手順定義

### Step 1: 対象ファイル限定の旧方言残存確認 (grep)

```bash
# 対象ファイル限定の camelCase 残存確認
rg -n "currentLevel|totalUsageCount|lastEvaluated" \
  .claude/skills/skill-creator/assets/evals-template.json \
  .claude/skills/skill-creator/scripts/init_skill.js \
  .claude/skills/skill-creator/scripts/collect_feedback.js \
  .claude/skills/task-specification-creator/EVALS.json \
  .claude/skills/task-specification-creator/scripts/log-usage.js \
  .claude/skills/int-test-skill/EVALS.json \
  .claude/skills/github-issue-manager/EVALS.json \
  .agents/skills/skill-creator/assets/evals-template.json \
  .agents/skills/skill-creator/scripts/init_skill.js \
  .agents/skills/skill-creator/scripts/collect_feedback.js \
  .agents/skills/task-specification-creator/EVALS.json \
  .agents/skills/task-specification-creator/scripts/log-usage.js \
  .agents/skills/int-test-skill/EVALS.json \
  .agents/skills/github-issue-manager/EVALS.json
# 期待: 0件
```

### Step 2: parity 確認 (diff)

```bash
# 対象スキルごとの .claude/.agents 差分確認
diff .claude/skills/skill-creator/assets/evals-template.json \
     .agents/skills/skill-creator/assets/evals-template.json
diff .claude/skills/skill-creator/scripts/init_skill.js \
     .agents/skills/skill-creator/scripts/init_skill.js
diff .claude/skills/task-specification-creator/EVALS.json \
     .agents/skills/task-specification-creator/EVALS.json
diff .claude/skills/task-specification-creator/scripts/log-usage.js \
     .agents/skills/task-specification-creator/scripts/log-usage.js
diff .claude/skills/int-test-skill/EVALS.json \
     .agents/skills/int-test-skill/EVALS.json
diff .claude/skills/github-issue-manager/EVALS.json \
     .agents/skills/github-issue-manager/EVALS.json
diff .claude/skills/skill-creator/scripts/collect_feedback.js \
     .agents/skills/skill-creator/scripts/collect_feedback.js
diff .claude/skills/skill-creator/schemas/feedback-record.json \
     .agents/skills/skill-creator/schemas/feedback-record.json
# 期待: 全て差分 0件
```

### Step 3: テスト (test)

```bash
# 対象スキルの EVALS.json 構文検証
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/task-specification-creator/EVALS.json','utf8'))" && echo OK
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/int-test-skill/EVALS.json','utf8'))" && echo OK
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/github-issue-manager/EVALS.json','utf8'))" && echo OK
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/skill-creator/assets/evals-template.json','utf8'))" && echo OK
# 期待: 全て OK
```

### Step 4: desktop consumer 確認

```bash
rg -n "skill_name|current_level|total_usage_count" \
  apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts \
  apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json
rg -n "filename: \\\"EVALS.json\\\"" apps/desktop/src/main/services/skill/SkillScanner.ts
# 期待: fixture が snake_case 契約で、SkillScanner は EVALS.json 存在検知のみ
```

## 検証順序

| 順序 | 検証種別          | コマンド               | 期待結果 | フェーズ |
| ---- | ----------------- | ---------------------- | -------- | -------- |
| 1    | grep (旧方言残存) | 対象限定 rg            | 0件      | Phase 7  |
| 2    | diff (parity)     | 変更対象ペア diff      | 差分 0件 | Phase 7  |
| 3    | test (JSON 構文)  | node JSON.parse        | 全 OK    | Phase 7  |
| 4    | desktop consumer  | fixture / scanner grep | 契約一致 | Phase 7  |
| 5    | 総合確認          | 全コマンド再実行       | 全 PASS  | Phase 11 |

## TC と実ファイル対応

| TC    | 確認項目                    | 対象ファイル                                       | 期待結果                                                      |
| ----- | --------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| TC-01 | writer が snake_case で書く | `evals-template.json`                              | `current_level`, `total_usage_count`, `last_evaluated` を含む |
| TC-02 | fixture が snake_case 契約  | `*/EVALS.json`, desktop fixture                    | camelCase キーが存在しない                                    |
| TC-03 | reader が snake_case で読む | `collect_feedback.js`, `log-usage.js`              | snake_case 参照へ統一                                         |
| TC-04 | 旧方言残存 grep が 0件      | 対象ファイル限定                                   | rg 出力 0件                                                   |
| TC-05 | `.claude`/`.agents` parity  | 変更ファイル全対                                   | diff 差分 0件                                                 |
| TC-06 | desktop consumer 回帰       | `skill-creator.fixture.test.ts`, `SkillScanner.ts` | fixture は snake_case、scanner は存在検知のみ                 |
