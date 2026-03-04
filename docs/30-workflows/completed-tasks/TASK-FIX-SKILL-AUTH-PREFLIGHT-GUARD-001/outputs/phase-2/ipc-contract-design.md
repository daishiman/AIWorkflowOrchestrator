# Phase 2 IPC契約設計

## 1. 変更対象契約

### 1.1 `skill:execute` 失敗応答

- 現行:
  - `{ success: false, error: string }`
- 変更後:
  - `{ success: false, error: string, errorCode?: string }`

### 1.2 Preload unwrap例外

- 現行:
  - `throw new Error(result.error)`
- 変更後:
  - `throw Error` しつつ `error.code = result.errorCode` を付与

## 2. 契約互換性

- `errorCode` は optional のため、既存呼び出し側は破壊されない
- `error` 文言は従来のまま維持

## 3. 認証Preflight契約

- 使用チャネル: `auth-key:exists`
- 応答: `{ exists: boolean }`
- 利用ポリシー:
  - `exists=false` → 実行中断 + 設定誘導
  - API未提供/取得失敗 → 互換維持のため実行継続
