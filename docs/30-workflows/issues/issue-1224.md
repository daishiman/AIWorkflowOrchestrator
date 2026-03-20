# [#1224] [TASK-IMP-CHAT-EDIT-CONCURRENT-REQUEST-GUARD-001] chat-edit:send-with-context の concurrent 実行ガード導入

## メタ情報

```yaml
issue_number: 1224
title: [TASK-IMP-CHAT-EDIT-CONCURRENT-REQUEST-GUARD-001] chat-edit:send-with-context の concurrent 実行ガード導入
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-14
updated_date: 2026-03-14
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1224
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`chat-edit:send-with-context` の IPC 連打時に Main 側で同時リクエスト制御がなく、競合と状態破損のリスクが残る。同一ワークスペース/同一セッションの多重実行を抑止し、予測可能な実行順序を保証する。

## 対象ファイル

- `apps/desktop/src/main/ipc/chatEditHandlers.ts`

## 完了条件

- [ ] 同時2要求で挙動が一意に定義される（拒否 or 先行キャンセル）
- [ ] 二重実行で state が破損しない
- [ ] エラーコードとガイダンスが UI に表示される

## 発見元

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 (2026-03-14)

## 仕様書パス

`docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-concurrent-request-guard-001.md`
