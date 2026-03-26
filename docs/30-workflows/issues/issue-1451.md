# [#1451] [UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001] blocked guidance retryConnection IPC契約定義

## メタ情報

```yaml
issue_number: 1451
title: [UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001] blocked guidance retryConnection IPC契約定義
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1451
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

NETWORK_ERROR 時の接続再確認 IPC ハンドラを定義し、GuidanceBlock の retry-connection CTA を実装する。

## 背景

- `modelSelectionGuidance.ts` で `retry-connection` action type が定義済み
- 対応する IPC handler（health:check 相当）が未定義
- handler なしでは CTA が no-op になり AC-4 違反

## 完了条件

- [ ] `retry-connection` に対応する IPC handler が定義されている
- [ ] CTA クリックで接続再確認が実行される
- [ ] 結果に応じて GuidanceBlock の表示が更新される
- [ ] 関連テストが追加されている

## 関連

- 親タスク: TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（Phase 3 M-02）
- 仕様書: `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001.md`
