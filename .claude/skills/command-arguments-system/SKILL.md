---
name: command-arguments-system
description: |
  コマンド引数システム（$ARGUMENTS、位置引数）を専門とするスキル。
  引数の渡し方、検証、デフォルト値、エラーメッセージ設計を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/command-arguments-system/resources/arguments-reference.md`: コマンド引数システム完全リファレンス
  - `.claude/skills/command-arguments-system/templates/command-with-args.md`: 引数付きコマンドテンプレート
  - `.claude/skills/command-arguments-system/scripts/validate-arguments.mjs`: $ARGUMENTS・位置引数($1,$2...)・argument-hint整合性・引数検証ロジックの自動検証

  使用タイミング:
  - コマンドに引数を追加する時
  - 引数検証ロジックを実装する時
  - デフォルト値やエラーメッセージを設計する時

  Use proactively when adding command arguments, implementing validation logic,
  or designing default values and error messages.
version: 1.0.0
---

# Command Arguments System

## 概要

このスキルは、Claude Codeコマンドの引数システムを提供します。
`$ARGUMENTS`、位置引数（`$1`, `$2`, ...）の使用方法、検証、デフォルト値、
親切なエラーメッセージの設計により、ユーザーフレンドリーなコマンドを作成できます。

**主要な価値**:

- $ARGUMENTS と位置引数の完全理解
- 堅牢な引数検証の実装
- デフォルト値の適切な提供
- わかりやすいエラーメッセージ設計

**対象ユーザー**:

- コマンドを作成するエージェント（@command-arch）
- 引数付きコマンドを設計する開発者
- ユーザーフレンドリーなコマンドを作成したいチーム

## リソース構造

```
command-arguments-system/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── arguments-reference.md                 # $ARGUMENTS完全リファレンス
│   ├── positional-arguments-guide.md          # 位置引数ガイド
│   ├── validation-patterns.md                 # 検証パターン集
│   └── error-messages-design.md               # エラーメッセージ設計
└── templates/
    ├── single-argument-template.md            # 単一引数テンプレート
    ├── multiple-arguments-template.md         # 複数引数テンプレート
    └── optional-arguments-template.md         # オプション引数テンプレート
```

### リソース種別

- **$ARGUMENTS リファレンス** (`resources/arguments-reference.md`): $ARGUMENTS の詳細仕様
- **位置引数ガイド** (`resources/positional-arguments-guide.md`): $1, $2 等の使用方法
- **検証パターン** (`resources/validation-patterns.md`): 10以上の検証パターン
- **エラーメッセージ設計** (`resources/error-messages-design.md`): 親切なエラーメッセージの作成方法
- **テンプレート** (`templates/`): 引数パターン別のテンプレート

## いつ使うか

### シナリオ1: 引数付きコマンドの作成

**状況**: コマンドに引数を追加したい

**適用条件**:

- [ ] $ARGUMENTS の使い方を知らない
- [ ] 位置引数の使い分けがわからない
- [ ] argument-hint の設定方法を知りたい

**期待される成果**: 引数を正しく扱うコマンド

### シナリオ2: 引数検証の実装

**状況**: 不正な引数をエラーにしたい

**適用条件**:

- [ ] 引数が空の場合のハンドリングが必要
- [ ] 特定の値のみ許可したい
- [ ] 複数引数の組み合わせを検証したい

**期待される成果**: 堅牢な引数検証ロジック

### シナリオ3: デフォルト値の提供

**状況**: 引数が省略された場合のデフォルト動作を設定したい

**適用条件**:

- [ ] オプション引数を実装したい
- [ ] デフォルト値の設定方法を知りたい
- [ ] 引数省略時の動作を定義したい

**期待される成果**: 柔軟な引数システム

## 基本的な使用

### $ARGUMENTS の使用

**最も単純な形式**:

```markdown
---
description: Commit changes with message
---

# Git Commit

Commit message: $ARGUMENTS

Steps:

1. Stage all changes: `git add -A`
2. Commit with message: `git commit -m "$ARGUMENTS"`
3. Push: `git push`
```

**実行例**:

```bash
> /commit "feat: add user authentication"

→ $ARGUMENTS = "feat: add user authentication"
```

### 位置引数の使用

**複数引数を扱う**:

````markdown
---
argument-hint: [source] [destination]
---

# Copy File

Copy file from $1 to $2

```bash
cp "$1" "$2"
```
````

Verify copy succeeded.

````

**実行例**:

```bash
> /copy src/old.js src/new.js

→ $1 = "src/old.js"
→ $2 = "src/new.js"
````

## 引数検証

### 必須引数のチェック

````markdown
---
description: Deploy to environment
---

# Deployment

Target environment: $ARGUMENTS

## Validation

Check if $ARGUMENTS is provided:

```bash
if [ -z "$ARGUMENTS" ]; then
  echo "❌ Error: Environment not specified"
  echo "Usage: /deploy [staging|production]"
  exit 1
fi
```
````

## Execution

