# Step 12: 手動テストガイド

**タスクID**: T-08-1
**フェーズ**: Phase 8 - 手動テスト
**目的**: 実環境でのOAuth認証フロー・ユーザー体験の確認

---

## 🔧 事前準備

### 1. 環境設定の確認

```bash
# worktreeディレクトリに移動
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766206724997-7b378f

# .envシンボリックリンクの確認
ls -la apps/desktop/.env

# 期待される出力:
# lrwxr-xr-x  1 dm  staff  58 ... .env -> /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.env
```

### 2. LaunchServicesキャッシュのクリア

```bash
# macOSプロトコルキャッシュをクリア
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user
```

### 3. アプリの起動

```bash
# previewモードで起動
pnpm --filter @repo/desktop preview
```

**期待されるログ**:

```
✓ built in ...
start electron app...
```

### 4. DevToolsを開く

`Cmd+Option+I`（macOS）または `F12`（Windows/Linux）

---

## 📋 手動テストケース（12件）

### テストケース1-2: UI/UXテスト（ログイン画面）

#### 1️⃣ AuthGuard表示確認

**操作**:

1. アプリを起動
2. 初回起動時の画面を確認

**期待結果**:

- ✅ ログイン画面（AuthView）が表示される
- ✅ アプリ名「AIWorkflowOrchestrator」が表示される
- ✅ 「アカウント登録・ログイン」というタイトルが表示される

**判定基準**:

- ダッシュボードや設定画面が表示される場合は❌ FAIL

**スクリーンショット**: 📸 ログイン画面全体

---

#### 2️⃣ ログインボタン表示確認

**操作**:

1. ログイン画面を確認

**期待結果**:

- ✅ 「Googleで続ける」ボタンが表示される
- ✅ 「GitHubで続ける」ボタンが表示される
- ✅ 「Discordで続ける」ボタンが表示される
- ✅ 各ボタンにプロバイダーアイコンが表示される

**判定基準**:

- 3つすべてのボタンが表示されること

**スクリーンショット**: 📸 OAuth provider buttons

---

### テストケース3-5: 機能テスト（OAuth認証開始）

#### 3️⃣ Google OAuth認証開始

**操作**:

1. 「Googleで続ける」ボタンをクリック

**期待結果**:

- ✅ デフォルトブラウザが開く
- ✅ Google認証画面（`accounts.google.com`）が表示される
- ✅ アプリ名「AIWorkflowOrchestrator」が認証画面に表示される

**DevToolsログ確認**:

```
[AuthSlice] Login initiated for provider: google
```

**判定基準**:

- ブラウザが開かない場合は❌ FAIL
- エラーメッセージが表示される場合は❌ FAIL

**スクリーンショット**: 📸 Google認証画面

---

#### 4️⃣ GitHub OAuth認証開始

**操作**:

1. アプリに戻り、ログアウト（まだログインしていない場合はスキップ）
2. 「GitHubで続ける」ボタンをクリック

**期待結果**:

- ✅ デフォルトブラウザが開く
- ✅ GitHub認証画面（`github.com/login`）が表示される

**判定基準**: テストケース3と同様

**スクリーンショット**: 📸 GitHub認証画面

---

#### 5️⃣ Discord OAuth認証開始

**操作**:

1. アプリに戻り、ログアウト
2. 「Discordで続ける」ボタンをクリック

**期待結果**:

- ✅ デフォルトブラウザが開く
- ✅ Discord認証画面（`discord.com/oauth2`）が表示される

**判定基準**: テストケース3と同様

**スクリーンショット**: 📸 Discord認証画面

---

### テストケース6-8: 統合テスト（認証コールバック処理）

#### 6️⃣ Google認証コールバック処理

**操作**:

1. 「Googleで続ける」ボタンをクリック
2. ブラウザでGoogle認証画面が開く
3. Googleアカウントを選択
4. 「許可」をクリック

**期待結果**:

- ✅ ブラウザから自動的にアプリに戻る
- ✅ ダッシュボード画面が表示される
- ✅ ログイン画面が消える

**DevToolsログ確認** (ターミナル):

```
Auth callback processed successfully, user: your-email@gmail.com
```

**判定基準**:

- アプリに戻らない場合は❌ FAIL（プロトコル未登録）
- エラーメッセージが表示される場合は❌ FAIL

**スクリーンショット**: 📸 ダッシュボード画面

---

#### 7️⃣ GitHub認証コールバック処理

テストケース6と同様の手順で、GitHubプロバイダーで実施。

**スクリーンショット**: 📸 GitHub認証後のダッシュボード

---

#### 8️⃣ Discord認証コールバック処理

テストケース6と同様の手順で、Discordプロバイダーで実施。

**スクリーンショット**: 📸 Discord認証後のダッシュボード

