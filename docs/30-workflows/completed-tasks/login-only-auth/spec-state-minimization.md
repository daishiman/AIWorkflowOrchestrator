# Renderer状態最小化要件定義書

## 概要

| 項目           | 内容                               |
| -------------- | ---------------------------------- |
| ドキュメントID | SEC-STATE                          |
| 対象タスク     | T-00-4: Renderer状態最小化要件定義 |
| 作成日         | 2025-12-09                         |
| ステータス     | 完了                               |

## 目的

Renderer Process側で保持すべき認証状態の最小構成を定義し、機密情報（トークン）をMain Processでのみ管理する方針を明文化する。これにより、XSS攻撃等によるトークン漏洩リスクを軽減する。

## 現状分析

### 既存実装の確認

現在の`apps/desktop/src/renderer/store/slices/authSlice.ts`の状態構造：

```typescript
export interface AuthSlice {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | null;
  session: AuthSession | null; // ⚠️ トークン情報を含む
  profile: UserProfile | null;
  linkedProviders: LinkedProvider[];
  isOffline: boolean;
  authError: string | null;
  // ...
}
```

`AuthSession`型の定義（`preload/types.ts`）：

```typescript
export interface AuthSession {
  user: AuthUser;
  accessToken: string; // ⚠️ 機密情報
  refreshToken: string; // ⚠️ 機密情報
  expiresAt: number;
  isOffline: boolean;
}
```

### 問題点

| ID        | 問題                                  | リスク                                       |
| --------- | ------------------------------------- | -------------------------------------------- |
| STATE-P01 | sessionにaccessTokenが含まれている    | XSS攻撃によるトークン窃取                    |
| STATE-P02 | sessionにrefreshTokenが含まれている   | リフレッシュトークン漏洩による永続的アクセス |
| STATE-P03 | Renderer DevToolsでトークンが閲覧可能 | 開発者ツール経由での情報漏洩                 |
| STATE-P04 | メモリダンプでトークンが取得可能      | メモリ攻撃によるトークン窃取                 |

## セキュリティ原則

### 最小権限の原則（Principle of Least Privilege）

> Renderer Processは表示に必要な最小限の情報のみを保持し、
> 認証・認可に関わる機密情報はMain Processで管理する。

### 分離の原則（Separation of Concerns）

```
┌─────────────────────────────────────────────────────────────────┐
│                         Main Process                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Secure Storage (keytar)                                  │  │
│  │  - refreshToken (暗号化保存)                              │  │
│  │  - accessToken (メモリ内、必要時のみ)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    IPC (限定的な情報のみ)                        │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Renderer Process                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Zustand Store (authSlice)                                │  │
│  │  - isAuthenticated: boolean                               │  │
│  │  - authUser: { id, email, displayName, avatarUrl, ... }   │  │
│  │  - profile: { displayName, avatarUrl, ... }               │  │
│  │  - ❌ accessToken なし                                     │  │
│  │  - ❌ refreshToken なし                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 機能要件

### 必須要件

| ID           | 要件                                 | 優先度 | 根拠                          |
| ------------ | ------------------------------------ | ------ | ----------------------------- |
| SEC-STATE-01 | accessTokenをRenderer側で保持しない  | 必須   | XSS攻撃によるトークン窃取防止 |
| SEC-STATE-02 | refreshTokenをRenderer側で保持しない | 必須   | リフレッシュトークン漏洩防止  |
| SEC-STATE-03 | 必要最小限のユーザー情報のみ保持     | 必須   | 情報露出の最小化              |
| SEC-STATE-04 | sessionプロパティの型変更            | 必須   | トークン除去後の型安全性確保  |

### 推奨要件

| ID           | 要件             | 優先度 | 根拠                     |
| ------------ | ---------------- | ------ | ------------------------ |
| SEC-STATE-05 | 後方互換性の維持 | 推奨   | 既存コードへの影響最小化 |
| SEC-STATE-06 | 型定義の一元化   | 推奨   | 重複定義の排除           |

## 状態構造仕様

### Rendererで保持すべき状態

| プロパティ      | 型                  | 説明               | 保持理由                     |
| --------------- | ------------------- | ------------------ | ---------------------------- |
| isAuthenticated | boolean             | 認証状態           | UI表示制御                   |
| isLoading       | boolean             | ローディング状態   | UI表示制御                   |
| authUser        | AuthUser \| null    | ユーザー基本情報   | UI表示（名前、アバター等）   |
| profile         | UserProfile \| null | プロファイル情報   | UI表示                       |
| linkedProviders | LinkedProvider[]    | 連携プロバイダー   | UI表示                       |
| isOffline       | boolean             | オフライン状態     | UI表示・機能制御             |
| authError       | string \| null      | エラーメッセージ   | UI表示                       |
| expiresAt       | number \| null      | セッション有効期限 | UI表示（自動ログアウト通知） |

### Rendererで保持してはならない機密情報

| 情報          | 理由                                         |
| ------------- | -------------------------------------------- |
| accessToken   | API認証に使用、漏洩で不正アクセス可能        |
| refreshToken  | トークン更新に使用、漏洩で永続的アクセス可能 |
| sessionSecret | セッション署名に使用                         |
| apiKeys       | 外部サービスのAPIキー                        |

### 新しいAuthUser型

```typescript
// packages/shared/src/types/auth.ts
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt: string;
  // ❌ accessToken は含めない
  // ❌ refreshToken は含めない
}
```

### 新しい状態構造

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.ts
export interface AuthSlice {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | null;
  // session: AuthSession | null; // 削除または変更
  sessionExpiresAt: number | null; // 有効期限のみ保持
  profile: UserProfile | null;
  linkedProviders: LinkedProvider[];
  isOffline: boolean;
  authError: string | null;

  // Actions
  login: (provider: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  // ...
}
```

