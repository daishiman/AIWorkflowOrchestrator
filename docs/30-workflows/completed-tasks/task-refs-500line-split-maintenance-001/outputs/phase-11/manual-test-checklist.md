# Phase 11: 手動テストチェックリスト

## タスク分類: NON_VISUAL（docs-only task）

## 実施項目

1. `SKILL.md` のリソース導線から current canonical file へ辿れること
2. `LOGS.md` から archive / history / index へ辿れること
3. `.claude` と `.agents` の mirror parity が取れていること
4. validator を replay してエラー 0 件であること

## 実行コマンド

```bash
# aiworkflow-requirements: SKILL.md のリソース導線確認
rg -n "references/" .claude/skills/aiworkflow-requirements/SKILL.md | while IFS= read -r line; do
  path=$(printf '%s' "$line" | sed -n 's/.*(\(references\/[^)]*\)).*/\1/p')
  file=".claude/skills/aiworkflow-requirements/${path}"
  [ -f "$file" ] && echo "OK: $file" || echo "MISSING: $file"
done

# task-specification-creator: SKILL.md のリソース導線確認
rg -n "references/" .claude/skills/task-specification-creator/SKILL.md | while IFS= read -r line; do
  path=$(printf '%s' "$line" | sed -n 's/.*(\(references\/[^)]*\)).*/\1/p')
  file=".claude/skills/task-specification-creator/${path}"
  [ -f "$file" ] && echo "OK: $file" || echo "MISSING: $file"
done

# validator replay
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js 2>&1 | tail -30
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate 2>&1 | tail -30
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js 2>&1 | tail -30
```

## 合格条件

- `manual-test-result.md` が `PASS` であること
- `NON_VISUAL` の根拠が明記されていること
