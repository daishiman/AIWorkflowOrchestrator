# Phase 2: 設計

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 2                         |
| 機能名 | AUTH-UI-004-google-avatar |
| 作成日 | 2026-02-04                |
| 状態   | **完了**                  |

## 目的

要件を実現可能な構造に落とし込む。

## 実行タスク

- 根本原因分析: プロバイダーごとのキー名の違いを特定
- 設計方針決定: フォールバック方式による解決策を選定
- 型設計: SupabaseIdentity型の拡張設計

---

## 根本原因分析

### identity_data のプロバイダー別構造

| プロバイダー | identity_data の主要キー                           | アバターURLキー |
| ------------ | -------------------------------------------------- | --------------- |
| Google       | `email`, `name`, `picture`, `sub`                  | `picture`       |
| GitHub       | `email`, `name`, `avatar_url`, `login`             | `avatar_url`    |
| Discord      | `email`, `username`, `avatar_url`, `discriminator` | `avatar_url`    |

### 問題のあるコード

```typescript
// Before: Googleの場合nullになる
avatarUrl: identity.identity_data?.avatar_url ?? null;
```

---

## 設計方針

### アプローチ: Null合体演算子によるフォールバック

```typescript
// After: avatar_url → picture の順でフォールバック
const avatarUrl =
  identity.identity_data?.avatar_url ?? identity.identity_data?.picture ?? null;
```

### 設計判断

| 選択肢               | 採用 | 理由                             |
| -------------------- | ---- | -------------------------------- |
| フォールバック方式   | ✅   | シンプル・既存コードへの影響最小 |
| プロバイダー別分岐   | ❌   | 条件分岐が増え複雑化             |
| 共通キー名への正規化 | ❌   | Supabase側のデータ構造変更が必要 |

### 優先順位の根拠

`avatar_url` を優先する理由:

- GitHub/Discordで一般的に使用されるキー名
- 将来的にGoogleが`avatar_url`を追加した場合にも対応
- 両方存在する場合は明示的なキー名を優先

---

## 型設計

### SupabaseIdentity型の拡張

```typescript
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

---

## 参照資料

| 資料名     | パス                                         | 説明          |
| ---------- | -------------------------------------------- | ------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |

---

## 成果物

| 成果物           | パス                        | 説明           |
| ---------------- | --------------------------- | -------------- |
| 設計ドキュメント | `outputs/phase-2/design.md` | 本ドキュメント |

---

## 完了条件

- [x] 根本原因が特定されている
- [x] 設計方針が決定されている
- [x] 型設計が完了している
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
