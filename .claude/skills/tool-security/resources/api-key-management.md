# API Key 管理ガイド

## 1. 安全な保存方法

### シークレットマネージャー（推奨）

#### AWS Secrets Manager

```javascript
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

async function getSecret(secretName) {
  const client = new SecretsManagerClient({ region: 'ap-northeast-1' });
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return JSON.parse(response.SecretString);
}

// 使用例
const secrets = await getSecret('prod/api-keys');
const apiKey = secrets.GITHUB_TOKEN;
```

#### HashiCorp Vault

```javascript
const vault = require('node-vault')({
  endpoint: 'https://vault.example.com:8200',
  token: process.env.VAULT_TOKEN
});

async function getSecret(path) {
  const result = await vault.read(path);
  return result.data;
}

// 使用例
const secrets = await getSecret('secret/api-keys');
```

### 環境変数（サーバーサイド）

#### Node.js での読み込み

```javascript
// dotenv を使用
require('dotenv').config();

const config = {
  githubToken: process.env.GITHUB_TOKEN,
  googleApiKey: process.env.GOOGLE_API_KEY,
  slackBotToken: process.env.SLACK_BOT_TOKEN
};

// 必須環境変数のチェック
const requiredEnvVars = ['GITHUB_TOKEN', 'GOOGLE_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

#### Docker での設定

```dockerfile
# 環境変数ファイルを使用（本番）
docker run --env-file .env.prod app

# シークレットを使用（Docker Swarm）
docker secret create github_token ./github_token.txt
docker service create --secret github_token app
```

#### Kubernetes での設定

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-keys
type: Opaque
data:
  GITHUB_TOKEN: Z2hwX3h4eHh4eHh4eA==  # base64エンコード
  GOOGLE_API_KEY: QUl6YXh4eHh4eHg=
---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    envFrom:
    - secretRef:
        name: api-keys
```

## 2. 漏洩防止対策

### .gitignore 設定

```gitignore
# 環境変数ファイル
.env
.env.local
.env.*.local
.env.production

# API Key ファイル
*.key
*.pem
credentials.json
service-account.json

# IDE/エディタ設定
.vscode/settings.json
.idea/
```

### pre-commit フック

```bash
#!/bin/bash
# .git/hooks/pre-commit

# APIキーパターンを検出
patterns=(
  'ghp_[a-zA-Z0-9]{36}'           # GitHub Personal Access Token
  'xoxb-[0-9]+-[a-zA-Z0-9]+'      # Slack Bot Token
  'AIza[a-zA-Z0-9_-]{35}'         # Google API Key
  'sk-[a-zA-Z0-9]{48}'            # OpenAI API Key
)

for pattern in "${patterns[@]}"; do
  if git diff --cached --diff-filter=ACMR | grep -qE "$pattern"; then
    echo "ERROR: Potential API key detected in staged files"
    echo "Pattern: $pattern"
    exit 1
  fi
done
```

### git-secrets 使用

```bash
# インストール
brew install git-secrets

# リポジトリに設定
git secrets --install
git secrets --register-aws

# カスタムパターン追加
git secrets --add 'ghp_[a-zA-Z0-9]{36}'
git secrets --add 'xoxb-[0-9]+-[a-zA-Z0-9]+'
```

## 3. ローテーション戦略

### 自動ローテーションフロー

```
┌─────────────────────────────────────────────────────┐
│                  ローテーションサイクル              │
├─────────────────────────────────────────────────────┤
│                                                      │
│   1. 新キー生成    ────────▶   2. 並行稼働          │
│   (API/CLI)                    (新旧両方有効)        │
│                                                      │
│         ▲                            │              │
│         │                            ▼              │
│                                                      │
│   4. 旧キー削除    ◀────────   3. 移行完了          │
│   (30日後)                     (新キーのみ使用)      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### ローテーションスクリプト例

```javascript
class KeyRotation {
  constructor(secretManager, serviceName) {
    this.secretManager = secretManager;
    this.serviceName = serviceName;
  }

  async rotate() {
    // 1. 新しいキーを生成
    const newKey = await this.generateNewKey();

    // 2. シークレットマネージャーを更新（バージョニング）
    await this.secretManager.update(this.serviceName, {
      currentKey: newKey,
      previousKey: await this.getCurrentKey(),
      rotatedAt: new Date().toISOString()
    });

    // 3. アプリケーションに通知（必要に応じて）
    await this.notifyApplications();

    // 4. 古いキーを無効化（待機期間後）
    setTimeout(async () => {
      await this.revokeOldKey();
    }, 30 * 24 * 60 * 60 * 1000); // 30日後
  }

  async getCurrentKey() {
    const secret = await this.secretManager.get(this.serviceName);
    return secret.currentKey;
  }

  async generateNewKey() {
    // APIプロバイダーによって異なる実装
    throw new Error('Must be implemented by subclass');
  }
}
```

## 4. 緊急対応手順

### キー漏洩時の対応

```
1. 即座の対応（0-15分）
   ├── 漏洩したキーを無効化
   ├── 新しいキーを生成
   └── システムを新キーで更新

2. 影響調査（15-60分）
   ├── アクセスログの確認
   ├── 不正使用の検出
   └── 影響範囲の特定

3. 事後対応（1-24時間）
   ├── インシデントレポート作成
   ├── 再発防止策の実施
   └── 関係者への通知
```

### 緊急連絡先テンプレート

```yaml
incident_response:
  primary_contact:
    name: "Security Team Lead"
    email: "security@example.com"
    phone: "+81-XXX-XXXX-XXXX"

  escalation:
    - level: 1
      contact: "On-call Engineer"
      response_time: "15 minutes"
    - level: 2
      contact: "Security Manager"
      response_time: "1 hour"
    - level: 3
      contact: "CTO"
      response_time: "4 hours"

  external_contacts:
    github:
      url: "https://support.github.com"
      action: "Revoke compromised token"
    google:
      url: "https://console.cloud.google.com"
      action: "Delete API key"
```

## 5. 監査とコンプライアンス

### キー使用ログ

```json
{
  "timestamp": "2025-11-27T10:30:00Z",
  "key_id": "key_xxxxx",
  "service": "github",
  "action": "api_call",
  "endpoint": "/repos/owner/repo/issues",
  "ip_address": "192.168.1.100",
  "user_agent": "MyApp/1.0",
  "response_status": 200
}
```

### 定期監査チェックリスト

- [ ] 未使用のキーを特定・削除
- [ ] 権限スコープの見直し
- [ ] アクセスパターンの異常検出
- [ ] ローテーション状況の確認
- [ ] 漏洩スキャンの実行
