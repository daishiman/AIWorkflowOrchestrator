# OpenAI APIキー設定ガイド

## 手順

### 1. .env.localファイルを編集

以下のファイルを開いて、APIキーを設定してください:

```bash
# エディタで開く
nvim /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20251226-000434/packages/shared/.env.local

# または、直接編集
cat > /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20251226-000434/packages/shared/.env.local << 'EOF'
# OpenAI API Key
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_API_KEY_HERE
EOF
```

**重要**: `YOUR_ACTUAL_API_KEY_HERE` を実際のOpenAI APIキーに置き換えてください。

### 2. 環境変数として読み込む

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20251226-000434/packages/shared

# 方法1: exportコマンドで読み込み
export $(cat .env.local | xargs)

# 方法2: sourceコマンドで読み込み
set -a && source .env.local && set +a

# 確認
echo "API Key length: ${#OPENAI_API_KEY}"
# 期待値: 50文字以上
```

### 3. APIキーが正しく設定されたか確認

```bash
# 文字数を確認（APIキー自体は表示しない）
echo "OPENAI_API_KEY is set: ${OPENAI_API_KEY:+YES (${#OPENAI_API_KEY} chars)}"

# 期待される出力:
# OPENAI_API_KEY is set: YES (51 chars)
```

### 4. 実環境テスト実行

```bash
# TC-03: OpenAI埋め込み生成テスト
pnpm tsx test-data/manual-test/scripts/tc03-openai-embedding.ts

# TC-05: バッチ処理テスト
pnpm tsx test-data/manual-test/scripts/tc05-batch-processing.ts

# TC-08: パイプライン統合テスト
pnpm tsx test-data/manual-test/scripts/tc08-pipeline.ts
```

---

## OpenAI APIキーの取得方法

まだAPIキーをお持ちでない場合:

1. **OpenAI Platformにアクセス**
   - https://platform.openai.com/

2. **アカウント作成/ログイン**
   - GitHubアカウントでサインアップ可能

3. **APIキーを作成**
   - Settings → API keys → Create new secret key
   - キーをコピー（一度しか表示されません）

4. **支払い方法を設定**
   - Billing → Add payment method
   - 使用量に応じた従量課金

---

## セキュリティ注意事項

### ✅ 安全な使用方法

- ✅ `.env.local` は `.gitignore` に含まれています（確認済み）
- ✅ APIキーはGitにコミットされません
- ✅ 環境変数として読み込むため、コードにハードコードされません

### ⚠️ 注意点

- ⚠️ `.env.local` を絶対にGitにコミットしないでください
- ⚠️ APIキーを他人と共有しないでください
- ⚠️ APIキーをSlackやメールで送信しないでください
- ⚠️ 公開リポジトリにpushしないでください

---

## テストコスト見積もり

### TC-03: OpenAI埋め込み生成

- チャンク数: 5
- トークン数: 約500トークン
- コスト: $0.00001（0.001円）

### TC-05: バッチ処理

- チャンク数: 22
- トークン数: 約2000トークン
- コスト: $0.00004（0.004円）

### TC-08: パイプライン統合

- チャンク数: 5
- トークン数: 約500トークン
- コスト: $0.00001（0.001円）

### 合計

- **総トークン**: 約3000トークン
- **総コスト**: 約$0.00006（**0.006円**）

**結論**: 実環境テストのコストは1円未満です。

---

## トラブルシューティング

### エラー: 401 Unauthorized

**原因**: APIキーが無効または形式が間違っている

**解決**:

```bash
# APIキーの形式を確認
echo $OPENAI_API_KEY | head -c 10
# 期待値: sk-proj-... または sk-...

# APIキーを再設定
export OPENAI_API_KEY="sk-proj-..."
```

### エラー: 429 Too Many Requests

**原因**: レート制限に到達

**解決**: テストスクリプトにリトライ機能が実装されているため、自動的に再試行されます。

### エラー: insufficient_quota

**原因**: OpenAIアカウントに支払い方法が未設定

**解決**:

1. https://platform.openai.com/account/billing にアクセス
2. 支払い方法を追加
3. プリペイドクレジットを購入（$5から）

---

**次のステップ**: APIキーを設定後、実環境テストを実行してください。
