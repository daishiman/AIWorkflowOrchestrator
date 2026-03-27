# Phase 8 Cleanup Sequencing

## 今回閉じたもの

- Agent / Skill consumer の central policy 消費
- composition root の auth mode / runtime policy DI 一元化
- runtime integration tests の current contract 同期

## 今回閉じないもの

| 項目                                 | 理由                                                                  | 継続先                               |
| ------------------------------------ | --------------------------------------------------------------------- | ------------------------------------ |
| `AI_CHECK_CONNECTION` cleanup        | public preload / handler / tests の削除は別 wave でまとめる必要がある | `UT-CLEANUP-AI-CHECK-CONNECTION-001` |
| deprecated `RuntimeResolver` cleanup | slide / runtime service / tests にまだ参照が残る                      | `UT-CLEANUP-RUNTIME-RESOLVER-001`    |
| sanitize placement                   | 本 wave の差分では配置判断を変えていない                              | `UT-DESIGN-SANITIZE-PLACEMENT-001`   |

## 整理方針

- close-out 完了は consumer の centralization 到達を意味し、cleanup 完了を意味しない。
- public contract を壊す削除は、専用 task で tests と docs を伴って行う。
