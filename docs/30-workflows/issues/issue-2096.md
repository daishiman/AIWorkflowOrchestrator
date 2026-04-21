# [#2096] [UT-W2-03B-CATEGORY-VALUES-SHARED-001] CATEGORY_VALUES 共有定数化（SkillInfoStep / DescribeStep drift 解消）

## メタ情報

```yaml
issue_number: 2096
title: [UT-W2-03B-CATEGORY-VALUES-SHARED-001] CATEGORY_VALUES 共有定数化（SkillInfoStep / DescribeStep drift 解消）
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-11
updated_date: 2026-04-11
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2096
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`SkillInfoStep.tsx` と `DescribeStep.tsx` でそれぞれ保持している `CATEGORY_VALUES` 定数を1箇所に集約し、2コンポーネント間の順序 drift リスクを解消する。

## 背景

W2-seq-03b の Phase 12 スキルフィードバックにて改善候補として記録。
`SKILL_CATEGORY_LABELS` は `skillCreator.ts` に集約済みだが、順序を規定する配列定数が2コンポーネントに分散している。

## 苦戦箇所

- `DescribeStep.tsx` は deprecated 状態だが互換維持のために残置中。このコンポーネントが残存する間は CATEGORY_VALUES の2重管理も継続する
- shared 化の配置先（`packages/shared/` vs `apps/desktop/` 内の定数ファイル）の判断が必要

## 受入基準

- [ ] `CATEGORY_VALUES` が1ファイルのみに定義されている
- [ ] `SkillInfoStep.tsx` と `DescribeStep.tsx` が共有定数を import している
- [ ] `pnpm --filter @repo/desktop test` がエラーなく通過する
- [ ] `pnpm typecheck` がエラーなく通過する

## 注意事項

- `DescribeStep.tsx` が deprecated のまま残存する間は優先度低。deprecated 削除タスクと同時実施も検討すること

## 仕様書

`docs/30-workflows/unassigned-task/UT-W2-03B-CATEGORY-VALUES-SHARED-001.md`
