# [#2111] feat(cron): TASK-CRON-VALIDATION-COMPOSITE-001 cronExpression 複合フィールド意味論チェック拡張

## メタ情報

```yaml
issue_number: 2111
title: feat(cron): TASK-CRON-VALIDATION-COMPOSITE-001 cronExpression 複合フィールド意味論チェック拡張
state: OPEN
priority:  low
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-12
updated_date: 2026-04-12
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2111
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | low    |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`TASK-CRON-SEMANTIC-VALIDATION-001` (#2082 closed) の Phase 12 申し送り事項から発生した改善タスク。

`validateCronSemantics()` 関数を拡張し、カンマ区切り・範囲指定・ステップ指定といった複合フィールドを持つ cron 式に対しても月末日の意味論チェックを実行できるようにする。

## 問題

現在の `validateCronSemantics` は日・月フィールドが**単純な数値の場合のみ**意味論チェックを実行する。

| cron 式         | 現在の動作           | 期待される動作                                      |
| --------------- | -------------------- | --------------------------------------------------- |
| `0 9 1,15 2 *`  | Stage 2 のみ（PASS） | `1,15` の各値が 2 月に存在するか確認可能            |
| `0 9 28-31 2 *` | Stage 2 のみ（PASS） | 範囲内に 2 月に存在しない日があるか確認可能         |
| `0 9 */10 2 *`  | Stage 2 のみ（PASS） | ステップ展開後に 2 月に存在しない日があるか確認可能 |

## 対象ファイル

- `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`（変更）
- `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`（変更）
- `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`（回帰テスト追加）

## 実装ガイド参照

`docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001/outputs/phase-12/implementation-guide.md`

## タスク仕様書

`docs/30-workflows/unassigned-task/TASK-CRON-VALIDATION-COMPOSITE-001.md`

## 親タスク

#2082 (TASK-CRON-SEMANTIC-VALIDATION-001 - closed)
