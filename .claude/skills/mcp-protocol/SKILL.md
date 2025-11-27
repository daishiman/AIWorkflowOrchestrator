---
name: mcp-protocol
description: |
  Model Context Protocol (MCP) の標準仕様とツール定義パターンに関する専門知識。
  MCPプロトコルの構造、サーバー設定、ツール定義、パラメータスキーマ設計を提供します。

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

Model Context Protocol (MCP) は、AIシステムが外部ツールやデータソースと標準化された方法で対話するためのプロトコル仕様です。このスキルは、MCPプロトコルの構造、設定方法、ベストプラクティスを提供します。

## コアコンセプト

### 1. MCPアーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude AI     │────▶│   MCP Server    │────▶│  External Tool  │
│  (クライアント)  │◀────│   (プロキシ)     │◀────│  (API/Service)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  MCP Protocol         │  Native Protocol      │
        │  (標準化)             │  (REST/GraphQL等)     │
```

### 2. MCPサーバー定義構造

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
- `command`: 実行コマンド（npx, node, python等）
- `args`: コマンド引数

**オプションフィールド**:
- `env`: 環境変数マッピング
- `cwd`: 作業ディレクトリ
- `disabled`: 無効化フラグ

### 3. 接続方式

| 方式 | 説明 | ユースケース |
|-----|------|-------------|
| **command** | ローカルプロセス起動 | npx、node、python等 |
| **url** | リモートHTTP/WebSocket | クラウドサービス接続 |
| **stdio** | 標準入出力 | カスタムプロセス |

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

| 型 | JSON Schema | 例 |
|---|-------------|---|
| 文字列 | `"type": "string"` | ファイルパス、URL |
| 数値 | `"type": "number"` | 数量、ID |
| 真偽値 | `"type": "boolean"` | フラグ |
| 配列 | `"type": "array"` | リスト |
| オブジェクト | `"type": "object"` | 複合データ |

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

### MCPサーバー設計チェックリスト

- [ ] サーバー名はkebab-case命名規則に従っているか？
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

| コード範囲 | カテゴリ | 説明 |
|-----------|---------|------|
| -32700 | Parse Error | JSONパースエラー |
| -32600 | Invalid Request | リクエスト形式不正 |
| -32601 | Method Not Found | メソッド未定義 |
| -32602 | Invalid Params | パラメータ不正 |
| -32603 | Internal Error | 内部エラー |

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

| スキル | 用途 |
|-------|------|
| `.claude/skills/api-connector-design/SKILL.md` | API統合パターン |
| `.claude/skills/tool-security/SKILL.md` | セキュリティ設定 |
| `.claude/skills/resource-oriented-api/SKILL.md` | リソース設計 |
| `.claude/skills/integration-patterns/SKILL.md` | 統合パターン |
