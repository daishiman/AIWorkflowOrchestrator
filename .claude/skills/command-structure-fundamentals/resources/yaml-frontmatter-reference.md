# YAML Frontmatter リファレンス

## 必須フィールド

### description
```yaml
description: Create Git commit with conventional format
```
- **用途**: コマンドの説明（SlashCommand Tool検索に使用）
- **推奨**: 1-2文、具体的な動詞+目的語+キーワード

## オプションフィールド

### argument-hint
```yaml
argument-hint: "[type] [message]"
```
- **用途**: 引数の説明をユーザーに提示
- **推奨**: 簡潔な構文説明

### model
```yaml
model: haiku  # または sonnet, opus
```
- **用途**: 使用するモデルを指定
- **デフォルト**: sonnet
- **推奨**: 単純タスクはhaiku

### allowed-tools
```yaml
allowed-tools:
  - Read
  - Write
  - Bash
```
- **用途**: 使用可能なツールを制限
- **セキュリティ**: 破壊的操作の制限

### disable-model-invocation
```yaml
disable-model-invocation: true
```
- **用途**: モデル呼び出しを無効化（静的コマンド）
- **使用場面**: テンプレート展開のみのコマンド
