# [#2337] [TASK-LOGS-ARCHIVE-AUTO-001] LOGS.md アーカイブ自動化スクリプト実装

## メタ情報

```yaml
issue_number: 2337
title: [TASK-LOGS-ARCHIVE-AUTO-001] LOGS.md アーカイブ自動化スクリプト実装
state: OPEN
priority: 低
scale: 中規模
category: -
status: -
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2337
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | -      |

---

## 背景

`TASK-LOGS-ARCHIVE-POLICY-001`（Issue #2282）にてアーカイブポリシーが確定済みだが、閾値判定・アーカイブ実行・mirror sync の各ステップは全て手動運用のままである。月次判定の自動化が未実装であり、毎月初第1営業日という定期タイミングでの実行は属人的な記憶に依存している。

Phase 1 計測では以下のスキルが複数閾値を同時に超過しており、ポリシーの必要性は既に実証済みである：

- `skill-creator`（2542 行 / 123 KB）
- `aiworkflow-requirements`（2908 行 / 571 KB）
- `task-specification-creator`（3158 行 / 234 KB）

## 目標

bash または Python スクリプトによって、`TASK-LOGS-ARCHIVE-POLICY-001` で定義したアーカイブポリシーの閾値判定（300行超・30KB超・月次 OR 条件）・実行・mirror sync・検証を自動化する。

1. スクリプト単体実行で `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の両方を閾値評価できること
2. dry-run モードで「対象スキル一覧と閾値超過理由」が出力できること
3. 実行モードでアーカイブ・LOGS.md 軽量化・mirror sync・diff ゼロ確認が一括実行できること
4. GitHub Actions のスケジュールジョブ（毎月 1 日）としてトリガーできること

## 成果物

| 成果物                                                        | 種別 | 内容                                    |
| ------------------------------------------------------------- | ---- | --------------------------------------- |
| `scripts/logs-archive.sh`（または `scripts/logs_archive.py`） | 新規 | アーカイブ自動化スクリプト本体          |
| `.github/workflows/logs-archive.yml`                          | 新規 | GitHub Actions スケジュールワークフロー |

## 参照

- ポリシー正本: `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`
- 仕様書: `docs/30-workflows/unassigned-task/TASK-LOGS-ARCHIVE-AUTO-001.md`

## 依存タスク

- TASK-LOGS-ARCHIVE-POLICY-001（前提: アーカイブポリシー定義元）
