---
name: .claude/skills/mcp-protocol/SKILL.md
description: |
  Model Context Protocol (MCP) の標準仕様とツール定義パターンに関する専門知識。
  MCPプロトコルの構造、サーバー設定、ツール定義、パラメータスキーマ設計を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/mcp-protocol/resources/config-examples.md`: command/url/stdio接続方式の実例、環境変数マッピング、複数サーバー設定
  - `.claude/skills/mcp-protocol/resources/mcp-specification.md`: プロトコル仕様、ツール定義構造、inputSchema設計、エラーコード体系
  - `.claude/skills/mcp-protocol/resources/troubleshooting.md`: 接続エラー診断、タイムアウト対応、レスポンス形式不正の解決
  - `.claude/skills/mcp-protocol/scripts/validate-mcp-config.mjs`: MCP設定ファイルの自動検証（構文、必須フィールド、環境変数）
  - `.claude/skills/mcp-protocol/scripts/validate-tool-schema.mjs`: ツール定義スキーマの検証（JSON Schema準拠、型安全性）
  - `.claude/skills/mcp-protocol/templates/server-config-template.json`: MCPサーバー設定テンプレート（command/args/env構造）
  - `.claude/skills/mcp-protocol/templates/tool-definition-template.json`: ツール定義テンプレート（name/description/inputSchema）

  使用タイミング:
  - MCPサーバーの新規設定が必要な時
  - ツール定義のYAML/JSON構造を設計する時
  - MCPプロトコル仕様への準拠を確認する時
  - claude_mcp_config.jsonの設計・検証時

version: 1.0.1
tags: [mcp, protocol, tool-definition, configuration]
related_skills:
  - .claude/skills/api-connector-design/SKILL.md
  - .claude/skills/tool-security/SKILL.md
---

# MCP Protocol スキル

## 概要

Model Context Protocol (MCP) は、AI システムが外部ツールやデータソースと標準化された方法で対話するためのプロトコル仕様です。このスキルは、MCP プロトコルの構造、設定方法、ベストプラクティスを提供します。

## コアコンセプト

### 1. MCP アーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude AI     │────▶│   MCP Server    │────▶│  External Tool  │
│  (クライアント)  │◀────│   (プロキシ)     │◀────│  (API/Service)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  MCP Protocol         │  Native Protocol      │
        │  (標準化)             │  (REST/GraphQL等)     │
```

### 2. MCP サーバー定義構造

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@mcp-server/package-name"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

**必須フィールド**:

- `command`: 実行コマンド（npx, node, python 等）
- `args`: コマンド引数

**オプションフィールド**:

- `env`: 環境変数マッピング
- `cwd`: 作業ディレクトリ
- `disabled`: 無効化フラグ

### 3. 接続方式

| 方式        | 説明                    | ユースケース         |
| ----------- | ----------------------- | -------------------- |
| **command** | ローカルプロセス起動    | npx、node、python 等 |
| **url**     | リモート HTTP/WebSocket | クラウドサービス接続 |
| **stdio**   | 標準入出力              | カスタムプロセス     |

### 4. ツール定義仕様

```json
{
  "name": "tool_name",
  "description": "ツールの機能説明",
  "inputSchema": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "パラメータ説明"
      }
    },
    "required": ["param1"]
  }
}
```

## パラメータスキーマ設計

### 型定義

| 型           | JSON Schema         | 例                |
| ------------ | ------------------- | ----------------- |
| 文字列       | `"type": "string"`  | ファイルパス、URL |
| 数値         | `"type": "number"`  | 数量、ID          |
| 真偽値       | `"type": "boolean"` | フラグ            |
| 配列         | `"type": "array"`   | リスト            |
| オブジェクト | `"type": "object"`  | 複合データ        |

### バリデーション制約

```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 100,
  "pattern": "^[a-z]+$",
  "enum": ["option1", "option2"]
}
```

### 必須/任意パラメータ

```json
{
  "properties": {
    "required_param": { "type": "string" },
    "optional_param": { "type": "string", "default": "default_value" }
  },
  "required": ["required_param"]
}
```

## 設計時の判断基準

### MCP サーバー設計チェックリスト

- [ ] サーバー名は kebab-case 命名規則に従っているか？
- [ ] 接続方式（command/url）は適切に選択されているか？
- [ ] 環境変数は安全に管理されているか？
- [ ] タイムアウト設定は適切か？

### ツール定義チェックリスト

- [ ] ツール名はリソース指向で一貫性があるか？
- [ ] 説明文は機能と用途を明確に表現しているか？
- [ ] パラメータスキーマは型安全か？
- [ ] 必須/任意の区別は適切か？
- [ ] デフォルト値は合理的か？

## エラーハンドリング仕様

### エラーコード体系

| コード範囲 | カテゴリ         | 説明               |
| ---------- | ---------------- | ------------------ |
| -32700     | Parse Error      | JSON パースエラー  |
| -32600     | Invalid Request  | リクエスト形式不正 |
| -32601     | Method Not Found | メソッド未定義     |
| -32602     | Invalid Params   | パラメータ不正     |
| -32603     | Internal Error   | 内部エラー         |

### リトライ戦略

```json
{
  "retry": {
    "maxAttempts": 3,
    "backoff": "exponential",
    "initialDelay": 1000,
    "maxDelay": 10000
  }
}
```

## リソース参照

詳細な仕様とパターンについては以下を参照:

- **仕様詳細**: `cat .claude/skills/mcp-protocol/resources/mcp-specification.md`
- **設定例**: `cat .claude/skills/mcp-protocol/resources/config-examples.md`
- **トラブルシューティング**: `cat .claude/skills/mcp-protocol/resources/troubleshooting.md`

## テンプレート参照

- **サーバー設定テンプレート**: `cat .claude/skills/mcp-protocol/templates/server-config-template.json`
- **ツール定義テンプレート**: `cat .claude/skills/mcp-protocol/templates/tool-definition-template.json`

## スクリプト実行

```bash
# MCP設定ファイルの検証
node .claude/skills/mcp-protocol/scripts/validate-mcp-config.mjs <config.json>

# ツール定義スキーマ検証
node .claude/skills/mcp-protocol/scripts/validate-tool-schema.mjs <tool-def.json>
```

## 関連スキル

| スキル                                          | 用途             |
| ----------------------------------------------- | ---------------- |
| `.claude/skills/api-connector-design/SKILL.md`  | API 統合パターン |
| `.claude/skills/tool-security/SKILL.md`         | セキュリティ設定 |
| `.claude/skills/resource-oriented-api/SKILL.md` | リソース設計     |
| `.claude/skills/integration-patterns/SKILL.md`  | 統合パターン     |
