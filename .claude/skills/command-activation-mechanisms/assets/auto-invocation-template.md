# 自動起動テンプレート

## SlashCommand Tool最適化

```markdown
---
description: Create Git commit with conventional message format (feat, fix, chore, docs)
argument-hint: "[type] [scope] [message]"
---

# Commit

Type: $1 (default: feat)
Scope: $2 (optional)
Message: $3 or $ARGUMENTS

## Generate Commit Message

Format: type(scope): message

## Create Commit

Execute: git commit -m "[message]"
```

## キーワードrich version

```markdown
---
description: |
  Generate and create Git commit with conventional commit format.
  Supports: feat (feature), fix (bug), chore, docs, refactor, test.
  Automatically stages changes and creates commit.
---
```

## 自動起動されやすくするポイント

1. **一般的な動詞**: create, generate, deploy, test, analyze
2. **具体的な目的語**: commit, component, API, test
3. **キーワード列挙**: 括弧内に関連語を列挙
