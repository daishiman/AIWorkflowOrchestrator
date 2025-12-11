# 引数システムリファレンス

## $ARGUMENTS

```markdown
Target: $ARGUMENTS
```

すべての引数を1つの文字列として受け取る。

**起動例**:

```bash
/deploy staging feature-x
# $ARGUMENTS = "staging feature-x"
```

## 位置引数 ($1, $2, ...)

```markdown
Environment: $1
Feature: $2
```

**起動例**:

```bash
/deploy staging feature-x
# $1 = "staging"
# $2 = "feature-x"
```

## デフォルト値

```markdown
Environment: $1 (default: dev)
```

引数なし → "dev" が使用される

## バリデーション

```markdown
## Validation

If $1 not in ["dev", "staging", "prod"]:
Error: "Invalid environment"
Exit
```

## ベストプラクティス

- argument-hint で構文を明示
- デフォルト値を提供
- バリデーションで早期エラー検出
