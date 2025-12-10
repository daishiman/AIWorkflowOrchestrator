# データフロー・同期戦略設計書

## 1. 概要

### 1.1 目的

`user_profiles`テーブル（PostgreSQL）と`user_metadata`（Supabase Auth）の間でプロフィールデータの一貫性を保つための同期戦略を定義する。

### 1.2 背景

現在の実装では、2つのデータソースが独立して更新されており、同期が取れていない：

```
問題箇所:
- profileHandlers.ts:256-328 → user_profiles のみ更新
- avatarHandlers.ts:162-178 → user_metadata のみ更新
- avatarHandlers.ts:266-282 → user_metadata のみ更新
- avatarHandlers.ts:354-359 → user_metadata のみ更新
```

---

## 2. データソース分析

### 2.1 データソース一覧

| データソース    | 保存先          | 特性                   | 永続性         |
| --------------- | --------------- | ---------------------- | -------------- |
| `user_profiles` | PostgreSQL (DB) | 明示的CRUD、拡張性高   | 永続           |
| `user_metadata` | Supabase Auth   | 認証セッションに紐付く | セッション依存 |
| `profileCache`  | electron-store  | ローカルキャッシュ     | アプリ終了まで |

### 2.2 フィールドマッピング

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        データフィールド比較                               │
├─────────────────────────┬─────────────────────────┬──────────────────────┤
│     user_profiles       │     user_metadata       │      profileCache    │
│    (PostgreSQL DB)      │    (Supabase Auth)      │    (UserProfile型)   │
├─────────────────────────┼─────────────────────────┼──────────────────────┤
│ id (PK)                 │ -                       │ id                   │
│ display_name            │ display_name            │ displayName          │
│ email                   │ -                       │ email                │
│ avatar_url              │ avatar_url              │ avatarUrl            │
│ plan                    │ -                       │ plan                 │
│ created_at              │ -                       │ createdAt            │
│ updated_at              │ -                       │ updatedAt            │
│ deleted_at (NEW)        │ -                       │ deletedAt (NEW)      │
│ -                       │ avatar_source           │ -                    │
│ -                       │ name (OAuth由来)        │ -                    │
│ -                       │ full_name (OAuth由来)   │ -                    │
└─────────────────────────┴─────────────────────────┴──────────────────────┘
```

### 2.3 ProfileCache と UserProfile の型統一

**重要**: `profileCache` は `UserProfile` 型をそのまま使用し、型の不整合を防ぐ。

```typescript
// shared/types/auth.ts - UserProfile 型定義（更新）
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null; // NEW: ソフトデリート用
}

// profileCache.ts - キャッシュは UserProfile 型を直接使用
export interface ProfileCache {
  getCachedProfile: () => Promise<UserProfile | null>;
  updateCachedProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
}
```

### 2.4 現状の同期問題（調査結果）

| 操作                | user_profiles | user_metadata           | profileCache | 問題点                 |
| ------------------- | ------------- | ----------------------- | ------------ | ---------------------- |
| profile:get         | ✅ 読取       | ✅ フォールバック       | ✅ 更新      | なし                   |
| profile:update      | ✅ 更新       | ⚠️ フォールバック時のみ | ✅ 更新      | 通常時未同期           |
| avatar:upload       | ❌ 未更新     | ✅ 更新                 | ⚠️ 間接的    | DB未同期               |
| avatar:use-provider | ❌ 未更新     | ✅ 更新                 | ⚠️ 間接的    | DB未同期               |
| avatar:remove       | ❌ 未更新     | ✅ 更新                 | ⚠️ 間接的    | **削除が効かない原因** |

---

## 3. 同期戦略

### 3.1 Primary Source of Truth の選定

**決定: `user_profiles` テーブルを Primary Source of Truth とする**

理由：

1. **永続性**: PostgreSQLは認証セッションに依存しない永続ストレージ
2. **拡張性**: 追加フィールド（plan, created_at等）を保持
3. **整合性**: RLSによる行レベルセキュリティで保護
4. **クエリ性**: 他テーブルとのJOINが可能

```
同期方向の優先度:
  user_profiles (Primary) → user_metadata (Secondary)
  user_profiles (Primary) → profileCache (Cache)
```

### 3.2 同期ルール

#### Rule 1: profile:update 実行時

```
1. user_profiles テーブル更新 (Primary)
   ↓ 成功時
2. user_metadata 同期 (Secondary)
   ↓ 失敗時は警告ログのみ
3. profileCache 更新 (Cache)
```

```typescript
// 実装イメージ
const { error: dbError } = await supabase
  .from("user_profiles")
  .update({ display_name, updated_at })
  .eq("id", userId);

