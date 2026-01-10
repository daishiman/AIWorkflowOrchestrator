# ユーザー明示起動

## 基本構文

```bash
# 引数なし
/command-name

# 引数あり
/command-name arg1 arg2

# 複数ワード引数（スペース含む）
/command-name "multi word argument"
```

## $ARGUMENTS の動作

```markdown
# コマンド定義

Target: $ARGUMENTS
```

```bash
# 起動例
/deploy staging feature-x

# $ARGUMENTS の値
"staging feature-x"
```

## 位置引数

```markdown
# コマンド定義

Environment: $1
Feature: $2
```

```bash
# 起動例
/deploy staging feature-x

# 値
$1 = "staging"
$2 = "feature-x"
```

## デフォルト値

```markdown
Target: $ARGUMENTS (default: main)
```

引数なし起動時は "main" が使用される。

## ベストプラクティス

1. **argument-hint**: 引数の説明を追加

```yaml
argument-hint: "[environment] [feature-name]"
```

2. **バリデーション**: 引数の検証

```markdown
If $1 not in ["dev", "staging", "prod"]:
Display error
Exit
```
