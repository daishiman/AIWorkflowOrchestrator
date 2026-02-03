# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 5                         |
| 機能名 | AUTH-UI-004-google-avatar |
| 作成日 | 2026-02-04                |
| 状態   | **完了**                  |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

- 型定義の拡張: SupabaseIdentity型に`picture`プロパティを追加
- 関数の修正: toLinkedProvider関数にフォールバック処理を実装
- コメントの追加: プロバイダー別の違いをJSDocで説明

---

## 実装内容

### 修正1: SupabaseIdentity型の拡張

```typescript
// packages/shared/types/auth.ts
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

### 修正2: toLinkedProvider関数の修正

```typescript
// packages/shared/infrastructure/auth/supabase-client.ts
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

## 参照資料

| 資料名       | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |

---

## 成果物

| 成果物   | パス                                                     | 説明               |
| -------- | -------------------------------------------------------- | ------------------ |
| 型定義   | `packages/shared/types/auth.ts`                          | 型拡張             |
| 関数実装 | `packages/shared/infrastructure/auth/supabase-client.ts` | フォールバック実装 |

---

## 完了条件

- [x] すべてのテストが成功状態（Green）
- [x] 実装が最小限に抑えられている
- [x] 型定義が拡張されている
- [x] JSDocコメントが追加されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
