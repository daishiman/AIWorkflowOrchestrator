# [#2319] [TASK-SC-IMPROVE-PROMPT-IMPL-001] SkillCreatorService runImprovePromptWorkflow 実処理実装

## メタ情報

```yaml
issue_number: 2319
title: [TASK-SC-IMPROVE-PROMPT-IMPL-001] SkillCreatorService runImprovePromptWorkflow 実処理実装
state: OPEN
priority: 中
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2319
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`SkillCreatorService.runImprovePromptWorkflow()` がスタブ実装のまま（`logger.warn` のみ）で、`improve-prompt` モード実行時に SKILL.md のプロンプトセクションが実際に改善されない。

## 背景

`UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` で `improve-prompt` モードの dispatch 修正は完了したが、`runImprovePromptWorkflow()` 本体の実処理が未実装のまま残っている。`update` モードより軽量な処理（prompt セクションのみ改善）を想定。

## 完了条件

- `improve-prompt` モード実行時に SKILL.md のプロンプトセクションが実際に改善される
- LLM クライアント利用可能時は改善提案が LLM で生成される
- LLM 未設定時は `improveSkill()` フォールバックが動作する
- AbortSignal 中断が各ステップで機能する
- TypeScript 型チェック PASS・全テスト PASS

## 関連

- 前タスク: UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE（dispatch 修正完了）
- 兄弟タスク: TASK-SC-CREATOR-UPDATE-IMPL-001（runUpdateWorkflow 実処理）
- 既存メソッド: `improveSkill()` との責務整理が必要

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SC-IMPROVE-PROMPT-IMPL-001.md`
