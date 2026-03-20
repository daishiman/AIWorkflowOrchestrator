# [#1280] [UT-06-005-A] PreToolUse Hook フォールバック統合 + timeout→abort 遷移実装

## メタ情報

```yaml
issue_number: 1280
title: [UT-06-005-A] PreToolUse Hook フォールバック統合 + timeout→abort 遷移実装
state: CLOSED
priority: 高
scale: 中規模
category: -
status: 未実施
created_date: 2026-03-16
updated_date: 2026-03-17
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1280
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

UT-06-005 で実装した processPermissionFallback/executeAbortFlow/executeSkipFlow を実際の PreToolUse Hook に統合する。

## 背景

- テストからのみ呼ばれる状態で、実行時フローへの統合が未完了
- sendPermissionRequest timeout 時の executeAbortFlow("timeout") 自動呼び出しも未実装
- 放置するとユーザーが Permission を拒否した際に abort/skip/retry の選択ができず、スキル実行が予期しない状態で停止するリスクがある

## 解決する問題

1. PreToolUse Hook の Permission 拒否フローで `processPermissionFallback` が呼ばれていない
2. `sendPermissionRequest` タイムアウト時に `executeAbortFlow("timeout")` の自動呼び出しがない
3. UT-06-005 で実装した全フォールバック機能（abort/skip/retry/timeout）が事実上無効化されている

## 成果物

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（PreToolUse Hook 修正 + sendPermissionRequest タイムアウト処理追加）
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts`（統合テスト 新規作成）

## テストケース

| TC-ID    | テスト内容                                                 | 期待結果                                          |
| -------- | ---------------------------------------------------------- | ------------------------------------------------- |
| TC-A-001 | Permission 拒否時に processPermissionFallback が呼ばれる   | processPermissionFallback が1回呼ばれること       |
| TC-A-002 | abort フォールバック時にスキル実行が停止する               | AbortError がスローされること                     |
| TC-A-003 | skip フォールバック時に実行が継続する                      | ツール実行がスキップされ次の処理が継続すること    |
| TC-A-004 | retry フォールバック時に再度 Permission 要求が発生する     | sendPermissionRequest が再度呼ばれること          |
| TC-A-005 | timeout 発生時に executeAbortFlow("timeout") が呼ばれる    | executeAbortFlow が "timeout" 引数で呼ばれること  |
| TC-A-006 | フォールバック処理が例外をスローした場合、abort に遷移する | executeAbortFlow("fallback_error") が呼ばれること |

## 関連 Pitfall

- P54: safeRegister パターン不適合（戻り値キャプチャ必要なハンドラ）
- P39: happy-dom 環境での userEvent 非互換
- P40: テスト実行ディレクトリ依存（モノレポ）

## 関連タスク

- UT-06-005（前提: processPermissionFallback 実装元）
- UT-06-005-B（並列対象: revokeSessionEntries セッション別実装）

## 指示書

`docs/30-workflows/unassigned-task/task-ut-06-005-a-hook-fallback-integration.md`
