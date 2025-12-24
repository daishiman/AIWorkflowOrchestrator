---
name: .claude/skills/mcp-protocol/SKILL.md
description: |
  Model Context Protocol (MCP) の標準仕様とツール定義パターンに関する専門知識。
  MCPプロトコルの構造、サーバー設定、ツール定義、パラメータスキーマ設計を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/config-examples.md`: command/url/stdio接続方式の実例、環境変数マッピング、複数サーバー設定
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/mcp-specification.md`: プロトコル仕様、ツール定義構造、inputSchema設計、エラーコード体系
  - `resources/troubleshooting.md`: 接続エラー診断、タイムアウト対応、レスポンス形式不正の解決
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-mcp-config.mjs`: MCP設定ファイルの自動検証（構文、必須フィールド、環境変数）
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-tool-schema.mjs`: ツール定義スキーマの検証（JSON Schema準拠、型安全性）
  - `templates/server-config-template.json`: MCPサーバー設定テンプレート（command/args/env構造）
  - `templates/tool-definition-template.json`: ツール定義テンプレート（name/description/inputSchema）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling mcp protocol tasks.
version: 1.0.1
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# MCP Protocol スキル

## 概要

Model Context Protocol (MCP) の標準仕様とツール定義パターンに関する専門知識。
MCPプロトコルの構造、サーバー設定、ツール定義、パラメータスキーマ設計を提供します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- MCPサーバーの新規設定が必要な時
- ツール定義のYAML/JSON構造を設計する時
- MCPプロトコル仕様への準拠を確認する時
- claude_mcp_config.jsonの設計・検証時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/mcp-protocol/resources/Level1_basics.md
cat .claude/skills/mcp-protocol/resources/Level2_intermediate.md
cat .claude/skills/mcp-protocol/resources/Level3_advanced.md
cat .claude/skills/mcp-protocol/resources/Level4_expert.md
cat .claude/skills/mcp-protocol/resources/config-examples.md
cat .claude/skills/mcp-protocol/resources/legacy-skill.md
cat .claude/skills/mcp-protocol/resources/mcp-specification.md
cat .claude/skills/mcp-protocol/resources/troubleshooting.md
```

### スクリプト実行
```bash
node .claude/skills/mcp-protocol/scripts/log_usage.mjs --help
node .claude/skills/mcp-protocol/scripts/validate-mcp-config.mjs --help
node .claude/skills/mcp-protocol/scripts/validate-skill.mjs --help
node .claude/skills/mcp-protocol/scripts/validate-tool-schema.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/mcp-protocol/templates/server-config-template.json
cat .claude/skills/mcp-protocol/templates/tool-definition-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.1 | 2025-12-24 | Spec alignment and required artifacts added |
