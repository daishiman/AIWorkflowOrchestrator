# Phase 1: 要件定義 — TASK-RT-04 API Key Management UI

## 1. 既存 IPC チャネル仕様

| チャネル名        | チャネル文字列      | パラメータ        | レスポンス                                                             | 説明                      |
| ----------------- | ------------------- | ----------------- | ---------------------------------------------------------------------- | ------------------------- |
| AUTH_KEY_SET      | `auth-key:set`      | `{ key: string }` | `{ success: boolean; error?: string }`                                 | APIキーを暗号化して保存   |
| AUTH_KEY_EXISTS   | `auth-key:exists`   | なし              | `{ exists: boolean; source?: "saved" \| "env-fallback" \| "not-set" }` | キーの存在確認            |
| AUTH_KEY_VALIDATE | `auth-key:validate` | `{ key: string }` | `{ valid: boolean; error?: string }`                                   | Anthropic APIへの疎通確認 |
| AUTH_KEY_DELETE   | `auth-key:delete`   | なし              | `{ success: boolean; error?: string }`                                 | 保存済みキーの削除        |

### セキュリティ仕様

- 全ハンドラで `validateIpcSender(event.sender)` によるスプーフィング防止
- キーは `safeStorage.encryptString()` でOS暗号化
- ログ出力時は `/sk-ant-api\d{2}-[A-Za-z0-9_-]+/g` で `[REDACTED]` 置換
- `auth-key:get` は意図的に非公開（セキュリティ上取得APIなし）

## 2. Preload API 公開メソッド

`window.electronAPI.authKey` に以下が**既に公開済み**（`preload/index.ts` L268-274）:

```typescript
authKey: {
  set: (key: string) => safeInvoke(IPC_CHANNELS.AUTH_KEY_SET, { key }),
  exists: () => safeInvoke(IPC_CHANNELS.AUTH_KEY_EXISTS),
  validate: (key: string) => safeInvoke(IPC_CHANNELS.AUTH_KEY_VALIDATE, { key }),
  delete: () => safeInvoke(IPC_CHANNELS.AUTH_KEY_DELETE),
}
```

**結論**: `skill-creator-api.ts` への重複追加は不要。`window.electronAPI.authKey` を直接使用する。

## 3. ApiKeyStatus 型要件

```typescript
type ApiKeyStatus = "not_set" | "validating" | "configured" | "error";
```

| 状態         | 意味           | UI表示                    |
| ------------ | -------------- | ------------------------- |
| `not_set`    | キー未設定     | 入力フォーム表示          |
| `validating` | 検証中         | スピナー + 入力無効化     |
| `configured` | 設定済み・有効 | マスク表示 + 削除ボタン   |
| `error`      | 設定/検証失敗  | エラーメッセージ + 再入力 |

## 4. UI 状態遷移

```
not_set → [ユーザーがキー入力して保存] → validating → configured
not_set → [ユーザーがキー入力して保存] → validating → error
configured → [削除ボタン押下] → not_set
error → [再入力して保存] → validating → configured | error
(初期ロード時) → [exists() で確認] → configured | not_set
```

## 5. バリデーション要件

| ルール                 | チェック内容                         | エラーメッセージ                          |
| ---------------------- | ------------------------------------ | ----------------------------------------- |
| 空文字チェック         | `key.trim() === ""`                  | APIキーを入力してください                 |
| プレフィックスチェック | `/^sk-ant-api\d{2}-/` にマッチしない | Anthropic APIキーの形式が正しくありません |
| 長さチェック           | 1〜200文字                           | APIキーの長さが不正です                   |

## 6. AC 写像確認

| AC   | 要件                                             | 実現方法                          |
| ---- | ------------------------------------------------ | --------------------------------- |
| AC-1 | ApiKeySettingsPanel が存在する                   | 新規コンポーネント作成            |
| AC-2 | バリデーション（空文字、フォーマット）が機能する | クライアントサイド + IPC validate |
| AC-3 | 保存状態がUI上に表示される                       | ApiKeyStatus による4状態表示      |
| AC-4 | 保存済みキーの削除機能が動作する                 | delete IPC チャネル呼び出し       |
| AC-5 | SkillLifecyclePanel に統合されている             | import + 条件付きレンダリング     |
