# [#2334] [TASK-SKILLS-PARITY-PREPUSH-PRECEDENCE-001] pre-push hook の parity gate 配置最適化

## メタ情報

```yaml
issue_number: 2334
title: [TASK-SKILLS-PARITY-PREPUSH-PRECEDENCE-001] pre-push hook の parity gate 配置最適化
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2334
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`.husky/pre-push` における parity gate の配置位置（先頭 / Phase 1直後 / 末尾）を UX / 確実性のトレードオフを計測のうえ最適化する。

## 背景

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase-11 `discovered-issues.md` Note-1 として検出された。現状 parity gate は `.husky/pre-push` の末尾にあり、Phase 1（shared build）失敗時に到達しないケースが存在する（esbuild version mismatch で実観測）。一方、先頭配置すると「lint が通ったのに parity で弾かれる」UX 問題が発生する。

## 仕様書

- `docs/30-workflows/unassigned-task/task-skills-parity-prepush-precedence-001.md`

## 関連タスク

- 親: TASK-AGENTS-SKILLS-FULL-SYNC-001（#2278）

## 優先度

中（AC-4 ロジック要件は現状でも充足するが UX 実害あり）
