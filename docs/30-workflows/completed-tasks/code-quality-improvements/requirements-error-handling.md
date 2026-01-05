# T-00-3: エラーハンドリング要件定義書

## メタ情報

| 項目             | 内容                       |
| ---------------- | -------------------------- |
| タスクID         | T-00-3                     |
| タスク名         | エラーハンドリング要件定義 |
| 分類             | コード品質改善             |
| 対象機能         | 認証関連のエラー処理       |
| 優先度           | 必須                       |
| ステータス       | 完了                       |
| 作成日           | 2025-12-09                 |
| 作成エージェント | .claude/agents/req-analyst.md               |

---

## 1. 背景

### 1.1 現状分析

`authSlice.ts`のエラーハンドリング現状を調査した結果：

| 関数             | 現状のエラーメッセージ                       | 問題点         |
| ---------------- | -------------------------------------------- | -------------- |
| `login`          | `"ログインに失敗しました"` / `error.message` | 一貫性なし     |
| `logout`         | ログのみ、ユーザーメッセージなし             | エラー表示なし |
| `initializeAuth` | `"認証の初期化に失敗しました"`               | 詳細情報なし   |
| `updateProfile`  | `"プロフィールの更新に失敗しました"`         | OK             |
| `linkProvider`   | `"アカウント連携に失敗しました"`             | OK             |

### 1.2 問題点

1. **エラーメッセージの一貫性**: 各関数で異なる形式のエラーメッセージ
2. **エラー種別の未分類**: ネットワークエラー、認証エラー等が区別されていない
3. **ユーザーフィードバックの不足**: 一部の関数でエラーがユーザーに通知されない
4. **技術的エラーの露出**: `error.message`がそのまま表示される可能性

### 1.3 目的

エラー処理を統一し、ユーザーフレンドリーな日本語メッセージを一貫して表示する。

---

## 2. 機能要件

### 2.1 CQ-ERR-01: エラー処理ヘルパー関数

**要件ID**: CQ-ERR-01
**優先度**: 必須

| 項目 | 内容                                                     |
| ---- | -------------------------------------------------------- |
| 説明 | エラーを適切な日本語メッセージに変換する共通ヘルパー関数 |
| 入力 | `unknown`型のエラー                                      |
| 出力 | ユーザー向け日本語エラーメッセージ                       |

**関数シグネチャ**:

```typescript
/**
 * 認証エラーを日本語メッセージに変換する
 *
 * @param error - キャッチされたエラー
 * @returns ユーザー向け日本語エラーメッセージ
 */
const handleAuthError = (error: unknown): string => {
  // ...
};
```

**受け入れ基準**:

- [ ] `unknown`型を安全に処理できる
- [ ] Errorインスタンスからメッセージを抽出できる
- [ ] 既知のエラーパターンを日本語に変換できる
- [ ] 未知のエラーにはデフォルトメッセージを返す

### 2.2 CQ-ERR-02: エラーメッセージ日本語化

**要件ID**: CQ-ERR-02
**優先度**: 必須

| 項目 | 内容                                           |
| ---- | ---------------------------------------------- |
| 説明 | すべてのエラーメッセージを日本語で統一する     |
| 対象 | 認証関連のすべてのエラー                       |
| 形式 | ユーザーが理解でき、次のアクションが分かる文言 |

**受け入れ基準**:

- [ ] 技術的なエラーメッセージが直接表示されない
- [ ] すべてのメッセージが日本語である
- [ ] メッセージが簡潔で分かりやすい

### 2.3 CQ-ERR-03: エラー種別分岐

**要件ID**: CQ-ERR-03
**優先度**: 推奨

| 項目 | 内容                                       |
| ---- | ------------------------------------------ |
| 説明 | エラーの種類に応じて適切なメッセージを返す |
| 種別 | ネットワーク、認証、タイムアウト、不明     |

**受け入れ基準**:

