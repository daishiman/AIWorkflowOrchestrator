# Phase 2 Design Summary

## current contract

- `RuntimePolicyResolver` は authority として存在するが、Agent / Skill consumer は旧 `RuntimeResolver` を直接参照していた。
- public IPC / preload / shared transport は `HandoffGuidance` や `SkillExecutionResponse` を通じて既に stable で、今回の差分は main process 内部配線に閉じていた。

## target delta

1. composition root が `RuntimePolicyResolver` と `IAuthModeService` を 1 回生成する。
2. `registerAgentExecutionHandlers()` と `registerSkillHandlers()` は resolver 自身ではなく `resolveWithService(authModeService.getMode())` を使う。
3. `terminal_handoff` の理由文言は `bundle.manualRetryRule` を正本にする。
4. public transport は既存の `TerminalHandoffBuilder` と shared response 型を再利用し、Step 2 の追加型定義は行わない。

## 設計判断

| 論点               | 判断                              | 理由                                                                       |
| ------------------ | --------------------------------- | -------------------------------------------------------------------------- |
| auth mode source   | `IAuthModeService` を注入         | consumer が auth 判定ロジックを再実装しないため                            |
| handoff response   | `TerminalHandoffBuilder` 継続利用 | public response 形状を変えずに central policy だけ差し替えられるため       |
| shared sync        | no-op                             | main process 内部 DI 変更のみで、public payload 追加がなかったため         |
| skill creator lane | no change                         | 既存 `registerSkillCreatorHandlers()` が public surface を保持していたため |

## 依存順

1. `index.ts` の DI 更新
2. `agentHandlers.ts` の consumer 置換
3. `skillHandlers.ts` の consumer 置換
4. runtime tests 更新
5. workflow docs 同期
