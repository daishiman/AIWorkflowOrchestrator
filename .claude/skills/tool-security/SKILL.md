---
name: tool-security
description: |
  MCPツールとAPI統合におけるセキュリティ設計の専門知識。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/tool-security/resources/api-key-management.md`: Api Key Managementリソース
  - `.claude/skills/tool-security/resources/input-validation-guide.md`: Input Validation Guideリソース
  - `.claude/skills/tool-security/resources/permission-patterns.md`: Permission Patternsリソース

  - `.claude/skills/tool-security/templates/audit-log-schema.json`: Audit Log Schemaテンプレート
  - `.claude/skills/tool-security/templates/security-config-template.json`: Security Configテンプレート

  - `.claude/skills/tool-security/scripts/check-env-vars.mjs`: Check Env Varsスクリプト
  - `.claude/skills/tool-security/scripts/validate-security-config.mjs`: Validate Security Configスクリプト

version: 1.0.1
---

# Tool Security スキル

## 概要

MCP ツールと外部 API 統合におけるセキュリティ設計の専門知識を提供します。最小権限の原則に基づき、安全なツール統合を実現するためのベストプラクティスを網羅します。

## セキュリティレイヤーモデル

```
┌─────────────────────────────────────────────┐
│              認証層 (Authentication)         │
│  API Key / OAuth Token / JWT                │
├─────────────────────────────────────────────┤
│              認可層 (Authorization)          │
│  権限スコープ / アクセス制御リスト           │
├─────────────────────────────────────────────┤
│              検証層 (Validation)             │
│  入力検証 / サニタイゼーション / 型チェック  │
├─────────────────────────────────────────────┤
│              監査層 (Audit)                  │
│  ログ記録 / アクセスログ / 異常検出         │
└─────────────────────────────────────────────┘
```

## 1. API Key 管理

### 保存場所の優先順位

| 方法                     | セキュリティ | 用途           |
| ------------------------ | ------------ | -------------- |
| シークレットマネージャー | ✅ 最高      | 本番環境       |
| 環境変数                 | ✅ 高        | サーバーサイド |
| 暗号化設定ファイル       | ⚠️ 中        | 開発環境       |
| プレーンテキストファイル | ❌ 低        | 非推奨         |
| ソースコード内           | ❌ 禁止      | 絶対禁止       |

### 環境変数管理ベストプラクティス

```bash
# .env ファイル（.gitignoreに必須追加）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
GOOGLE_API_KEY=AIzaxxxxxxxxxxxxxxxxx
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxxxxxx

# .env.example（コミット可能なテンプレート）
GITHUB_TOKEN=your_github_token_here
GOOGLE_API_KEY=your_google_api_key_here
SLACK_BOT_TOKEN=your_slack_bot_token_here
```

### ローテーション戦略

```
週次/月次ローテーション推奨フロー:

1. 新しいキーを生成
2. 新旧両方のキーを一時的に有効化
3. システムを新しいキーに更新
4. 古いキーを無効化
5. 古いキーを削除
```

## 2. 権限スコープ設計

### 最小権限の原則

```yaml
# 悪い例（過剰な権限）
scopes:
  - read:all
  - write:all
  - admin:all

# 良い例（必要最小限）
scopes:
  - read:user
  - read:repository
  - write:issue
```

### スコープマッピング

| 操作             | 必要スコープ  | 説明             |
| ---------------- | ------------- | ---------------- |
| ファイル読み取り | `read:files`  | 読み取り専用     |
| ファイル書き込み | `write:files` | 作成・更新       |
| メッセージ送信   | `chat:write`  | チャット送信     |
| ユーザー情報取得 | `users:read`  | プロフィール参照 |

### 権限レベル階層

```
ADMIN (管理者)
  └── WRITE (書き込み)
       └── READ (読み取り)
            └── PUBLIC (公開)
