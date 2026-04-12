# [#2054] [UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001] DescribeStep.tsx 物理削除

## メタ情報

```yaml
issue_number: 2054
title: [UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001] DescribeStep.tsx 物理削除
state: OPEN
priority: 中
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-08
updated_date: 2026-04-08
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2054
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` を物理削除する。

W2-seq-03b でexportは削除済み、`@deprecated` も付与済みのため、物理ファイルを安全に削除できる。

## 背景

W2-seq-03b（wizard/index.ts 最終エクスポート整理）において以下が完了：

- `wizard/index.ts` から `DescribeStep` のエクスポートを削除済み
- `DescribeStep.tsx` に `@deprecated` JSDocを追加済み
- `GenerationMode` の import 先を `GenerateStep` に変更済み

## タスク分類

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| task_id      | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 |
| category     | リファクタリング                           |
| priority     | 低                                         |
| scale        | 小規模                                     |
| task_type    | NON_VISUAL                                 |
| dependencies | UT-SKILL-WIZARD-W2-seq-03b（完了済み）     |

## 実行タスク

1. `DescribeStep.tsx` への参照残留を全量確認（`import.*DescribeStep` パターン検索）
2. `DescribeStep.tsx` を物理削除
3. `pnpm typecheck` 通過確認
4. `pnpm test` 通過確認（`wizard-exports.test.ts` の DescribeStep 非存在テストは維持）

## 受入基準

- [ ] `DescribeStep.tsx` が存在しない
- [ ] `pnpm typecheck` がエラーなく通過
- [ ] `DescribeStep` を import している箇所がない
- [ ] `wizard-exports.test.ts` の DescribeStep 確認テストが維持・パスする

## 注意事項

`wizard-exports.test.ts` に `DescribeStep がエクスポートされていないこと` テストがある。ファイル削除後も有効なので削除しないこと。

## 由来

UT-SKILL-WIZARD-W2-seq-03b Phase 12 未タスク検出レポート（物理削除は別タスク計画）
