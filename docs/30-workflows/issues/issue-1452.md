# [#1452] [UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001] chatSlice 未使用 state クリーンアップ

## メタ情報

```yaml
issue_number: 1452
title: [UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001] chatSlice 未使用 state クリーンアップ
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1452
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

chatSlice に定義済みだが未使用の state（ChatPanelStatus, streamingError, resolvedCapability）の活用または削除を判断する。

## 背景

- ChatPanelStatus: 型定義のみ、使用箇所なし
- streamingError: state 定義あり、setter あり、呼び出し元なし（常に null）
- resolvedCapability: state 定義あり、setter あり、設定箇所なし（常に "none"）
- 未使用 state が溜まると Store の肥大化と可読性低下を招く

## 完了条件

- [ ] 各 state の活用/削除判断が記録されている
- [ ] 削除対象は安全に除去されている
- [ ] 活用対象は consumer が接続されている
- [ ] 関連テストが更新されている

## 関連

- 親タスク: TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（Phase 3 M-03, Phase 1 G-04〜G-06）
- 仕様書: `docs/30-workflows/unassigned-task/UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001.md`
