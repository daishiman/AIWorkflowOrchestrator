# [#2127] feat(cron): TASK-CRON-ALL-FREQUENCY-GUARD-001 cronConverter hour/minute 全周波数共通範囲ガード処理追加

## メタ情報

```yaml
issue_number: 2127
title: feat(cron): TASK-CRON-ALL-FREQUENCY-GUARD-001 cronConverter hour/minute 全周波数共通範囲ガード処理追加
state: OPEN
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-04-13
updated_date: 2026-04-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2127
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`cronConverter.ts` の `hour`（0-23）と `minute`（0-59）にも範囲外ガードが未実装。
`TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001` で `dayOfMonth` のガードを追加したが、`hour`/`minute` は本タスクのスコープ外として切り出した。

## 背景

- `weekly`, `monthly`, `hourly` 等の全周波数で `hour` や `minute` に不正値が渡された場合（例: hour=-1, hour=25, minute=60）でも、不正な cron 式が生成される
- `Number.isInteger()` チェックが未実装のため、NaN・小数・Infinity も通過してしまう

## 受け入れ条件

| AC番号 | 条件                                            | 検証方法       |
| ------ | ----------------------------------------------- | -------------- |
| AC-1   | `hour=-1` のとき全周波数で `""` を返す          | 単体テスト     |
| AC-2   | `hour=24` のとき全周波数で `""` を返す          | 単体テスト     |
| AC-3   | `minute=-1` のとき全周波数で `""` を返す        | 単体テスト     |
| AC-4   | `minute=60` のとき全周波数で `""` を返す        | 単体テスト     |
| AC-5   | `hour=0` のとき正常動作する（境界値）           | 単体テスト     |
| AC-6   | `hour=23` のとき正常動作する（境界値）          | 単体テスト     |
| AC-7   | `minute=0` のとき正常動作する（境界値）         | 単体テスト     |
| AC-8   | `minute=59` のとき正常動作する（境界値）        | 単体テスト     |
| AC-9   | 既存テスト全件がパスする                        | vitest実行     |
| AC-10  | JSDoc に hour/minute ガード仕様が追記されている | コードレビュー |

## 関連ファイル

- `apps/desktop/src/renderer/utils/cronConverter.ts`
- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`

## 発見元

TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 Phase 12 未タスク検出（2026-04-13）

## 仕様書

`docs/30-workflows/unassigned-task/TASK-CRON-ALL-FREQUENCY-GUARD-001.md`
