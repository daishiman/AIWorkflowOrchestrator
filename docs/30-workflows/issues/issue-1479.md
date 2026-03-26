# [#1479] UT-CHATVIEW-MODEL-SELECTOR-DATA-TESTID-001: InlineModelSelector に data-testid 属性を追加

## メタ情報

```yaml
issue_number: 1479
title: UT-CHATVIEW-MODEL-SELECTOR-DATA-TESTID-001: InlineModelSelector に data-testid 属性を追加
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1479
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

InlineModelSelector コンポーネントのルート要素に `data-testid="inline-model-selector"` を追加する。

## 背景

Phase 4 仕様書では `data-testid="inline-model-selector"` を使ったテストを想定していたが、InlineModelSelector コンポーネントには `data-testid` が付与されていない。テストでは `role="combobox"` で代替しているため機能的な問題はないが、E2E テスト（Playwright）での要素特定や、複数の combobox が同一画面に存在する場合の識別性向上のために `data-testid` の追加が望ましい。

## 対応内容

1. `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` のルート `<div>` に `data-testid="inline-model-selector"` を追加
2. 既存テスト（InlineModelSelector.test.tsx）で `data-testid` を使ったアサーションを追加（任意）

## 影響ファイル

- `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` — 修正（1行追加）

## 検出元

- タスク: TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION Phase 12
- 仕様書: `docs/30-workflows/unassigned-task/ut-chatview-model-selector-data-testid-001.md`
