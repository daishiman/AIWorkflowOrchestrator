# [#2332] [TASK-SKILLS-SYNC-WORKTREE-LOCK-001] worktree 並列 sync-skills-mirror.sh の exclusive lock 導入

## メタ情報

```yaml
issue_number: 2332
title: [TASK-SKILLS-SYNC-WORKTREE-LOCK-001] worktree 並列 sync-skills-mirror.sh の exclusive lock 導入
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2332
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

複数 worktree で同時に `sync-skills-mirror.sh` が実行された場合の rsync race condition を、`flock`（Linux）/ `mkdir` atomic lock（macOS）で防ぐ。

## 背景

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase-12 未タスク検出（LOW-1）として検出された。10 本並列 worktree 開発で理論上の race condition が存在する。現状は pre-push の直列性に依存して実害未観測。

## 仕様書

- `docs/30-workflows/unassigned-task/task-skills-sync-worktree-lock-001.md`

## 関連タスク

- 親: TASK-AGENTS-SKILLS-FULL-SYNC-001（#2278）
- 隣接: task-post-merge-parity-check-integration-001

## 優先度

低（理論上の race、並列 worktree 運用が定着してから起票）
