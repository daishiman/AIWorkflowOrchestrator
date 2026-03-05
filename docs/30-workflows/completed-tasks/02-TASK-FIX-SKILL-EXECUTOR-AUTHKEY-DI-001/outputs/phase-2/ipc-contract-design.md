# Phase 2 IPC契約設計

## 契約結論

- 外部IPCチャネルの追加・削除なし。
- `skill:execute` / `auth-key:exists` の公開契約は変更しない。
- 変更対象は Main 内部DI配線のみ。

## 契約詳細

### `skill:execute`（維持）

- Request:
  - 正式: `{ skillName: string; prompt: string }`
  - 互換: `{ skillId: string; params?: Record<string, unknown> }`
- Success: `{ success: true, data: SkillExecutionResponse }`
- Error: `{ success: false, error: string, errorCode?: string }`
- 認証失敗時: `errorCode = "AUTHENTICATION_ERROR"`

### `auth-key:exists`（維持）

- Response: `{ exists: boolean }`
- 判定順: store -> `ANTHROPIC_API_KEY` env

## 内部インターフェース変更

- `registerSkillHandlers(mainWindow, skillService, authKeyService?)`
  - 第3引数を追加（オプショナル）

## 後方互換

- 既存呼び出し `registerSkillHandlers(mainWindow, skillService)` は有効。
- 既存テストモックは2引数のまま通る。

## セキュリティ境界

- APIキーはMain内部でのみ保持・利用。
- エラーメッセージは既存サニタイズ処理を維持。
