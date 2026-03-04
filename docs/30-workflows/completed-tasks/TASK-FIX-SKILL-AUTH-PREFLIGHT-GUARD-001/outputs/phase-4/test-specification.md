# Phase 4 テスト仕様

## 目的

`AUTHENTICATION_ERROR` の事前検知と設定誘導を、Main/Preload/Renderer の境界で失敗先行（Red）で検証可能にする。

## テスト観点

| ID       | レイヤー      | 観点                                                     | 対象ファイル                                                             | 期待値                                  |
| -------- | ------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| P4-TC-01 | Main IPC      | `skill:execute` 失敗応答へ `errorCode` が含まれる        | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`      | `AUTHENTICATION_ERROR` が返る           |
| P4-TC-02 | Main IPC      | `auth-key:exists` が環境変数 fallback を考慮する         | `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`            | store 未設定でも env 有で `exists=true` |
| P4-TC-03 | Preload       | `safeInvokeUnwrap` が `errorCode -> Error.code` 転写する | `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts`          | `error.code === "AUTHENTICATION_ERROR"` |
| P4-TC-04 | Renderer Hook | preflight NG 時に execute を呼ばずエラー設定する         | `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`    | execute 未呼び出し + 誘導文言           |
| P4-TC-05 | Renderer View | AgentView 実行前 preflight で設定誘導へ分岐              | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 設定誘導表示                            |
| P4-TC-06 | Store         | `agentSlice.executeSkill` が preflight NG で早期 return  | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`    | `executionStatus=failed` + 誘導文言     |

## Red 前提

- 実装前提であれば P4-TC-01〜06 は未実装/契約不整合で失敗する。
- 現在ブランチは Green 済みのため、Red は履歴再構成として記録する。
