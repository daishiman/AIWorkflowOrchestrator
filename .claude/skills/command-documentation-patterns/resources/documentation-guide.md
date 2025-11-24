# ドキュメンテーションガイド

## 自己文書化構造

```markdown
---
description: Clear explanation of what command does
argument-hint: "[required] [optional]"
---

# command-name

## Purpose
Brief explanation

## Usage
/command-name [args]

## Examples
/command-name example1
/command-name example2

## Steps
Clear step descriptions
```

## description の書き方

```yaml
# ❌ 悪い例
description: Do things

# ✅ 良い例
description: Create React component with TypeScript and tests

# ✅ さらに良い例（キーワードrich）
description: Create React component with TypeScript, tests, and Storybook stories
```

## コメントの配置

```markdown
## Step 1: Validation
# 入力の妥当性を確認
Check if component exists
Validate naming conventions

## Step 2: Generation
# テンプレートからファイルを生成
Create component.tsx from template
Create test.spec.tsx from template
```

**原則**: 自明でないロジックのみコメント

## 例の提供

```markdown
## Examples

### Basic usage
/create-component Button

### With options
/create-component Button --with-stories

### Multiple components
/create-component Modal Dialog Tooltip
```

## トラブルシューティング

```markdown
## Common Issues

### "Component already exists"
Solution: Use --force flag to overwrite

### "Invalid name format"
Solution: Use PascalCase (e.g., MyComponent)
```
