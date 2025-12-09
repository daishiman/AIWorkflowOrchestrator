# T-00-1: 既存実装状況の調査結果レポート

## 調査概要

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| タスクID | T-00-1                                               |
| 調査日   | 2025-12-09                                           |
| 調査対象 | Phase 5.5レビューで指摘された4項目のセキュリティ機能 |
| 調査結果 | 全4項目が**実装済み**                                |

---

## 調査結果サマリー

| 指摘項目           |  実装状況   | 実装ファイル                                                     | テスト有無 |
| ------------------ | :---------: | ---------------------------------------------------------------- | :--------: |
| CSP設定            | ✅ 実装済み | `apps/desktop/src/main/infrastructure/security/csp.ts`           |  ✅ あり   |
| 入力バリデーション | ✅ 実装済み | `packages/shared/schemas/auth.ts`                                |  ✅ あり   |
| IPC sender検証     | ✅ 実装済み | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` |  ✅ あり   |
| Renderer状態最小化 | ✅ 実装済み | `apps/desktop/src/renderer/store/slices/authSlice.ts`            |  ✅ あり   |

---

## 詳細調査結果

### 1. CSP設定 (Content Security Policy)

#### 実装状況: ✅ 完全実装済み

**ファイル**: `apps/desktop/src/main/infrastructure/security/csp.ts`

#### 実装内容

| 要件ID     | 要件                                  | 実装状況 | 確認箇所                                 |
| ---------- | ------------------------------------- | :------: | ---------------------------------------- |
| SEC-CSP-01 | script-src 'self' のみ許可（本番）    |    ✅    | `getProductionDirectives()` L143         |
| SEC-CSP-02 | style-src 'self' 'unsafe-inline' 許可 |    ✅    | L144                                     |
| SEC-CSP-03 | connect-src でSupabase URLのみ許可    |    ✅    | `buildSupabaseConnectSources()` L108-120 |
| SEC-CSP-04 | frame-ancestors 'none' 設定           |    ✅    | `BASE_DIRECTIVES` L91                    |
| SEC-CSP-05 | 開発環境用CSP設定の分離               |    ✅    | `getDevelopmentDirectives()` L167-185    |

#### 特筆事項

- 環境変数（`isDev`）による本番/開発の自動切り替え
- Supabase URLの動的追加機能
- 不正URL入力時の安全なフォールバック（警告ログ出力）
- クリックジャッキング対策（frame-ancestors: 'none'）
- プラグイン対策（object-src: 'none'）

#### テストファイル

`apps/desktop/src/main/infrastructure/security/csp.test.ts` (256行)

- 本番環境でunsafe-evalが含まれないテスト
- 開発環境でunsafe-evalが含まれるテスト
- Supabase URL含有テスト
- frame-ancestors設定テスト
- セキュリティ要件テスト群

---

### 2. 入力バリデーション (Zodスキーマ)

#### 実装状況: ✅ 完全実装済み

**ファイル**: `packages/shared/schemas/auth.ts`

#### 実装内容

| 要件ID     | 要件                             | 実装状況 | 確認箇所                                              |
| ---------- | -------------------------------- | :------: | ----------------------------------------------------- |
| SEC-VAL-01 | displayName入力のZodスキーマ定義 |    ✅    | `displayNameSchema` L102-117                          |
| SEC-VAL-02 | OAuthプロバイダー値の列挙型検証  |    ✅    | `oauthProviderSchema` L46-48                          |
| SEC-VAL-03 | IPC引数の型安全な検証            |    ✅    | `loginArgsSchema`, `updateProfileArgsSchema` L195-226 |

#### スキーマ詳細

##### displayNameSchema

```typescript
- minLength: 1
- maxLength: 50
- pattern: /^[a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\s\-_]+$/
```

XSS/SQLインジェクション対策として、特殊記号を禁止（`<`, `>`, `'`, `"`, `;`等）

##### oauthProviderSchema

```typescript
enum: ["google", "github", "discord"]
```

ホワイトリスト方式による検証

##### avatarUrlSchema

```typescript
- URL形式チェック
- HTTPSのみ許可（HTTP拒否）
- nullable対応
```

#### テストファイル

`packages/shared/schemas/auth.test.ts` (576行)

- XSS攻撃文字列拒否テスト（scriptタグ、imgタグ等）
- SQLインジェクション文字列拒否テスト
- 特殊記号拒否テスト（30種以上）
- 境界値テスト（空文字、51文字以上）
- プロトコルインジェクション拒否テスト

---

### 3. IPC sender検証

#### 実装状況: ✅ 完全実装済み

**ファイル**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

#### 実装内容

| 要件ID     | 要件                                 | 実装状況 | 確認箇所                       |
| ---------- | ------------------------------------ | :------: | ------------------------------ |
| SEC-IPC-01 | IPC呼び出し元のwebContents検証       |    ✅    | `validateIpcSender()` L178-254 |
| SEC-IPC-02 | 不正な呼び出し元からのリクエスト拒否 |    ✅    | L188-246                       |
| SEC-IPC-03 | セキュリティログ出力                 |    ✅    | `logSecurityEvent()` L107-129  |

