# Phase 2 テスト方針

## 1. 単体テスト（必須）

- Main IPC
  - `skillHandlers.execute`: 失敗時 `errorCode` 返却
  - `authKeyHandlers`: `auth-key:exists` 応答の安定性
- Preload
  - `safeInvokeUnwrap`: `errorCode` を `Error.code` に転写
- Renderer
  - `AgentView`: preflight NG時に execute未呼び出し + 誘導表示
  - `useSkillExecution`: preflight NG時に `AUTHENTICATION_ERROR`

## 2. 回帰テスト

- 既存の `skill:execute` 成功・失敗系を再実行
- 既存セキュリティ検証（sender validation）を再実行

## 3. テストデータ境界

- `auth-key:exists = true`
- `auth-key:exists = false`
- `auth-key API 不在`
- `skill:execute` エラー（`AUTHENTICATION_ERROR` / 一般エラー）

## 4. 合格基準

- 追加テスト PASS
- 既存対象テスト PASS
- 重大回帰 0 件
