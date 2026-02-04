# Phase 5: 実装サマリー - AUTH-UI-004-google-avatar

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-004 |
| Phase      | 5           |
| 作成日     | 2026-02-04  |
| ステータス | **完了**    |

---

## 実装内容

### 修正1: SupabaseIdentity型の拡張

**ファイル**: `packages/shared/types/auth.ts`

```typescript
/**
 * Supabase Identity型
 *
 * identity_data内のフィールドはプロバイダーによって異なる:
 * - Google: picture (アバターURL)
 * - GitHub: avatar_url
 * - Discord: avatar_url
 */
export interface SupabaseIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    name?: string;
    avatar_url?: string;
    picture?: string; // Google uses 'picture' instead of 'avatar_url'
  };
  created_at: string;
}
```

**変更点**: `picture?: string` プロパティを追加

---

### 修正2: toLinkedProvider関数の修正

**ファイル**: `packages/shared/infrastructure/auth/supabase-client.ts`

```typescript
/**
 * Supabase Identityから LinkedProvider に変換
 *
 * 注意: プロバイダーによってavatarUrlのキー名が異なる
 * - Google: picture
 * - GitHub: avatar_url
 * - Discord: avatar_url
 */
export function toLinkedProvider(identity: SupabaseIdentity): {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
} {
  // プロバイダーによってavatarのキー名が異なる
  // Google: picture, GitHub/Discord: avatar_url
  const avatarUrl =
    identity.identity_data?.avatar_url ??
    identity.identity_data?.picture ??
    null;

  return {
    provider: identity.provider as OAuthProvider,
    providerId: identity.id,
    email: identity.identity_data?.email ?? "",
    displayName: identity.identity_data?.name ?? null,
    avatarUrl,
    linkedAt: identity.created_at,
  };
}
```

**変更点**: `avatar_url ?? picture ?? null` のフォールバックチェーンを実装

---

## TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop test:run
```

- [x] テストが成功することを確認（Green状態）
- [x] 1265テスト全通過

---

## アーキテクチャ層別実装

| 層             | 実装内容                 | ファイル                                                 |
| -------------- | ------------------------ | -------------------------------------------------------- |
| Shared Package | 型定義拡張               | `packages/shared/types/auth.ts`                          |
| Shared Package | toLinkedProvider関数修正 | `packages/shared/infrastructure/auth/supabase-client.ts` |

---

## 成果物一覧

| 成果物   | パス                                                     | 説明               |
| -------- | -------------------------------------------------------- | ------------------ |
| 型定義   | `packages/shared/types/auth.ts`                          | 型拡張             |
| 関数実装 | `packages/shared/infrastructure/auth/supabase-client.ts` | フォールバック実装 |

---

## 完了条件チェックリスト

- [x] すべてのテストが成功状態（Green）
- [x] 実装が最小限に抑えられている
- [x] 型定義が拡張されている
- [x] JSDocコメントが追加されている
- [x] 本Phase内の全タスクを100%実行完了
