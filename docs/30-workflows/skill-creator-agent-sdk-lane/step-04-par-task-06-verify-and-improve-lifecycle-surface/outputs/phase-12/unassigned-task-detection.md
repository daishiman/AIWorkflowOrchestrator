# Unassigned Task Detection

## サマリー

Task06 の docs-only 仕様 wave を 2 回確認し、follow-up 候補 3 件のうち 1 件だけを新規未タスクとして formalize した。残り 2 件は既存 sibling task の責務として扱い、新規未タスク化しない。

## SF-03 4パターン点検

| パターン              | 判定     | 内容                                                          |
| --------------------- | -------- | ------------------------------------------------------------- |
| 型定義→実装           | 該当あり | verify detail DTO は仕様化したが実装は未着手                  |
| 契約→テスト           | 該当あり | IPC / preload / renderer parity は task spec 上の matrix まで |
| UI仕様→コンポーネント | 該当あり | detail panel / re-verify action は仕様段階                    |
| 仕様書間差異→設計決定 | 該当なし | sibling boundary は Task05 / 07 / 08 へ明示委譲済み           |

## follow-up 判定

| 候補                          | 判定                    | 理由                                                                                       | 配置先 / 扱い                                                                            |
| ----------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Layer 3 / Layer 4 verify 導入 | 新規未タスク化          | Task06 の初回 scope 外であり、別 task 化しないと verify が肥大化する                       | `docs/30-workflows/unassigned-task/task-imp-task-sdk-06-layer34-verify-expansion-001.md` |
| governance hardening          | sibling task へ委譲済み | terminal handoff の表示と governance 契約は Task07 の責務であり、Task06 から重複起票しない | `step-05-seq-task-07-execution-governance-and-handoff-alignment/`                        |
| session compatibility         | sibling task へ委譲済み | re-verify と resume semantics は Task08 の persistence 設計で扱う                          | `step-06-seq-task-08-session-persistence-and-resume-contract/`                           |

## 新規未タスク 1 件の理由

- 将来対応を本文で明示している
- Layer 3 / Layer 4 verify は Task07 / Task08 の既存責務へ包含できず、Task06 由来の detail contract として独立粒度を持つ
- docs-only task でも genuine gap を 0件扱いにすると downstream planning が曖昧になる

## 新規未タスク化しなかった 2 件の理由

- governance hardening は Task07 の acceptance criteria と境界が一致しており、別 issue にすると同一責務が二重化する
- session compatibility は Task08 の resume / persistence semantics に含まれるため、Task06 から追加起票すると設計責務が分散する
