# [#2206] [TASK-SW-STREAM-FUP-01] SkillCreatorProgressData の shared 移動

## メタ情報

```yaml
issue_number: 2206
title: [TASK-SW-STREAM-FUP-01] SkillCreatorProgressData の shared 移動
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-16
updated_date: 2026-04-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2206
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`SkillCreatorProgressData` 型を `packages/shared/src/types/` へ移動する。

## 背景

TASK-SW-STREAM-001でonProgressコールバックを実装した際、`SkillCreatorProgressData` 型をローカル定義した。
TASK-SW-STREAM-002でIPC配線を行うと、rendererでも同型が必要になり、型の重複定義が発生する。

## 変更対象

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（型定義削除・import追加）
- `packages/shared/src/types/index.ts`（型定義追加・export）

## 受入基準

- `SkillCreatorProgressData` が `@repo/shared/types` からimport可能
- 既存の型参照が全てsharedのimportに切り替わっている
- typecheck/testが全てpass

## 依存

TASK-SW-STREAM-002完了後に実施推奨

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SW-STREAM-FUP-01-SHARED-TYPE-PROMOTION.md`
