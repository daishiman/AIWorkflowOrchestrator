# 🔍 緊急調査: 過去の動作との差異

## ユーザー報告

**「今までローカルのアプリとしてテストできていた」**
**「ログイン認証できていた」**

→ これは非常に重要な情報です。

---

## 📊 調査結果

### 発見1: ドキュメントに`pnpm dev`でのテスト手順が記載

`docs/setup/google-oauth-setup.md`より：

```
## 4. 動作確認

1. アプリを起動: `pnpm dev`
2. 設定画面からGoogleログインボタンをクリック
3. ブラウザでGoogle認証画面が開く
4. 認証後、アプリに自動的にリダイレクトされる  ← ここが重要！
```

**「アプリに自動的にリダイレクトされる」= カスタムプロトコルが動作していた**

### 発見2: cc88083コミット（別ブランチ）

コミットメッセージ：

```
開発環境でカスタムプロトコル（aiworkflow://）が登録されない問題に対応するため、
開発者ツールコンソールから認証トークンを注入できるデバッグ機能を追加。

## 使用方法（開発環境のみ）
await window.electronAPI.auth.devInjectAuthCallback(callbackUrl);
```

**このデバッグ機能が現在のコードに存在しません。**

---

## 🤔 仮説

### 仮説1: 過去に.appバンドルを作成していた

1. 過去に一度`pnpm package:mac`を実行
2. `.app`バンドルがmacOSにカスタムプロトコルを登録
3. その後、`pnpm dev`でもカスタムプロトコルが動作していた
4. 何らかの理由（macOS再起動、キャッシュクリア等）で登録が失われた

**確認方法**:

```bash
# macOSに登録されているプロトコルハンドラーを確認
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -dump | grep -i aiworkflow
```

### 仮説2: 過去は別のRedirect URLを使用していた

SupabaseのRedirect URLs設定で、`localhost`ベースのURLを使っていた可能性。

**確認が必要**:

- Supabase Dashboard → Authentication → URL Configuration
- Redirect URLs に何が設定されているか

### 仮説3: cc88083のデバッグ機能を使っていた

cc88083ブランチで`devInjectAuthCallback`機能が実装されており、それを使ってテストしていた。

---

## 🔧 確認が必要な項目

### 1. Supabase Redirect URLs設定

Supabaseダッシュボードで確認してください：

1. https://supabase.com/dashboard
2. プロジェクト選択
3. **Authentication** → **URL Configuration**
4. **Redirect URLs**に何が設定されているか

以下のいずれかが設定されていますか？

- ✅ `aiworkflow://auth/callback`（カスタムプロトコル）
- ✅ `http://localhost:3000/auth/callback`（ローカルサーバー）
- ✅ その他のURL？

### 2. macOSのプロトコル登録状況

ターミナルで実行：

```bash
# 登録されているプロトコルハンドラーを確認
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -dump | grep -i "aiworkflow\|workflow"
```

何か表示されますか？

### 3. mainブランチでパッケージングが成功するか

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
git checkout main
cd apps/desktop
pnpm package:mac
```

これは成功しますか？エラーが出ますか？

---

## 🎯 次のステップ

上記3つの確認結果を教えてください。それに基づいて、過去の動作を復元します。

特に重要：

1. **Supabase Redirect URLs**の設定内容
2. **macOSプロトコル登録**の有無
3. **mainブランチのパッケージング**が成功するか

これらの情報があれば、過去の動作を復元できます。
