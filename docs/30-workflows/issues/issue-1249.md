# [#1249] UT-SKILL-DOCS-TERMINAL-HANDOFF-001: terminal-handoff 実パス実装

## タスク概要

`SkillDocsCapabilityResolver` の terminal-handoff パスに実際のLLM到達判定ロジックを実装する。

## 背景

- 現在 `isAvailable()` はAPI key設定有無のみで判定
- ネットワーク障害・プロバイダダウン時に `integrated-api` を返してしまい生成失敗する
- `ping(): Promise<boolean>` メソッド追加による実到達確認が必要

## メタ情報

| 項目     | 内容                                                                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID | UT-SKILL-DOCS-TERMINAL-HANDOFF-001                                                                                                                                                      |
| カテゴリ | 改善                                                                                                                                                                                    |
| 優先度   | 中                                                                                                                                                                                      |
| 規模     | 小規模                                                                                                                                                                                  |
| 発見元   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 10 MINOR-R10-02                                                                                                                                |
| 仕様書   | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/unassigned-task/task-ut-skill-docs-terminal-handoff-001.md` |

## 関連タスク

- TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
- UT-9I-001
