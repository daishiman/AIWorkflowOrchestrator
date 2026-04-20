# Phase 9 command-log

## 一括判定コマンド実行ログ（2026-04-19）

### ステップ 1: line budget

```
$ wc -l .claude/scripts/verify-skills-parity.sh .claude/scripts/sync-skills-mirror.sh
      40 .claude/scripts/verify-skills-parity.sh
      48 .claude/scripts/sync-skills-mirror.sh
      88 total
```

### ステップ 2: link check

```
$ for p in .claude/scripts/verify-skills-parity.sh .claude/scripts/sync-skills-mirror.sh \
           .claude/hooks/session-init.sh .husky/pre-push \
           .agents/skills/int-test-skill/SKILL.md \
           .claude/skills/aiworkflow-requirements/scripts/generate-index.js \
           .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
           .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
           .claude/hooks/post-merge-index-regenerate.sh \
           .claude/scripts/setup-merge-drivers.sh; do
    test -e "$p" && echo "OK: $p" || echo "MISSING: $p"
  done
OK: .claude/scripts/verify-skills-parity.sh
OK: .claude/scripts/sync-skills-mirror.sh
OK: .claude/hooks/session-init.sh
OK: .husky/pre-push
OK: .agents/skills/int-test-skill/SKILL.md
OK: .claude/skills/aiworkflow-requirements/scripts/generate-index.js
OK: .claude/skills/aiworkflow-requirements/scripts/validate-structure.js
OK: .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js
OK: .claude/hooks/post-merge-index-regenerate.sh
OK: .claude/scripts/setup-merge-drivers.sh
```

### ステップ 3: mirror parity

```
$ diff -qr .claude/skills .agents/skills
$ echo "parity exit: $?"
parity exit: 0
```

### ステップ 4: index parity

```
$ diff .claude/skills/aiworkflow-requirements/indexes/keywords.json \
       .agents/skills/aiworkflow-requirements/indexes/keywords.json
$ echo "kw exit=$?"
kw exit=0

$ diff .claude/skills/aiworkflow-requirements/indexes/topic-map.md \
       .agents/skills/aiworkflow-requirements/indexes/topic-map.md
$ echo "tm exit=$?"
tm exit=0
```

### ステップ 5: validate-structure

```
$ node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
       .claude/skills/aiworkflow-requirements
# canonical exit=0 （警告: 既存 lessons-learned-*.md 等がサイズ超過だが本タスク責務外）

$ node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
       .agents/skills/aiworkflow-requirements
# mirror exit=0
```

### ステップ 6: shellcheck

```
$ command -v shellcheck
# 未インストール → SKIP（必須ではない）
```

### ステップ 7: verify-skills-parity.sh

```
$ bash .claude/scripts/verify-skills-parity.sh
[parity-check] OK: .claude/skills と .agents/skills に差分はありません
$ echo "verify exit: $?"
verify exit: 0
```

### ステップ 8: audit-unassigned-tasks

```
$ node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
       --json --target-file docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md
# exit=0 （他タスクの missing heading は本タスク範囲外）
```

## 判定サマリ

全 8 ステップ（ステップ 6 は SKIP）で MAJOR なし。**Phase 10 進行可**。
