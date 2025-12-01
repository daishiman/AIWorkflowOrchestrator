---
description: |
  MCPサーバーの統合設定を行う専門コマンド。

  🤖 起動エージェント:
  - `.claude/agents/mcp-integrator.md`: MCPサーバー統合専門エージェント

  📚 利用可能スキル（mcp-integratorエージェントが参照）:
  - `.claude/skills/mcp-protocol/SKILL.md` - MCP仕様、ツール/リソース/プロンプト定義
  - `.claude/skills/tool-security/SKILL.md` - ツール権限、セキュリティ設計
  - `.claude/skills/json-schema-validation/SKILL.md` - MCPサーバー設定検証
  - `.claude/skills/process-management/SKILL.md` - MCPサーバープロセス管理

  ⚙️ このコマンドの設定:
  - argument-hint: "[mcp-server-name]"（必須: context7/sequential-thinking/playwright等）
  - allowed-tools: mcp-integratorエージェント起動と最小限の確認用
    • Task: mcp-integratorエージェント起動用
    • Read: 既存MCP設定確認用
    • Edit: claude_mcp_config.json編集用
    • Write: 設定ファイル生成用
  - model: sonnet（標準的なMCP設定タスク）

  📋 成果物:
  - `claude_mcp_config.json`（MCPサーバー設定追加/更新）
  - `.env.example`（必要な環境変数追加）
  - ドキュメント（`.claude/docs/mcp/[server-name].md`）

  🎯 対応MCPサーバー:
  - context7: ライブラリドキュメンテーション検索
  - sequential-thinking: 多段階推論エンジン
  - playwright: ブラウザ自動化・E2Eテスト
  - desktop-commander: ローカルファイルシステム操作
  - その他: カスタムMCPサーバー

  トリガーキーワード: mcp, mcp server, tool integration, context7, sequential, playwright, ツール統合
argument-hint: "[mcp-server-name]"
allowed-tools:
  - Task
  - Read
  - Edit
  - Write
model: sonnet
---

# MCP Server Integration

このコマンドは、MCPサーバーの統合設定を行います。

## 📋 実行フロー

### Phase 1: MCPサーバー名の確認

**引数確認**:
```bash
# MCPサーバー名が指定されている場合
mcp-server-name: "$ARGUMENTS"（例: context7, sequential-thinking, playwright）

# 未指定の場合
エラー: MCPサーバー名は必須です
使用例: /ai:setup-mcp context7
```

### Phase 2: mcp-integratorエージェントを起動

**使用エージェント**: `.claude/agents/mcp-integrator.md`

**エージェントへの依頼内容**:
```markdown
MCPサーバー「${mcp-server-name}」の統合設定を行ってください。

**要件**:
1. MCPサーバー情報の収集:
   - サーバー種別（npx package、custom command、Docker container）
   - 必要な環境変数（API キー、認証情報等）
   - 提供するツール・リソース・プロンプト一覧
   - セキュリティ要件（permissions、sandbox設定）

2. claude_mcp_config.json への設定追加:
   - 既存設定の保持（マージ処理）
   - サーバー起動コマンド設定
   - 環境変数マッピング
   - タイムアウト・リトライ設定

3. 環境変数設定:
   - .env.example への追加（機密情報はプレースホルダー）
   - 必要な環境変数の一覧と説明

4. ドキュメント生成:
   - 使用方法ガイド（`.claude/docs/mcp/[server-name].md`）
   - 提供ツール一覧と使用例
   - トラブルシューティング

**スキル参照**:
- `.claude/skills/mcp-protocol/SKILL.md`: MCP仕様、設定形式
- `.claude/skills/tool-security/SKILL.md`: ツール権限設計
- `.claude/skills/json-schema-validation/SKILL.md`: 設定ファイル検証
- `.claude/skills/process-management/SKILL.md`: プロセス管理

**成果物**:
- `claude_mcp_config.json`（MCPサーバー設定、既存設定保持）
- `.env.example`（環境変数追加）
- `.claude/docs/mcp/${mcp-server-name}.md`（使用ガイド）

**品質基準**:
- JSON構文の正確性
- 既存設定の保持（マージ処理、上書き禁止）
- セキュリティ（API キーの環境変数化、パス検証）
- ドキュメンテーション（使用例、トラブルシューティング）
```

