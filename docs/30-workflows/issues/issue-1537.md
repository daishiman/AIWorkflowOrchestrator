# [#1537] [UT-06-003-UNIFICATION-TEST-GAP] skill-api.unification.test.ts expectedMethods 検証漏れ修正

## メタ情報

```yaml
issue_number: 1537
title: [UT-06-003-UNIFICATION-TEST-GAP] skill-api.unification.test.ts expectedMethods 検証漏れ修正
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1537
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`apps/desktop/src/preload/__tests__/skill-api.unification.test.ts` の `expectedMethods` 配列が49項目しかなく、`getDetail` と `update` の2メソッドが含まれていない。

## 問題

- `expectedMethods` 配列: **49項目**
- `expect(actualMethods.length).toBe(51)`: **51を期待**
- コメントには `getDetail` と `update` を含む51項目の内訳が記載
- テストは PASS するが、2メソッドのリネーム/削除時に検出不可

## 修正内容

`expectedMethods` 配列に `"getDetail"` と `"update"` の2項目を追加（+2行）

## 対象ファイル

- `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts` (L129-179)

## 指示書

`docs/30-workflows/unassigned-task/task-ut-06-003-unification-test-gap.md`

## 発見元

UT-06-003-PRELOAD-API-IMPL 6層レビュー 2回目検証（2026-03-23）
