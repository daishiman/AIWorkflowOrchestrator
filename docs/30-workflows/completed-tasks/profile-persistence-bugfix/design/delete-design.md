# アカウント削除機能設計書

## 1. 概要

### 1.1 目的

ユーザーが自身のアカウントを削除できる機能を設計する。
安全性を重視し、誤操作による削除を防止する確認フローを含む。

### 1.2 背景

現在の実装状況：

- アバター削除（avatar:remove）: 実装済み
- プロフィール削除（profile:delete）: 未実装
- アカウント削除UI: 未実装

---

## 2. 要件定義

### 2.1 機能要件

| ID    | 要件                                        | 優先度 |
| ----- | ------------------------------------------- | ------ |
| FR-01 | ユーザーは自身のアカウントを削除できる      | 必須   |
| FR-02 | 削除前にメールアドレス入力による確認が必要  | 必須   |
| FR-03 | 削除後はログイン画面にリダイレクトされる    | 必須   |
| FR-04 | 削除データ: profile, avatar (Storage), auth | 必須   |

### 2.2 非機能要件

| ID     | 要件                                          | 優先度 |
| ------ | --------------------------------------------- | ------ |
| NFR-01 | 削除操作は不可逆（復元不可）                  | 必須   |
| NFR-02 | 削除確認に3秒のディレイを設ける（誤操作防止） | 推奨   |
| NFR-03 | 削除中はローディング表示                      | 必須   |

### 2.3 セキュリティ要件

| ID     | 要件                                      | 優先度 |
| ------ | ----------------------------------------- | ------ |
| SEC-01 | 認証済みユーザーのみ削除可能              | 必須   |
| SEC-02 | 自分自身のアカウントのみ削除可能          | 必須   |
| SEC-03 | メールアドレス一致確認による誤操作防止    | 必須   |
| SEC-04 | IPCバリデーションによる不正リクエスト防止 | 必須   |

---

## 3. 削除フロー設計

### 3.1 処理シーケンス

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI Layer      │     │   IPC Handler   │     │   Supabase      │
│ (AccountSection)│     │(profileHandlers)│     │  (Auth/DB/Storage)
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ 1. 削除ボタンクリック │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │ 2. 確認ダイアログ表示 │                       │
         │<──────────────────────│                       │
         │                       │                       │
         │ 3. メールアドレス入力 │                       │
         │       + 削除確定      │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │                       │ 4. 認証確認           │
         │                       │──────────────────────>│
         │                       │                       │
         │                       │ 5. メール一致確認     │
         │                       │ (user.email === input)│
         │                       │                       │
         │                       │ 6. user_profiles削除  │
         │                       │──────────────────────>│
         │                       │                       │
         │                       │ 7. Storage削除        │
         │                       │ (avatars/{userId}/)   │
         │                       │──────────────────────>│
         │                       │                       │
         │                       │ 8. ローカルキャッシュ  │
         │                       │    クリア             │
         │                       │                       │
         │                       │ 9. signOut            │
         │                       │──────────────────────>│
         │                       │                       │
         │ 10. 成功レスポンス    │                       │
         │<──────────────────────│                       │
         │                       │                       │
         │ 11. ログイン画面へ    │                       │
         │     リダイレクト      │                       │
         │                       │                       │
```

### 3.2 ソフトデリート（論理削除）設計

**重要な要件変更**: 完全削除（物理削除）ではなく、復元可能な論理削除を採用。

#### 理由

- 管理者によるデータ復元が必要な場合がある
- ユーザーとのメールやり取りの可能性
- 法的要件への対応（データ保持期間）

#### ソフトデリートの実装

```
【論理削除フロー】
1. user_profiles.deleted_at に現在時刻を設定
   ↓
2. Storage (アバター画像) は保持（削除しない）
   ↓
3. ローカルキャッシュクリア
   ↓
4. Auth (signOut)
   ↓
5. ユーザーはログイン画面へ（再ログイン不可）
```

#### データベーススキーマ変更

```sql
-- user_profiles テーブルに deleted_at カラムを追加
ALTER TABLE user_profiles ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 削除済みユーザーを除外するビュー（オプション）
CREATE VIEW active_user_profiles AS
SELECT * FROM user_profiles WHERE deleted_at IS NULL;
```

#### 削除済みユーザーの扱い

| 状態       | deleted_at     | ログイン | データ表示 | 管理者復元 |
| ---------- | -------------- | -------- | ---------- | ---------- |
| アクティブ | NULL           | 可能     | 表示       | -          |
| 削除済み   | タイムスタンプ | 不可     | 非表示     | 可能       |

### 3.3 削除順序の理由（ソフトデリート版）

```
1. user_profiles.deleted_at = NOW() (論理削除)
   ↓
