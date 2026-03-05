# Phase 6 拡張テストケース

## 追加・重点ケース

### EC-01

- ファイル: `src/main/ipc/__tests__/ipc-double-registration.test.ts`
- 内容: `registerSkillHandlers` へ authKeyService 注入 + `registerAuthKeyHandlers` との同一インスタンス検証
- 目的: Main配線不整合の再発防止

### EC-02

- ファイル: `src/main/ipc/__tests__/skillHandlers.execute.test.ts`
- 内容: `AUTHENTICATION_ERROR` の errorCode 伝搬回帰
- 目的: 失敗契約維持

### EC-03

- ファイル: `src/preload/__tests__/skill-api.contract.test.ts`
- 内容: preloadの errorCode->Error.code 転写回帰
- 目的: Main->Preload境界整合

### EC-04

- ファイル: `src/renderer/hooks/__tests__/useSkillExecution.test.ts`
- 内容: preflight失敗時に execute を抑止
- 目的: Renderer境界の異常系維持
