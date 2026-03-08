# IPC ドキュメント: Profile/Avatar フォールバックチャンネル仕様

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| Phase    | 12 - ドキュメント                             |
| 作成日   | 2026-03-08                                    |

---

## 1. 概要

Supabase 未設定環境では、Auth（5チャンネル）に加えて Profile（11チャンネル）/ Avatar（3チャンネル）も fallback ハンドラを登録し、未登録 IPC による Renderer クラッシュを防ぐ。

合計 **19 チャンネル**が Supabase 未設定時にフォールバック経路で応答する。

---

## 2. 経路分岐条件

```typescript
const supabase = getSupabaseClient();
```

| `getSupabaseClient()` 戻り値 | 経路           | 登録される関数                                                                                            |
| ---------------------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| `SupabaseClient` (非null)    | 通常経路       | `registerAuthHandlers()`, `registerProfileHandlers()`, `registerAvatarHandlers()`                         |
| `null`                       | フォールバック | `registerAuthFallbackHandlers()`, `registerProfileFallbackHandlers()`, `registerAvatarFallbackHandlers()` |

両経路は if/else で排他的に実行される。同一チャンネルに通常ハンドラとフォールバックが同時登録されることはない。

---

## 3. Profile フォールバック（11 チャンネル）

### エラーコード

- 定数: `PROFILE_ERROR_CODES.NOT_CONFIGURED`
- 値: `"profile/not-configured"`
- 定義元: `packages/shared/types/auth.ts` L390

### チャンネル一覧

| #   | チャンネル定数                              | チャンネル名                   | 通常経路の用途           | 通常経路の Request 引数                  | フォールバック Response                                                                                            |
| --- | ------------------------------------------- | ------------------------------ | ------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | `IPC_CHANNELS.PROFILE_GET`                  | `profile:get`                  | プロフィール取得         | なし                                     | `{ success: false, error: { code: "profile/not-configured", message: "Profile service is not configured. ..." } }` |
| 2   | `IPC_CHANNELS.PROFILE_UPDATE`               | `profile:update`               | プロフィール更新         | `{ displayName?, avatarUrl? }`           | 同上                                                                                                               |
| 3   | `IPC_CHANNELS.PROFILE_DELETE`               | `profile:delete`               | プロフィール削除         | `{ confirmEmail: string }`               | 同上                                                                                                               |
| 4   | `IPC_CHANNELS.PROFILE_GET_PROVIDERS`        | `profile:get-providers`        | 連携プロバイダー一覧取得 | なし                                     | 同上                                                                                                               |
| 5   | `IPC_CHANNELS.PROFILE_LINK_PROVIDER`        | `profile:link-provider`        | プロバイダー連携追加     | `{ provider: OAuthProvider }`            | 同上                                                                                                               |
| 6   | `IPC_CHANNELS.PROFILE_UNLINK_PROVIDER`      | `profile:unlink-provider`      | プロバイダー連携解除     | `{ provider: OAuthProvider }`            | 同上                                                                                                               |
| 7   | `IPC_CHANNELS.PROFILE_UPDATE_TIMEZONE`      | `profile:update-timezone`      | タイムゾーン更新         | `{ timezone: Timezone }`                 | 同上                                                                                                               |
| 8   | `IPC_CHANNELS.PROFILE_UPDATE_LOCALE`        | `profile:update-locale`        | ロケール更新             | `{ locale: Locale }`                     | 同上                                                                                                               |
| 9   | `IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS` | `profile:update-notifications` | 通知設定更新             | `{ notificationSettings: Partial<...> }` | 同上                                                                                                               |
| 10  | `IPC_CHANNELS.PROFILE_EXPORT`               | `profile:export`               | プロフィールエクスポート | なし                                     | 同上                                                                                                               |
| 11  | `IPC_CHANNELS.PROFILE_IMPORT`               | `profile:import`               | プロフィールインポート   | なし（ダイアログで選択）                 | 同上                                                                                                               |

### フォールバック Response 詳細

```json
{
  "success": false,
  "error": {
    "code": "profile/not-configured",
    "message": "Profile service is not configured. Supabase environment variables are required."
  }
}
```

**特記事項:**

- フォールバックハンドラは Request 引数を一切参照しない（即時エラー応答）
- `data` プロパティは存在しない
- 全11チャンネルが同一オブジェクト参照を返す

---

## 4. Avatar フォールバック（3 チャンネル）

### エラーコード

- 定数: `AVATAR_ERROR_CODES.NOT_CONFIGURED`
- 値: `"avatar/not-configured"`
- 定義元: `packages/shared/types/auth.ts` L402

