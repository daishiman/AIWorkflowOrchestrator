# [#2207] [TASK-SW-STREAM-FUP-02] onProgress 進捗フェーズの定数化

## メタ情報

```yaml
issue_number: 2207
title: [TASK-SW-STREAM-FUP-02] onProgress 進捗フェーズの定数化
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-16
updated_date: 2026-04-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2207
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`createSkill()` の5段階進捗フロー（phase/percentage/message）を `PROGRESS_PHASES` 定数オブジェクトに集約する。

## 背景

TASK-SW-STREAM-001で5段階の進捗を実装したが、phase名・percentage・messageがハードコードされている。
テストファイルでも同じ文字列/数値を重複記述しており、変更時に両方を修正する必要がある。

## 変更対象

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/__tests__/main/services/skill/SkillCreatorService.progress.test.ts`

## 受入基準

- `PROGRESS_PHASES.PLANNING`, `PROGRESS_PHASES.GENERATING_SKILL` 等の定数が定義されている
- `createSkill()` 内のemitProgress呼び出しが全て定数を参照している
- テストの期待値が定数を参照している
- typecheck/testが全てpass

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SW-STREAM-FUP-02-PROGRESS-CONSTANTS.md`