if (!dbError) {
  // Primary成功 → Secondary同期（失敗しても続行）
  const syncResult = await syncProfileToMetadata(supabase, { display_name });
  if (!syncResult.success) {
    console.warn("[ProfileSync] user_metadata同期失敗:", syncResult.error);
  }
  // Cache更新
  await cache.updateCachedProfile(profile);
}
```

#### Rule 2: avatar:\* 操作実行時

```
1. user_metadata 更新 (認証情報として必要)
   ↓ 成功時
2. user_profiles.avatar_url 同期 (Primary)
   ↓ 失敗時は警告ログのみ
3. profileCache 更新 (Cache)
```

```typescript
// 実装イメージ
const { error: authError } = await supabase.auth.updateUser({
  data: { avatar_url: publicUrl, avatar_source: "upload" },
});

if (!authError) {
  // Auth成功 → DB同期（失敗しても続行）
  const syncResult = await syncMetadataToProfile(supabase, userId, {
    avatar_url: publicUrl,
  });
  if (!syncResult.success) {
    console.warn("[AvatarSync] user_profiles同期失敗:", syncResult.error);
  }
}
```

#### Rule 3: フォールバック（user_profiles不在時）

```
user_profiles 読み取りエラー時:
  ↓
user_metadata から profile を構築
  ↓
profileCache に保存
```

### 3.3 同期タイミング

| 操作            | Primary更新       | Secondary同期   | Cache更新          |
| --------------- | ----------------- | --------------- | ------------------ |
| profile:get     | -                 | -               | 読み取り時更新     |
| profile:update  | user_profiles     | → user_metadata | → profileCache     |
| avatar:upload   | user_metadata     | → user_profiles | → profileCache     |
| avatar:use-prov | user_metadata     | → user_profiles | → profileCache     |
| avatar:remove   | user_metadata     | → user_profiles | → profileCache     |
| profile:delete  | user_profiles削除 | → signOut       | → キャッシュクリア |

---

## 4. 同期ユーティリティ設計

### 4.1 ファイル配置

```
apps/desktop/src/main/infrastructure/profileSync.ts
```

理由：

- infrastructureレイヤー = 外部サービス連携の実装
- Supabase Auth API/DB操作の詳細を隠蔽
- 単一責務：同期ロジックのみを担当

### 4.2 インターフェース定義

```typescript
/**
 * 同期操作の結果
 */
export interface SyncResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 同期対象フィールド（Profile → Metadata）
 */
export interface ProfileToMetadataFields {
  display_name?: string;
  avatar_url?: string | null;
}

/**
 * 同期対象フィールド（Metadata → Profile）
 */
export interface MetadataToProfileFields {
  avatar_url?: string | null;
}
```

### 4.3 関数シグネチャ

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * user_profiles → user_metadata への同期
 *
 * @param supabase - Supabaseクライアント
 * @param updates - 同期するフィールド
 * @returns 同期結果
 *
 * @example
 * // profile:update 後に呼び出し
 * await syncProfileToMetadata(supabase, { display_name: "新しい名前" });
 */
export async function syncProfileToMetadata(
  supabase: SupabaseClient,
  updates: ProfileToMetadataFields,
): Promise<SyncResult>;

/**
 * user_metadata → user_profiles への同期
 *
 * @param supabase - Supabaseクライアント
 * @param userId - 対象ユーザーID
 * @param updates - 同期するフィールド
 * @returns 同期結果
 *
 * @example
 * // avatar:upload 後に呼び出し
 * await syncMetadataToProfile(supabase, userId, { avatar_url: publicUrl });
 */
export async function syncMetadataToProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: MetadataToProfileFields,
): Promise<SyncResult>;

/**
 * プロフィール整合性の確認・修復
 *
 * @param supabase - Supabaseクライアント
 * @param userId - 対象ユーザーID
 * @returns 同期結果
 *
 * @example
 * // アプリ起動時やエラー復旧時に呼び出し
 * await ensureProfileConsistency(supabase, userId);
 */
export async function ensureProfileConsistency(
  supabase: SupabaseClient,
  userId: string,
): Promise<SyncResult>;
```

### 4.4 実装詳細