---

### テストケース9-10: UI/UXテスト（ログイン後）

#### 9️⃣ ログイン後のユーザー情報表示

**操作**:

1. ログイン済み状態で、Settings画面を開く（App Dockの歯車アイコン）
2. Profileセクションを確認

**期待結果**:

- ✅ ユーザー名が表示される
- ✅ メールアドレスが表示される
- ✅ アバター画像が表示される（プロバイダーから取得）

**判定基準**:

- ユーザー情報が正しく表示されること

**スクリーンショット**: 📸 Settings画面のProfile表示

---

#### 🔟 ログアウト

**操作**:

1. Settings画面でログアウトボタンをクリック
2. 確認ダイアログが表示される場合は「OK」をクリック

**期待結果**:

- ✅ ログイン画面（AuthView）に戻る
- ✅ ダッシュボードが非表示になる
- ✅ OAuth providerボタンが再び表示される

**DevToolsログ確認**:

```
[AuthSlice] Logout successful
```

**判定基準**:

- ログイン画面に戻らない場合は❌ FAIL

**スクリーンショット**: 📸 ログアウト後のログイン画面

---

### テストケース11-12: リグレッションテスト

#### 1️⃣1️⃣ 認証済み状態でのアプリ起動

**操作**:

1. ログイン済み状態でアプリを終了（`Cmd+Q`）
2. アプリを再起動（`pnpm preview`）

**期待結果**:

- ✅ ログイン画面をスキップ
- ✅ 直接ダッシュボードが表示される
- ✅ ユーザー情報が保持されている

**DevToolsログ確認**:

```
[AuthSlice] Session restored from stored tokens
```

**判定基準**:

- ログイン画面が表示される場合は❌ FAIL
- セッションが保持されていない場合は❌ FAIL

---

#### 1️⃣2️⃣ 既存機能への影響確認

**操作**:

1. ログイン済み状態で以下の各機能を操作:
   - Dashboard: 統計情報の表示
   - Editor: ファイル編集
   - Chat: AIチャット
   - Graph: ナレッジグラフ表示
   - Settings: 設定変更

**期待結果**:

- ✅ すべての機能が正常に動作する
- ✅ AuthGuard有効化による悪影響がない
- ✅ 画面遷移がスムーズ

**判定基準**:

- いずれかの機能でエラーが発生する場合は❌ FAIL
- 画面表示が崩れる場合は❌ FAIL

**スクリーンショット**: 📸 各機能の動作画面

---

## ⚠️ トラブルシューティング

### 問題1: カスタムプロトコルが動作しない

**症状**:

```
この書類を開くアプリケーションが設定されていません
aiworkflow://auth/callback#...
```

**解決方法**:

```bash
# LaunchServicesキャッシュをクリア
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

# アプリを再起動
pnpm --filter @repo/desktop preview
```

---

### 問題2: ログイン画面が表示されない

**症状**: アプリ起動時にダッシュボードや設定画面が表示される

**解決方法**:

```javascript
// DevTools Consoleで実行
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

### 問題3: OAuth認証ボタンをクリックしても反応しない

**症状**: ボタンをクリックしてもブラウザが開かない

**確認事項**:

```javascript
// DevTools Consoleで確認
console.log("electronAPI:", window.electronAPI);
console.log("auth methods:", window.electronAPI?.auth);

// 期待される出力:
// auth: { login: function, logout: function, ... }
```

**解決方法**:

- 環境変数（.env）が正しく設定されているか確認
- アプリを再ビルド: `pnpm --filter @repo/desktop build`

---

### 問題4: 認証成功後もログイン画面のまま

**症状**: ブラウザで認証完了後、アプリに戻るがログイン画面のまま

**確認事項**:

```bash
# ターミナルログを確認
# 期待されるログ:
# Auth callback processed successfully, user: your-email@...
```

**解決方法**:

- DevTools Consoleでストアの状態を確認
- Main Processのログでエラーを確認

---

## 📸 スクリーンショット取得箇所

| テストケース | スクリーンショット内容       |
| ------------ | ---------------------------- |
| 1            | ログイン画面全体             |
| 2            | OAuth providerボタン         |
| 3            | Google認証画面               |
| 6            | Google認証後のダッシュボード |
| 9            | Settings画面のProfile表示    |
| 10           | ログアウト後のログイン画面   |
| 12           | 各機能の動作画面             |

---

## ✅ テスト完了の確認

全12テストケースで以下を満たすこと：

- [ ] すべてのテストケースが実行済み
- [ ] すべてのテストケースがPASS
- [ ] スクリーンショットが記録済み
- [ ] 発見された不具合なし、または技術的負債として記録済み

---

## 📝 結果の記録

テスト結果は `step12-manual-test-results.md` に記録してください。
