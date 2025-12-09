# セキュリティ改善タスク仕様書

## タスク概要

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスク名   | login-only-auth セキュリティ強化                 |
| 対象機能   | 認証画面（AuthView/AuthGuard）のセキュリティ向上 |
| 優先度     | 高                                               |
| 見積もり   | 中規模                                           |
| ステータス | 未実施                                           |

## 背景と目的

Phase 5.5 Final Review Gate において、`@electron-security` エージェントによるセキュリティレビューで以下の改善点が指摘された：

1. **Content Security Policy (CSP) 未設定**
2. **入力値バリデーション不足**
3. **IPC sender検証未実装**
4. **Renderer側での機密情報保持リスク**

これらのセキュリティ強化を行い、Electronアプリケーションのセキュリティベストプラクティスに準拠する。

## 実施方針

### フェーズ構成

```
Phase 1: 要件定義・設計 (TDD準備)
Phase 2: CSP設定実装
Phase 3: 入力値バリデーション強化
Phase 4: IPC sender検証実装
Phase 5: Renderer状態最小化
Phase 6: セキュリティテスト・検証
```

## Phase 1: 要件定義・設計

### 1.1 CSP設定要件

#### 機能要件

| ID         | 要件                                                  | 優先度 |
| ---------- | ----------------------------------------------------- | ------ |
| SEC-CSP-01 | script-src 'self' のみ許可                            | 必須   |
| SEC-CSP-02 | style-src 'self' 'unsafe-inline' 許可（Tailwind対応） | 必須   |
| SEC-CSP-03 | connect-src でSupabase URLのみ許可                    | 必須   |
| SEC-CSP-04 | frame-ancestors 'none' 設定                           | 必須   |
| SEC-CSP-05 | 開発環境用CSP設定の分離                               | 推奨   |

#### 設計

```typescript
// apps/desktop/src/main/security/csp.ts
export const getContentSecurityPolicy = (isDev: boolean): string => {
  const supabaseUrl = process.env.SUPABASE_URL || "";

  const directives = {
    "default-src": ["'self'"],
    "script-src": isDev
      ? ["'self'", "'unsafe-eval'"] // 開発時のみ
      : ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'"], // Tailwind CSS用
    "connect-src": ["'self'", supabaseUrl, "https://*.supabase.co"],
    "img-src": ["'self'", "data:", "https:"], // アバター画像用
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
};
```

### 1.2 入力値バリデーション要件

#### 機能要件

| ID         | 要件                             | 優先度 |
| ---------- | -------------------------------- | ------ |
| SEC-VAL-01 | displayName入力のZodスキーマ定義 | 必須   |
| SEC-VAL-02 | OAuthプロバイダー値の列挙型検証  | 必須   |
| SEC-VAL-03 | IPC引数の型安全な検証            | 必須   |

#### 設計

```typescript
// packages/shared/src/schemas/auth.ts
import { z } from "zod";

export const oauthProviderSchema = z.enum(["google", "github", "discord"]);

export const displayNameSchema = z
  .string()
  .min(1, "表示名は必須です")
  .max(50, "表示名は50文字以内で入力してください")
  .regex(
    /^[a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\s]+$/,
    "使用できない文字が含まれています",
  );

export const updateProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
});

export type OAuthProvider = z.infer<typeof oauthProviderSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

### 1.3 IPC sender検証要件

#### 機能要件

| ID         | 要件                                 | 優先度 |
| ---------- | ------------------------------------ | ------ |
| SEC-IPC-01 | IPC呼び出し元のwebContents検証       | 必須   |
| SEC-IPC-02 | 不正な呼び出し元からのリクエスト拒否 | 必須   |
| SEC-IPC-03 | セキュリティログ出力                 | 推奨   |

#### 設計

```typescript
// apps/desktop/src/main/security/ipc-validator.ts
import { BrowserWindow, IpcMainInvokeEvent } from "electron";

export const validateIpcSender = (event: IpcMainInvokeEvent): boolean => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);

  if (!win) {
    console.warn("[Security] IPC call from unknown webContents");
    return false;
  }

  // メインウィンドウからの呼び出しのみ許可
  const mainWindow = BrowserWindow.getAllWindows().find(
    (w) => w.webContents.id === webContents.id,
  );

  if (!mainWindow) {
    console.warn("[Security] IPC call from unauthorized window");
    return false;
  }

  return true;
};

// 使用例
ipcMain.handle("auth:login", async (event, provider) => {
  if (!validateIpcSender(event)) {
    throw new Error("Unauthorized IPC call");
  }
  // ... 処理続行
});
```

### 1.4 Renderer状態最小化要件

#### 機能要件

| ID           | 要件                                  | 優先度 |
| ------------ | ------------------------------------- | ------ |
| SEC-STATE-01 | access_tokenをRenderer側で保持しない  | 必須   |
| SEC-STATE-02 | refresh_tokenをRenderer側で保持しない | 必須   |
| SEC-STATE-03 | 必要最小限のユーザー情報のみ保持      | 必須   |

#### 設計

```typescript
// 現状: authSlice.ts で保持している状態
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | null; // OK: 表示用情報のみ
  profile: UserProfile | null; // OK: 表示用情報のみ
  linkedProviders: LinkedProvider[];
  isOffline: boolean;
  authError: string | null;
  // tokens は保持しない（Main Process管理）
}

