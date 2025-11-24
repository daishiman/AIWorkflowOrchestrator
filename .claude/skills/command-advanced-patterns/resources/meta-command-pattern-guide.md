# メタコマンドパターン

## 概要

メタコマンド：コマンド自身を管理するコマンド。コマンドの一覧表示、検索、実行、管理を行う。

## 基本構造

```markdown
---
description: Manage and discover commands
---

# Command Manager

Action: $ARGUMENTS

## List All Commands
Scan `.claude/commands/` directory
Display: name, description, usage

## Search Commands
If $ARGUMENTS provided:
  Filter by keyword in name/description
  Display matches

## Execute Command
If $ARGUMENTS is command name:
  Execute: `/$ARGUMENTS`
```

## 実装例

```markdown
---
description: Search and manage project commands
---

# cmd

Query: $ARGUMENTS

## No Arguments: List All
Scan `.claude/commands/*.md`
Parse YAML frontmatter
Display table:
| Command | Description | Args |

## With Arguments: Search
Filter commands matching $ARGUMENTS
Display matches with usage examples

## Special: Help
If $ARGUMENTS == "help":
  Display command syntax guide
  Show examples
```

## ユースケース

1. **コマンド発見**: `/cmd search test` → テスト関連コマンド一覧
2. **使用法確認**: `/cmd commit` → commitコマンドの詳細
3. **カテゴリ一覧**: `/cmd list --category deploy`

## ベストプラクティス

- description を検索可能にする（明確なキーワード）
- カテゴリやタグでフィルタリング機能
- 使用頻度の追跡と表示
