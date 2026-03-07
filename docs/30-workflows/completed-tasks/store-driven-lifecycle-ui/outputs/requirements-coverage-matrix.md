# requirements-coverage-matrix

## 目的

`/.claude/skills/aiworkflow-requirements/` から、TASK-10A-F（Store駆動ライフサイクルUI統合）に必要な仕様を漏れなく抽出できているかを検証する。

## 抽出戦略（Progressive Disclosure準拠）

1. `indexes/quick-reference.md` で技術キーワードを初期特定
2. `indexes/resource-map.md` でカテゴリ別の正本仕様を特定
3. 必要最小限の `references/*.md` をPhaseごとに紐付け

## 必要仕様の網羅マトリクス

| 関心ごと               | 必須仕様（aiworkflow-requirements）                                                                                                    | 参照先Phase | 充足判定 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                           | 1,2,5,9,12  | OK       |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                            | 1,2,8,9     | OK       |
| UI機能仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                        | 1,2,5,11    | OK       |
| UI原則                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                                         | 3,10,11     | OK       |
| インターフェース契約   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                      | 1,2,3,10    | OK       |
| IPC API契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                   | 1,2,3,10    | OK       |
| IPCセキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                           | 1,3,9,10    | OK       |
| スキル実行セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                              | 3,9,10      | OK       |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                  | 1,2,5,9     | OK       |
| 品質基準               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                            | 1,6,7,9,10  | OK       |
| タスク運用台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                   | 10,12,13    | OK       |
| タスク運用ルール       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                                                             | 10,12,13    | OK       |
| 教訓同期               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                 | 12          | OK       |
| 抽出入口               | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` / `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` | index,1     | OK       |

## ギャップ判定

- 未参照の必須カテゴリ: 0
- 参照先の非実在パス: 0
- Phase依存と仕様参照の不整合: 0

## 結論

本ワークフロー仕様書は、今回の実装で必要な `aiworkflow-requirements` の情報を抽出経路まで含めて網羅している。