## データフロー仕様

### 認証成功時のデータフロー

```
┌────────────┐      ┌────────────────┐      ┌────────────────┐
│   OAuth    │ ──── │  Main Process  │ ──── │Renderer Process│
│  Callback  │      │                │      │                │
└────────────┘      └────────────────┘      └────────────────┘
      │                    │                       │
      │  tokens            │                       │
      ▼                    │                       │
┌────────────────────────────────────────────────────────────┐
│ 1. Main Process: トークン受信                              │
│    - accessToken, refreshToken を取得                      │
└────────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Main Process: セキュアストレージに保存                  │
│    - keytar.setPassword('auth', 'refreshToken', token)     │
└────────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Main Process: ユーザー情報を抽出                        │
│    - toAuthUser(session.user) で必要な情報のみ抽出         │
└────────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ 4. IPC: 限定的な情報をRendererに送信                       │
│    - { authenticated: true, user: AuthUser }               │
│    - ❌ accessToken は送信しない                           │
│    - ❌ refreshToken は送信しない                          │
└────────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Renderer Process: 状態更新                              │
│    - isAuthenticated = true                                │
│    - authUser = user                                       │
│    - sessionExpiresAt = expiresAt                          │
└────────────────────────────────────────────────────────────┘
```

### API呼び出し時のデータフロー

```
┌────────────────┐      ┌────────────────┐      ┌────────────┐
│Renderer Process│ ──── │  Main Process  │ ──── │  Supabase  │
│                │      │                │      │            │
└────────────────┘      └────────────────┘      └────────────┘
      │                       │                      │
      │  IPC: profile:update  │                      │
      │  { displayName: "..." }                      │
      ▼                       │                      │
      ────────────────────────▶                      │
                              │                      │
                    ┌─────────▼──────────┐           │
                    │ 1. IPC受信         │           │
                    │ 2. Storageからtoken取得 │      │
                    │ 3. API呼び出し     │────────────▶
                    │    (Authorization: Bearer token) │
                    └────────────────────┘           │
                              │                      │
                              │     API Response     │
                              ◀──────────────────────│
                              │                      │
      ◀───────────────────────│                      │
      │  IPC Response         │                      │
      │  (トークンなし)       │                      │
```

## 移行戦略

### Phase 1: 型定義の変更

1. `AuthSession` 型からトークン関連フィールドを削除
2. 新しい `AuthUser` 型を定義
3. `authSlice` の状態型を更新

### Phase 2: Main Process側の変更

1. IPC経由でトークンを送信しないように変更
2. `AUTH_STATE_CHANGED` イベントのペイロードを変更

### Phase 3: Renderer側の変更

1. `authSlice` から `session` プロパティを削除/変更
2. トークン参照箇所を削除

### Phase 4: テストの更新

1. 既存テストをトークンなしの状態でパスするように修正
2. 新しいテストケースを追加

## テスト要件

### ユニットテスト

| テストID  | シナリオ                                | 期待結果                |
| --------- | --------------------------------------- | ----------------------- |
| STATE-T01 | authSlice状態にaccessTokenが含まれない  | プロパティが存在しない  |
| STATE-T02 | authSlice状態にrefreshTokenが含まれない | プロパティが存在しない  |
| STATE-T03 | 認証成功後の状態                        | authUser のみ設定される |
| STATE-T04 | ログアウト後の状態                      | 状態がクリアされる      |

### 統合テスト

| テストID  | シナリオ       | 期待結果                       |
| --------- | -------------- | ------------------------------ |
| STATE-I01 | 認証フロー全体 | トークンがRendererに露出しない |
| STATE-I02 | セッション更新 | ユーザー情報のみ更新される     |

## 完了条件

- [x] Rendererで保持すべき状態項目が明示されている
- [x] 保持してはならない機密情報が明示されている
- [x] Main Processでのトークン管理方針が定義されている
- [x] 状態変更時のデータフローが定義されている
- [x] テスト要件が定義されている
- [x] 移行戦略が定義されている

## 関連ドキュメント

- `apps/desktop/src/renderer/store/slices/authSlice.ts`
- `apps/desktop/src/preload/types.ts`
- `apps/desktop/src/main/infrastructure/secureStorage.ts`
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
