# [#2333] [TASK-GENERATE-INDEX-DETERMINISM-GUARD-001] generate-index.js 非 deterministic 検出ガード

## メタ情報

```yaml
issue_number: 2333
title: [TASK-GENERATE-INDEX-DETERMINISM-GUARD-001] generate-index.js 非 deterministic 検出ガード
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2333
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`generate-index.js` を 2 回連続実行して出力差分がないことをチェックするガードを追加し、非 deterministic 化を早期検知する。

## 背景

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase-12 未タスク検出（LOW-2）として検出された。将来 `generate-index.js` が非 deterministic になった場合、sync 実行のたびに diff が残り parity OK にならない。現状は sync exit 1 で間接的に検知可能。

## 仕様書

- `docs/30-workflows/unassigned-task/task-generate-index-determinism-guard-001.md`

## 関連タスク

- 親: TASK-AGENTS-SKILLS-FULL-SYNC-001（#2278）
- 前提: TASK-CONFLICT-PREVENT-001（日付ヘッダ除去で deterministic 化済み）

## 優先度

低（実害が発生してから起票）
