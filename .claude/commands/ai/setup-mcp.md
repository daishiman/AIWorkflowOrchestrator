---
description: |
  MCPサーバーの統合設定を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/mcp-integrator.md`: MCPサーバー統合専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [mcp-server-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: mcp, mcp server, tool integration, context7, sequential, playwright, ツール統合
argument-hint: "[mcp-server-name]"
allowed-tools:
  - Task
model: sonnet
---

# MCP Server Integration

## 目的

`.claude/commands/ai/setup-mcp.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: MCPサーバー統合専門エージェントの実行

**目的**: MCPサーバー統合専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: MCPサーバー統合専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/mcp-integrator.md`

Task ツールで `.claude/agents/mcp-integrator.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[mcp-server-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/mcp/`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-mcp [mcp-server-name]
```
