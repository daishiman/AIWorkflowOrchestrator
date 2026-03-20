# [#1226] [TASK-IMP-CHAT-EDIT-CONTEXT-SIZE-ALIGNMENT-001] Context 100KB 上限と provider token 上限の乖離解消

## メタ情報

```yaml
issue_number: 1226
title: [TASK-IMP-CHAT-EDIT-CONTEXT-SIZE-ALIGNMENT-001] Context 100KB 上限と provider token 上限の乖離解消
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-03-14
updated_date: 2026-03-14
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1226
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`MAX_CONTEXT_SIZE=100KB` と provider 側 token 上限の乖離により、実行時に context 切り捨てや品質劣化が発生しうる。運用値の根拠を揃えないと再発する。

## 対象

- `ContextBuilder` の上限設計を provider 非依存の安全側値へ再定義
- 可能なら resolver から provider 情報を受けて上限を可変化

## 完了条件

- [ ] context 上限値の根拠（token換算）が文書化される
- [ ] 上限を超える入力で CONTEXT_TOO_LARGE が安定して返る
- [ ] 既存成功系の送信が回帰しない

## 発見元

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 (2026-03-14)

## 仕様書パス

`docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-context-size-alignment-001.md`