#### 検証フロー

1. **Step 1**: webContentsからBrowserWindowを取得できるか確認
2. **Step 2**: DevToolsからの呼び出しでないか確認
3. **Step 3**: 許可されたウィンドウリストに含まれているか確認

#### エラーコード

- `IPC_UNAUTHORIZED`: BrowserWindowが見つからない
- `IPC_FORBIDDEN`: DevTools、未許可ウィンドウからの呼び出し

#### ユーティリティ

- `toIPCValidationError()`: 検証結果をIPCResponse形式に変換
- `withValidation()`: 既存handlerにラップして検証を追加

#### テストファイル

`apps/desktop/src/main/infrastructure/security/ipc-validator.test.ts` (645行)

- 許可ウィンドウからの呼び出し成功テスト
- BrowserWindow非存在時のUNAUTHORIZEDエラーテスト
- 許可リストにないウィンドウのFORBIDDENエラーテスト
- DevToolsからの呼び出し拒否テスト
- セキュリティログ出力テスト
- 認証系channel全てでの検証テスト

---

### 4. Renderer状態最小化

#### 実装状況: ✅ 完全実装済み

**ファイル**: `apps/desktop/src/renderer/store/slices/authSlice.ts`

#### 実装内容

| 要件ID       | 要件                                  | 実装状況 | 確認箇所               |
| ------------ | ------------------------------------- | :------: | ---------------------- |
| SEC-STATE-01 | access_tokenをRenderer側で保持しない  |    ✅    | 状態定義 L17-27        |
| SEC-STATE-02 | refresh_tokenをRenderer側で保持しない |    ✅    | 状態定義 L17-27        |
| SEC-STATE-03 | 必要最小限のユーザー情報のみ保持      |    ✅    | `sessionExpiresAt` L23 |

#### AuthSlice状態構造（トークンなし）

```typescript
interface AuthSlice {
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | null;
  sessionExpiresAt: number | null; // トークンではなく有効期限のみ
  profile: UserProfile | null;
  linkedProviders: LinkedProvider[];
  isOffline: boolean;
  authError: string | null;
  // access_token, refresh_token は含まない
}
```

#### セキュリティコメント

コード内に明確なセキュリティコメントが記載：

- L12-16: 「セキュリティ対策として、トークン情報は状態に保存しない」
- L23: 「セッション有効期限 (Unix timestamp) - トークンは含まない」
- L49: 「Initial state (トークンなし - セキュリティ対策)」
- L156: 「トークンは保存しない - 有効期限のみ」

#### テストファイル

`apps/desktop/src/renderer/store/slices/authSlice.test.ts` (1263行)

- 状態最小化テストセクション（L938-1251）
- sessionプロパティが存在しないテスト
- accessToken/refreshTokenが状態に含まれないテスト
- getSessionレスポンスにトークンが含まれていても状態に保存されないテスト
- DevToolsセキュリティテスト（シリアライズ時にトークンが含まれない）

---

## 結論

### 判定: **PASS** (全4項目実装済み)

Phase 5.5のセキュリティレビューで指摘された4項目は、既に以下の品質で実装されています：

1. **CSP設定**: 本番/開発環境分離、Supabase対応、クリックジャッキング対策済み
2. **入力バリデーション**: XSS/SQLインジェクション対策、ホワイトリスト方式採用
3. **IPC sender検証**: 3段階検証、セキュリティログ出力、handlerラッパー提供
4. **Renderer状態最小化**: トークン排除、有効期限のみ保持、コメント記載

### 推奨次ステップ

既存実装が完全であるため、以下のフェーズに進むことを推奨：

1. **Phase 1**: 設計検証 → 既存実装の設計妥当性を確認
2. **Phase 1.5**: 設計レビューゲート → 複数エージェントによる検証
3. **Phase 5**: 品質保証 → テスト実行・脆弱性スキャン
4. **Phase 6**: ドキュメント更新 → セキュリティガイドラインへの反映

---

## 完了条件チェックリスト

- [x] CSP設定の実装有無が確認できた
- [x] Zodスキーマの実装有無が確認できた
- [x] IPC validator の実装有無が確認できた
- [x] authSliceでのトークン管理状況が確認できた

---

## 参考ファイル一覧

| カテゴリ        | ファイルパス                                                          |
| --------------- | --------------------------------------------------------------------- |
| CSP実装         | `apps/desktop/src/main/infrastructure/security/csp.ts`                |
| CSPテスト       | `apps/desktop/src/main/infrastructure/security/csp.test.ts`           |
| Zodスキーマ     | `packages/shared/schemas/auth.ts`                                     |
| Zodテスト       | `packages/shared/schemas/auth.test.ts`                                |
| IPC検証         | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`      |
| IPCテスト       | `apps/desktop/src/main/infrastructure/security/ipc-validator.test.ts` |
| authSlice       | `apps/desktop/src/renderer/store/slices/authSlice.ts`                 |
| authSliceテスト | `apps/desktop/src/renderer/store/slices/authSlice.test.ts`            |
