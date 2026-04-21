# [#2335] TASK-MERGE-DRIVER-BOOTSTRAP-GUARD-001: merge.ours.driver 未登録検出 guard 機構実装

## メタ情報

```yaml
issue_number: 2335
title: TASK-MERGE-DRIVER-BOOTSTRAP-GUARD-001: merge.ours.driver 未登録検出 guard 機構実装
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2335
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

新規clone後に `setup-merge-drivers.sh` を実行せずに `git merge`/`git pull` を実行した場合、`.gitattributes` で `merge=ours` を指定していても Git 2.38系は stderr に警告なく default 3-way マージにフォールバックする。このため開発者が誤った設定のまま長期間作業するリスクがある。

## 解決策

post-merge hook または session-start hook で `git config --get merge.ours.driver` を検出し、未登録なら自動起動 or 警告ログを出す機構を実装する。

## 優先度・規模

- **優先度**: 中（MEDIUM）
- **規模**: 小規模（実装0.5d / テスト0.5d / Phase 11再実施0.5d）
- **分類**: インフラ改善 / Git運用

## 仕様書

`docs/30-workflows/unassigned-task/TASK-MERGE-DRIVER-BOOTSTRAP-GUARD-001.md`

## 発見元

TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 Phase 12 unassigned-task-detection.md（DISC-MED-01）
