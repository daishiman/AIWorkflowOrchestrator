# Phase 4 テスト仕様書（Red）

## 目的

- `AuthKeyService` DI欠落をテストで再現し、実装前に失敗を固定する。

## 追加テスト

### TC-RED-001

- 対象: `src/main/ipc/__tests__/ipc-double-registration.test.ts`
- ケース名: `registerAllIpcHandlers が registerSkillHandlers に authKeyService を注入する`
- 検証点:
  - `registerSkillHandlers` が3引数で呼ばれる
  - 第3引数（authKeyService）が `registerAuthKeyHandlers` 第2引数と同一インスタンス

## 回帰対象（既存）

- `src/main/ipc/__tests__/skillHandlers.execute.test.ts`
- `src/main/ipc/__tests__/skillHandlers.delegate.test.ts`
- `src/preload/__tests__/skill-api.contract.test.ts`

## 期待

- 現行実装では TC-RED-001 が Fail（2引数呼び出しのため）。
