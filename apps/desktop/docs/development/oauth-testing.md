# OAuth認証のテスト方法

## 問題: 開発環境でカスタムプロトコルが動作しない

開発環境（`pnpm dev`）では、Electronアプリが未ビルドのため、OS（macOS/Windows/Linux）にカスタムプロトコル（`aiworkflow://`）が登録されません。

### 症状

OAuth認証後に以下のエラーが表示される：

```
この書類を開くアプリケーションをApp Storeで検索するか、
このコンピュータにあるアプリケーションを選択してください。
aiworkflow://auth/callback#access_token=...
```

---

## 解決策

OAuth認証フローをテストするには、**ビルド版のアプリを使用する**必要があります。

### 方法1: ビルドしてテスト（推奨）

```bash
# 1. アプリをビルド
pnpm --filter @repo/desktop build

# 2. ビルド済みアプリを起動
pnpm --filter @repo/desktop preview

# 3. OAuth認証をテスト
# - ログイン画面でプロバイダーボタンをクリック
# - ブラウザでOAuth認証を完了
# - カスタムプロトコルでアプリにリダイレクト
```

### 方法2: パッケージング（完全テスト）

```bash
# macOSの場合
pnpm --filter @repo/desktop package:mac

# ビルドされたアプリを起動
open apps/desktop/dist/AI\ Workflow\ Orchestrator.app

# Windowsの場合
pnpm --filter @repo/desktop package:win
```

---

## 開発環境での代替テスト方法

完全なOAuthフローをテストせずに認証機能をテストするには、以下の方法があります：

### A. ユニットテスト

```bash
# AuthGuard、AuthView、authSliceのテスト
pnpm --filter @repo/desktop test:run AuthGuard
pnpm --filter @repo/desktop test:run AuthView
pnpm --filter @repo/desktop test:run authSlice
```

### B. DevToolsコンソールから手動認証

開発環境で認証状態を手動で設定：

```javascript
// DevTools Console（Renderer Process）
window.electronAPI.auth
  .login({ provider: "google" })
  .then((response) => console.log("Login response:", response));
```

### C. Main Processログの確認

```bash
# Electron DevToolsを開く（F12）
# Main ProcessのログはターミナルにWARN/ERROR output
```

---

## トラブルシューティング

### Q1: `pnpm preview`でもカスタムプロトコルが動作しない

**A**: `preview`モードでもビルドされたアプリですが、プロトコル登録にはアプリの再起動が必要な場合があります。

```bash
# 1. アプリを完全に終了
# 2. ビルドし直す
pnpm --filter @repo/desktop build

# 3. プレビューを再起動
pnpm --filter @repo/desktop preview
```

### Q2: macOSでプロトコルが登録されない

**A**: macOSのLaunchServices データベースをリセット：

```bash
# LaunchServicesデータベースをリビルド
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

# アプリを再起動
```

### Q3: ログインボタンを押してもブラウザが開かない

**A**: IPC `auth.login` ハンドラーのログを確認：

```typescript
// apps/desktop/src/main/ipc/authHandlers.ts
// console.log が出力されているか確認
```

---

## 本番環境でのテスト

本番環境（パッケージング済みアプリ）では、カスタムプロトコルが正しく登録されるはずです。

### macOS

```bash
pnpm --filter @repo/desktop package:mac
open apps/desktop/dist/AI\ Workflow\ Orchestrator.app
```

### Windows

```bash
pnpm --filter @repo/desktop package:win
# apps/desktop/dist/AI Workflow Orchestrator Setup.exe を実行
```

---

## electron-builder設定

カスタムプロトコルは以下のファイルで設定されています：

**`apps/desktop/electron-builder.yml`**:

```yaml
mac:
  extendInfo:
    CFBundleURLTypes:
      - CFBundleURLSchemes:
          - aiworkflow
        CFBundleURLName: com.aiworkflow.auth
        CFBundleTypeRole: Viewer

linux:
  mimeTypes:
    - x-scheme-handler/aiworkflow
```

Windowsは`app.setAsDefaultProtocolClient()`で自動登録されます。

---

## まとめ

| 環境                              | カスタムプロトコル | OAuthテスト方法                      |
| --------------------------------- | ------------------ | ------------------------------------ |
| **開発環境** (`pnpm dev`)         | ❌ 未登録          | ユニットテスト、または`pnpm preview` |
| **ビルド版** (`pnpm preview`)     | ✅ 登録済み        | 完全なOAuthフロー                    |
| **パッケージ版** (`pnpm package`) | ✅ 登録済み        | 完全なOAuthフロー（推奨）            |

**OAuth認証フローの完全テストは、ビルド版またはパッケージ版で実施してください。**