### Phase 3: 検証と完了

**検証内容**:
1. claude_mcp_config.json 構文チェック
2. 環境変数の存在確認
3. MCPサーバー起動テスト（オプション）
4. ツール一覧の取得確認

**完了報告**:
- 設定されたMCPサーバー名
- 提供されるツール一覧
- 必要な環境変数一覧
- 使用方法とテスト手順

## 使用例

### Context7（ライブラリドキュメンテーション）

```bash
/ai:setup-mcp context7
```

**設定内容**:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upshift/mcp-server-context7@latest"]
    }
  }
}
```

**環境変数**: 不要

### Sequential Thinking（多段階推論）

```bash
/ai:setup-mcp sequential-thinking
```

**設定内容**:
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**環境変数**: 不要

### Playwright（ブラウザ自動化）

```bash
/ai:setup-mcp playwright
```

**設定内容**:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium"
      }
    }
  }
}
```

**環境変数**:
```bash
# .env.example に追加
PLAYWRIGHT_BROWSER=chromium  # chromium | firefox | webkit
```

## 対応MCPサーバー

### 公式MCPサーバー

| サーバー名 | 説明 | 環境変数 |
|-----------|------|----------|
| **context7** | ライブラリドキュメンテーション検索 | 不要 |
| **sequential-thinking** | 多段階推論エンジン | 不要 |
| **playwright** | ブラウザ自動化・E2Eテスト | PLAYWRIGHT_BROWSER（オプション） |
| **brave-search** | Brave Search API統合 | BRAVE_API_KEY（必須） |
| **github** | GitHub API統合 | GITHUB_PERSONAL_ACCESS_TOKEN（必須） |

### カスタムMCPサーバー

カスタムMCPサーバーも設定可能:
```bash
/ai:setup-mcp custom-server
```

対話的に以下を収集:
- 起動コマンド（npx、node、custom script）
- 環境変数
- セキュリティ設定

## トラブルシューティング

### MCPサーバーが起動しない

**原因**: 環境変数が設定されていない

**解決策**:
```bash
# 必要な環境変数を確認
cat .claude/docs/mcp/[server-name].md

# 環境変数を設定
cp .env.example .env
# .env を編集してAPI キー等を追加
```

### JSON構文エラー

**原因**: claude_mcp_config.json のフォーマット不正

**解決策**:
```bash
# JSONフォーマット検証
cat claude_mcp_config.json | jq .

# 自動修正
cat claude_mcp_config.json | jq . > claude_mcp_config.json.tmp
mv claude_mcp_config.json.tmp claude_mcp_config.json
```

### ツールが認識されない

**原因**: MCPサーバーが正常に起動していない

**解決策**:
1. Claude Codeを再起動
2. MCPサーバーログを確認
3. 環境変数が正しく設定されているか確認

### 既存設定が上書きされた

**原因**: mcp-integrator のマージ処理ミス

**解決策**:
1. Git履歴から claude_mcp_config.json を復元
2. 手動で設定をマージ
3. mcp-integrator エージェントのバグ報告

## セキュリティベストプラクティス

### API キーの管理

```bash
# ✅ 正しい: 環境変数使用
{
  "env": {
    "BRAVE_API_KEY": "$BRAVE_API_KEY"
  }
}

# ❌ 間違い: ハードコード
{
  "env": {
    "BRAVE_API_KEY": "BSAxxxxxxxxxxx"  # 禁止
  }
}
```

### ツール権限の制限

MCPサーバーが提供するツールに対して、必要最小限の権限のみ付与:
- Read系ツールのみ: 分析・検索用途
- Write系ツール: 明示的な承認必要
- Bash系ツール: サンドボックス環境のみ

## 参照

- mcp-integrator エージェント: `.claude/agents/mcp-integrator.md`
- mcp-protocol スキル: `.claude/skills/mcp-protocol/SKILL.md`
- tool-security スキル: `.claude/skills/tool-security/SKILL.md`
- 公式MCPサーバー一覧: https://modelcontextprotocol.io/servers
