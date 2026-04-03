# [#1680] feat(skill-creator): TASK-SDK-04-U1-F1 verification_review request を single_select kind に変更

## メタ情報

```yaml
issue_number: 1680
title: feat(skill-creator): TASK-SDK-04-U1-F1 verification_review request を single_select kind に変更
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-27
updated_date: 2026-03-27
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1680
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## Summary

`createVerificationReviewRequest()` が `free_text` kind のまま残っている。
engine の `applyVerificationReviewTransition()` は `selectedOptionId` ベースで動作するため、
`single_select` kind with approve/improve/reject options への変更が必要。

## Details

- **Task spec path**: `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-verification-review-single-select-001.md`
- **Priority**: 中
- **Parent**: TASK-SDK-04-U1 (#1672)
- **Scope**: engine internal function change only

## Acceptance Criteria

- `createVerificationReviewRequest()` が `single_select` kind を返すこと
- options に `approve` / `improve` / `reject` が含まれること
- `applyVerificationReviewTransition()` が `selectedOptionId` で正しく分岐すること
- 既存テストが更新され、全テストがパスすること
