# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| 機能名     | refs-500line-split-maintenance |
| 前提Phase  | Phase 8                        |
| 次Phase    | Phase 10: 最終レビュー         |
| ステータス | pending                        |
| 作成日     | 2026-04-07                     |

## 目的

一括品質チェックを実行し、全ての受入条件（AC-1〜AC-6）が満たされていることを確認する。

## 実行タスク

### Task 1: 受入条件チェックリスト

| AC   | 条件                                                             | 検証コマンド | 結果 |
| ---- | ---------------------------------------------------------------- | ------------ | ---- |
| AC-1 | 対象 references の Markdown が 500 行未満                        | 下記         | TBD  |
| AC-2 | SKILL.md リソース導線が valid（ERROR/WARN 0）                    | 下記         | TBD  |
| AC-3 | indexes/topic-map.md / indexes/keywords.json が再生成されている  | 下記         | TBD  |
| AC-4 | `.claude` と `.agents` が同期（references + indexes + SKILL.md） | 下記         | TBD  |
| AC-5 | 内部リンクが解決できる（ALL_LINKS_EXIST）                        | 下記         | TBD  |
| AC-6 | コードファイルへの変更がゼロ（.ts/.tsx/.js）                     | 下記         | TBD  |

```bash
# AC-1: 500 行超ファイルが残存していないか（references のみ）
find .claude/skills/aiworkflow-requirements/references/ .claude/skills/task-specification-creator/references/ -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 >= 500 {print "OVER_500:", $0}' | head -20

# AC-2: SKILL.md 導線検証（ERROR/WARN が 0 件であること）
if node .claude/skills/aiworkflow-requirements/scripts/generate-index.js 2>&1 | rg -n "ERROR|WARN"; then
  echo "NG: aiworkflow-requirements の generate-index.js で ERROR/WARN を検出"
else
  echo "OK: aiworkflow-requirements の generate-index.js に ERROR/WARN なし"
fi

if node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate 2>&1 | rg -n "ERROR|WARN"; then
  echo "NG: task-specification-creator の generate-index.js で ERROR/WARN を検出"
else
  echo "OK: task-specification-creator の generate-index.js に ERROR/WARN なし"
fi

# AC-3: indexes の再生成確認（存在すること + 更新されていること）
ls -l .claude/skills/aiworkflow-requirements/indexes/topic-map.md .claude/skills/aiworkflow-requirements/indexes/keywords.json
ls -l .claude/skills/task-specification-creator/indexes/topic-map.md .claude/skills/task-specification-creator/indexes/keywords.json

# AC-4: mirror parity（差分 0 件であること）
diff -qr .claude/skills/aiworkflow-requirements/references/ .agents/skills/aiworkflow-requirements/references/ 2>/dev/null
diff -qr .claude/skills/aiworkflow-requirements/indexes/ .agents/skills/aiworkflow-requirements/indexes/ 2>/dev/null
diff -qr .claude/skills/task-specification-creator/references/ .agents/skills/task-specification-creator/references/ 2>/dev/null
diff -qr .claude/skills/task-specification-creator/indexes/ .agents/skills/task-specification-creator/indexes/ 2>/dev/null
diff -q .claude/skills/aiworkflow-requirements/SKILL.md .agents/skills/aiworkflow-requirements/SKILL.md 2>/dev/null
diff -q .claude/skills/task-specification-creator/SKILL.md .agents/skills/task-specification-creator/SKILL.md 2>/dev/null

# AC-5: 内部リンク検証（ALL_LINKS_EXIST であること）
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js 2>&1 | tail -5

# AC-6: コードファイル差分が 0 件であること（OK/NG を明示）
if git diff --name-only | rg -q "\\.(ts|tsx|js)$"; then
  echo "NG: code changes detected"
  git diff --name-only | rg "\\.(ts|tsx|js)$"
else
  echo "OK: no code changes"
fi
```

### Task 2: SKILL.md 行数確認（参考情報）

SKILL.md は canonical entry point として残すため、ここでは line-budget gate ではなく参考値として記録する。

```bash
wc -l .claude/skills/aiworkflow-requirements/SKILL.md
wc -l .claude/skills/task-specification-creator/SKILL.md
```

## 成果物

| 成果物      | パス                           | 説明                  |
| ----------- | ------------------------------ | --------------------- |
| QA レポート | `outputs/phase-9/qa-report.md` | AC-1〜AC-6 の検証結果 |

## 完了条件

- [ ] AC-1〜AC-6 が全て PASS
- [ ] QA レポートに全チェック結果が記録されている

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
