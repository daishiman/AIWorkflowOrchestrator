# コマンド配置オプション

## 3つの配置場所

### 1. プロジェクトコマンド
**場所**: `.claude/commands/`
**スコープ**: プロジェクト固有
**用途**: チーム共有、プロジェクト特化

```bash
.claude/commands/
├── deploy.md
├── test.md
└── review.md
```

### 2. ユーザーコマンド
**場所**: `~/.claude/commands/`
**スコープ**: 全プロジェクト共通
**用途**: 個人用、汎用ツール

```bash
~/.claude/commands/
├── commit.md
├── note.md
└── search.md
```

### 3. MCPプロンプト
**場所**: MCP server prompts
**スコープ**: MCP server提供
**用途**: サーバー機能統合

## 選択基準

| 条件 | 配置 |
|------|------|
| プロジェクト固有のワークフロー | `.claude/commands/` |
| チームで共有すべきコマンド | `.claude/commands/` |
| 個人的なユーティリティ | `~/.claude/commands/` |
| 全プロジェクトで使うコマンド | `~/.claude/commands/` |
| MCP server機能 | MCP prompts |

## ベストプラクティス

✓ **プロジェクト**: プロジェクト特化の自動化
✓ **ユーザー**: 汎用的な個人ツール
✓ **バージョン管理**: プロジェクトコマンドはGit管理
✗ **混在禁止**: 同じコマンドを両方に置かない