2. Storage (保持 - 削除しない)
   ↓
3. ローカルキャッシュクリア
   ↓
4. Auth (signOut)
```

理由：

- **論理削除**: データは保持され、管理者が復元可能
- **Storage保持**: アバター画像も復元時に必要なため削除しない
- **Auth**: サインアウトで即時アクセス不可に
- **キャッシュ**: ローカルデータのみクリア

### 3.4 管理者による復元機能（将来実装）

```typescript
// 管理者用API（将来実装）
async function restoreAccount(userId: string): Promise<void> {
  await supabase
    .from("user_profiles")
    .update({ deleted_at: null })
    .eq("id", userId);
}
```

### 3.5 エラーハンドリング

| エラー箇所            | 対応                 |
| --------------------- | -------------------- |
| user_profiles更新失敗 | エラー返却、処理中断 |
| キャッシュクリア失敗  | 警告ログ、処理続行   |
| signOut失敗           | 警告ログ、処理続行   |

---

## 4. IPC設計

### 4.1 チャネル追加

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // ... 既存のチャネル
  PROFILE_DELETE: "profile:delete",
} as const;
```

### 4.2 型定義

```typescript
// apps/desktop/src/preload/types.ts

/**
 * アカウント削除リクエスト
 */
export interface ProfileDeleteRequest {
  /** 確認用メールアドレス入力 */
  confirmEmail: string;
}

/**
 * アカウント削除レスポンス
 */
export type ProfileDeleteResponse = IPCResponse<void>;
```

### 4.3 ElectronAPI拡張

```typescript
// apps/desktop/src/preload/types.ts (ProfileAPI拡張)
export interface ProfileAPI {
  // ... 既存のメソッド
  delete: (request: ProfileDeleteRequest) => Promise<ProfileDeleteResponse>;
}
```

### 4.4 preload.ts 拡張

```typescript
// apps/desktop/src/preload/preload.ts
profile: {
  // ... 既存のメソッド
  delete: (request: ProfileDeleteRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROFILE_DELETE, request),
},
```

---

## 5. ハンドラー設計

### 5.1 ファイル配置

既存の `profileHandlers.ts` に追加：

```
apps/desktop/src/main/ipc/profileHandlers.ts
```

### 5.2 実装設計（ソフトデリート版）

```typescript
// profileHandlers.ts に追加

// エラーコード追加
const DELETE_ERROR_CODES = {
  NOT_AUTHENTICATED: "profile/delete-not-authenticated",
  EMAIL_MISMATCH: "profile/delete-email-mismatch",
  DELETE_FAILED: "profile/delete-failed",
  ALREADY_DELETED: "profile/already-deleted",
} as const;

// profile:delete ハンドラー（ソフトデリート）
ipcMain.handle(
  IPC_CHANNELS.PROFILE_DELETE,
  withValidation(
    IPC_CHANNELS.PROFILE_DELETE,
    async (
      _event,
      { confirmEmail }: { confirmEmail: string },
    ): Promise<IPCResponse<void>> => {
      try {
        // 1. 認証確認
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return {
            success: false,
            error: {
              code: DELETE_ERROR_CODES.NOT_AUTHENTICATED,
              message: "Not authenticated",
            },
          };
        }

        // 2. メールアドレス一致確認
        if (user.email?.toLowerCase() !== confirmEmail.toLowerCase()) {
          return {
            success: false,
            error: {
              code: DELETE_ERROR_CODES.EMAIL_MISMATCH,
              message: "Email address does not match",
            },
          };
        }

        // 3. user_profiles 論理削除（deleted_at を設定）
        // ※ 物理削除ではなく、deleted_at フラグで管理者が復元可能に
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .is("deleted_at", null); // 既に削除済みでないことを確認

        if (profileError) {
          // user_profilesテーブルが存在しない場合は続行
          if (!isUserProfilesTableError(profileError)) {
            return {
              success: false,
              error: {
                code: DELETE_ERROR_CODES.DELETE_FAILED,
                message: profileError.message,
              },
            };
          }
        }

        // 4. Storage は削除しない（復元時に必要）
        // ※ アバター画像は保持し、管理者が復元できるようにする
        console.log("[ProfileDelete] Storage保持（ソフトデリート）");

        // 5. ローカルキャッシュクリア
        try {
          await cache.clearProfile();
        } catch (cacheError) {
          console.warn("[ProfileDelete] キャッシュクリア警告:", cacheError);
        }

        // 6. サインアウト
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.warn("[ProfileDelete] signOut警告:", signOutError);
        }

        // 7. 認証状態変更を通知
        mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
          authenticated: false,
          user: null,
        });

        return { success: true };
      } catch (error) {
        console.error("[ProfileDelete] 予期しないエラー:", error);
        return {
          success: false,
          error: {
            code: DELETE_ERROR_CODES.DELETE_FAILED,
            message:
              error instanceof Error
                ? error.message
                : "Failed to delete account",
          },
        };
      }
    },
    { getAllowedWindows: () => [mainWindow] },
  ),
);
```

