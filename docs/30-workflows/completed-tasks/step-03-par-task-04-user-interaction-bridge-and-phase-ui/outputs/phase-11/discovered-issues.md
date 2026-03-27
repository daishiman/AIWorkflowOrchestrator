# Discovered Issues

## Summary

実装レビューの結果、Task04 の current code と Phase 12 記録の間に 3 件の follow-up がある。いずれも Task04 の scope 外へ棚上げせず、未タスクとして formalize する。

## Notes

| ID             | 種別                     | 概要                                                                                                                                                          | 判定           |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| TASK-SDK-04-U1 | runtime semantics        | `submitUserInput()` が `awaitingUserInput` を消すだけで、`plan_review` / `verification_review` 回答に応じた phase 遷移を起こしていない                        | follow-up 作成 |
| TASK-SDK-04-U2 | renderer/runtime binding | `SkillLifecyclePanel` が `planId` は canonical plan を使いながら、execute payload に current textarea 値を再送しており、plan review 後の実行対象が drift する | follow-up 作成 |
| TASK-SDK-04-U3 | evidence / path sync     | Phase 11/12/13 証跡が旧 path と docs-heavy 前提を残しており、現 code wave の説明と一致していない                                                              | follow-up 作成 |

- `UT-SC-02-006` の handoff visible 化そのものは current code で概ね吸収済みだが、上記 3 件は別責務として切り出す。
- approval / disclosure copy の最終化は引き続き Task07 の責務とし、本 file では追加 blocker に含めない。
- persistence / resume semantics は引き続き Task08 の責務だが、Task04 側で stale evidence を残さないことは今回の修正対象に含める。
