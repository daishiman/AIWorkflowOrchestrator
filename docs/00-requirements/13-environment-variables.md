# 環境変数（MVP）

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## 13.1 必須環境変数

### Cloud（Railway + Turso）

| 変数名               | 説明                              | 設定方法          |
| -------------------- | --------------------------------- | ----------------- |
| `TURSO_DATABASE_URL` | Turso接続URL（libsql://...）      | Railway Variables |
| `TURSO_AUTH_TOKEN`   | Turso認証トークン                 | Railway Secrets   |
| `OPENAI_API_KEY`     | OpenAI APIキー（GPT-4o等）        | Railway Secrets   |
| `ANTHROPIC_API_KEY`  | Anthropic APIキー（Claude 3.5等） | Railway Secrets   |
| `GOOGLE_AI_API_KEY`  | Google AI APIキー（Gemini等）     | Railway Secrets   |
| `XAI_API_KEY`        | xAI APIキー（Grok等）             | Railway Secrets   |
| `DISCORD_TOKEN`      | Discord Botトークン               | Railway Secrets   |
| `DISCORD_CLIENT_ID`  | Discord Client ID                 | Railway Variables |
| `AGENT_SECRET_KEY`   | Agent認証キー                     | Railway Secrets   |

### Turso環境変数の取得方法

```bash
# Turso CLIでデータベース作成後
turso db show <database-name>

# 出力例:
# URL: libsql://your-db-name-your-org.turso.io

# 認証トークン生成
turso db tokens create <database-name>
```

### Local Agent

| 変数名             | 説明                                  |
| ------------------ | ------------------------------------- |
| `API_BASE_URL`     | Railway デプロイURL                   |
| `AGENT_SECRET_KEY` | Cloud と同じ値                        |
| `WATCH_DIR`        | 監視ディレクトリ（例: `./InputBox`）  |
| `OUTPUT_DIR`       | 出力ディレクトリ（例: `./OutputBox`） |

---

## 13.2 ローカル開発

### Railway CLI による環境変数同期

Railway CLI を使用すると、Railway で設定した環境変数をローカル開発環境で利用できます。

### コマンド説明

| コマンド                | 説明                                             |
| ----------------------- | ------------------------------------------------ |
| `railway variables`     | Railway の環境変数一覧を表示（確認用）           |
| `railway run <command>` | Railway の環境変数をロードした状態でコマンド実行 |

### ローカル開発フロー

1. Railway CLI で環境変数を同期
2. `railway run pnpm dev` でローカルサーバー起動
3. `http://localhost:3000` で動作確認
4. Railway の環境変数が自動的にロードされる（.env ファイル不要）

---

## 関連ドキュメント

- [デプロイメント](./12-deployment.md)
- [ローカルエージェント仕様](./09-local-agent.md)
- [テクノロジースタック](./03-technology-stack.md)