```

## 3. Rate Limiting 設計

### 制限設定チェックリスト

- [ ] API プロバイダーの制限値を確認
- [ ] クライアント側での Rate Limit 実装
- [ ] バックオフ戦略の定義
- [ ] Rate Limit ヘッダーの監視

### 実装パターン

```javascript
const rateLimitConfig = {
  maxRequests: 100, // 最大リクエスト数
  windowMs: 60000, // ウィンドウサイズ（ミリ秒）
  retryAfterMs: 1000, // 基本リトライ間隔
  maxRetries: 3, // 最大リトライ回数
};
```

## 4. 入力検証とサニタイゼーション

### 検証チェックリスト

- [ ] 型チェック（string, number, boolean 等）
- [ ] 長さ制限（minLength, maxLength）
- [ ] 形式検証（regex, format）
- [ ] 範囲チェック（minimum, maximum）
- [ ] 許可値リスト（enum）

### サニタイゼーションパターン

| 脅威                     | 対策               |
| ------------------------ | ------------------ |
| SQL インジェクション     | パラメータ化クエリ |
| XSS                      | HTML エスケープ    |
| パストラバーサル         | パス正規化・検証   |
| コマンドインジェクション | シェルエスケープ   |

### パストラバーサル防止

```javascript
function validatePath(userPath) {
  const normalizedPath = path.normalize(userPath);

  // 親ディレクトリ参照をチェック
  if (normalizedPath.includes("..")) {
    throw new Error("Invalid path: parent directory traversal");
  }

  // 許可されたディレクトリ内かチェック
  const allowedRoot = "/allowed/directory";
  if (!normalizedPath.startsWith(allowedRoot)) {
    throw new Error("Invalid path: outside allowed directory");
  }

  return normalizedPath;
}
```

## 5. セキュリティリスク評価

### 脅威モデリングマトリクス

| 脅威                 | 影響度 | 発生可能性 | リスクレベル | 対策                     |
| -------------------- | ------ | ---------- | ------------ | ------------------------ |
| API Key 漏洩         | 高     | 中         | 高           | 環境変数、ローテーション |
| 過剰権限             | 高     | 高         | 高           | 最小権限の原則           |
| Rate Limit 超過      | 中     | 高         | 中           | バックオフ実装           |
| 入力インジェクション | 高     | 中         | 高           | 入力検証                 |
| 不正アクセス         | 高     | 低         | 中           | IP 制限、監査ログ        |

### リスク評価チェックリスト

- [ ] API Key は環境変数で管理されているか？
- [ ] 権限スコープは必要最小限か？
- [ ] 入力検証は実装されているか？
- [ ] 監査ログは記録されているか？
- [ ] Rate Limiting は適切か？
- [ ] トークン有効期限は適切か？

## 6. 監査ログ設計

### ログ項目

```json
{
  "timestamp": "2025-11-27T10:30:00Z",
  "action": "api_call",
  "tool": "github_create_issue",
  "user_id": "user-123",
  "request_id": "req-abc-xyz",
  "input": {
    "repository": "owner/repo",
    "title": "Issue title"
  },
  "result": "success",
  "duration_ms": 150,
  "ip_address": "192.168.1.1"
}
```

### ログレベル

| レベル | 用途         | 例                            |
| ------ | ------------ | ----------------------------- |
| ERROR  | 失敗・エラー | 認証失敗、権限エラー          |
| WARN   | 警告         | Rate Limit 接近、異常アクセス |
| INFO   | 正常操作     | API 呼び出し成功              |
| DEBUG  | 詳細情報     | リクエスト/レスポンス詳細     |

## 設計時の判断基準

### セキュリティ設計チェックリスト

- [ ] API Key は環境変数またはシークレットマネージャーで管理？
- [ ] 権限スコープは必要最小限に制限？
- [ ] 入力検証とサニタイゼーションは実装？
- [ ] Rate Limiting は適切に設定？
- [ ] 監査ログは記録？
- [ ] トークンローテーション戦略は定義？
- [ ] エラーメッセージは機密情報を含まない？

## リソース参照

詳細なセキュリティパターンについては以下を参照:

- **API Key 管理**: `cat .claude/skills/tool-security/resources/api-key-management.md`
- **権限設計パターン**: `cat .claude/skills/tool-security/resources/permission-patterns.md`
- **入力検証ガイド**: `cat .claude/skills/tool-security/resources/input-validation-guide.md`

## テンプレート参照

- **セキュリティ設定テンプレート**: `cat .claude/skills/tool-security/templates/security-config-template.json`
- **監査ログスキーマ**: `cat .claude/skills/tool-security/templates/audit-log-schema.json`

## スクリプト実行

```bash
# セキュリティ設定検証
node .claude/skills/tool-security/scripts/validate-security-config.mjs <config.json>

# 環境変数チェック
node .claude/skills/tool-security/scripts/check-env-vars.mjs
```

## 関連スキル

| スキル                                         | 用途     |
| ---------------------------------------------- | -------- |
| `.claude/skills/mcp-protocol/SKILL.md`         | MCP 設定 |
| `.claude/skills/api-connector-design/SKILL.md` | API 統合 |
