# Phase 5 契約差分

## 外部契約

- 変更なし
  - `skill:execute` request/response
  - `auth-key:exists` response
  - `errorCode` / `AUTHENTICATION_ERROR` 伝搬

## 内部契約

- 変更あり
  - `registerSkillHandlers(mainWindow, skillService)`
  - `registerSkillHandlers(mainWindow, skillService, authKeyService?)`

## 互換性判定

- 既存2引数呼び出し: 維持（破壊なし）
- 新規3引数呼び出し: `ipc/index.ts` で採用

## リスク判定

- 低
  - IPCチャネル増減なし
  - 返却型変更なし
  - 追加はDI注入のみ
