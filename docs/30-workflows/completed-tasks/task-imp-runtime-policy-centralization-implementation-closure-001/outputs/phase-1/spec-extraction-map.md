# Phase 1 Spec Extraction Map

## 参照対応表

| 論点                        | Task 仕様書                             | upstream / canonical                         | current code anchor                                                                                          | この wave の判断                                                               |
| --------------------------- | --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| authority の一意化          | `index.md` AC-1                         | Task02 `outputs/phase-2/contract-matrix.md`  | `apps/desktop/src/main/ipc/index.ts`                                                                         | `RuntimePolicyResolver` を composition root で 1 回生成し、consumer へ注入する |
| Agent execute path          | `phase-1-requirements.md` consumer 観点 | Task02 ownership / policy contract           | `apps/desktop/src/main/ipc/agentHandlers.ts`                                                                 | local resolver 依存をやめ、`resolveWithService()` の decision を直接消費する   |
| Skill execute path          | `phase-1-requirements.md` consumer 観点 | Task02 ownership / policy contract           | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                                 | handoff / integrated の分岐を central policy へ寄せる                          |
| legacy health route         | `index.md` AC-4                         | canonical workflow / backlog                 | `apps/desktop/src/main/ipc/aiHandlers.ts`, `apps/desktop/src/preload/channels.ts`                            | 今回は削除せず、cleanup 条件のみを固定する                                     |
| deprecated resolver cleanup | `index.md` AC-6                         | canonical workflow / backlog                 | `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`, `apps/desktop/src/main/slide/skill-executor.ts` | consumer 移行完了後の follow-up として残す                                     |
| shared / preload drift      | `index.md` AC-3                         | `api-ipc-system-core.md`, `llm-ipc-types.md` | `packages/shared/src/types`, `apps/desktop/src/preload/*`                                                    | public transport は既存契約を維持し、新規 Step 2 変更は不要と判定する          |
| test evidence               | `index.md` AC-5                         | quality requirements                         | `apps/desktop/src/main/ipc/__tests__/*`                                                                      | agent / skill runtime tests と既存 contract tests を証跡の主軸にする           |

## AC 対応

| AC   | 仕様アンカー                                | 監査アンカー                                        |
| ---- | ------------------------------------------- | --------------------------------------------------- |
| AC-1 | authority を `RuntimePolicyResolver` に統一 | `index.ts`, `agentHandlers.ts`, `skillHandlers.ts`  |
| AC-2 | execute path で decision を実消費           | runtime tests 2本                                   |
| AC-3 | shared/public transport は drift なしを証明 | preload / shared no-op 判定、existing contract 維持 |
| AC-4 | `AI_CHECK_CONNECTION` は cleanup 入口を明示 | `cleanup-sequencing.md`, backlog 同期               |
| AC-5 | 回帰経路と失敗系をカバー                    | targeted vitest + typecheck                         |
| AC-6 | cleanup 条件を Phase 10-12 で文章化         | final review / phase12 outputs                      |