- [ ] ネットワークエラーが識別できる
- [ ] 認証エラーが識別できる
- [ ] タイムアウトエラーが識別できる
- [ ] 各種別に適切なメッセージが設定されている

### 2.4 CQ-ERR-04: ユーザーフィードバック

**要件ID**: CQ-ERR-04
**優先度**: 必須

| 項目 | 内容                                                 |
| ---- | ---------------------------------------------------- |
| 説明 | すべてのエラーがユーザーに適切にフィードバックされる |
| 方法 | `authError` stateへの設定                            |
| 表示 | AuthView、AccountSectionのエラー表示領域             |

**受け入れ基準**:

- [ ] `login`関数でエラーがユーザーに表示される
- [ ] `logout`関数でエラーがユーザーに表示される
- [ ] `updateProfile`関数でエラーがユーザーに表示される
- [ ] `linkProvider`関数でエラーがユーザーに表示される
- [ ] `initializeAuth`関数でエラーがユーザーに表示される

---

## 3. エラー種別と日本語メッセージマッピング

### 3.1 エラーコード定義

```typescript
/**
 * 認証エラーコード
 */
type AuthErrorCode =
  | "NETWORK_ERROR"
  | "AUTH_FAILED"
  | "TIMEOUT"
  | "SESSION_EXPIRED"
  | "PROVIDER_ERROR"
  | "PROFILE_UPDATE_FAILED"
  | "LINK_PROVIDER_FAILED"
  | "UNKNOWN";
```

### 3.2 エラーメッセージマッピング

| エラーコード            | 検出パターン                                       | 日本語メッセージ                                             |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `NETWORK_ERROR`         | `network`, `fetch`, `connection`, `offline`        | `ネットワーク接続を確認してください`                         |
| `AUTH_FAILED`           | `unauthorized`, `401`, `authentication`, `invalid` | `認証に失敗しました。再度ログインしてください`               |
| `TIMEOUT`               | `timeout`, `ETIMEDOUT`                             | `接続がタイムアウトしました。再試行してください`             |
| `SESSION_EXPIRED`       | `expired`, `session`                               | `セッションの有効期限が切れました。再度ログインしてください` |
| `PROVIDER_ERROR`        | `provider`, `oauth`                                | `認証プロバイダーとの接続に失敗しました`                     |
| `PROFILE_UPDATE_FAILED` | (専用)                                             | `プロフィールの更新に失敗しました`                           |
| `LINK_PROVIDER_FAILED`  | (専用)                                             | `アカウント連携に失敗しました`                               |
| `UNKNOWN`               | (デフォルト)                                       | `予期しないエラーが発生しました`                             |

### 3.3 エラー検出ロジック

```typescript
const handleAuthError = (error: unknown): string => {
  // 1. Errorインスタンスかチェック
  if (!(error instanceof Error)) {
    return "予期しないエラーが発生しました";
  }

  const message = error.message.toLowerCase();

  // 2. ネットワークエラー
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    message.includes("offline")
  ) {
    return "ネットワーク接続を確認してください";
  }

  // 3. 認証エラー
  if (
    message.includes("unauthorized") ||
    message.includes("401") ||
    message.includes("authentication") ||
    message.includes("invalid")
  ) {
    return "認証に失敗しました。再度ログインしてください";
  }

  // 4. タイムアウト
  if (message.includes("timeout")) {
    return "接続がタイムアウトしました。再試行してください";
  }

  // 5. セッション期限切れ
  if (message.includes("expired") || message.includes("session")) {
    return "セッションの有効期限が切れました。再度ログインしてください";
  }

  // 6. プロバイダーエラー
  if (message.includes("provider") || message.includes("oauth")) {
    return "認証プロバイダーとの接続に失敗しました";
  }

  // 7. デフォルト
  return "予期しないエラーが発生しました";
};
```

---

## 4. 対象関数一覧（5件）

### 4.1 login関数

**現状**:

