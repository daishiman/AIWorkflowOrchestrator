# [#1453] [UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001] blocked reason 優先度設計

## メタ情報

```yaml
issue_number: 1453
title: [UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001] blocked reason 優先度設計
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1453
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

複数の blocked reason が同時に成立した場合の優先度ルールを定義し、ChatView / WorkspaceView が常に同じ理由と CTA を表示するようにする。

## 背景

- current helper `deriveModelSelectionBlockedReason()` は NO_PROVIDER / NO_MODEL のみを順に判定
- health / auth / policy violation が加わると優先表示が曖昧になる
- 優先度規則がないと surface ごとに別ロジックが再発する

## 完了条件

- [ ] reason priority の決定表が作成されている
- [ ] Chat / Workspace / 将来の consumer が同じ helper を参照する
- [ ] 複数 reason 同時成立ケースのテストが追加されている
- [ ] system spec / workflow / lessons に priority rule が記録されている

## 関連

- 親タスク: TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（Phase 3 M-04）
- 仕様書: `docs/30-workflows/unassigned-task/UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001.md`