### チャンネル一覧

| #   | チャンネル定数                     | チャンネル名          | 通常経路の用途           | 通常経路の Request 引数       | フォールバック Response                                                                                          |
| --- | ---------------------------------- | --------------------- | ------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | `IPC_CHANNELS.AVATAR_UPLOAD`       | `avatar:upload`       | アバター画像アップロード | なし（ダイアログで選択）      | `{ success: false, error: { code: "avatar/not-configured", message: "Avatar service is not configured. ..." } }` |
| 2   | `IPC_CHANNELS.AVATAR_USE_PROVIDER` | `avatar:use-provider` | プロバイダーアバター使用 | `{ provider: OAuthProvider }` | 同上                                                                                                             |
| 3   | `IPC_CHANNELS.AVATAR_REMOVE`       | `avatar:remove`       | アバター画像削除         | なし                          | 同上                                                                                                             |

### フォールバック Response 詳細

```json
{
  "success": false,
  "error": {
    "code": "avatar/not-configured",
    "message": "Avatar service is not configured. Supabase environment variables are required."
  }
}
```

---

## 5. Auth フォールバック（既存 5 チャンネル - 参考）

| #   | チャンネル定数                   | チャンネル名        | フォールバック Response                                                                                        |
| --- | -------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `IPC_CHANNELS.AUTH_LOGIN`        | `auth:login`        | `{ success: false, error: { code: "auth/not-configured", message: "Authentication is not configured. ..." } }` |
| 2   | `IPC_CHANNELS.AUTH_LOGOUT`       | `auth:logout`       | 同上                                                                                                           |
| 3   | `IPC_CHANNELS.AUTH_GET_SESSION`  | `auth:get-session`  | `{ success: true, data: null }` (例外: 未認証状態は正常)                                                       |
| 4   | `IPC_CHANNELS.AUTH_REFRESH`      | `auth:refresh`      | `{ success: false, error: { code: "auth/not-configured", ... } }`                                              |
| 5   | `IPC_CHANNELS.AUTH_CHECK_ONLINE` | `auth:check-online` | `{ success: true, data: { online: boolean } }` (例外: Supabase 不要)                                           |

**注意:** `auth:get-session` と `auth:check-online` は Supabase 未設定でも意味のある正常応答を返す。Profile / Avatar のフォールバックにはこのような例外はない。

---

## 6. 登録パターン（共通）

3ドメインとも以下の統一パターンで登録される:

```typescript
// 1. 共通ヘルパーでエラーレスポンスを生成
const notConfiguredResponse = createNotConfiguredResponse(
  DOMAIN_ERROR_CODES.NOT_CONFIGURED,
  "Domain service is not configured. ...",
);

// 2. ReadonlyArray<FallbackHandler> でチャンネル配列を定義
const fallbackHandlers: ReadonlyArray<FallbackHandler> = [
  [IPC_CHANNELS.DOMAIN_ACTION, async () => notConfiguredResponse],
  // ...
];

// 3. 共通ヘルパーで一括登録
registerFallbackHandlers(fallbackHandlers);
```

### 型定義

```typescript
type FallbackHandler = readonly [
  channel: string,
  handler: () => Promise<unknown>,
];
```

---

## 7. 契約上の注意事項

### 排他制約

- 通常経路（`registerProfileHandlers` / `registerAvatarHandlers`）と fallback 経路は if/else で排他にする
- `ipcMain.handle()` は二重登録不可のため、`unregisterAllIpcHandlers()` 前提のライフサイクルを崩さない

### Renderer 側の前提

- Renderer / Preload は `success: false` 応答を受けた場合、UI 上でエラー表示に分岐できること
- フォールバック応答では `data` プロパティが存在しないため、`result.data?.xxx` のような optional chaining で安全にアクセスすること

### チャンネル追加時の同期義務

`apps/desktop/src/preload/channels.ts` に Profile / Avatar チャンネルを追加した場合、対応する fallback エントリも `index.ts` の `registerProfileFallbackHandlers()` / `registerAvatarFallbackHandlers()` に追加する必要がある。回帰テスト T-E1/T-E2 が同期ズレを検出する。

---

## 8. 関連正本

| 仕様書                                                                            | 関連内容                            |
| --------------------------------------------------------------------------------- | ----------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | Auth/Profile/Avatar IPC 全体仕様    |
| `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | Supabase 依存ドメインの責務分離     |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | ipcMain.handle 登録/解除ルール      |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | fallback 経路を含む契約同期チェック |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | not configured 系エラーコード体系   |
