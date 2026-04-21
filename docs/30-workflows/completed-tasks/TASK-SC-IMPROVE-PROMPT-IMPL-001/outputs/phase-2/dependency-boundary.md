# 依存関係・責務境界

## improve-prompt vs update の差異

| 観点          | improve-prompt             | update                           |
| ------------- | -------------------------- | -------------------------------- |
| progress step | improving(65%)             | generating-skill(60%)            |
| 対象          | プロンプトセクション改善   | スキル全体更新                   |
| 実処理        | runImprovePromptWorkflow() | runUpdateWorkflow() (兄弟タスク) |
| LLM 入力      | 既存 SKILL.md 全文         | options の変更内容               |

## 兄弟タスク境界

| タスク                          | 対象                       | スコープ外                 |
| ------------------------------- | -------------------------- | -------------------------- |
| 本タスク                        | runImprovePromptWorkflow() | runUpdateWorkflow()        |
| TASK-SC-CREATOR-UPDATE-IMPL-001 | runUpdateWorkflow()        | runImprovePromptWorkflow() |

## SkillCreatorService 内部責務

- `runImprovePromptWorkflow()`: SKILL.md 読み込み→改善→書き戻し
- `improveSkill()`: improve_skill.js スクリプト呼び出し（フォールバック専用）
- `createSkill()`: progress emit・AbortController・エラー後クリーンアップ の所有者
