# [#2331] [TASK-POST-MERGE-PARITY-CHECK-INTEGRATION-001] post-merge hook への parity check 連結

## メタ情報

```yaml
issue_number: 2331
title: [TASK-POST-MERGE-PARITY-CHECK-INTEGRATION-001] post-merge hook への parity check 連結
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2331
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`.claude/hooks/post-merge-index-regenerate.sh` に `verify-skills-parity.sh` を連結し、merge 直後の canonical/mirror drift を即時検知できるようにする。

## 背景

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase-12 未タスク検出（MID-2）として検出された。現状 post-merge hook は index 再生成のみで parity までは見ない。drift が 1 wave 以上の頻度で再発した際に、検出の遅延が問題になる。

## 仕様書

- `docs/30-workflows/unassigned-task/task-post-merge-parity-check-integration-001.md`

## 関連タスク

- 親: TASK-AGENTS-SKILLS-FULL-SYNC-001（#2278）
- 隣接: task-skills-sync-worktree-lock-001、task-generate-index-determinism-guard-001

## 優先度

中（drift 発生時の検出遅延を防ぐ）
