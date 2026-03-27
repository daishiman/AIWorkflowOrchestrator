# Implementation Summary

## 実装面

| 面       | 役割                                                           | Task06 で守る境界                                                                     |
| -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| shared   | verify detail DTO と provenance summary の公開契約             | 既存 `RuntimeSkillCreatorImproveSuggestion` / `ApplyImprovementResult` を再定義しない |
| main     | `verifyResult` owner、improve / apply の runtime orchestration | verify truth を renderer へ移さない                                                   |
| preload  | renderer に見せる最小 public API                               | IPC payload を shared DTO と同型に保つ                                                |
| renderer | detail panel、selection、re-verify action                      | create 主導線と手動 guidance owner を奪わない                                         |

## 変更の芯

- `verifyResult` / `sourceProvenance` の owner は Task02 側に残す
- Task06 は detail surface と action wiring に限定する
- improve と apply は既存 public contract の再利用を優先する
- re-verify は create 入口への回帰ではなく、現在文脈での再点検として定義する

## 非対象

- create 主導線の再設計
- governance / disclosure / manual boundary の hardening
- session persistence / resume compatibility
- Layer 3 / Layer 4 verify の導入
