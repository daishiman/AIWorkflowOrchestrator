# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 8                              |
| Phase名    | リファクタリング               |
| 機能名     | refs-500line-split-maintenance |
| 前提Phase  | Phase 7                        |
| 次Phase    | Phase 9: 品質保証              |
| ステータス | pending                        |
| 作成日     | 2026-04-07                     |

## 目的

Phase 5-6 の実装で発生した冗長性・命名の一貫性の問題を解消する。

## 実行タスク

### Task 1: 重複コンテンツの確認

```bash
# 子ファイル間でコンテンツが重複していないか確認
# （同じ H2 見出しが複数ファイルに存在しないか）
(
  for f in .claude/skills/aiworkflow-requirements/references/*.md; do
    grep "^## " "$f"
  done
) | sort | uniq -d | head -20

(
  for f in .claude/skills/task-specification-creator/references/*.md; do
    grep "^## " "$f"
  done
) | sort | uniq -d | head -20
```

### Task 2: 命名一貫性の確認

| 確認項目         | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実装後に記入） |        |       |      |

### Task 3: 親ファイルの最終調整

親ファイルが目次・概要レベルに収まっているか確認:

```bash
for f in task-workflow-completed.md lessons-learned-current.md patterns.md phase-templates.md spec-update-workflow.md; do
  echo "$f: $(wc -l < .claude/skills/*/references/$f 2>/dev/null) 行"
done
```

## 成果物

| 成果物               | パス                                 | 説明                      |
| -------------------- | ------------------------------------ | ------------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | Before/After/理由テーブル |

## 完了条件

- [ ] 重複コンテンツが排除されている
- [ ] 命名一貫性が確保されている
- [ ] 親ファイルが目次レベルに縮小されている

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
