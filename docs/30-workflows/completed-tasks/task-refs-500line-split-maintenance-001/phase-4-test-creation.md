# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 4                                                   |
| Phase名    | テスト作成                                          |
| 機能名     | refs-500line-split-maintenance                      |
| 対象機能   | TASK-REFS-500LINE-SPLIT-001 References ファイル分離 |
| 前提Phase  | Phase 3                                             |
| 次Phase    | Phase 5: 実装                                       |
| ステータス | pending                                             |
| 作成日     | 2026-04-07                                          |

## 目的

docs-only タスクのため、自動テストではなく検証スクリプトと手動検証手順を定義する。

**タスク分類**: docs-only task（自動テスト不要、検証基準の定義のみ）

## 実行タスク

### Task 1: 検証コマンドの定義

```bash
# 1. 500 行超ファイルが残存していないか確認（references のみ）
find .claude/skills/aiworkflow-requirements/references/ .claude/skills/task-specification-creator/references/ -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 >= 500 {print "OVER_500:", $0}' | head -20

# 2. SKILL.md のリソース導線が全て実在するファイルを参照しているか
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

# 3. mirror 同期確認
diff -qr .claude/skills/aiworkflow-requirements/references/ .agents/skills/aiworkflow-requirements/references/ 2>/dev/null
diff -qr .claude/skills/task-specification-creator/references/ .agents/skills/task-specification-creator/references/ 2>/dev/null

# 4. 内部リンク検証（broken link がないか）
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js 2>&1 | tail -5
```

### Task 2: 検証マトリクスの作成

| TC-ID | テスト内容                                         | 期待結果                    | 検証コマンド                                                                                          |
| ----- | -------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------- |
| TC-01 | 500 行超ファイルが 0 件である                      | OVER_500 なし               | `find ... awk`                                                                                        |
| TC-02 | aiworkflow-requirements SKILL.md の導線が valid    | エラー 0 件                 | `generate-index.js`                                                                                   |
| TC-03 | task-specification-creator SKILL.md の導線が valid | エラー 0 件                 | `generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate` |
| TC-04 | `.claude` と `.agents` の mirror が一致            | diff 出力なし               | `diff -qr`                                                                                            |
| TC-05 | 内部リンクが全て解決できる                         | ALL_LINKS_EXIST             | `verify-unassigned-links.js`                                                                          |
| TC-06 | コードファイルへの変更がゼロ                       | `.ts`/`.tsx`/`.js` 変更なし | `git diff --stat`                                                                                     |

### Task 3: ロールバック手順の定義

分離作業は git ブランチ上で実施し、問題が発生した場合は**影響範囲を限定して**巻き戻す。

1. まず差分確認: `git status` / `git diff` / `git diff --stat`
2. 巻き戻しが必要な場合は、対象ファイルを限定して復旧する（全面ロールバックは避ける）

```bash
# 例: 変更を破棄したいファイルだけを worktree から戻す
git restore --source=HEAD -- path/to/file.md

# 例: staging 済みを取り消す（必要な場合のみ）
git restore --staged -- path/to/file.md
```

補足:

- `git restore` は破壊的操作になり得るため、必ず `git diff` で対象を確認してから実行する。

## 成果物

| 成果物     | パス                                       | 説明                |
| ---------- | ------------------------------------------ | ------------------- |
| 検証基準書 | `outputs/phase-4/verification-criteria.md` | TC-01〜TC-06 の定義 |

## 完了条件

- [ ] TC-01〜TC-06 の検証コマンドが定義されている
- [ ] ロールバック手順が明記されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 検証基準書が作成されている

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
