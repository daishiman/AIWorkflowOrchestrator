---
name: command-error-handling
description: |
  コマンドのエラーハンドリングを専門とするスキル。
  引数検証、事前チェック、ロールバック機能、ユーザー確認、
  親切なエラーメッセージの設計を提供します。

  使用タイミング:
  - 堅牢なエラー処理を実装する時
  - ロールバック機能が必要な時
  - ユーザー確認を統合する時

  Use proactively when implementing robust error handling, rollback mechanisms,
  or user confirmation workflows.
version: 1.0.0
---

# Command Error Handling

## 概要

このスキルは、Claude Codeコマンドのエラーハンドリングを提供します。
引数検証、事前チェック、ロールバック機能、親切なエラーメッセージにより、
堅牢で信頼できるコマンドを作成できます。

**主要な価値**:
- 包括的なエラー検証
- 安全なロールバック機能
- わかりやすいエラーメッセージ
- ユーザー確認の統合

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- 本番環境で使用するコマンドを作成する開発者
- 堅牢性を重視するチーム

## リソース構造

```
command-error-handling/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── validation-strategies.md               # 検証戦略詳細
│   ├── rollback-patterns.md                   # ロールバックパターン
│   ├── error-message-design.md                # エラーメッセージ設計
│   └── user-confirmation-patterns.md          # ユーザー確認パターン
└── templates/
    ├── validation-template.md                 # 検証テンプレート
    ├── rollback-template.md                   # ロールバックテンプレート
    └── confirmation-template.md               # 確認テンプレート
```

### リソース種別

- **戦略詳細** (`resources/*-strategies.md`, `*-patterns.md`): 各戦略の詳細仕様
- **エラーメッセージ設計** (`resources/error-message-design.md`): 親切なメッセージの作成方法
- **テンプレート** (`templates/`): エラーハンドリングパターン別のテンプレート

## いつ使うか

### シナリオ1: 引数検証の実装
**状況**: 不正な引数をエラーにしたい

**適用条件**:
- [ ] 引数が必須
- [ ] 特定の値のみ許可
- [ ] 複雑な検証ロジックが必要

**期待される成果**: 堅牢な引数検証

### シナリオ2: ロールバック機能の実装
**状況**: 失敗時に元に戻したい

**適用条件**:
- [ ] 破壊的な操作を行う
- [ ] 複数ステップがある
- [ ] 失敗時の復旧が必要

**期待される成果**: 安全なロールバック機能

### シナリオ3: エラーメッセージの改善
**状況**: わかりにくいエラーメッセージを改善したい

**適用条件**:
- [ ] ユーザーが問題を理解できない
- [ ] 解決方法が不明確
- [ ] エラーメッセージが技術的すぎる

**期待される成果**: ユーザーフレンドリーなエラーメッセージ

## エラーハンドリング戦略

### 3層防御

```
┌────────────────────────────────────────┐
│ Layer 1: 引数検証（Validation）        │
│ - 引数の存在確認                       │
│ - 値の範囲チェック                     │
│ - 形式の検証                           │
└────────────────┬───────────────────────┘
                │ Pass
                ▼
┌────────────────────────────────────────┐
│ Layer 2: 事前チェック（Pre-flight）    │
│ - 環境の確認                           │
│ - ファイルの存在確認                   │
│ - 権限のチェック                       │
└────────────────┬───────────────────────┘
                │ Pass
                ▼
┌────────────────────────────────────────┐
│ Layer 3: 実行時チェック（Runtime）     │
│ - 操作の成功確認                       │
│ - 結果の検証                           │
│ - 副作用の確認                         │
└────────────────────────────────────────┘
```

## Layer 1: 引数検証

### 必須引数のチェック

```markdown
## Validation Phase

Check required arguments:
```bash
if [ -z "$ARGUMENTS" ]; then
  echo "❌ Error: Environment not specified"
  echo ""
  echo "Usage: /deploy [staging|production]"
  echo ""
  echo "Example:"
  echo "  /deploy staging"
  exit 1
fi
```
```

### 値の範囲チェック

```markdown
## Validation Phase

Check valid values:
```bash
VALID_ENVS=("staging" "production" "development")

if [[ ! " ${VALID_ENVS[@]} " =~ " ${ARGUMENTS} " ]]; then
  echo "❌ Error: Invalid environment '$ARGUMENTS'"
  echo ""
  echo "Valid environments:"
  for env in "${VALID_ENVS[@]}"; do
    echo "  - $env"
  done
  echo ""
  echo "Usage: /deploy [environment]"
  exit 1
