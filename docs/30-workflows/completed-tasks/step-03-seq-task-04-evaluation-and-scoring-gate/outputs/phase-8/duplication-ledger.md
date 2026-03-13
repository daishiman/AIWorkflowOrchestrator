# Phase 8: Duplication Ledger

| 対象         | 旧状態                    | 現状態                                              |
| ------------ | ------------------------- | --------------------------------------------------- |
| gate label   | UI ごとに個別表現の可能性 | `getLifecycleGateLabel()` に集約                    |
| summary      | surface ごとに生成し得た  | `buildLifecycleGateDecision()` に集約               |
| threshold    | 60 / 80 / 70 が散在し得た | `LIFECYCLE_SCORE_THRESHOLDS` に集約                 |
| delta 計算   | UI 側で再計算し得た       | snapshot 保存時に固定                               |
| Task05 reuse | 新規ロジック追加の恐れ    | `SkillCenterView` が既存 selector / action を再利用 |

## 未解消だが許容した重複

| 項目                                                         | 理由                                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `SkillEvaluationPanel` と `ScoreDisplay` の badge style 定義 | 既存 component のレイアウト差が大きく、Task04 では無理に共通 CSS map 化しない |
