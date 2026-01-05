# 🚨 緊急: 環境変数の設定が必要です

## 問題

以下のエラーが発生しています：

```
[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Auth features disabled.
[IPC] Auth, profile, and avatar handlers not registered - Supabase not configured
```

**これが原因でOAuth認証が一切動作していません。**

---

## 🔧 即座の解決方法

### ステップ1: .envファイルを作成

`apps/desktop/.env`ファイルを作成してください：

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766206724997-7b378f/apps/desktop

# .envファイルを作成
touch .env
```

### ステップ2: Supabase認証情報を設定

`.env`ファイルに以下を追加：

```env
# Supabase設定
# SupabaseプロジェクトのSettings > API から取得

# あなたのコールバックURLから判明したProject ID: sfofowcpbaehxzroqswx
VITE_SUPABASE_URL=https://sfofowcpbaehxzroqswx.supabase.co

# Supabase Anon/Public Key（SupabaseダッシュボードのSettings > API から取得）
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# OAuth Redirect URL
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback
```

### ステップ3: Supabase ANON KEYを取得

1. Supabaseダッシュボードを開く: https://supabase.com/dashboard
2. あなたのプロジェクト（`sfofowcpbaehxzroqswx`）を選択
3. **Settings** → **API** を開く
4. **Project API keys** セクションの **anon public** キーをコピー
5. `.env`ファイルの`VITE_SUPABASE_ANON_KEY`に貼り付け

### ステップ4: アプリを再起動

```bash
# preview mode を終了（Ctrl+C）

# 再ビルド&起動
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop preview
```

---

## ✅ 確認方法

アプリ起動後、以下のログが表示されるはずです：

```
✅ [Supabase] Client initialized successfully
```

「Missing VITE_SUPABASE_URL」エラーが表示されなくなったら成功です。

---

## 📝 .envファイルの完全な例

以下は設定例です（実際の値に置き換えてください）：

```env
# apps/desktop/.env

# Supabase設定
VITE_SUPABASE_URL=https://sfofowcpbaehxzroqswx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Nmb2Zvd2NwYmFlaHh6cm9xc3d4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODU4MDAwMDAwfQ.YOUR_ACTUAL_ANON_KEY_HERE
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback
```

**⚠️ 重要**: `.env`ファイルは`.gitignore`に含まれているため、Gitにコミットされません（セキュリティ対策）。

---

## 🎯 環境変数設定後の動作

### 期待される動作

1. アプリ起動 → ログイン画面が表示される
2. Googleボタンをクリック → ブラウザが開く
3. Google認証を完了 → コールバックURL（`aiworkflow://...`）へリダイレクト
4. アプリに認証情報が送信される → ダッシュボードが表示される

### 開発環境の制限（再掲）

**previewモードでもカスタムプロトコルが未登録**のため、ステップ4でエラーが発生します。

完全なOAuth認証フローをテストするには、パッケージング版が必要です：

```bash
pnpm --filter @repo/desktop package:mac
```

---

## 🚀 まとめ

### 現在の問題

1. ❌ 環境変数が未設定 → **即座に設定が必要**
2. ❌ カスタムプロトコル未登録（preview mode） → パッケージング版が必要

### 解決手順

#### 今すぐ実施:

```bash
# 1. .envファイルを作成
cd apps/desktop
nano .env  # またはvim, codeなど

# 2. 以下を貼り付け（ANON_KEYは実際の値に置き換える）
VITE_SUPABASE_URL=https://sfofowcpbaehxzroqswx.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback

# 3. 保存して終了

# 4. アプリを再起動
cd ../../
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop preview
```

#### 完全なOAuthテストの場合:

```bash
# electron-builderエラーは調査中
# 代替として、electron-packagerを使用するか、
# 環境変数を設定してから再度package:macを試す
```

**環境変数を設定すれば、少なくともIPCハンドラーが登録され、ログインボタンが機能するようになります。**
