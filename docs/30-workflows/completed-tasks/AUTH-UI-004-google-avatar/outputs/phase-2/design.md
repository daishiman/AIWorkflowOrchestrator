# Phase 2: 設計ドキュメント - AUTH-UI-004-google-avatar

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-004 |
| Phase      | 2           |
| 作成日     | 2026-02-04  |
| ステータス | **完了**    |

---

## 根本原因分析

### 問題の概要

Google連携が正常に完了しているにもかかわらず、「Googleのアバターを使用」オプションがアバターメニューに表示されない。

### identity_data のプロバイダー別構造

| プロバイダー | identity_data の主要キー                           | アバターURLキー |
| ------------ | -------------------------------------------------- | --------------- |
| Google       | `email`, `name`, `picture`, `sub`                  | `picture`       |
| GitHub       | `email`, `name`, `avatar_url`, `login`             | `avatar_url`    |
| Discord      | `email`, `username`, `avatar_url`, `discriminator` | `avatar_url`    |

### 問題のあるコード（修正前）

```typescript
// Before: Googleの場合nullになる
avatarUrl: identity.identity_data?.avatar_url ?? null;
```

**原因**: Googleは `picture` キーを使用するが、コードは `avatar_url` のみを参照していた。

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

1. GitHub/Discordで一般的に使用されるキー名
2. 将来的にGoogleが`avatar_url`を追加した場合にも対応
3. 両方存在する場合は明示的なキー名を優先

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

**変更点**: `picture?: string` プロパティを追加

---

## アーキテクチャ影響分析

| 層               | 影響 | 変更内容                 |
| ---------------- | ---- | ------------------------ |
| Shared Package   | 中   | 型定義拡張、関数修正     |
| Desktop Renderer | なし | 既存UIが修正後の値を表示 |
| IPC通信          | なし | 既存チャネルを使用       |

---

## 統合テスト連携

| 統合ポイント | 契約定義                              |
| ------------ | ------------------------------------- |
| IPC通信      | profile:get-providers（既存チャネル） |
| Supabase     | identity_data → LinkedProvider変換    |
| Renderer     | avatarUrl表示（既存UIコンポーネント） |

---

## 完了条件チェックリスト

- [x] 根本原因が特定されている
- [x] 設計方針が決定されている
- [x] 型設計が完了している
- [x] 本Phase内の全タスクを100%実行完了
