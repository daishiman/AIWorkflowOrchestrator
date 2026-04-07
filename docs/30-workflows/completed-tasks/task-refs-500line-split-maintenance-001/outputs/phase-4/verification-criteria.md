# Phase 4: 検証基準書

## タスク分類: docs-only（自動テスト不要）

## 検証マトリクス

| TC-ID | テスト内容                                         | 期待結果                   | 検証コマンド                                                                                                                                                                                                                              |
| ----- | -------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-01 | 500行超ファイルが0件である                         | OVER_500なし               | `find .claude/skills/aiworkflow-requirements/references/ .claude/skills/task-specification-creator/references/ -name "*.md" -exec wc -l {} \; \| sort -rn \| awk '$1 >= 500 {print "OVER_500:", $0}'`                                     |
| TC-02 | aiworkflow-requirements SKILL.md の導線が valid    | エラー0件                  | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                                                                   |
| TC-03 | task-specification-creator SKILL.md の導線が valid | エラー0件                  | `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate`                                                                              |
| TC-04 | `.claude` と `.agents` の mirror が一致            | diff出力なし               | `diff -qr .claude/skills/aiworkflow-requirements/references/ .agents/skills/aiworkflow-requirements/references/` + `diff -qr .claude/skills/task-specification-creator/references/ .agents/skills/task-specification-creator/references/` |
| TC-05 | 内部リンクが全て解決できる                         | ALL_LINKS_EXIST            | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                                                       |
| TC-06 | コードファイルへの変更がゼロ                       | `.ts`/`.tsx`/`.js`変更なし | `git diff --stat \| grep -E '\.(ts\|tsx\|js)$'`                                                                                                                                                                                           |

## 検証コマンド（完全版）

```bash
# TC-01: 500行超ファイル確認
find .claude/skills/aiworkflow-requirements/references/ .claude/skills/task-specification-creator/references/ -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 >= 500 {print "OVER_500:", $0}' | head -20

# TC-02: aiworkflow-requirements インデックス生成
if node .claude/skills/aiworkflow-requirements/scripts/generate-index.js 2>&1 | grep -E "ERROR|WARN"; then
  echo "NG: ERROR/WARN detected"
else
  echo "OK: generate-index.js passed"
fi

# TC-03: task-specification-creator インデックス生成
if node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate 2>&1 | rg -n "ERROR|WARN"; then
  echo "NG: ERROR/WARN detected"
else
  echo "OK: generate-index.js passed"
fi

# TC-04: mirror同期確認
diff -qr .claude/skills/aiworkflow-requirements/references/ .agents/skills/aiworkflow-requirements/references/
diff -qr .claude/skills/task-specification-creator/references/ .agents/skills/task-specification-creator/references/

# TC-05: 内部リンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js 2>&1 | tail -5

# TC-06: コード変更確認
git diff --stat | grep -E '\.(ts|tsx|js)$' || echo "OK: no code file changes"
```

## ロールバック手順

分離作業は git worktree 環境で実施。問題が発生した場合:

```bash
# 対象ファイルを確認
git status
git diff --stat

# 特定ファイルのみロールバック（破壊的操作のため diff で確認後に実行）
git diff -- path/to/file.md
git restore --source=HEAD -- path/to/file.md

# ステージング取り消し（必要な場合のみ）
git restore --staged -- path/to/file.md
```

## 受入条件チェックリスト

- [ ] TC-01: 全対象ファイルが500行未満（PASS）
- [ ] TC-02: aiworkflow-requirements generate-index.js エラーなし（PASS）
- [ ] TC-03: task-specification-creator generate-index.js エラーなし（PASS）
- [ ] TC-04: mirror差異なし（PASS）
- [ ] TC-05: 全内部リンク解決（PASS）
- [ ] TC-06: コード変更ゼロ（PASS）
