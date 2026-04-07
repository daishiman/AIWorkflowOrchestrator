# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 6                              |
| Phase名    | テスト拡充                     |
| 機能名     | refs-500line-split-maintenance |
| 前提Phase  | Phase 5                        |
| 次Phase    | Phase 7: カバレッジ確認        |
| ステータス | pending                        |
| 作成日     | 2026-04-07                     |

## 目的

Phase 5 で実施した分離の正確性を検証する。全てのクロスリファレンスが有効であることを確認する。

## 実行タスク

### Task 1: 全 TC の実行

```bash
# TC-01: 500 行超ファイルが 0 件であること
echo "=== TC-01: 500行超ファイル確認 ==="
find .claude/skills/aiworkflow-requirements/references/ .claude/skills/task-specification-creator/references/ -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 >= 500 {print "FAIL:", $0}'
echo "TC-01 PASS: 500行超ファイルなし"

# TC-02: aiworkflow-requirements generate-index
echo "=== TC-02: aiworkflow-requirements index 生成 ==="
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js 2>&1 | tail -10

# TC-03: task-specification-creator generate-index
echo "=== TC-03: task-specification-creator index 生成 ==="
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate 2>&1 | tail -10

# TC-04: mirror 同期確認
echo "=== TC-04: mirror 同期確認 ==="
diff -qr .claude/skills/aiworkflow-requirements/references/ .agents/skills/aiworkflow-requirements/references/ 2>/dev/null && echo "PASS: 同期済み"
diff -qr .claude/skills/task-specification-creator/references/ .agents/skills/task-specification-creator/references/ 2>/dev/null && echo "PASS: 同期済み"

# TC-05: 内部リンク検証
echo "=== TC-05: 内部リンク検証 ==="
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js 2>&1 | tail -5

# TC-06: コードファイルへの変更がゼロ
echo "=== TC-06: コード変更確認 ==="
git diff --stat | grep -E "\.ts$|\.tsx$|\.js$" && echo "FAIL: コードファイルが変更されています" || echo "PASS: コードファイルへの変更なし"
```

### Task 2: エッジケース検証

- [ ] 分離後の子ファイルが SKILL.md から参照されていることを確認
- [ ] 旧ファイル名への参照が残存していないことを確認

```bash
# 旧ファイルへの残存参照確認（例: task-workflow-completed.md の分離ファイルが正しく参照されているか）
grep -rn "task-workflow-completed\.md" .claude/skills/ | grep -v "^.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md"
```

## 成果物

| 成果物             | パス                                          | 説明                  |
| ------------------ | --------------------------------------------- | --------------------- |
| リンク検証レポート | `outputs/phase-6/link-verification-report.md` | TC-01〜TC-06 実行結果 |

## 完了条件

- [ ] TC-01〜TC-06 が全て PASS
- [ ] エッジケース確認が完了

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
