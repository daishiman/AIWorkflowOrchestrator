# [#485] [UI-CONV-HISTORY-001] 会話履歴UI実装

## メタ情報

```yaml
issue_number: 485
title: [UI-CONV-HISTORY-001] 会話履歴UI実装
state: CLOSED
priority: 高
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-01-24
updated_date: 2026-01-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/485
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

UT-LLM-HISTORY-001で完成したバックエンド（ConversationRepository + IPC Handlers）を活用し、会話履歴を閲覧・管理・操作できるUIコンポーネントを実装する。

## 背景

- バックエンド永続化機能は完了済み（ConversationRepository 457行 + IPC Handlers 243行）
- UIコンポーネントが未実装のため、ユーザーは会話履歴機能を利用できない

## スコープ

| サブタスク | 説明                               |
| ---------- | ---------------------------------- |
| UI-001     | 会話一覧UIコンポーネント           |
| UI-002     | 会話詳細UIコンポーネント           |
| UI-003     | メッセージ入力UIコンポーネント     |
| UI-004     | Preload API接続（conversationAPI） |

## 完了条件

- [ ] 会話一覧表示（ページネーション対応）
- [ ] 会話検索動作
- [ ] 会話選択→詳細表示連携
- [ ] 新規会話作成・削除
- [ ] メッセージ一覧表示・送信
- [ ] テストカバレッジ80%以上

## 依存タスク

- UT-LLM-HISTORY-001（完了）: 会話履歴永続化

## 参照

- タスク仕様書: \`docs/30-workflows/unassigned-task/task-conversation-history-ui-implementation.md\`
- バックエンド実装: \`apps/desktop/src/main/repositories/conversationRepository.ts\`
