# Phase 2 成果物: 設計サマリー

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| タスクID   | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 作成日     | 2026-03-08                                    |
| ステータス | 完了（P50: 既存実装が設計と一致）             |

## 設計サマリー

### 関数設計

3つのフォールバック登録関数が同一パターンで実装される設計:

| 関数名                              | チャンネル数 | エラーコード                           |
| ----------------------------------- | ------------ | -------------------------------------- |
| `registerAuthFallbackHandlers()`    | 5            | `AUTH_ERROR_CODES.AUTH_NOT_CONFIGURED` |
| `registerProfileFallbackHandlers()` | 11           | `PROFILE_ERROR_CODES.NOT_CONFIGURED`   |
| `registerAvatarFallbackHandlers()`  | 3            | `AVATAR_ERROR_CODES.NOT_CONFIGURED`    |

### 共通ヘルパー設計

重複排除のため2つの共通関数を抽出:

#### `createNotConfiguredResponse(code, message)`

```typescript
function createNotConfiguredResponse(code: string, message: string) {
  return { success: false, error: { code, message } };
}
```

#### `registerFallbackHandlers(handlers)`

```typescript
function registerFallbackHandlers(
  handlers: ReadonlyArray<FallbackHandler>,
): void {
  for (const [channel, handler] of handlers) {
    ipcMain.handle(channel, handler);
  }
}
```

### レスポンス構造

全フォールバックハンドラが統一されたエラーエンベロープを返す:

```typescript
{
  success: false,
  error: {
    code: "<DOMAIN>_ERROR_CODES.NOT_CONFIGURED",
    message: "<Domain> service is not configured. Supabase environment variables are required."
  }
}
```

例外: Auth の `get-session` は `{ success: true, data: null }`、`check-online` は `{ success: true, data: { online: net.isOnline() } }` を返す。

### 呼び出し箇所の設計

`apps/desktop/src/main/ipc/index.ts` L460-477 の if/else 分岐:

- **if（Supabase設定済み）**: `registerAuthHandlers()` + `registerProfileHandlers()` + `registerAvatarHandlers()` を登録
- **else（Supabase未設定）**: `registerAuthFallbackHandlers()` + `registerProfileFallbackHandlers()` + `registerAvatarFallbackHandlers()` を登録

排他分岐により、通常ハンドラとフォールバックハンドラが同時に登録されることはない。

### 影響範囲

#### 変更対象ファイル

| ファイル                             | 変更内容                               |
| ------------------------------------ | -------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts` | 2関数追加 + elseブロックに呼び出し追加 |

#### 変更しないファイル

| ファイル                                       | 理由                               |
| ---------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/preload/channels.ts`         | チャンネル定数は既存のものを使用   |
| `apps/desktop/src/main/ipc/profileHandlers.ts` | 通常ハンドラは変更不要             |
| `apps/desktop/src/main/ipc/avatarHandlers.ts`  | 通常ハンドラは変更不要             |
| `packages/shared/types/auth.ts`                | エラーコード定数は既存のものを使用 |

### P5（二重登録）対策

1. **if/else排他分岐**: `getSupabaseClient()` の戻り値による分岐で、通常ハンドラとフォールバックが同時に登録されない
2. **`unregisterAllIpcHandlers()`**: macOS `activate` イベント等での再登録時は、事前に全ハンドラを解除
3. **`registerFallbackHandlers()` ヘルパー**: `ipcMain.handle()` を宣言的配列から一括登録し、手動管理のミスを防止

## 既存実装との照合結果

| 設計要素                            | 設計仕様                                           | 既存実装（L689-787）       | 一致 |
| ----------------------------------- | -------------------------------------------------- | -------------------------- | ---- |
| `createNotConfiguredResponse()`     | `{ success, error: { code, message } }` 生成       | L689-697: 完全一致         | 合致 |
| `registerFallbackHandlers()`        | `ReadonlyArray<FallbackHandler>` を反復登録        | L699-703: 完全一致         | 合致 |
| `registerProfileFallbackHandlers()` | 11チャンネル、`PROFILE_ERROR_CODES.NOT_CONFIGURED` | L746-769: 完全一致         | 合致 |
| `registerAvatarFallbackHandlers()`  | 3チャンネル、`AVATAR_ERROR_CODES.NOT_CONFIGURED`   | L775-787: 完全一致         | 合致 |
| else分岐での呼び出し                | 3関数連続呼び出し                                  | L474-476: 完全一致         | 合致 |
| `FallbackHandler` 型                | `readonly [string, (...) => Promise<unknown>]`     | 型定義済み（ファイル上部） | 合致 |

## 完了条件チェックリスト

- [x] `registerProfileFallbackHandlers()` の関数設計が完了
- [x] `registerAvatarFallbackHandlers()` の関数設計が完了
- [x] レスポンス構造が既存パターンと一致することを確認
- [x] 呼び出し箇所（elseブロック）の変更内容が明確
- [x] 影響範囲分析で変更ファイルが1ファイルに限定されることを確認
- [x] P5（二重登録）対策が設計に含まれている
- [x] 既存実装との照合で全要素が一致することを検証済み

## 次のPhase

Phase 3: 設計レビュー -> `outputs/phase-3/design-review-result.md`
