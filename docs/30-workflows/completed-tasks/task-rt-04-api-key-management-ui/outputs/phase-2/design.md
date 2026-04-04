# 設計書 - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 2

## 4層整合性テーブル

| 層       | 役割                                                      | 正本ファイル                                    |
| -------- | --------------------------------------------------------- | ----------------------------------------------- |
| Shared   | `ApiKeyStatus` を提供する                                 | `packages/shared/src/types/skillCreator.ts:209` |
| Main IPC | `auth-key:set/exists/validate/delete` を処理する          | `apps/desktop/src/main/ipc/authKeyHandlers.ts`  |
| Preload  | `window.electronAPI.authKey` を公開する                   | `apps/desktop/src/preload/authKeyApi.ts`        |
| Renderer | `ApiKeySettingsPanel` と `SkillLifecyclePanel` で利用する | `apps/desktop/src/renderer/components/skill/`   |

## 型・契約設計 (確定版)

```ts
// packages/shared/src/types/skillCreator.ts
export type ApiKeyStatus = "not_set" | "validating" | "configured" | "error";

// apps/desktop/src/main/services/auth/types.ts
export interface AuthKeySetRequest {
  key: string;
}
export interface AuthKeySetResponse {
  success: boolean;
  error?: string;
}
export interface AuthKeyExistsResponse {
  exists: boolean;
  source?: "saved" | "env-fallback" | "not-set";
}
export interface AuthKeyValidateResponse {
  valid: boolean;
  error?: string;
}
export interface AuthKeyDeleteResponse {
  success: boolean;
  error?: string;
}
```

## IPC チャンネル設計

| チャンネル          | Request           | Response                                                               |
| ------------------- | ----------------- | ---------------------------------------------------------------------- |
| `auth-key:set`      | `{ key: string }` | `{ success: boolean, error?: string }`                                 |
| `auth-key:exists`   | なし              | `{ exists: boolean, source?: "saved" \| "env-fallback" \| "not-set" }` |
| `auth-key:validate` | `{ key: string }` | `{ valid: boolean, error?: string }`                                   |
| `auth-key:delete`   | なし              | `{ success: boolean, error?: string }`                                 |

## UI設計

### `ApiKeySettingsPanel` 状態遷移

```
not_set → (入力＆保存) → validating → configured
not_set → (入力＆保存) → validating → error
configured → (削除) → not_set
```

| 状態       | 表示                            | 操作            |
| ---------- | ------------------------------- | --------------- |
| not_set    | 未設定バッジ + 入力フォーム     | 入力→保存ボタン |
| validating | 検証中...バッジ + 入力無効化    | なし            |
| configured | 設定済みバッジ + マスク表示     | 削除ボタン      |
| error      | エラーバッジ + エラーメッセージ | 入力→再保存     |

### 導線設計

| 導線     | コンポーネント                                | 責務                             |
| -------- | --------------------------------------------- | -------------------------------- |
| 主導線   | `SettingsView` → `AuthKeySection`             | 設定画面からのAPI キー管理       |
| 補助導線 | `SkillLifecyclePanel` → `ApiKeySettingsPanel` | スキル実行画面からのAPI キー確認 |

## セキュリティ設計

- `validateIpcSender` を全 Main IPC ハンドラーに適用済み (`withValidation()`)
- `trim()` 後空文字を拒否
- API キーをログ・エラーメッセージへ生で出さない (`sanitizeApiKey()`)
- `ANTHROPIC_API_KEY_SANITIZE_PATTERN` でログのサニタイズを実施

## 変更対象ファイル

| 区分     | ファイル                                                             | 状態             |
| -------- | -------------------------------------------------------------------- | ---------------- |
| 実装対象 | `packages/shared/src/types/skillCreator.ts`                          | 実装済み         |
| 実装対象 | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                       | 実装済み         |
| 実装対象 | `apps/desktop/src/preload/authKeyApi.ts`                             | 実装済み         |
| 実装対象 | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` | 実装済み         |
| 実装対象 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 統合済み         |
| 参照のみ | `apps/desktop/src/renderer/views/SettingsView/index.tsx`             | 主導線として参照 |
