# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 7                              |
| Phase名    | カバレッジ確認                 |
| 機能名     | refs-500line-split-maintenance |
| 前提Phase  | Phase 6                        |
| 次Phase    | Phase 8: リファクタリング      |
| ステータス | pending                        |
| 作成日     | 2026-04-07                     |

## 目的

docs-only タスクのため、コードカバレッジではなく「対象ファイルの処理率」を確認する。

**カバレッジ対象**: Phase 1 でリストアップした全 500 行超ファイルが漏れなく処理されたか。

## 実行タスク

### Task 1: 対象ファイルの処理完了確認

```bash
# Phase 1 でリストアップしたファイル数と、現在の 500 行超ファイル数を比較
BEFORE=$(find .claude/skills/aiworkflow-requirements/references/ .claude/skills/task-specification-creator/references/ -name "*.md" | wc -l)
AFTER=$(find .claude/skills/aiworkflow-requirements/references/ .claude/skills/task-specification-creator/references/ -name "*.md" -exec wc -l {} \; | awk '$1 >= 500' | wc -l)
echo "処理前対象: ${BEFORE}件"
echo "処理後残存: ${AFTER}件（0 であること）"
```

### Task 2: カバレッジサマリー

| カテゴリ                              | 処理前件数 | 処理後件数 | 処理率   |
| ------------------------------------- | ---------- | ---------- | -------- |
| aiworkflow-requirements（500行超）    | 19         | 0          | 100%     |
| task-specification-creator（500行超） | 5          | 0          | 100%     |
| **合計**                              | **24**     | **0**      | **100%** |

（実際の値は実装後に記入）

### Task 3: 変更ファイルの確認

```bash
git diff --stat | grep "\.md"
```

変更されたファイル:

- 分離されたファイル（行数が減少）
- 新規作成された子ファイル
- 更新された SKILL.md（2件）
- 再生成された indexes/topic-map.md / indexes/keywords.json

## 成果物

| 成果物             | パス                                 | 説明                 |
| ------------------ | ------------------------------------ | -------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 処理率と変更ファイル |

## 完了条件

- [ ] 全対象ファイルの処理率が 100%
- [ ] 500 行超ファイルが 0 件

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
