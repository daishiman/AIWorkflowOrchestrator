# [#2138] [TASK-CRON-ERROR-STYLE-UNIFICATION-001] weekly/monthly エラースタイル統一（text-xs vs text-sm）

## メタ情報

```yaml
issue_number: 2138
title: [TASK-CRON-ERROR-STYLE-UNIFICATION-001] weekly/monthly エラースタイル統一（text-xs vs text-sm）
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-04-13
updated_date: 2026-04-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2138
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`VisualCronPicker` のエラー表示において、weekly が `text-xs`、monthly が `text-sm` となっており、同じ役割のアラート要素でフォントサイズが不統一な状態になっている。UI の一貫性を確保するため、両者を `text-sm` に統一する。

## 対象ファイル

- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`

## 詳細

### Why

weekly エラー（254行目付近）は `text-xs text-red-500 mt-1`、monthly エラー（282行目付近）は `text-red-500 text-sm mt-1` と異なるフォントサイズクラスが付与されている。機能上の問題はないが、同じ役割のアラートで見た目のサイズが異なると UI 全体の一貫性が弱まる。また将来のデザイントークン見直し時にどちらを正とするか曖昧になりやすい。

### What

- weekly エラー `p` 要素の `text-xs` を `text-sm` に変更（1行のみ）
- `text-sm` を正とする根拠: monthly 側が後から実装された際に選択されたサイズ、かつフォーム内他のヘルプテキストも `text-sm` を使用

### 変更箇所

```diff
- <p role="alert" className="text-xs text-red-500 mt-1">
+ <p role="alert" className="text-sm text-red-500 mt-1">
```

diff は `VisualCronPicker.tsx` 1ファイル・1行のみ。

## タスク仕様書

`docs/30-workflows/unassigned-task/task-cron-error-style-unification.md`

## 優先度

低
