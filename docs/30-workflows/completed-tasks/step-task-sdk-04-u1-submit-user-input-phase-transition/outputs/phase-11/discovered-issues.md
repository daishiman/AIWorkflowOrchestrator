# Discovered Issues

## Real-time Classification

| ID    | 発見事項                                                                                                    | 分類 | 対応方針                                                                                               |
| ----- | ----------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------ |
| DI-01 | `createVerificationReviewRequest` が `free_text` kind のまま。将来 UI 改善で `single_select` にすべき可能性 | Note | Task05 以降で対応。本タスクの engine transition logic は selectedOptionId ベースで動作するため影響なし |
| DI-02 | `phase_transition` artifact の payload 型は shared types に未定義（any で記録）                             | Note | TECH-M-01 として追跡済み。将来タスクで型定義を検討                                                     |
