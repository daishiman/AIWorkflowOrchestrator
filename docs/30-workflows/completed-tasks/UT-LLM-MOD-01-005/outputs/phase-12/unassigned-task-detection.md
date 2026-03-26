# Phase 12: 未タスク検出

## サマリー

| 区分              | 件数 | 備考                                                 |
| ----------------- | ---- | ---------------------------------------------------- |
| current findings  | 2    | 今回差分から formalize した follow-up                |
| baseline findings | 1群  | 既知の IPC contract drift は今回 FAIL 判定に使わない |

## current findings

| #   | タスク                                                                         | 分類             | 優先度 | formalize path                                                                       |
| --- | ------------------------------------------------------------------------------ | ---------------- | ------ | ------------------------------------------------------------------------------------ |
| 1   | `LLMAdapterFactory` の `SUPPORTED_PROVIDER_IDS` を `PROVIDER_IDS` 由来へ寄せる | リファクタリング | 中     | `docs/30-workflows/unassigned-task/task-llm-adapter-factory-provider-ids-ssot.md`    |
| 2   | `handleGetProviders()` の readonly models bridge を型で解消する                | 改善             | 低     | `docs/30-workflows/unassigned-task/task-llm-handle-get-providers-readonly-models.md` |

## baseline findings

| 項目                     | 扱い                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| IPC contract drift 204件 | 既知負債として継続監視。今回差分の FAIL 判定からは除外し、existing backlog / validator baseline として分離記録する |

## 検出根拠

- `LLMAdapterFactory.ts` に `SUPPORTED_PROVIDER_IDS` の手動列挙が残っている
- `llm.ts` の `handleGetProviders()` は `readonly models` を mutable `LLMProvider[]` へ橋渡しするため `[...config.models]` を使っている
- current task scope では SSoT の確立を優先し、上記 2 点は Phase 12 follow-up として切り出した

## 3ステップ確認

| ステップ                        | 結果 |
| ------------------------------- | ---- |
| 指示書作成                      | 実施 |
| `task-workflow-backlog.md` 登録 | 実施 |
| 関連仕様書 / workflow 参照追加  | 実施 |

## current / baseline 監査

- `verify-unassigned-links`: repo 全体では baseline missing 63。今回追加 2 件は target-file 監査で current 0 を確認
- `audit-unassigned-tasks --json --target-file ...`: currentViolations 0
- `audit-unassigned-tasks --json` baseline: baselineViolations 334
