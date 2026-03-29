# Phase 6: ギャップ精査

## 検証日時

2026-03-29

## 既存 follow-up の確認

| ID                                              | 内容                                                | backlog 状態      | 今回の扱い   |
| ----------------------------------------------- | --------------------------------------------------- | ----------------- | ------------ |
| `task-llm-adapter-factory-provider-ids-ssot`    | `LLMAdapterFactory` の provider ID 正本化           | 既存 backlog 項目 | 再発行しない |
| `task-llm-handle-get-providers-readonly-models` | readonly bridge 解消                                | 既存 backlog 項目 | 再発行しない |
| `UT-LLM-MOD-04-001`                             | OpenAI/xAI アダプターテストのレガシー model ID 統一 | 既存 backlog 項目 | 再発行しない |

## 今回の修正範囲

| 種別          | 対象                               | 状態     |
| ------------- | ---------------------------------- | -------- |
| stale spec    | 旧パス参照、旧実装前提文言         | 修正対象 |
| artifact 不足 | outputs/phase-2, 5, 6, 7, 8, 9, 10 | 補完対象 |
| 新規未タスク  | なし                               | 発行不要 |

## 判断

- 新規未タスクは発行しない
- 今回のギャップは stale spec と artifact 不足に限定
- 既存 backlog と重複する未タスクを防止
