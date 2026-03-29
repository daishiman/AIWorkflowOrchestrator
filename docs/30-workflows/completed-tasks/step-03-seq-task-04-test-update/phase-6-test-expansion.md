# Phase 6: ギャップ精査

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 6                          |
| 機能名 | task-llm-mod-04-audit-sync |
| 作成日 | 2026-03-29                 |

## 目的

`TASK-LLM-MOD-04` 完了後に残る follow-up を current backlog と突き合わせ、今回 workflow に含めるべきものと含めないものを切り分ける。

## 実行タスク

- backlog 既存項目の確認
- 今回 workflow の責務境界確認
- 新規未タスク化の要否判定

## 既存 follow-up

| ID                                              | 内容                                                | 今回の扱い                            |
| ----------------------------------------------- | --------------------------------------------------- | ------------------------------------- |
| `task-llm-adapter-factory-provider-ids-ssot`    | `LLMAdapterFactory` の provider ID 正本化           | 既存 backlog を参照、再発行しない     |
| `task-llm-handle-get-providers-readonly-models` | readonly bridge 解消                                | 既存 backlog を参照、再発行しない     |
| `UT-LLM-MOD-04-001`                             | OpenAI/xAI アダプターテストのレガシー model ID 統一 | 既存 backlog として維持し再発行しない |

## 判断

- 新規未タスクは発行しない
- 今回のギャップは stale spec と artifact 不足に限定される

## 参照資料

| 資料    | パス                                                                                   | 説明           |
| ------- | -------------------------------------------------------------------------------------- | -------------- |
| Phase 5 | `phase-5-implementation.md`                                                            | 実装実態       |
| backlog | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`           | 既存 follow-up |
| lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-test-typesafety.md` | SSoT 教訓      |

## 統合テスト連携

ギャップ精査は backlog 既存項目と重複未タスクを防ぐための工程である。

## 成果物

| 成果物       | パス                        | 説明               |
| ------------ | --------------------------- | ------------------ |
| ギャップ精査 | `phase-6-test-expansion.md` | follow-up 切り分け |

## 完了条件

- [x] 既存 backlog を確認した
- [x] 新規未タスクを再発行しないと決定した
- [x] 今回の修正範囲を stale spec と artifact に限定した
- [x] **本Phase内の全タスクを100%実行完了**
