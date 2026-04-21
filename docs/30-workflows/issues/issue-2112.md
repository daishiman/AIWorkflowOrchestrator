# [#2112] feat(cron): TASK-CRON-VALIDATION-I18N-001 cronバリデーションエラーメッセージ i18n 対応

## メタ情報

```yaml
issue_number: 2112
title: feat(cron): TASK-CRON-VALIDATION-I18N-001 cronバリデーションエラーメッセージ i18n 対応
state: OPEN
priority:  low
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-12
updated_date: 2026-04-12
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2112
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

`CRON_VALIDATION_ERRORS` 定数（および関数内インライン文字列）を i18n 翻訳辞書と接続できる形にリファクタリングし、将来の多言語対応コストをゼロに近づける。

## 問題

`scheduleConfigValidator.ts` のすべてのエラーメッセージが日本語にハードコードされている。

```typescript
const CRON_VALIDATION_ERRORS = {
  EMPTY: "cron式を入力してください",
  INVALID_FORMAT: "cron式の形式が正しくありません",
  INVALID_DATE: "指定した日付は存在しません（例: 2月31日）",
} as const;
```

インライン文字列も混在しており、多言語展開時に修正漏れが発生するリスクがある。

## 実装方針

翻訳関数注入パターン（アプローチA）を推奨：

```typescript
export const CRON_VALIDATION_KEYS = {
  EMPTY: "cron.validation.empty",
  INVALID_FORMAT: "cron.validation.invalidFormat",
  INVALID_DATE: "cron.validation.invalidDate",
} as const;

export function validateCronExpression(
  value: string,
  t: TranslateFn = defaultT, // 省略時は日本語フォールバック
): string | null;
```

## 対象ファイル

- `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`（変更）
- `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`（修正）
- `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`（修正）
- 新規: `apps/desktop/src/locales/ja/scheduleValidator.json`
- 新規: `apps/desktop/src/locales/en/scheduleValidator.json`

## 実装ガイド参照

`docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001/outputs/phase-12/implementation-guide.md`

## タスク仕様書

`docs/30-workflows/unassigned-task/TASK-CRON-VALIDATION-I18N-001.md`

## 親タスク

#2082 (TASK-CRON-SEMANTIC-VALIDATION-001 - closed)