```typescript
set({
  isLoading: false,
  authError: error instanceof Error ? error.message : "ログインに失敗しました",
});
```

**改善後**:

```typescript
set({
  isLoading: false,
  authError: handleAuthError(error),
});
```

### 4.2 logout関数

**現状**:

```typescript
console.error("[AuthSlice] Logout error:", error);
get().clearAuth();
// ユーザーへのエラー表示なし
```

**改善後**:

```typescript
console.error("[AuthSlice] Logout error:", error);
set({ authError: handleAuthError(error) });
get().clearAuth();
```

### 4.3 initializeAuth関数

**現状**:

```typescript
set({
  isLoading: false,
  authError:
    error instanceof Error ? error.message : "認証の初期化に失敗しました",
});
```

**改善後**:

```typescript
set({
  isLoading: false,
  authError: handleAuthError(error),
});
```

### 4.4 updateProfile関数

**現状**:

```typescript
set({
  isLoading: false,
  authError:
    error instanceof Error ? error.message : "プロフィールの更新に失敗しました",
});
```

**改善後**:

```typescript
// 専用メッセージを維持しつつ、unknownエラーも処理
const errorMessage =
  error instanceof Error
    ? handleAuthError(error)
    : "プロフィールの更新に失敗しました";
set({ isLoading: false, authError: errorMessage });
```

### 4.5 linkProvider関数

**現状**:

```typescript
set({
  isLoading: false,
  authError:
    error instanceof Error ? error.message : "アカウント連携に失敗しました",
});
```

**改善後**:

```typescript
// 専用メッセージを維持しつつ、unknownエラーも処理
const errorMessage =
  error instanceof Error
    ? handleAuthError(error)
    : "アカウント連携に失敗しました";
set({ isLoading: false, authError: errorMessage });
```

---

## 5. 完了条件（受け入れ基準）

### 5.1 機能完了条件

- [ ] CQ-ERR-01: `handleAuthError`関数が実装されている
- [ ] CQ-ERR-02: すべてのエラーメッセージが日本語
- [ ] CQ-ERR-03: エラー種別ごとに適切なメッセージが返される
- [ ] CQ-ERR-04: 全5関数でユーザーにエラーがフィードバックされる

### 5.2 品質完了条件

- [ ] TypeScript型エラーがない
- [ ] `handleAuthError`にユニットテストがある
- [ ] 技術的エラーメッセージが直接ユーザーに表示されない

### 5.3 テストケース

| テストID | 入力                             | 期待出力                                                     |
| -------- | -------------------------------- | ------------------------------------------------------------ |
| ERR-01   | `new Error("network failure")`   | `ネットワーク接続を確認してください`                         |
| ERR-02   | `new Error("401 unauthorized")`  | `認証に失敗しました。再度ログインしてください`               |
| ERR-03   | `new Error("request timeout")`   | `接続がタイムアウトしました。再試行してください`             |
| ERR-04   | `new Error("session expired")`   | `セッションの有効期限が切れました。再度ログインしてください` |
| ERR-05   | `new Error("unknown error xyz")` | `予期しないエラーが発生しました`                             |
| ERR-06   | `"string error"`                 | `予期しないエラーが発生しました`                             |
| ERR-07   | `null`                           | `予期しないエラーが発生しました`                             |

---

## 6. 参照情報

### 6.1 関連ドキュメント

- `docs/30-workflows/code-quality-improvements/task-login-only-auth-code-quality.md`
- `apps/desktop/src/renderer/store/slices/authSlice.ts`

### 6.2 関連タスク

- T-01-3: エラーハンドリング設計
- T-03-3: エラーハンドリング実装

### 6.3 既存コード参照

- `apps/desktop/src/renderer/store/slices/authSlice.ts` - 現状のエラーハンドリング
- `apps/desktop/src/renderer/views/AuthView/index.tsx` - エラー表示UI
- `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` - エラー表示UI