```typescript
// profileSync.ts

import type { SupabaseClient } from "@supabase/supabase-js";

export interface SyncResult {
  success: boolean;
  error?: { code: string; message: string };
}

export interface ProfileToMetadataFields {
  display_name?: string;
  avatar_url?: string | null;
}

export interface MetadataToProfileFields {
  avatar_url?: string | null;
}

const SYNC_ERROR_CODES = {
  AUTH_UPDATE_FAILED: "sync/auth-update-failed",
  DB_UPDATE_FAILED: "sync/db-update-failed",
  CONSISTENCY_CHECK_FAILED: "sync/consistency-check-failed",
} as const;

/**
 * user_profiles → user_metadata への同期
 */
export async function syncProfileToMetadata(
  supabase: SupabaseClient,
  updates: ProfileToMetadataFields,
): Promise<SyncResult> {
  try {
    // 更新対象がなければ成功扱い
    if (!updates.display_name && updates.avatar_url === undefined) {
      return { success: true };
    }

    const metadataUpdate: Record<string, unknown> = {};
    if (updates.display_name !== undefined) {
      metadataUpdate.display_name = updates.display_name;
    }
    if (updates.avatar_url !== undefined) {
      metadataUpdate.avatar_url = updates.avatar_url;
    }

    const { error } = await supabase.auth.updateUser({
      data: metadataUpdate,
    });

    if (error) {
      return {
        success: false,
        error: {
          code: SYNC_ERROR_CODES.AUTH_UPDATE_FAILED,
          message: error.message,
        },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: SYNC_ERROR_CODES.AUTH_UPDATE_FAILED,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * user_metadata → user_profiles への同期
 */
export async function syncMetadataToProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: MetadataToProfileFields,
): Promise<SyncResult> {
  try {
    // 更新対象がなければ成功扱い
    if (updates.avatar_url === undefined) {
      return { success: true };
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return {
        success: false,
        error: {
          code: SYNC_ERROR_CODES.DB_UPDATE_FAILED,
          message: error.message,
        },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: SYNC_ERROR_CODES.DB_UPDATE_FAILED,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * プロフィール整合性の確認・修復
 */
export async function ensureProfileConsistency(
  supabase: SupabaseClient,
  userId: string,
): Promise<SyncResult> {
  try {
    // 1. 両方のソースからデータ取得
    const [profileResult, authResult] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", userId).single(),
      supabase.auth.getUser(),
    ]);

    const profile = profileResult.data;
    const metadata = authResult.data.user?.user_metadata;

    // 2. profileがなければ何もしない（フォールバック処理は呼び出し側）
    if (!profile) {
      return { success: true };
    }

    // 3. 不整合チェック・修復
    const needsSync: ProfileToMetadataFields = {};

    if (profile.display_name !== metadata?.display_name) {
      needsSync.display_name = profile.display_name;
    }
    if (profile.avatar_url !== metadata?.avatar_url) {
      needsSync.avatar_url = profile.avatar_url;
    }

    // 4. user_profiles を正として user_metadata を修復
    if (Object.keys(needsSync).length > 0) {
      return syncProfileToMetadata(supabase, needsSync);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: SYNC_ERROR_CODES.CONSISTENCY_CHECK_FAILED,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
```

---

## 5. エラーハンドリング戦略

### 5.1 同期失敗時の方針

| シナリオ                   | Primary状態 | Secondary状態 | 対応                 |
| -------------------------- | ----------- | ------------- | -------------------- |
| Primary成功、Secondary失敗 | 更新済み    | 未更新        | 警告ログ、処理続行   |
| Primary失敗                | 未更新      | -             | エラー返却、処理中断 |
| 両方失敗                   | 未更新      | 未更新        | エラー返却、処理中断 |

### 5.2 ロールバック戦略

**採用しない理由**:

- 2つのストレージ間でトランザクションを保証できない
- ロールバック処理自体が失敗するリスク
- Primary（user_profiles）が正であれば、次回アクセス時に修復可能

**代替策**:

- `ensureProfileConsistency` を定期的/エラー復旧時に実行
- user_profiles を正として user_metadata を上書き

---

## 6. シーケンス図

### 6.1 profile:update フロー

```
┌─────────┐         ┌────────────────┐      ┌──────────────┐     ┌─────────────┐
│Renderer │         │profileHandlers │      │ user_profiles│     │user_metadata│
└────┬────┘         └───────┬────────┘      └──────┬───────┘     └──────┬──────┘
     │                      │                      │                    │
     │ profile:update       │                      │                    │
     │─────────────────────>│                      │                    │
     │                      │                      │                    │
     │                      │ 1. UPDATE            │                    │
     │                      │─────────────────────>│                    │
     │                      │                      │                    │
     │                      │ OK                   │                    │
     │                      │<─────────────────────│                    │
     │                      │                      │                    │
     │                      │ 2. syncProfileToMetadata                  │
     │                      │───────────────────────────────────────────>
     │                      │                      │                    │
     │                      │ OK/NG (警告ログのみ) │                    │
     │                      │<───────────────────────────────────────────
     │                      │                      │                    │
     │ { success: true }    │                      │                    │
     │<─────────────────────│                      │                    │
```

