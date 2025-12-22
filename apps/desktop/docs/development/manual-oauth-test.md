# 手動でOAuth認証トークンを設定する方法

## 背景

preview/開発モードでは、カスタムプロトコル（`aiworkflow://`）がOSに登録されないため、OAuth認証コールバックが自動的に処理されません。

しかし、**手動でトークンを抽出し、DevToolsから設定することで認証をテスト**できます。

---

## 🔧 手動認証テスト手順

### ステップ1: OAuth認証を開始

1. アプリを起動

   ```bash
   pnpm --filter @repo/desktop preview
   ```

2. ログイン画面でプロバイダーボタンをクリック（例: Google）
3. ブラウザでOAuth認証を完了

### ステップ2: コールバックURLからトークンを抽出

ブラウザで表示されたエラー画面に、以下のようなURLが表示されます：

```
aiworkflow://auth/callback#access_token=eyJhbGci...&refresh_token=fmgkhzayfeph&...
```

このURLから以下の2つのトークンをコピーしてください：

- **access_token**: `eyJhbGci...`（長いJWT文字列）
- **refresh_token**: `fmgkhzayfeph`（短い文字列）

### ステップ3: DevToolsからトークンを設定

1. アプリのDevToolsを開く（`Cmd+Option+I` または `F12`）

2. **Console**タブで以下を実行：

```javascript
// トークンを変数に設定（上記URLから抽出したものに置き換える）
const accessToken =
  "eyJhbGciOiJIUzI1NiIsImtpZCI6Imw3bmlMZDU3SkhBZ00vMGwiLCJ0eXAiOiJKV1QifQ..."; // 実際のaccess_token
const refreshToken = "fmgkhzayfeph"; // 実際のrefresh_token

// MainProcessに認証イベントを送信
// 注: これは通常カスタムプロトコルハンドラーが自動的に行う処理です
const url = `aiworkflow://auth/callback#access_token=${accessToken}&refresh_token=${refreshToken}&token_type=bearer`;

// IPCを使ってトークンを送信
// （実装によってはこの方法が使えない場合があります）
```

### ステップ3（代替）: 直接セッションAPIを使用

より簡単な方法として、直接Supabaseセッションを設定：

```javascript
// Main ProcessでSupabaseセッションを設定する必要があるため、
// 一時的にIPCハンドラーを追加するか、以下の回避策を使用

// 回避策: コールバックURLをコピーしてMain Processのログに貼り付ける
// （Main Processは handleAuthCallback を呼び出す必要があります）
```

---

## 🚀 より簡単な方法: パッケージング版を使用

手動設定よりも、**パッケージング版（.appバンドル）を作成する方が確実**です。

### 修正: electron-builder設定

`apps/desktop/electron-builder.yml`に`electronVersion`を追加済みです：

```yaml
electronVersion: 39.2.5
```

### パッケージング実行

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766206724997-7b378f

# macOS用アプリバンドルを作成
pnpm --filter @repo/desktop package:mac

# 作成されたアプリを起動
open apps/desktop/dist/mac/AI\ Workflow\ Orchestrator.app
```

または、別のターゲット：

```bash
# DMG作成（時間がかかる）
pnpm --filter @repo/desktop package:mac

# ZIPバンドル（より高速）
# electron-builder.yml で zip targetが設定済み
```

---

## 🎯 推奨: パッケージング版でテスト

**手動トークン設定は複雑なため、パッケージング版（.app）の使用を強く推奨します。**

### 実行コマンド

```bash
# 作業ディレクトリに移動
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766206724997-7b378f

# パッケージング実行
pnpm --filter @repo/desktop package:mac

# 成功したら、以下が生成されます
# apps/desktop/dist/mac/AI Workflow Orchestrator.app
```

### パッケージング後のテスト

1. `.app`ファイルをダブルクリックして起動
2. ログイン画面が表示される
3. Googleボタンをクリック
4. ブラウザでGoogle認証を完了
5. **自動的にアプリに戻り、ダッシュボードが表示される** ✅

---

## ⚠️ 重要な注意

**preview モード（`pnpm preview`）ではカスタムプロトコルが動作しません。**

| モード             | プロトコル登録 | OAuth動作 |
| ------------------ | -------------- | --------- |
| `pnpm dev`         | ❌             | ❌        |
| `pnpm preview`     | ❌             | ❌        |
| `pnpm package:mac` | ✅             | ✅        |

**完全なOAuth認証フローをテストするには、パッケージング版（.app）が必須です。**
