# [#2318] [TASK-SC-CREATOR-UPDATE-IMPL-001] SkillCreatorService runUpdateWorkflow 実処理実装

## メタ情報

```yaml
issue_number: 2318
title: [TASK-SC-CREATOR-UPDATE-IMPL-001] SkillCreatorService runUpdateWorkflow 実処理実装
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2318
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`SkillCreatorService.runUpdateWorkflow()` がスタブ実装のまま（`logger.warn` のみ）で、`update` モード実行時に既存スキルの SKILL.md が実際に更新されない。

## 背景

`UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` で `update` モードの dispatch 修正は完了したが、`runUpdateWorkflow()` 本体の実処理が未実装のまま残っている。

## 完了条件

- `update` モード実行時に既存 SKILL.md が実際に更新される
- LLM クライアント利用可能時は purpose が LLM で再生成される
- AbortSignal 中断が各ステップで機能する
- TypeScript 型チェック PASS・全テスト PASS

## 関連

- 前タスク: UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE（dispatch 修正完了）
- 兄弟タスク: TASK-SC-IMPROVE-PROMPT-IMPL-001（improve-prompt 実処理）
- 関連: TASK-SC-UPDATE-SKILL-IMPL-001 #2203（SkillService.updateSkill 永続化）

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SC-CREATOR-UPDATE-IMPL-001.md`
