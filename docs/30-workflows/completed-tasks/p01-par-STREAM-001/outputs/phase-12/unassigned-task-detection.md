# 未タスク検出レポート: TASK-SW-STREAM-001

## 検出された未タスク候補

| ID     | 未タスク候補                                                | 優先度 | 理由                                                            |
| ------ | ----------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| FUP-01 | `SkillCreatorProgressData` を `packages/shared/` へ移動     | Low    | 型定義がTASK-SW-STREAM-002とも共有される可能性がある            |
| FUP-02 | `percentage` 値の定数化（`PROGRESS_PHASES` オブジェクト等） | Low    | magic numberが散在するとメンテナンス性が低下する                |
| FUP-03 | モード別（collaborative/orchestrate）の進捗フロー詳細化     | Medium | 現状はcreateモードと同じ5段階だが、モードごとに差異がある可能性 |

## 後続タスク連携

- TASK-SW-STREAM-002: IPC配線タスク（FUP-01完了後に実施推奨）