fi
```
```

### 形式の検証

```markdown
## Validation Phase

Check format:
```bash
# Check semver format (e.g., 1.2.3)
if ! [[ "$ARGUMENTS" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Error: Invalid version format '$ARGUMENTS'"
  echo ""
  echo "Expected format: MAJOR.MINOR.PATCH"
  echo "Example: 1.2.3"
  echo ""
  echo "Current: $ARGUMENTS"
  exit 1
fi
```
```

## Layer 2: 事前チェック

### ファイル存在確認

```markdown
## Pre-flight Checks

Verify required files exist:
```bash
REQUIRED_FILES=(
  ".env"
  "package.json"
  "tsconfig.json"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo "❌ Error: Required files not found"
  echo ""
  echo "Missing files:"
  for file in "${MISSING_FILES[@]}"; do
    echo "  - $file"
  done
  echo ""
  echo "Please ensure all required files exist"
  exit 1
fi
```
```

### 環境確認

```markdown
## Pre-flight Checks

Verify environment is ready:
```bash
# Check Node.js version
REQUIRED_NODE="18"
CURRENT_NODE=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$CURRENT_NODE" -lt "$REQUIRED_NODE" ]; then
  echo "❌ Error: Node.js version too old"
  echo ""
  echo "Required: Node.js >= $REQUIRED_NODE"
  echo "Current:  Node.js $CURRENT_NODE"
  echo ""
  echo "Please upgrade Node.js"
  exit 1
fi

# Check dependencies installed
if [ ! -d "node_modules" ]; then
  echo "❌ Error: Dependencies not installed"
  echo ""
  echo "Please run: npm install"
  exit 1
fi
```
```

### テストと品質チェック

```markdown
## Pre-flight Checks

Run tests and quality checks:
```bash
echo "🧪 Running tests..."
if ! npm test; then
  echo ""
  echo "❌ Error: Tests failed"
  echo ""
  echo "Please fix failing tests before deployment"
  echo ""
  echo "To see detailed test output:"
  echo "  npm test -- --verbose"
  exit 1
fi

echo "📝 Running linter..."
if ! npm run lint; then
  echo ""
  echo "❌ Error: Lint checks failed"
  echo ""
  echo "To auto-fix some issues:"
  echo "  npm run lint -- --fix"
  exit 1
fi
```
```

## Layer 3: 実行時チェック

### 操作の成功確認

```markdown
## Execution with Verification

Execute and verify each step:
```bash
# Build
echo "🏗️  Building..."
if ! npm run build; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build successful"

# Deploy
echo "🚀 Deploying..."
if ! aws s3 sync dist/ s3://$BUCKET/; then
  echo "❌ Deployment failed"
  echo ""
  echo "Rollback required"
  exit 1
fi
echo "✅ Deployment successful"
```
```

### ヘルスチェック

```markdown
## Post-deployment Verification

Verify deployment health:
```bash
HEALTH_URL="https://$ARGUMENTS.example.com/health"
MAX_RETRIES=5
RETRY_DELAY=10

for i in $(seq 1 $MAX_RETRIES); do
  echo "🔍 Health check attempt $i/$MAX_RETRIES..."

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

  if [ "$RESPONSE" = "200" ]; then
    echo "✅ Health check passed"
    break
  fi

  if [ $i -eq $MAX_RETRIES ]; then
    echo "❌ Health check failed after $MAX_RETRIES attempts"
    echo ""
    echo "HTTP Status: $RESPONSE"
    echo "URL: $HEALTH_URL"
    echo ""
    echo "🔄 Initiating rollback..."
    # Rollback logic here
    exit 1
  fi

  echo "⏳ Waiting $RETRY_DELAY seconds before retry..."
  sleep $RETRY_DELAY
done
```
```

## ロールバック機能

### バックアップと復元

```markdown
## Step 1: Create Backup
```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_TAG="backup-$TIMESTAMP"

echo "💾 Creating backup: $BACKUP_TAG"

# Git tag backup
git tag $BACKUP_TAG

# S3 backup
aws s3 sync s3://$BUCKET/ s3://$BUCKET-backup-$TIMESTAMP/

echo "✅ Backup created: $BACKUP_TAG"
```

## Step 2: Deploy with Error Handling
```bash
set -e  # Exit on error

if ! npm run build; then
  echo "❌ Build failed, no rollback needed"
  exit 1
fi

if ! aws s3 sync dist/ s3://$BUCKET/; then
  echo "❌ Deployment failed"
  echo "🔄 Rolling back to: $BACKUP_TAG"

  # Restore from backup
  aws s3 sync s3://$BUCKET-backup-$TIMESTAMP/ s3://$BUCKET/

  echo "✅ Rollback complete"
  exit 1
fi
```

## Step 3: Health Check
```bash
if ! curl -f $HEALTH_URL; then
  echo "❌ Health check failed"
  echo "🔄 Rolling back to: $BACKUP_TAG"

  # Restore from backup
  aws s3 sync s3://$BUCKET-backup-$TIMESTAMP/ s3://$BUCKET/

  # Rollback database if needed
  git checkout $BACKUP_TAG db/migrations/

  echo "✅ Rollback complete"
  exit 1
fi
```
```

### トランザクション的実行

```markdown
## Atomic Operation Pattern

Execute all-or-nothing:
```bash
# Start transaction
BEGIN_STATE=$(git rev-parse HEAD)

# Function to rollback
rollback() {
  echo "🔄 Rolling back changes..."
  git reset --hard $BEGIN_STATE
  git clean -fd
  echo "✅ Rollback complete"
}

# Set trap for errors
trap rollback ERR

# Execute operations
echo "📝 Applying changes..."
# ... operations here ...

# Commit if all succeeded
git add -A
git commit -m "Applied changes"
echo "✅ All changes applied successfully"

# Remove trap
trap - ERR
```
```

## ユーザー確認

### 破壊的操作の確認

```markdown
## Step 3: User Confirmation

⚠️ **This will DELETE the production database.**

Show what will be deleted:
- Database: production_db
- Tables: 42 tables
- Estimated rows: 1,234,567 rows

This action CANNOT be undone.

Ask user: "Type 'DELETE PRODUCTION' to confirm:"

Wait for user input.

If input equals "DELETE PRODUCTION" exactly:
  → Proceed to deletion
Else:
  → Cancel operation
  → Show: "❌ Operation cancelled (input did not match)"
```

### 段階的確認

```markdown
## Multi-stage Confirmation

### Stage 1: Impact Assessment
Show deployment impact:
- Environment: PRODUCTION
- Services affected: 3 services
- Estimated downtime: 2-5 minutes
- Rollback available: Yes

Ask: "Proceed with deployment? (yes/no)"

### Stage 2: Final Confirmation
If "yes":
  Show final warning:
  ```
  🚨 FINAL CONFIRMATION

  You are about to deploy to PRODUCTION.

  Type the current date (YYYY-MM-DD) to confirm:
  ```

  Wait for date input.

  If date matches today:
    → Proceed with deployment
  Else:
    → Cancel: "Date mismatch, operation cancelled"
```

## 親切なエラーメッセージ

### テンプレート

```
❌ Error: [What went wrong]

[Why it happened]

✓ Valid options:
  - Option 1
  - Option 2

💡 How to fix:
  1. Step 1
  2. Step 2

📝 Example:
  [Working example command]

🔗 More info:
  [Documentation link if available]
```

### 実装例

```bash
echo "❌ Error: Invalid deployment environment '$ARGUMENTS'"
echo ""
echo "The environment '$ARGUMENTS' is not recognized."
echo ""
echo "✓ Valid environments:"
echo "  - staging   (for testing)"
echo "  - production (requires approval)"
echo ""
echo "💡 How to fix:"
echo "  1. Check your spelling"
echo "  2. Use one of the valid environments"
echo ""
echo "📝 Example:"
echo "  /deploy staging"
echo ""
echo "🔗 More info:"
echo "  See .claude/docs/deployment-guide.md"
```

## 詳細リソースの参照

### 検証戦略
詳細は `resources/validation-strategies.md` を参照

### ロールバックパターン
詳細は `resources/rollback-patterns.md` を参照

### エラーメッセージ設計
詳細は `resources/error-message-design.md` を参照

### ユーザー確認パターン
詳細は `resources/user-confirmation-patterns.md` を参照

### テンプレート
- 検証: `templates/validation-template.md`
- ロールバック: `templates/rollback-template.md`
- 確認: `templates/confirmation-template.md`

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# エラーパターン集
cat .claude/skills/command-error-handling/resources/error-patterns.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-error-handling/resources/error-patterns.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-error-handling/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-error-handling
```

## 関連スキル

- `.claude/skills/command-arguments-system/SKILL.md` - 引数検証の基礎
- `.claude/skills/command-security-design/SKILL.md` - セキュリティとエラーハンドリング
- `.claude/skills/command-advanced-patterns/SKILL.md` - インタラクティブパターン

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
