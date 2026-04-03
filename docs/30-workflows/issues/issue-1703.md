# [#1703] [UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001] execute()/improve() LLMAdapterステータスチェック追加

## メタ情報

```yaml
issue_number: 1703
title: [UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001] execute()/improve() LLMAdapterステータスチェック追加
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1703
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

TASK-RT-01 で `plan()` に LLMAdapter ステータスチェックを実装したが、同様に LLM を使用する `execute()` と `improve()` にはガードが未実装。adapter 未設定・初期化失敗時にユーザーへの actionable メッセージが提供されない。

## 関連タスク

- 親タスク: TASK-RT-01
- タスク仕様書: `docs/30-workflows/unassigned-task/task-ut-rt-01-execute-improve-adapter-guard-001.md`

## 完了条件

- `execute()` / `improve()` が `_llmAdapterStatus === "failed"` の場合に `LLM_ADAPTER_FAILED` エラーを返す
- `execute()` / `improve()` が `_llmAdapterStatus === "initializing"` の場合に `LLM_ADAPTER_INITIALIZING` エラーを返す
- actionable メッセージが `plan()` と同等の品質で提供される
- 既存の `execute()` / `improve()` テストがリグレッションなし

## 優先度

Medium - `plan()` と同等のエラーハンドリング品質を `execute()` / `improve()` にも適用する。