Proceed with deployment to $ARGUMENTS

````

### 値の範囲チェック

```markdown
## Validation
Check if $ARGUMENTS is valid:
```bash
if [ "$ARGUMENTS" != "staging" ] && [ "$ARGUMENTS" != "production" ]; then
  echo "❌ Error: Invalid environment '$ARGUMENTS'"
  echo "Valid options: staging, production"
  exit 1
fi
````

````

### 複数引数の検証

```markdown
---
argument-hint: [source] [destination]
---

# Copy File

Source: $1
Destination: $2

## Validation
```bash
# Check both arguments provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "❌ Error: Source and destination required"
  echo "Usage: /copy [source] [destination]"
  exit 1
fi

# Check source file exists
if [ ! -f "$1" ]; then
  echo "❌ Error: Source file '$1' not found"
  exit 1
fi

# Check destination directory exists
DEST_DIR=$(dirname "$2")
if [ ! -d "$DEST_DIR" ]; then
  echo "❌ Error: Destination directory '$DEST_DIR' not found"
  exit 1
fi
````

## Execution

Copy file from $1 to $2

````

## デフォルト値

### シンプルなデフォルト値

```markdown
---
description: Run tests with optional pattern
---

# Test Runner

Test pattern: $ARGUMENTS (default: all tests)

## Determine Pattern
```bash
PATTERN="${$ARGUMENTS:-**/*.test.js}"
pnpm test -- "$PATTERN"
````

````

### 条件付きデフォルト

```markdown
## Determine Environment
```bash
if [ -z "$ARGUMENTS" ]; then
  # No argument provided, use staging as default
  ENV="staging"
  echo "ℹ️  No environment specified, using default: staging"
else
  ENV="$ARGUMENTS"
fi

echo "Deploying to: $ENV"
````

````

## エラーメッセージ設計

### 親切なエラーメッセージの原則

**悪い例**:
```bash
echo "Error"
exit 1
````

**良い例**:

```bash
echo "❌ Error: Invalid environment '$ARGUMENTS'"
echo ""
echo "Valid options:"
echo "  - staging"
echo "  - production"
echo ""
echo "Usage: /deploy [staging|production]"
echo ""
echo "Example:"
echo "  /deploy staging"
exit 1
```

### エラーメッセージのテンプレート

```markdown
## Error Handling

If validation fails, show:

1. ❌ What went wrong
2. ✓ What are valid options
3. 💡 How to fix it (usage example)
4. 📝 Example command

Example error message:
```

❌ Error: Invalid priority level 'urgent'

Valid priority levels:

- low
- medium
- high

Usage: /create-issue [title] [priority]

Example:
/create-issue "Fix login bug" high

```

```

## 高度な引数パターン

### フラグ引数の処理

````markdown
## Parse Arguments

Check for flags in $ARGUMENTS:

```bash
VERBOSE=false
FORCE=false

for arg in $ARGUMENTS; do
  case $arg in
    --verbose|-v)
      VERBOSE=true
      ;;
    --force|-f)
      FORCE=true
      ;;
    *)
      TARGET="$arg"
      ;;
  esac
done
```
````

## Execution

Deploy to $TARGET with verbose=$VERBOSE, force=$FORCE

````

### 名前付き引数の処理

```markdown
## Parse Named Arguments

Extract key=value pairs from $ARGUMENTS:
```bash
for arg in $ARGUMENTS; do
  case $arg in
    env=*)
      ENV="${arg#*=}"
      ;;
    region=*)
      REGION="${arg#*=}"
      ;;
    version=*)
      VERSION="${arg#*=}"
      ;;
  esac
done
````

Example:

```
/deploy env=production region=us-east-1 version=1.2.3
```

````

## 詳細リソースの参照

### $ARGUMENTS 完全リファレンス
詳細な仕様は `resources/arguments-reference.md` を参照

### 位置引数ガイド
$1, $2 等の使用方法は `resources/positional-arguments-guide.md` を参照

### 検証パターン集
10以上の検証パターンは `resources/validation-patterns.md` を参照

### エラーメッセージ設計
親切なエラーメッセージの作成方法は `resources/error-messages-design.md` を参照

### テンプレート
- 単一引数: `templates/single-argument-template.md`
- 複数引数: `templates/multiple-arguments-template.md`
- オプション引数: `templates/optional-arguments-template.md`

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# $ARGUMENTS完全リファレンス
cat .claude/skills/command-arguments-system/resources/arguments-reference.md
````

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-arguments-system/resources/arguments-reference.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-arguments-system/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-arguments-system
```

## 関連スキル

- `.claude/skills/command-structure-fundamentals/SKILL.md` - 基本構造とargument-hint
- `.claude/skills/command-error-handling/SKILL.md` - エラーハンドリング戦略
- `.claude/skills/command-documentation-patterns/SKILL.md` - 使用例とドキュメンテーション
- `.claude/skills/command-basic-patterns/SKILL.md` - 条件分岐型パターン

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
