# Documentation Changelog

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001 |
| 実行日     | 2026-04-19                   |
| ステータス | COMPLETED                    |

## 変更履歴

| 日付       | 種別     | ファイル                                                                   | 変更内容                                                                            |
| ---------- | -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-04-19 | 新規作成 | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | LOGS.md アーカイブポリシー正本（D-1〜D-4 / F-001〜F-005 反映）                      |
| 2026-04-19 | 新規作成 | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 上記の mirror（diff=0）                                                             |
| 2026-04-19 | 更新     | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | `### references/logs-archive-policy.md` エントリ追加（logs-archive-legacy.md の後） |
| 2026-04-19 | 更新     | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`        | LOGS.md アーカイブポリシー即時導線セクション追加                                    |
| 2026-04-19 | 更新     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`           | §10 その他（デプロイ・運用）に `logs-archive-policy.md` 行追加                      |
| 2026-04-19 | 追記     | `.claude/skills/aiworkflow-requirements/LOGS.md`                           | TASK-LOGS-ARCHIVE-POLICY-001 完了記録                                               |
| 2026-04-19 | 新規作成 | `docs/30-workflows/logs-archive-policy-001/outputs/phase-*/`               | Phase 1〜12 全 outputs                                                              |

## CHANGELOG.md 追記相当

```markdown
### docs

- TASK-LOGS-ARCHIVE-POLICY-001: LOGS.md アーカイブポリシー統一文書化（Refs #2282）
  - `.claude/` / `.agents/` 両側に logs-archive-policy.md を新規作成
  - topic-map / quick-reference / resource-map の 3 インデックスに参照追加
  - 閾値: 300行超 / 30KB超 / 月次（OR条件）、命名: logs-archive-YYYY-MM.md
```

## 関連コミット対象パス

- `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`
- `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `docs/30-workflows/logs-archive-policy-001/` 配下全ファイル
