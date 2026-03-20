# [#1295] [UT-06-005-A-PERMISSION-RESOLVER-DI] SkillExecutor 内 PermissionResolver の DIP 準拠 DI 化

## メタ情報

```yaml
issue_number: 1295
title: [UT-06-005-A-PERMISSION-RESOLVER-DI] SkillExecutor 内 PermissionResolver の DIP 準拠 DI 化
state: OPEN
priority: 中
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-17
updated_date: 2026-03-17
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1295
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

SkillExecutor コンストラクタ内で `new PermissionResolver()` を直接生成している DIP（依存性逆転原則）違反を解消する。

## 問題

- `PermissionStore` は `IPermissionStore` 経由の DI 済みだが、`PermissionResolver` は具象クラス直接生成
- テストでモック差し替えが困難（P61 パターン）
- 関連 Pitfall: P61（DIP 違反）、P34（遅延初期化 DI）、P62（DI スコープ問題）

## 解決策

1. `IPermissionResolver` インターフェースを抽出
2. `SkillExecutorDeps` に `permissionResolver?` を追加
3. コンストラクタで DI 化（デフォルト値として `new PermissionResolver()` を維持）

## 対象ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`

## タスク仕様書

`docs/30-workflows/completed-tasks/UT-06-005-A-hook-fallback-integration/unassigned-task/task-ut-06-005-a-permission-resolver-di.md`

## 発見元

UT-06-005-A Phase 12 コード品質分析（2026-03-17）
