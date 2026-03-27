# Sibling Boundary Decision

## owned / delegated / non-goal

| 区分      | 項目                                                | 判断理由                                             |
| --------- | --------------------------------------------------- | ---------------------------------------------------- |
| owned     | Layer 3 / Layer 4 verify detail DTO                 | Task06 由来の genuine gap であり、本 task の中心責務 |
| owned     | re-verify action の UI / bridge 契約                | verify surface の拡張で閉じる                        |
| owned     | evidence / provenance / route snapshot 表示方針     | verify detail surface の契約に含まれる               |
| delegated | approval / disclosure / manual boundary             | Task07 の governance bundle が canonical owner       |
| delegated | route priority / integrated_api vs terminal_handoff | Task07 が primary / secondary lane を定義済み        |
| delegated | persistence / checkpoint / invalidation             | Task08 が session compatibility owner                |
| delegated | stale session / resume warning                      | Task08 が resume semantics owner                     |
| non-goal  | terminal handoff UX redesign                        | verify 拡張から切り離す                              |
| non-goal  | create mainline 導線変更                            | Task05 の責務                                        |
| non-goal  | verify 用の別実行エンジン                           | Task06 / 本 task の scope 外                         |

## decision rules

1. Task07 / Task08 owner の項目は renderer に表示しても ownership を移さない。
2. re-verify action は session を復元しない。現行 workflow context からの再評価起点だけを扱う。
3. delegated note は reference-only とし、新規 DTO owner を作らない。