// AuthUser型の見直し
interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt: string;
  // access_token, refresh_token は含めない
}
```

## Phase 2: CSP設定実装

### 2.1 ファイル構成

```
apps/desktop/src/main/security/
├── csp.ts                    # CSP設定
├── csp.test.ts              # CSPテスト
└── index.ts                 # エクスポート
```

### 2.2 実装手順

1. `csp.ts` でCSP生成関数を実装
2. `main/index.ts` でBrowserWindow作成時にCSPヘッダー設定
3. 開発環境と本番環境でのCSP分離

### 2.3 テストケース

| テストID | シナリオ                               | 期待結果                 |
| -------- | -------------------------------------- | ------------------------ |
| CSP-01   | 本番環境CSP生成                        | unsafe-eval が含まれない |
| CSP-02   | 開発環境CSP生成                        | unsafe-eval が含まれる   |
| CSP-03   | Supabase URL が connect-src に含まれる | URL許可される            |
| CSP-04   | frame-ancestors が 'none'              | 設定されている           |

## Phase 3: 入力値バリデーション強化

### 3.1 ファイル構成

```
packages/shared/src/schemas/
├── auth.ts                   # 認証関連スキーマ
├── auth.test.ts             # スキーマテスト
└── index.ts                 # エクスポート
```

### 3.2 実装手順

1. Zod スキーマ定義
2. 型のエクスポート
3. Renderer側でのバリデーション適用
4. Main Process側でのバリデーション適用（二重チェック）

### 3.3 テストケース

| テストID | シナリオ                  | 期待結果           |
| -------- | ------------------------- | ------------------ |
| VAL-01   | 有効なdisplayName         | バリデーション通過 |
| VAL-02   | 空のdisplayName           | エラー             |
| VAL-03   | 51文字以上のdisplayName   | エラー             |
| VAL-04   | 特殊文字を含むdisplayName | エラー             |
| VAL-05   | 有効なOAuthプロバイダー   | バリデーション通過 |
| VAL-06   | 無効なOAuthプロバイダー   | エラー             |

## Phase 4: IPC sender検証実装

### 4.1 ファイル構成

```
apps/desktop/src/main/security/
├── ipc-validator.ts          # IPC検証
├── ipc-validator.test.ts    # テスト
└── index.ts                 # エクスポート
```

### 4.2 実装手順

1. `validateIpcSender` 関数実装
2. 既存のIPC handlersに検証追加
3. 不正アクセス時のログ出力

### 4.3 テストケース

| テストID | シナリオ                        | 期待結果       |
| -------- | ------------------------------- | -------------- |
| IPC-01   | 有効なwebContentsからの呼び出し | 許可           |
| IPC-02   | 不明なwebContentsからの呼び出し | 拒否           |
| IPC-03   | 不正アクセス時のログ出力        | ログ記録される |

## Phase 5: Renderer状態最小化

### 5.1 実装手順

1. `authSlice.ts` の状態確認
2. 不要なトークン情報がないことを確認
3. Main Process側でのトークン管理確認

### 5.2 確認事項

- [ ] access_token が Renderer 状態に含まれていない
- [ ] refresh_token が Renderer 状態に含まれていない
- [ ] セッション情報は Main Process で管理されている

## Phase 6: セキュリティテスト・検証

### 6.1 検証項目

| 項目               | 検証方法             | 担当エージェント   |
| ------------------ | -------------------- | ------------------ |
| CSP設定            | DevTools Console確認 | @electron-security |
| 入力バリデーション | 単体テスト           | @unit-tester       |
| IPC検証            | 統合テスト           | @e2e-tester        |
| 状態最小化         | コードレビュー       | @sec-auditor       |

### 6.2 セキュリティレビュー

```bash
# セキュリティレビュー実行コマンド
/ai:security-audit scope: auth
```

## 完了条件

- [ ] CSP が本番環境で適切に設定されている
- [ ] すべての入力値がZodスキーマで検証されている
- [ ] IPC呼び出し元の検証が実装されている
- [ ] Renderer側で機密トークンが保持されていない
- [ ] セキュリティテストがすべてパスしている
- [ ] `@electron-security` レビューで PASS 評価

## 関連ドキュメント

- `docs/30-workflows/login-only-auth/design-auth-guard.md`
- `docs/30-workflows/login-only-auth/design-auth-view.md`
- `apps/desktop/src/main/handlers/authHandlers.ts`
- `apps/desktop/src/renderer/store/slices/authSlice.ts`