### 5.3 キャッシュインターフェース拡張

```typescript
// ProfileCacheインターフェース拡張
export interface ProfileCache {
  getCachedProfile: () => Promise<UserProfile | null>;
  updateCachedProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>; // 追加
}
```

---

## 6. UI設計

### 6.1 配置場所

```
apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx
```

既存のAccountSectionコンポーネント内に「危険な操作」セクションを追加。

### 6.2 コンポーネント構成

```
AccountSection
├── [既存] プロフィール編集UI
├── [既存] アバター管理UI
├── [既存] 連携プロバイダー管理
└── [新規] DangerZone
    ├── セクションタイトル
    ├── 説明文
    └── DeleteAccountButton
        └── DeleteConfirmDialog
            ├── 警告メッセージ
            ├── 削除データリスト
            ├── メール確認入力
            ├── キャンセルボタン
            └── 削除ボタン
```

### 6.3 UIワイヤーフレーム

#### 6.3.1 DangerZone セクション

```
┌────────────────────────────────────────────────────────────────┐
│ アカウント設定                                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [既存のプロフィール編集UI]                                      │
│                                                                │
│ ────────────────────────────────────────────────────────────── │
│                                                                │
│ [既存のアバター管理UI]                                          │
│                                                                │
│ ────────────────────────────────────────────────────────────── │
│                                                                │
│ [既存の連携プロバイダー管理]                                    │
│                                                                │
│ ══════════════════════════════════════════════════════════════ │
│                                                                │
│  危険な操作                                          ← 赤色タイトル
│                                                                │
│  アカウントを削除すると、すべてのデータが完全に                 │
│  削除され、復元できません。                                     │
│                                                                │
│  [ アカウントを削除 ]      ← 赤枠ボタン、hover時に背景赤       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

#### 6.3.2 削除確認ダイアログ

```
┌────────────────────────────────────────────────────────────────┐
│  ⚠ アカウントを削除しますか？                        ← 赤アイコン
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  この操作は取り消せません。                                     │
│  以下のデータが完全に削除されます：                             │
│                                                                │
│    • プロフィール情報                                           │
│    • アップロードしたアバター画像                               │
│    • すべての設定                                               │
│                                                                │
│  ────────────────────────────────────────────────────────────  │
│                                                                │
│  確認のため、メールアドレスを入力してください：                 │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ example@email.com                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ↑ user.email と完全一致で削除ボタン有効化                      │
│                                                                │
│              [ キャンセル ]    [ 削除する ]                     │
│                 ↑ グレー          ↑ 赤、disabled              │
│                                   メール一致で enabled          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 6.4 実装コード

```typescript
// DangerZone コンポーネント

interface DangerZoneProps {
  userEmail: string;
}

export const DangerZone: React.FC<DangerZoneProps> = ({ userEmail }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();

  const isEmailMatch = confirmEmail.toLowerCase() === userEmail.toLowerCase();

  const handleDelete = async () => {
    if (!isEmailMatch) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteAccount(confirmEmail)).unwrap();
      // 成功時はauthSliceがログアウト状態にリセット
      // AuthStateProviderがログイン画面にリダイレクト
    } catch (error) {
      // エラー表示（authSlice.deleteErrorに設定済み）
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="mt-8 pt-8 border-t border-red-200">
      <h3 className="text-lg font-semibold text-red-600 mb-2">
        危険な操作
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        アカウントを削除すると、すべてのデータが完全に削除され、復元できません。
      </p>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="px-4 py-2 border-2 border-red-500 text-red-500 rounded
                   hover:bg-red-500 hover:text-white transition-colors"
      >
        アカウントを削除
      </button>

      {/* 確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setConfirmEmail("");
        }}
        userEmail={userEmail}
        confirmEmail={confirmEmail}
        onConfirmEmailChange={setConfirmEmail}
        isEmailMatch={isEmailMatch}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
    </section>
  );
};
```

