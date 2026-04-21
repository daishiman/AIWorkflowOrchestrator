# [#2128] docs(cron): TASK-CRON-DOM-NULL-DEFAULT-001 VisualCronConfig.dayOfMonth null/undefined 既定値ルール明確化

## メタ情報

```yaml
issue_number: 2128
title: docs(cron): TASK-CRON-DOM-NULL-DEFAULT-001 VisualCronConfig.dayOfMonth null/undefined 既定値ルール明確化
state: OPEN
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-04-13
updated_date: 2026-04-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2128
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`VisualCronConfig.dayOfMonth` は `number` 型（null非許容）で定義されているが、null/undefined が渡された場合の既定値ルールが未定義。

## 背景

- `TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001` で `Number.isInteger(dayOfMonth)` により null/undefined を弾く実装を追加したが、これは「意図した設計」として明示されていない
- 呼び出し元がどの値を既定値として使うべきかのドキュメントが不足している

## 受け入れ条件

| AC番号 | 条件                                                                                         | 検証方法       |
| ------ | -------------------------------------------------------------------------------------------- | -------------- |
| AC-1   | `VisualCronConfig.dayOfMonth` の型定義に null/undefined 時の挙動が JSDoc で明記されている    | コードレビュー |
| AC-2   | `visualConfigToCron` の JSDoc に null/undefined が渡された場合 `""` を返す旨が明記されている | コードレビュー |
| AC-3   | 既存テスト全件がパスする（ランタイム挙動の変更なし）                                         | vitest実行     |

## 関連ファイル

- `apps/desktop/src/renderer/types/visualCronConfig.ts`
- `apps/desktop/src/renderer/utils/cronConverter.ts`

## 発見元

TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 Phase 12 未タスク検出（2026-04-13）

## 仕様書

`docs/30-workflows/unassigned-task/TASK-CRON-DOM-NULL-DEFAULT-001.md`
