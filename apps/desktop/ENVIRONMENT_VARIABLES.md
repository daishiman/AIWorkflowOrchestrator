# 🚨 環境変数の設定（必須）

## 現在の問題

以下のエラーのため、**OAuth認証が一切動作していません**：

```
[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.
[IPC] Auth, profile, and avatar handlers not registered - Supabase not configured
```

---

## 🔧 解決方法（3ステップ）

### ステップ1: Supabase認証情報を取得

1. **Supabaseダッシュボード**を開く
   - URL: https://supabase.com/dashboard
   - プロジェクトID: `sfofowcpbaehxzroqswx`（あなたのコールバックURLから判明）

2. **Settings** → **API** を開く

3. 以下2つをコピー:
   - **Project URL**: `https://sfofowcpbaehxzroqswx.supabase.co`
   - **Project API keys** → **anon public** key（長いJWT文字列）

### ステップ2: .envファイルを作成

```bash
# apps/desktopディレクトリで実行
cd apps/desktop

# .envファイルを作成（エディタで開く）
code .env
# またはvim .env
# またはnano .env
```

### ステップ3: 以下の内容を.envファイルに貼り付け

```
VITE_SUPABASE_URL=https://sfofowcpbaehxzroqswx.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_PUBLIC_KEY_HERE
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback
```

**例**（ANON_KEYは実際の値に置き換える）:

```
VITE_SUPABASE_URL=https://sfofowcpbaehxzroqswx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Nmb2Zvd2NwYmFlaHh6cm9xc3d4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4MDAwMDAwMCwiZXhwIjoxODQwMDAwMDAwfQ.ACTUAL_SIGNATURE_HERE
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback
```

### ステップ4: アプリを再起動

```bash
# 現在のpreviewを終了（Ctrl+C）

# 再ビルド&起動
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop preview
```

---

## ✅ 確認方法

### 成功時のログ

```
✓ Supabase client initialized
✓ Auth handlers registered
```

「Missing environment variables」エラーが消えたら成功です。

### DevToolsで確認

DevTools Console（`Cmd+Option+I`）で：

```javascript
// electronAPIが利用可能か確認
console.log("electronAPI.auth:", window.electronAPI?.auth);

// 期待される出力:
// {
//   login: function,
//   logout: function,
//   getSession: function,
//   ...
// }
```

---

## 🎯 重要なポイント

### これがなぜCritical（緊急）か

**環境変数なし = authハンドラー未登録 = ログイン機能が完全に動作しない**

```
環境変数未設定
  ↓
Supabaseクライアント初期化失敗
  ↓
authハンドラー未登録
  ↓
ログインボタンをクリックしても何も起こらない
```

### 環境変数設定後の動作

```
環境変数設定済み
  ↓
Supabaseクライアント初期化成功 ✅
  ↓
authハンドラー登録成功 ✅
  ↓
ログインボタンをクリック → ブラウザが開く ✅
```

---

## 📞 サポート

### Supabase ANON KEYの取得方法がわからない場合

1. https://supabase.com/dashboard にログイン
2. プロジェクト一覧から`sfofowcpbaehxzroqswx`を選択
3. 左サイドバー: **Settings**（歯車アイコン）
4. **API**タブをクリック
5. **Project API keys**セクションを探す
6. **anon** **public** と書かれたキーをコピー

キーは `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...`のような形式です（非常に長い文字列）。

---

**環境変数を設定したら、アプリを再起動してください。ログインボタンが機能するようになります。**