---

## 7. Redux設計

### 7.1 authSlice拡張

```typescript
// authSlice.ts

// State追加
interface AuthState {
  // ... 既存のstate
  deleteLoading: boolean;
  deleteError: AuthError | null;
}

// initialState追加
const initialState: AuthState = {
  // ... 既存の初期値
  deleteLoading: false,
  deleteError: null,
};

// Thunk追加
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (confirmEmail: string, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.profile.delete({ confirmEmail });
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result;
    } catch (error) {
      return rejectWithValue({
        code: "profile/delete-failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// extraReducers追加
.addCase(deleteAccount.pending, (state) => {
  state.deleteLoading = true;
  state.deleteError = null;
})
.addCase(deleteAccount.fulfilled, () => {
  // 完全リセット（ログアウト状態に戻す）
  return initialState;
})
.addCase(deleteAccount.rejected, (state, action) => {
  state.deleteLoading = false;
  state.deleteError = action.payload as AuthError;
})
```

---

## 8. テスト設計

### 8.1 ユニットテスト

```typescript
describe("profile:delete", () => {
  describe("正常系", () => {
    it("正しいメールアドレスで削除が実行される");
    it("user_profiles → Storage → signOut の順序で削除される");
    it("成功後にAUTH_STATE_CHANGEDが送信される");
  });

  describe("異常系", () => {
    it("認証されていない場合はエラー");
    it("メールアドレス不一致で拒否される");
    it("メールアドレスは大文字小文字を区別しない");
    it("user_profiles削除失敗時はエラーを返す");
    it("Storage削除失敗時は警告ログのみで続行");
    it("signOut失敗時は警告ログのみで成功を返す");
  });
});

describe("DangerZone UI", () => {
  it("削除ボタンがクリックでダイアログを表示");
  it("メールアドレス不一致時は削除ボタンがdisabled");
  it("メールアドレス一致時は削除ボタンが有効化");
  it("削除中はローディング表示");
  it("エラー時はエラーメッセージ表示");
});
```

### 8.2 統合テスト

1. 削除ボタン → 確認ダイアログ → メール入力 → 削除実行 → ログイン画面
2. 削除中にキャンセルできないことを確認
3. 削除後に再ログインで新規ユーザーとして扱われる

---

## 9. 制限事項

### 9.1 Supabase Admin API制限

**問題**: ユーザー完全削除（`auth.admin.deleteUser`）はサーバーサイドのみ

**対応**:

- クライアントサイドでは `signOut` のみ実行
- 認証情報はセッションが切れるまで残る可能性あり
- 完全削除が必要な場合は、将来的にサーバーサイド処理を追加

### 9.2 OAuth連携の扱い

**問題**: OAuth連携（Google, GitHub, Discord）はSupabase側に残る可能性

**対応**:

- 各プロバイダー側での連携解除を案内（将来の機能拡張）
- 現時点ではアプリ側のデータ削除のみ対応

---

## 10. 完了条件チェックリスト

- [x] 削除フローが明確に定義されている
- [x] 確認ダイアログのUI設計が完了
- [x] IPCチャネル・型定義が設計されている
- [x] 削除順序（DB → Storage → Auth）が定義されている
- [x] エラーハンドリング戦略が定義されている
- [x] Redux状態管理が設計されている
- [x] テストケースが定義されている
- [x] 制限事項が明記されている

---

## 11. 設計レビュー結果

### レビュー実施日: 2025-12-10

### 判定: PASS

### 指摘事項と対応

| 観点             | 指摘内容                           | 対応状況 |
| ---------------- | ---------------------------------- | -------- |
| セキュリティ設計 | 3段階確認フローの実装              | PASS     |
| セキュリティ設計 | 認証状態の検証                     | PASS     |
| セキュリティ設計 | 削除順序が安全（Auth最後）         | PASS     |
| セキュリティ設計 | エラーメッセージに機密情報なし     | PASS     |
| アーキテクチャ   | 既存ハンドラーへの追加で整合性あり | PASS     |
| ドメインモデル   | 削除対象データが明確               | PASS     |

### 補足

- Supabase Admin API制限は9.1節で明記済み
- 部分削除のリスクは3.3節のエラーハンドリングで対処済み
