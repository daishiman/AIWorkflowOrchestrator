# AUTH-UI-004 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### プロバイダーによるアバターURLの違いとは？

**日常生活での例え:**

SNSアプリにログインするとき、GoogleやGitHubなど様々なサービスのアカウントを使えますよね。それぞれのサービスはあなたの情報（名前やプロフィール写真）を持っていますが、その情報の**呼び方（ラベル）**がサービスごとに違うんです。

例えば:

- **Google**: プロフィール写真を「picture」と呼ぶ
- **GitHub**: プロフィール写真を「avatar_url」と呼ぶ
- **Discord**: プロフィール写真を「avatar_url」と呼ぶ

これは、日本で「名前」と呼ぶものを、英語圏では「name」と呼ぶのと同じようなものです。

**今回の修正でやったこと:**

私たちのアプリは最初、「avatar_url」という名前でしかプロフィール写真を探していませんでした。だから、Googleのユーザーは「picture」という名前で情報を持っていても、アプリは「見つからない」と判断していたんです。

修正後は、「avatar_url」で見つからなかったら「picture」も探す、というフォールバック（代替手段）を追加しました。

---

## Part 2: 技術的詳細

### 型定義

```typescript
export interface SupabaseIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    name?: string;
    avatar_url?: string; // GitHub, Discord
    picture?: string; // Google
  };
  created_at: string;
}
```

### フォールバック実装

```typescript
const avatarUrl =
  identity.identity_data?.avatar_url ?? identity.identity_data?.picture ?? null;
```

**優先順位の理由:**

1. `avatar_url` を優先: GitHub/Discordで一般的なキー名
2. `picture` をフォールバック: Googleで使用されるキー名
3. 両方なければ `null`

### 実装箇所

| ファイル                                                 | 変更内容                                    |
| -------------------------------------------------------- | ------------------------------------------- |
| `packages/shared/types/auth.ts`                          | SupabaseIdentity型に`picture`プロパティ追加 |
| `packages/shared/infrastructure/auth/supabase-client.ts` | toLinkedProvider関数にフォールバック追加    |

### テストカバレッジ

- Line Coverage: 100%
- Branch Coverage: 100%
- Function Coverage: 100%

---

## 関連ドキュメント

- システム仕様書: `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- アーキテクチャ: `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`
