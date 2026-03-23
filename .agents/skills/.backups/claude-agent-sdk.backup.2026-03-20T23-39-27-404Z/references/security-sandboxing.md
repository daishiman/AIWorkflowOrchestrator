# セキュリティとサンドボックス リファレンス

## サンドボックス概要

Claude Agent SDKはサンドボックス機能を提供し、ファイルシステムとネットワークの分離を実現。Anthropicの内部使用では、サンドボックスにより**権限プロンプトが84%削減**された。

---

## ファイルシステム分離

### デフォルト動作

- 現在の作業ディレクトリとそのサブディレクトリへの読み書きを許可
- 明示的な許可なしに作業ディレクトリ外のファイル変更をブロック

### 危険なパス（書き込み禁止推奨）

| カテゴリ               | パス例                           |
| ---------------------- | -------------------------------- |
| 実行可能ファイル       | `$PATH`内のディレクトリ          |
| システム設定           | `/etc/**`, `/usr/**`             |
| シェル設定             | `.bashrc`, `.zshrc`, `.profile`  |
| SSH鍵                  | `~/.ssh/**`                      |
| 認証情報               | `~/.aws/**`, `~/.gcloud/**`      |

### 推奨Permission Rules

```typescript
const options: Options = {
  permissions: {
    deny: [
      { tool: "Write", paths: ["/etc/**", "/usr/**", "/var/**"] },
      { tool: "Write", paths: ["**/.bashrc", "**/.zshrc", "**/.profile"] },
      { tool: "Write", paths: ["**/.ssh/**"] },
      { tool: "Write", paths: ["**/.aws/**", "**/.gcloud/**"] },
    ],
  },
};
```

---

## ネットワーク分離

ネットワーク分離により、承認されたサーバーへの接続のみを許可。

### 効果

- プロンプトインジェクションによる機密情報漏洩を防止
- マルウェアのダウンロードを防止
- 不正なデータ送信をブロック

### 実装例

```typescript
const options: Options = {
  // ネットワークアクセスを制限
  networkAllowlist: [
    "api.anthropic.com",
    "github.com",
    "registry.npmjs.org",
  ],
};
```

---

## 静的解析

Bashコマンド実行前に静的解析を実行:

### 検出対象

- システムファイルを変更するコマンド
- 機密ディレクトリへのアクセス
- 危険な操作（rm -rf, sudo, chmod 777等）

### 実装例

```typescript
const dangerousPatterns = [
  "rm -rf",
  "sudo",
  "chmod 777",
  "> /dev/",
  "mkfs",
  "dd if=",
  ":(){ :|:& };:", // fork bomb
  "curl | bash",
  "wget | sh",
];

function shouldBlockCommand(command: string): boolean {
  return dangerousPatterns.some((pattern) => command.includes(pattern));
}
```

---

## ホスティングとセキュアデプロイ

### コンテナサンドボックス

本番環境では、SDKをサンドボックス化されたコンテナ環境内で実行することを推奨:

| 機能               | 説明                                   |
| ------------------ | -------------------------------------- |
| プロセス分離       | エージェントプロセスの隔離             |
| リソース制限       | CPU/メモリ使用量の制限                 |
| ネットワーク制御   | 承認されたエンドポイントのみアクセス可 |
| エフェメラルFS     | 一時的なファイルシステム               |

### Docker構成例

```dockerfile
FROM node:20-slim

# 非rootユーザーで実行
RUN useradd -m agent
USER agent

WORKDIR /app
COPY --chown=agent:agent . .

# リソース制限付きで実行
CMD ["node", "agent.js"]
```

```yaml
# docker-compose.yml
services:
  agent:
    build: .
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
    read_only: true
    tmpfs:
      - /tmp
    networks:
      - restricted
```

---

## セキュリティベストプラクティス

### deny-allから開始

```
deny-all から開始
    ↓
必要なコマンド・ディレクトリのみをホワイトリスト化
    ↓
機密操作（git push, インフラ変更）には明示的な確認を要求
    ↓
危険コマンド（rm -rf, sudo）をブロック
```

### 実装例

```typescript
const options: Options = {
  permissionMode: "deny", // deny-all から開始

  permissions: {
    // 必要な操作のみ許可
    allow: [
      { tool: "Read", paths: ["/project/**"] },
      { tool: "Grep" },
      { tool: "Glob" },
    ],

    // 機密操作は確認
    ask: [
      { tool: "Write", paths: ["/project/**"] },
      { tool: "Edit", paths: ["/project/**"] },
      { tool: "Bash", commands: ["git push"] },
    ],

    // 危険操作は拒否
    deny: [
      { tool: "Bash", commands: ["rm -rf", "sudo", "chmod 777"] },
      { tool: "Write", paths: ["/etc/**", "/usr/**"] },
    ],
  },
};
```

---

## エンタープライズ考慮事項

| 課題               | 対策                                   |
| ------------------ | -------------------------------------- |
| クレデンシャル散在 | 集中管理されたシークレットストアを使用 |
| 可視性ゼロ         | ツールアクセスのログと監査を実装       |
| アクセス制御ギャップ | ロールベースの権限を実装             |
| MCP認証            | 認証付きMCPサーバーを使用             |

### 監査ログ実装

```typescript
const options: Options = {
  hooks: {
    PostToolUse: async (input, toolUseID, { signal }) => {
      // 監査ログを記録
      await auditLog.record({
        timestamp: new Date().toISOString(),
        toolName: input.toolName,
        args: sanitizeArgs(input.args),
        userId: getCurrentUser(),
        sessionId: getCurrentSession(),
      });
      return {};
    },
  },
};
```

---

## Main Process セキュリティ

| 項目                 | 推奨設定                          |
| -------------------- | --------------------------------- |
| APIキー管理          | Electron SafeStorageで暗号化保存  |
| ファイルアクセス     | プロジェクトディレクトリに制限    |
| コマンド実行         | 危険パターンをPreToolUseでブロック |
| IPC通信              | 入力バリデーション必須            |

### SafeStorage使用例

```typescript
import { safeStorage } from "electron";

// APIキーを暗号化して保存
function saveApiKey(apiKey: string): void {
  const encrypted = safeStorage.encryptString(apiKey);
  fs.writeFileSync(apiKeyPath, encrypted);
}

// APIキーを復号して取得
function getApiKey(): string {
  const encrypted = fs.readFileSync(apiKeyPath);
  return safeStorage.decryptString(encrypted);
}
```

---

## 公式デモアプリケーション

公式デモは開発環境向け。本番デプロイや大規模使用は非推奨。

| デモ名          | 説明                                                 |
| --------------- | ---------------------------------------------------- |
| Getting Started | SDK基本の理解のためのシンプルな入門例                |
| Excel Demo      | AI搭載スプレッドシート作成・分析（Electron）         |
| Research Agent  | トピック調査と包括的レポート生成のマルチエージェント |
| Email Agent     | AI搭載メール管理のデモクライアント                   |

**リポジトリ:** https://github.com/anthropics/claude-agent-sdk-demos

---

## 公式ドキュメント

| ドキュメント         | URL                                                           |
| -------------------- | ------------------------------------------------------------- |
| セキュアデプロイ     | https://platform.claude.com/docs/en/agent-sdk/secure-deployment |
| ホスティング         | https://platform.claude.com/docs/en/agent-sdk/hosting         |
| サンドボックス       | https://code.claude.com/docs/en/sandboxing                    |

---

## 関連ドキュメント

- [permission-control.md](./permission-control.md) - Permission Control
- [hooks-system.md](./hooks-system.md) - Hooksシステム
- [mcp-integration.md](./mcp-integration.md) - MCP統合
