# 🚨 緊急修正: シンボリックリンクが壊れていました

## 問題の根本原因

**worktreeで`.env`シンボリックリンクが壊れていました。**

```bash
# mainブランチ（正常）
apps/desktop/.env → /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.env ✅

# worktree（壊れていた）
apps/desktop/.env → 存在しない ❌
```

---

## ✅ 修正完了

シンボリックリンクを再作成しました：

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766206724997-7b378f/apps/desktop
ln -sf /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.env .env
```

---

## 📋 既存の.env設定（確認済み）

プロジェクトルートの`.env`ファイル：

```env
# Supabase 設定
VITE_SUPABASE_URL=https://sfofowcpbaehxzroqswx.supabase.co

# ✅ Publishable key (sb_xxx_xxxxxx 形式) - 正しい設定
VITE_SUPABASE_ANON_KEY=sb_publishable_RWb-YND_qI7Z0BpKuQ4Z4w__VVWbbf1

# OAuth リダイレクト設定
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback
```

**ご指摘の通り、Publishable keyが既に設定されています。**

---

## 🔄 次のアクション

シンボリックリンクを修正したので、アプリを再起動してください：

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766206724997-7b378f

# 再ビルド＆起動
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop preview
```

---

## ✅ 期待される動作

### 正常なログ

```
✓ [Supabase] Client initialized
✓ [IPC] Auth handlers registered
```

### エラーが消える

```
❌ [Supabase] Missing VITE_SUPABASE_URL... ← このエラーが消えるはず
```

---

## 🎯 まとめ

### 問題

- worktreeで`.env`シンボリックリンクが壊れていた
- そのため環境変数が読み込まれず、Supabaseクライアントが初期化されなかった

### 解決

- ✅ シンボリックリンク再作成
- ✅ Publishable key設定確認（既に正しく設定されていた）
- ✅ .envファイルが読み込まれるようになった

**アプリを再起動すれば、ログイン機能が動作するはずです。**
