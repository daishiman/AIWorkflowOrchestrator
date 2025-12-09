# Supabase 認証設定ガイド

このドキュメントでは、AIWorkflowOrchestrator で Supabase を使用した OAuth 認証を設定する方法を説明します。

## 目次

1. [概要](#概要)
2. [Step 1: Supabase プロジェクトの作成](#step-1-supabase-プロジェクトの作成)
3. [Step 2: API キーの取得](#step-2-api-キーの取得)
4. [Step 3: 環境変数の設定](#step-3-環境変数の設定)
5. [Step 4: OAuth プロバイダーの設定](#step-4-oauth-プロバイダーの設定)
6. [Step 5: リダイレクト URL の設定](#step-5-リダイレクト-url-の設定)
7. [Step 6: Electron カスタムプロトコルの設定](#step-6-electron-カスタムプロトコルの設定)
8. [コード実装例](#コード実装例)
9. [トラブルシューティング](#トラブルシューティング)

---

## 概要

AIWorkflowOrchestrator は以下の認証フローを使用します：

- **OAuth 2.0 PKCE フロー**: セキュアな認証（Electronアプリに推奨）
- **カスタムプロトコル**: `aiworkflow://auth/callback` でコールバック処理
- **サポートプロバイダー**: Google, GitHub, Discord

### 認証フロー図

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Electron  │────▶│   Supabase  │────▶│   OAuth     │────▶│   Provider  │
│     App     │     │    Auth     │     │   Redirect  │     │  (Google等) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                                                            │
      │◀───────────────────────────────────────────────────────────┘
      │              aiworkflow://auth/callback#token=xxx
```

---

## Step 1: Supabase プロジェクトの作成

### 1.1 アカウント作成

1. [https://supabase.com](https://supabase.com) にアクセス
2. **「Start your project」** をクリック
3. GitHub アカウントでサインアップ（または Email）

### 1.2 新規プロジェクトの作成

1. ダッシュボードで **「New project」** をクリック
2. 以下を入力：
   - **Name**: `aiworkflow-orchestrator`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（後で使用）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
3. **「Create new project」** をクリック
4. プロジェクトの準備が完了するまで待機（約2分）

---

## Step 2: API キーの取得

### 2.1 Project URL と API Key の場所

Supabase ダッシュボードで以下の手順で取得します：

1. 左サイドバーの **⚙️ Project Settings**（歯車アイコン）をクリック
2. **「Data API」** セクションをクリック（※「API」ではなく「Data API」）

### 2.2 API キーシステムについて

Supabase は現在 API キーシステムを移行中です。**両方のキー形式が利用可能**で、どちらを使用しても動作します。

#### 新しい API キー（推奨）

**「API Keys」タブ** に表示されるキー：

| キー形式                | 用途                   | クライアント使用 |
| ----------------------- | ---------------------- | ---------------- |
| `sb_<project>_<random>` | Publishable key (公開) | ✅ OK            |
| `sbp_<random>`          | Secret key (秘密)      | ❌ 使用禁止      |

新規プロジェクトでは、`sb_` で始まる Publishable key の使用を推奨します。

#### レガシー API キー

**「Legacy API Keys」タブ** に表示されるキー：

| キー形式       | 用途                           | クライアント使用 |
| -------------- | ------------------------------ | ---------------- |
| `anon` public  | 匿名アクセス（クライアント用） | ✅ OK            |
| `service_role` | サーバーサイド（全権限）       | ❌ 使用禁止      |

既存プロジェクトや互換性のために `anon` キーも引き続き使用可能です。

### 2.3 取得する値

**Data API** ページで以下の2つの値をコピーします：

| 項目            | 場所                                                                  | 説明                                  |
| --------------- | --------------------------------------------------------------------- | ------------------------------------- |
| **Project URL** | 「Project URL」セクション                                             | `https://xxxxxxxxxx.supabase.co` 形式 |
| **API Key**     | 「API Keys」タブ → Publishable key、または「Legacy API Keys」→ `anon` | クライアントで使用するキー            |

> **⚠️ 重要**: `service_role` / Secret key は**絶対に公開しないでください**。これらはサーバーサイドでのみ使用し、クライアントコードには含めません。

### 2.4 どちらのキーを使うべきか？

| シナリオ             | 推奨キー                          |
| -------------------- | --------------------------------- |
| 新規プロジェクト     | 新しい Publishable key (`sb_...`) |
| 既存プロジェクト     | 既存の `anon` キーをそのまま使用  |
| 移行中のプロジェクト | どちらでも OK（動作は同じ）       |

### 2.5 スクリーンショット参考

```
┌─────────────────────────────────────────────────────────────┐
│ Project Settings > Data API                                  │
├─────────────────────────────────────────────────────────────┤
│ Project URL: https://xxx.supabase.co  [コピー]              │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [API Keys] | [Legacy API Keys]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ── API Keys タブ（新キー）──────────────────────────────── │
│ │ Publishable: sb_xxx_xxxxxx  [コピー] ◀── 新規推奨       │ │
│ │ Secret: sbp_xxxxxx (使わない)                           │ │
│                                                              │
│ ── Legacy API Keys タブ（旧キー）───────────────────────── │
│ │ anon public: eyJ...  [コピー] ◀── 既存OK                │ │
│ │ service_role secret: eyJ... (使わない)                  │ │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 3: 環境変数の設定

### 3.1 .env ファイルの作成

プロジェクトルートに `.env` ファイルを作成：

```env
# ===========================================
# Supabase 設定（必須）
# ===========================================

# Project URL - Data API ページからコピー
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co

# API Key - 以下のいずれかを使用：
# - 新キー: API Keys タブの Publishable key (sb_xxx_xxxxxx 形式)
# - 旧キー: Legacy API Keys タブの anon key (eyJ... 形式)
VITE_SUPABASE_ANON_KEY=sb_xxx_xxxxxx

# ===========================================
# OAuth リダイレクト設定（オプション）
# ===========================================

# Electron アプリのカスタムプロトコル（デフォルト値）
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback
```

### 3.2 .env.example の作成（チーム共有用）

```env
# Supabase Configuration
# Get these values from: Supabase Dashboard > Project Settings > Data API
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# API Key (use one of the following):
# - New: Publishable key from "API Keys" tab (sb_xxx_... format)
# - Legacy: anon key from "Legacy API Keys" tab (eyJ... format)
VITE_SUPABASE_ANON_KEY=your-api-key-here

# OAuth Redirect URL (for Electron custom protocol)
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback
```

### 3.3 .gitignore の確認

`.env` ファイルが Git にコミットされないことを確認：

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

---

## Step 4: OAuth プロバイダーの設定

各プロバイダーの設定手順を説明します。

### 4.1 Google OAuth の設定

#### Step 4.1.0: OAuth 同意画面の設定（初回のみ）

OAuth クライアント ID を作成する前に、**OAuth 同意画面** の設定が必要です。

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. 左メニュー → **「APIとサービス」** → **「OAuth 同意画面」**
4. **「対象」** で以下のいずれかを選択：

| 選択肢   | 対象ユーザー                          | 用途           |
| -------- | ------------------------------------- | -------------- |
| **内部** | Google Workspace 組織内のユーザーのみ | 社内ツール専用 |
| **外部** | すべての Google アカウント保持者      | 一般公開アプリ |

> **推奨**: 一般ユーザー向けアプリの場合は **「外部」** を選択してください。

5. **「外部」** を選択 → **「次へ」**
6. アプリ情報を入力：
   - **アプリ名**: AIWorkflowOrchestrator
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
7. **「保存して次へ」** → スコープ設定（デフォルトのままでOK）→ **「保存して次へ」**
8. テストユーザーを追加（開発中に使用するメールアドレス）
9. **「作成」** をクリック

> **注意**: 「外部」を選択すると、最初は **テストモード** で開始されます。テストユーザーとして追加したアカウントのみがログイン可能です。本番公開には Google の審査が必要になります。

#### Step 4.1.1: Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. 左メニュー → **「APIとサービス」** → **「認証情報」**
4. **「+ 認証情報を作成」** → **「OAuth クライアント ID」**
5. 以下を設定：

| 項目                         | 値                                                |
| ---------------------------- | ------------------------------------------------- |
| アプリケーションの種類       | ウェブ アプリケーション                           |
| 名前                         | AIWorkflowOrchestrator（任意）                    |
| 承認済みの JavaScript 生成元 | （空欄でOK）                                      |
| 承認済みのリダイレクト URI   | `https://xxxxxxxxxx.supabase.co/auth/v1/callback` |

> **重要**: リダイレクト URI の `xxxxxxxxxx` は、あなたの Supabase プロジェクト ID に置き換えてください。

6. **「作成」** をクリック
7. 表示される **クライアント ID** と **クライアント シークレット** をコピー

#### Step 4.1.2: Supabase での設定

1. Supabase ダッシュボード → 左サイドバー → **「Authentication」**
2. **「Providers」** タブをクリック
3. **「Google」** を展開
4. 以下を入力：

| 項目                       | 値                                  |
| -------------------------- | ----------------------------------- |
| Enable Sign in with Google | ON                                  |
| Client ID                  | Google Cloud Console でコピーした値 |
| Client Secret              | Google Cloud Console でコピーした値 |

5. **「Save」** をクリック

---

### 4.2 GitHub OAuth の設定

#### Step 4.2.1: GitHub での設定

1. [GitHub Developer Settings](https://github.com/settings/developers) にアクセス
2. **「OAuth Apps」** → **「New OAuth App」**
3. 以下を入力：

| 項目                           | 値                                                | 説明                           |
| ------------------------------ | ------------------------------------------------- | ------------------------------ |
| **Application name**           | `AIWorkflowOrchestrator`                          | ユーザーに表示されるアプリ名   |
| **Homepage URL**               | `http://localhost:5173`                           | 開発時はこれでOK、本番時は変更 |
| **Application description**    | （空欄でOK）                                      | 任意の説明文                   |
| **Authorization callback URL** | `https://xxxxxxxxxx.supabase.co/auth/v1/callback` | Supabase のコールバック URL    |
| **Enable Device Flow**         | 未チェック                                        | チェック不要                   |

> **重要**: `xxxxxxxxxx` はあなたの Supabase プロジェクト ID に置き換えてください。

#### スクリーンショット参考

```
┌─────────────────────────────────────────────────────────────┐
│ Register a new OAuth app                                     │
├─────────────────────────────────────────────────────────────┤
│ Application name *                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ AIWorkflowOrchestrator                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Homepage URL *                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ http://localhost:5173                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Application description                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (空欄でOK)                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Authorization callback URL *                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://xxx.supabase.co/auth/v1/callback                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ☐ Enable Device Flow  ← チェック不要                        │
│                                                              │
│ [Register application]  Cancel                               │
└─────────────────────────────────────────────────────────────┘
```

4. **「Register application」** をクリック
5. 次の画面で **Client ID** が表示される → コピー
6. **「Generate a new client secret」** をクリック → **Client Secret** をコピー

> **注意**: Client Secret は一度しか表示されません。必ずコピーして安全な場所に保存してください。

#### 本番環境への移行時

本番公開時は **Homepage URL** を実際のドメインに変更：

```
http://localhost:5173  →  https://your-domain.com
```

（Authorization callback URL は Supabase のままで変更不要）

#### Step 4.2.2: Supabase での設定

1. Supabase ダッシュボード → **「Authentication」** → **「Providers」**
2. **「GitHub」** を展開
3. 以下を入力：

| 項目                       | 値                    |
| -------------------------- | --------------------- |
| Enable Sign in with GitHub | ON                    |
| Client ID                  | GitHub でコピーした値 |
| Client Secret              | GitHub でコピーした値 |

4. **「Save」** をクリック

---

### 4.3 Discord OAuth の設定

#### Step 4.3.1: Discord アプリケーションの作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 右上の **「New Application」** をクリック
3. アプリケーション名を入力：`AIWorkflowOrchestrator`
4. 利用規約に同意して **「Create」** をクリック

#### Step 4.3.2: General Information の設定

1. 左メニュー → **「General Information」**
2. 以下の情報を確認・設定：

| 項目                     | 設定値                       | 必須 |
| ------------------------ | ---------------------------- | ---- |
| **Name**                 | `AIWorkflowOrchestrator`     | 必須 |
| **Description**          | アプリの説明（空欄でもOK）   | 任意 |
| **App Icon**             | アプリアイコン（空欄でもOK） | 任意 |
| **Terms of Service URL** | （空欄でOK）                 | 任意 |
| **Privacy Policy URL**   | （空欄でOK）                 | 任意 |

3. ページ下部の **「Save Changes」** をクリック（変更した場合）

#### Step 4.3.3: OAuth2 の設定（重要）

1. 左メニュー → **「OAuth2」**
2. **Client information** セクションで以下をコピー：

| 項目              | 説明                                 | コピー |
| ----------------- | ------------------------------------ | ------ |
| **Client ID**     | `144759674599872xxxx` のような数字   | 必須   |
| **Client Secret** | 「Reset Secret」で生成、一度だけ表示 | 必須   |

> **注意**: Client Secret が表示されていない場合は **「Reset Secret」** をクリックして新しく生成してください。生成後は一度しか表示されないので、必ずコピーして保存してください。

3. **Public Client** は **OFF のまま**（トグルを触らない）

#### Step 4.3.4: Redirects の設定（重要）

1. **「Redirects」** セクションで **「Add Redirect」** をクリック
2. 以下の URL を入力：

```
https://xxxxxxxxxx.supabase.co/auth/v1/callback
```

> **重要**: `xxxxxxxxxx` はあなたの Supabase プロジェクト ID に置き換えてください。

3. Enter キーを押すか、入力欄外をクリックして確定

#### スクリーンショット参考（OAuth2 ページ）

```
┌─────────────────────────────────────────────────────────────┐
│ OAuth2                                                       │
├─────────────────────────────────────────────────────────────┤
│ Client information                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Client ID: 144759674599872xxxx            [コピー]      │ │
│ │ Client Secret: Hidden for security        [コピー]      │ │
│ │                                    [Reset Secret]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Public Client                                          [OFF] │
│ ← OFF のまま（トグルを触らない）                             │
│                                                              │
│ Redirects                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://xxx.supabase.co/auth/v1/callback                │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Add Redirect] ← クリックして上記 URL を追加                │
│                                                              │
│ OAuth2 URL Generator                                         │
│ Scopes: ← 設定不要（Supabase が自動で処理）                 │
│ ☐ identify  ☐ email  ☐ guilds ...                          │
└─────────────────────────────────────────────────────────────┘
```

#### Step 4.3.5: Scopes について（設定不要）

**OAuth2 URL Generator** セクションの **Scopes** は設定不要です。
Supabase が OAuth フロー時に自動的に必要なスコープ（`identify`, `email`）をリクエストします。

#### Step 4.3.6: Supabase での設定

1. Supabase ダッシュボード → **「Authentication」** → **「Providers」**
2. **「Discord」** を展開（クリックして開く）
3. 以下を入力：

| 項目                            | 値                                 | 説明                     |
| ------------------------------- | ---------------------------------- | ------------------------ |
| **Enable Sign in with Discord** | ON（トグルを有効化）               | Discord ログインを有効化 |
| **Client ID**                   | Discord でコピーした Client ID     | 数字の文字列             |
| **Client Secret**               | Discord でコピーした Client Secret | 英数字の文字列           |

4. **「Save」** をクリック

#### Discord OAuth 設定チェックリスト

- [ ] Discord Developer Portal でアプリケーションを作成した
- [ ] Client ID をコピーした
- [ ] Client Secret を生成してコピーした
- [ ] Redirects に Supabase のコールバック URL を追加した
- [ ] Public Client は OFF のまま
- [ ] Supabase の Discord Provider を有効化した
- [ ] Supabase に Client ID と Client Secret を入力した

---

## Step 5: リダイレクト URL の設定

Electron アプリでカスタムプロトコル `aiworkflow://` を使用するため、Supabase に追加の設定が必要です。

### 5.1 Supabase での設定

1. Supabase ダッシュボード → **「Authentication」** → **「URL Configuration」**
2. **「Redirect URLs」** セクションで **「Add URL」** をクリック
3. 以下を追加：
   ```
   aiworkflow://auth/callback
   ```
4. **「Save」** をクリック

### 5.2 Site URL の設定（オプション）

開発時のデフォルト Site URL を設定：

| 環境 | Site URL                             |
| ---- | ------------------------------------ |
| 開発 | `http://localhost:5173`              |
| 本番 | `aiworkflow://` または実際のドメイン |

---

## Step 6: Electron カスタムプロトコルの設定

### 6.1 プロトコルハンドラーの登録

`apps/desktop/src/main/index.ts` での設定例：

```typescript
import { app, protocol } from "electron";
import { processAuthCallback } from "./ipc/authHandlers";

// アプリ起動時にプロトコルを登録
app.whenReady().then(() => {
  // カスタムプロトコル aiworkflow:// を登録
  protocol.registerHttpProtocol("aiworkflow", (request) => {
    const url = request.url;
    if (url.includes("/auth/callback")) {
      processAuthCallback(url, mainWindow, supabase, secureStorage);
    }
  });
});

// macOS: open-url イベントでプロトコルを処理
app.on("open-url", (event, url) => {
  event.preventDefault();
  if (url.startsWith("aiworkflow://auth/callback")) {
    processAuthCallback(url, mainWindow, supabase, secureStorage);
  }
});

// Windows/Linux: second-instance イベントで処理
app.on("second-instance", (event, commandLine) => {
  const url = commandLine.find((arg) => arg.startsWith("aiworkflow://"));
  if (url) {
    processAuthCallback(url, mainWindow, supabase, secureStorage);
  }
});
```

### 6.2 electron-builder での設定

`electron-builder.yml` または `package.json` の build 設定：

```yaml
# electron-builder.yml
mac:
  extendInfo:
    CFBundleURLTypes:
      - CFBundleURLSchemes:
          - aiworkflow
        CFBundleURLName: com.aiworkflow.auth

win:
  # Windows はインストーラーが自動でレジストリに登録

linux:
  mimeTypes:
    - x-scheme-handler/aiworkflow
```

---

## コード実装例

### Supabase クライアントの初期化

```typescript
// packages/shared/infrastructure/auth/supabase-client.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Electron では false
      flowType: "pkce", // PKCE フローを使用（推奨）
    },
  });
}
```

### OAuth ログインの実装

```typescript
// OAuth ログイン開始
async function loginWithOAuth(provider: "google" | "github" | "discord") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: "aiworkflow://auth/callback",
      skipBrowserRedirect: true, // Electron では true
    },
  });

  if (error) {
    console.error("OAuth error:", error);
    return;
  }

  // ブラウザで認証 URL を開く
  if (data.url) {
    await shell.openExternal(data.url);
  }
}
```

### コールバック処理

```typescript
// OAuth コールバックの処理
async function processAuthCallback(callbackUrl: string) {
  // URL からトークンを抽出
  const hashParams = new URLSearchParams(callbackUrl.split("#")[1] || "");

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (accessToken && refreshToken) {
    // セッションを設定
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Session error:", error);
      return;
    }

    // リフレッシュトークンを安全に保存
    await secureStorage.storeRefreshToken(refreshToken);

    // メインウィンドウに認証成功を通知
    mainWindow.webContents.send("auth:state-changed", {
      authenticated: true,
      user: data.user,
    });
  }
}
```

---

## トラブルシューティング

### 問題 1: 「Invalid redirect URI」エラー

**原因**: Supabase に登録したリダイレクト URL が一致しない

**解決策**:

1. Supabase ダッシュボード → Authentication → URL Configuration
2. `aiworkflow://auth/callback` が正確に登録されているか確認
3. プロトコル名（`aiworkflow`）のスペルミスがないか確認

### 問題 2: OAuth 後にアプリに戻らない

**原因**: カスタムプロトコルが OS に登録されていない

**解決策**:

- **macOS**: アプリを一度アンインストールして再インストール
- **Windows**: レジストリにプロトコルが登録されているか確認
- **開発時**: `app.setAsDefaultProtocolClient('aiworkflow')` を追加

```typescript
// 開発時のプロトコル登録
if (process.env.NODE_ENV === "development") {
  app.setAsDefaultProtocolClient("aiworkflow");
}
```

### 問題 3: 「Client ID not found」エラー

**原因**: 環境変数が正しく設定されていない

**解決策**:

1. `.env` ファイルが存在するか確認
2. 変数名が `VITE_` プレフィックスで始まっているか確認
3. アプリを再起動

### 問題 4: セッションが保持されない

**原因**: トークンが正しく保存されていない

**解決策**:

```typescript
// SafeStorage の利用可否を確認
import { safeStorage } from "electron";

if (safeStorage.isEncryptionAvailable()) {
  // 暗号化して保存
  const encrypted = safeStorage.encryptString(refreshToken);
  store.set("auth.refreshToken", encrypted.toString("base64"));
} else {
  console.warn("SafeStorage not available");
}
```

---

## チェックリスト

設定が完了したら、以下を確認してください：

- [ ] Supabase プロジェクトを作成した
- [ ] Project URL を取得した
- [ ] API キーを取得した（Publishable key または anon key）
- [ ] `.env` ファイルに環境変数を設定した
- [ ] Google OAuth を設定した（使用する場合）
- [ ] GitHub OAuth を設定した（使用する場合）
- [ ] Discord OAuth を設定した（使用する場合）
- [ ] Supabase に `aiworkflow://auth/callback` を追加した
- [ ] Electron でカスタムプロトコルを登録した
- [ ] `.env` が `.gitignore` に含まれている

---

## 参考リンク

- [Supabase Auth ドキュメント](https://supabase.com/docs/guides/auth)
- [Supabase OAuth プロバイダー設定](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 設定ガイド](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth 設定ガイド](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [Discord OAuth 設定ガイド](https://supabase.com/docs/guides/auth/social-login/auth-discord)