### 6.2 avatar:upload フロー

```
┌─────────┐         ┌───────────────┐     ┌─────────────┐     ┌──────────────┐
│Renderer │         │avatarHandlers │     │user_metadata│     │ user_profiles│
└────┬────┘         └──────┬────────┘     └──────┬──────┘     └──────┬───────┘
     │                     │                     │                    │
     │ avatar:upload       │                     │                    │
     │────────────────────>│                     │                    │
     │                     │                     │                    │
     │                     │ 1. Storage upload   │                    │
     │                     │───────(省略)────────│                    │
     │                     │                     │                    │
     │                     │ 2. updateUser       │                    │
     │                     │────────────────────>│                    │
     │                     │                     │                    │
     │                     │ OK                  │                    │
     │                     │<────────────────────│                    │
     │                     │                     │                    │
     │                     │ 3. syncMetadataToProfile                 │
     │                     │─────────────────────────────────────────>│
     │                     │                     │                    │
     │                     │ OK/NG (警告ログのみ)│                    │
     │                     │<─────────────────────────────────────────│
     │                     │                     │                    │
     │ { success: true }   │                     │                    │
     │<────────────────────│                     │                    │
```

---

## 7. 検証方法

### 7.1 ユニットテスト

```typescript
describe("profileSync", () => {
  describe("syncProfileToMetadata", () => {
    it("display_nameを正しく同期する");
    it("avatar_urlを正しく同期する");
    it("部分更新が動作する");
    it("更新対象がない場合は成功を返す");
    it("Supabase Auth APIエラー時にエラーを返す");
  });

  describe("syncMetadataToProfile", () => {
    it("avatar_urlをuser_profilesに同期する");
    it("avatar_url=nullで削除同期する");
    it("更新対象がない場合は成功を返す");
    it("DB更新エラー時にエラーを返す");
  });

  describe("ensureProfileConsistency", () => {
    it("不整合を検出して修正する");
    it("整合している場合は何もしない");
    it("profileが存在しない場合は成功を返す");
  });
});
```

### 7.2 統合テスト

1. profile:update → 再起動 → 変更が保持されている
2. avatar:upload → 再起動 → 画像が保持されている
3. オフライン時 → キャッシュから読み取れる

---

## 8. 設計判断の根拠

### 8.1 なぜ user_profiles を Primary にするか

| 観点         | user_profiles          | user_metadata  |
| ------------ | ---------------------- | -------------- |
| 永続性       | PostgreSQL（永続）     | セッション依存 |
| 拡張性       | カスタムフィールド可能 | 制限あり       |
| クエリ       | SQL/JOIN可能           | getUser()のみ  |
| セキュリティ | RLSで保護              | Auth設定依存   |

### 8.2 なぜロールバックを採用しないか

- 分散システムで厳密なトランザクションは困難
- ロールバック自体の失敗リスク
- user_profiles優先で、次回アクセス時に修復可能

### 8.3 なぜ警告ログのみで続行するか

- Primary（user_profiles）が更新されていれば、データは保存されている
- Secondary（user_metadata）の不整合は次回の ensureProfileConsistency で修復可能
- ユーザー操作をブロックしない

---

## 9. 完了条件チェックリスト

- [x] データソースの責務が明確に定義されている
- [x] 同期の方向とタイミングが定義されている
- [x] エラー時のロールバック戦略が定義されている（採用しない判断含む）
- [x] 同期ユーティリティのインターフェースが設計されている
- [x] 実装詳細が記載されている
- [x] シーケンス図で処理フローが可視化されている

---

## 10. 設計レビュー結果

### レビュー実施日: 2025-12-10

### 判定: MINOR（軽微な指摘あり → Phase 2 進行可）

### 指摘事項と対応

| 観点                 | 指摘内容                           | 対応状況                |
| -------------------- | ---------------------------------- | ----------------------- |
| アーキテクチャ整合性 | 同期ユーティリティの配置先が明確か | 対応済み（4.1節に明記） |
| アーキテクチャ整合性 | レイヤー間依存関係が適切か         | PASS                    |
| セキュリティ設計     | エラーメッセージに機密情報なし     | PASS                    |
| ドメインモデル       | データソースの責務が明確           | PASS                    |
| ドメインモデル       | エラー時の振る舞いが定義されている | PASS                    |

### 補足

- 型定義（`SyncResult`, `ProfileToMetadataFields` 等）は同期ユーティリティファイル内に定義
- 既存の `ProfileCache` インターフェースとの整合性を保つ設計
