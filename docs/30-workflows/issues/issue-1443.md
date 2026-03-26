# [#1443] [UT-FIX-LLM-FETCHPROVIDERS-RETRY-001] fetchProviders失敗時のリトライとバリデーション連携

## メタ情報

```yaml
issue_number: 1443
title: [UT-FIX-LLM-FETCHPROVIDERS-RETRY-001] fetchProviders失敗時のリトライとバリデーション連携
state: OPEN
priority: 中
scale: -
category: 改善
status: 未実施
created_date: 2026-03-21
updated_date: 2026-03-21
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1443
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

fetchProvidersが失敗した場合、永続化値のバリデーションがスキップされる（providers空配列で判断保留）。リトライ成功時にバリデーションが確実に実行されるかの検証が必要。

## 背景

TASK-FIX-LLM-CONFIG-PERSISTENCE で `validateAndSyncPersistedConfig` を実装したが、`availableProviders` が空配列の場合は判断を保留する設計。fetchProvidersが失敗→リトライ→成功した場合に、バリデーションと同期が正しく実行されることの統合テストが不足している。

## 受入基準

- [ ] fetchProviders失敗→リトライ→成功のシナリオで、永続化値のバリデーションが実行されることを検証するテストを追加する
- [ ] リトライ時に二重同期が発生しないことを確認する

## 関連

- TASK-FIX-LLM-CONFIG-PERSISTENCE
- arch-state-management.md
- llm-ipc-types.md

## タスク仕様書

`docs/30-workflows/unassigned-task/UT-FIX-LLM-FETCHPROVIDERS-RETRY-001.md`
