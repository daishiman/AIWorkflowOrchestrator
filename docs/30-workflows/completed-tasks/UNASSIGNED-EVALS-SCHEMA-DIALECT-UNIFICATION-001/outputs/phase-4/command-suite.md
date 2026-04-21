# Phase 4: Command Suite

## TC-04: 旧方言残存確認 (grep)

```bash
# 対象ファイル限定の camelCase 残存確認（0件が期待値）
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
```

## TC-05: parity 確認 (diff)

```bash
# 変更した各ファイルの .claude/.agents 差分確認（差分 0件が期待値）
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
```

## TC-01/02: JSON 構文検証 (test)

```bash
# 変更後の JSON ファイルが有効な JSON であることを確認
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/skill-creator/assets/evals-template.json','utf8')); console.log('OK')"
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/task-specification-creator/EVALS.json','utf8')); console.log('OK')"
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/int-test-skill/EVALS.json','utf8')); console.log('OK')"
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/github-issue-manager/EVALS.json','utf8')); console.log('OK')"
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/skill-creator/schemas/feedback-record.json','utf8')); console.log('OK')"
```

## TC-03: snake_case 参照確認 (grep)

```bash
# collect_feedback.js と task-specification-creator/log-usage.js が snake_case を参照することを確認
rg -n "current_level|total_usage_count|last_evaluated" \
  .claude/skills/skill-creator/scripts/collect_feedback.js \
  .claude/skills/task-specification-creator/scripts/log-usage.js
```

## TC-06: desktop consumer 回帰確認

```bash
rg -n "skill_name|current_level|total_usage_count" \
  apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts \
  apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json
rg -n "filename: \\\"EVALS.json\\\"" \
  apps/desktop/src/main/services/skill/SkillScanner.ts
```

## 全コマンド再実行スクリプト

```bash
#!/bin/bash
set -e
echo "=== TC-04: camelCase 残存確認 ==="
COUNT=$(rg -l "currentLevel|totalUsageCount|lastEvaluated" \
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
  .agents/skills/github-issue-manager/EVALS.json 2>/dev/null | wc -l)
echo "残存ファイル数: $COUNT（期待: 0）"

echo "=== TC-05: parity 確認 ==="
for f in \
  "skill-creator/assets/evals-template.json" \
  "skill-creator/scripts/init_skill.js" \
  "task-specification-creator/EVALS.json" \
  "task-specification-creator/scripts/log-usage.js" \
  "int-test-skill/EVALS.json" \
  "github-issue-manager/EVALS.json" \
  "skill-creator/scripts/collect_feedback.js" \
  "skill-creator/schemas/feedback-record.json"; do
  diff ".claude/skills/$f" ".agents/skills/$f" && echo "PASS: $f" || echo "FAIL: $f"
done

echo "=== TC-06: desktop consumer ==="
rg -n "skill_name|current_level|total_usage_count" \
  apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts \
  apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json
```
