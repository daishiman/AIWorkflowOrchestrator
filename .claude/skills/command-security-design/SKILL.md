---
name: command-security-design
description: |
  コマンドのセキュリティ設計を専門とするスキル。
  allowed-toolsによるツール制限、disable-model-invocationによる自動実行防止、
  機密情報保護の実装方法を提供します。

  使用タイミング:
  - 破壊的な操作を行うコマンドを作成する時
  - ツール使用を制限したい時
  - 機密情報の誤コミットを防ぐチェックを実装する時

  Use proactively when creating destructive commands, restricting tool usage,
  or implementing secret protection checks.
version: 1.0.0
---

# Command Security Design

## 概要

このスキルは、Claude Codeコマンドのセキュリティ設計を提供します。
allowed-toolsによる最小権限の原則、disable-model-invocationによる危険な操作の保護、
機密情報の誤コミット防止により、安全で信頼できるコマンドを作成できます。

**主要な価値**:
- 最小権限の原則の適用
- 破壊的操作の適切な保護
- 機密情報漏洩の防止
- セキュリティベストプラクティスの実装

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- セキュリティを重視する開発者
- 本番環境で使用するコマンドを作成するチーム

## リソース構造

```
command-security-design/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── allowed-tools-reference.md             # allowed-tools完全リファレンス
│   ├── disable-model-invocation-guide.md      # disable-model-invocation詳細
│   ├── secret-protection-patterns.md          # 機密情報保護パターン
│   └── security-checklist.md                  # セキュリティチェックリスト
└── templates/
    ├── readonly-command-template.md           # 読み取り専用テンプレート
    ├── restricted-command-template.md         # 制限付きテンプレート
    └── destructive-command-template.md        # 破壊的操作テンプレート
```

### リソース種別

- **allowed-tools リファレンス** (`resources/allowed-tools-reference.md`): 構文と実例
- **disable-model-invocation ガイド** (`resources/disable-model-invocation-guide.md`): 自動実行防止の詳細
- **機密情報保護パターン** (`resources/secret-protection-patterns.md`): シークレット検出パターン
- **セキュリティチェックリスト** (`resources/security-checklist.md`): コマンド作成時の確認事項
- **テンプレート** (`templates/`): セキュリティレベル別のテンプレート

## いつ使うか

### シナリオ1: 破壊的操作の保護
**状況**: ファイル削除やデプロイなど危険な操作を行うコマンドを作成する

**適用条件**:
- [ ] データ損失のリスクがある
- [ ] 本番環境に影響する
- [ ] ユーザー確認が必要

**期待される成果**: 安全に保護された破壊的操作コマンド

### シナリオ2: ツール使用の制限
**状況**: 特定のツールやコマンドのみ使用可能にしたい

**適用条件**:
- [ ] 読み取り専用コマンドを作成したい
- [ ] 特定ディレクトリのみ書き込み可能にしたい
- [ ] Git操作のみ許可したい

**期待される成果**: 最小権限を適用したコマンド

### シナリオ3: 機密情報の保護
**状況**: API keyやパスワードの誤コミットを防ぎたい

**適用条件**:
- [ ] Git操作を含むコマンドを作成する
- [ ] 機密情報を扱う可能性がある
- [ ] シークレット検出チェックが必要

**期待される成果**: 機密情報保護チェック付きコマンド

## allowed-tools による制限

### 基本構文

```yaml
# 基本形式
allowed-tools: ToolName, ToolName, ...

# パターンマッチング
allowed-tools: Bash(git*), Bash(npm*)

# パス制限
allowed-tools: Write(src/**/*.js), Read(*.md)

# 複数組み合わせ
allowed-tools: |
  Bash(git add:*),
  Bash(git commit:*),
  Read,
  Write(src/**)
```

### 読み取り専用コマンド

```yaml
---
description: Analyze code quality without modifications
allowed-tools: Read, Grep
---

# Code Quality Analysis

Run analysis on codebase without making any changes.

## Analysis Steps
1. Read source files
2. Calculate metrics
3. Generate report

**Security**: This command cannot modify files.
```

### Git専用コマンド

```yaml
---
description: Create git commit with conventional format
allowed-tools: Bash(git*)
---

# Git Commit

This command can only execute git commands.

## Security
- Limited to git operations only
- Cannot modify non-git files
- Cannot execute other shell commands
```

### 特定ディレクトリのみ書き込み可能

```yaml
---
description: Generate test files
allowed-tools: Read, Write(tests/**), Bash(npm test)
---

# Test Generator

Generate test files in tests/ directory only.

## Security
- Can read any file
- Can only write to tests/ directory
- Can run npm test command
```

## disable-model-invocation による保護

### 破壊的操作の保護

```yaml
---
description: Delete all temporary files and caches
disable-model-invocation: true  # モデルが勝手に実行しないように
allowed-tools: Bash(rm *)
---

# Cleanup Command

⚠️ **This command is destructive.**

This command will delete files and cannot be automatically invoked by the model.
It requires explicit user execution.

## What will be deleted:
- Temporary files in /tmp
- Build caches
- Node modules

## Execution
User must explicitly run: `/cleanup`
```

### 本番デプロイの保護

```yaml
---
description: Deploy to production environment
disable-model-invocation: true
allowed-tools: Bash(aws*), Bash(git*)
---

# Production Deployment

🚨 **PRODUCTION DEPLOYMENT**

This command requires explicit user execution and confirmation.

## Pre-deployment Checklist
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Staging deployment successful
- [ ] Backup created

## Confirmation Required
Before proceeding, ask user:
"Deploy to PRODUCTION? Type 'PRODUCTION' to confirm:"

Only proceed if user types exactly "PRODUCTION".
```

## 機密情報保護

### シークレット検出チェック

```markdown
## Security Check

Before committing, verify no secrets in staged files:

```bash
# Check for common secret patterns
SECRET_PATTERNS=(
  "api[_-]?key"
  "password"
  "secret"
  "token"
  "access[_-]?key"
  "aws[_-]?secret"
  "private[_-]?key"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if git diff --cached | grep -iE "$pattern" > /dev/null; then
    echo "⚠️ Warning: Potential secret detected: $pattern"
    echo "Please review staged files:"
    git diff --cached --name-only
    exit 1
  fi
done

echo "✅ No secrets detected"
```
```

### .env ファイル保護

```markdown
## Environment File Check

Ensure .env files are not committed:

```bash
if git diff --cached --name-only | grep -E "\.env$|\.env\." > /dev/null; then
  echo "❌ Error: .env file detected in staged files"
  echo ""
  echo "The following .env files should not be committed:"
  git diff --cached --name-only | grep -E "\.env$|\.env\."
  echo ""
  echo "Please unstage them:"
  echo "  git reset HEAD <file>"
  exit 1
fi
```
```

### API Key保護

```markdown
## API Key Detection

Check for hardcoded API keys:

```bash
# Patterns for common API key formats
if git diff --cached | grep -E "['\"][A-Za-z0-9]{20,}['\"]" | grep -iE "(api|key|secret)" > /dev/null; then
  echo "⚠️ Warning: Possible API key detected"
  echo ""
  echo "Detected patterns:"
  git diff --cached | grep -E "['\"][A-Za-z0-9]{20,}['\"]" | grep -iE "(api|key|secret)"
  echo ""
  echo "Please verify these are not actual API keys."
  echo "Use environment variables instead."
  exit 1
fi
```
```

## セキュリティチェックリスト

コマンド作成時の確認事項:

### 権限の確認
- [ ] 必要最小限のツールのみ許可しているか？
- [ ] allowed-tools が適切に設定されているか？
- [ ] 読み取り専用で済む場合は Write を含めていないか？

### 破壊的操作の確認
- [ ] ファイル削除を行うか？
- [ ] 本番環境に影響するか？
- [ ] disable-model-invocation: true が設定されているか？

### ユーザー確認の確認
- [ ] 危険な操作の前に確認を求めているか？
- [ ] 確認メッセージは明確で理解しやすいか？
- [ ] ロールバック方法を提示しているか？

### 機密情報の確認
- [ ] Git操作を含むコマンドにシークレット検出チェックがあるか？
- [ ] .env ファイル保護チェックがあるか？
- [ ] API key検出パターンを実装しているか？

### エラーハンドリングの確認
- [ ] 操作失敗時の挙動が定義されているか？
- [ ] エラーメッセージは安全（機密情報を含まない）か？
- [ ] ロールバック機能が実装されているか（必要な場合）？

## 詳細リソースの参照

### allowed-tools 完全リファレンス
詳細な構文と実例は `resources/allowed-tools-reference.md` を参照

### disable-model-invocation ガイド
自動実行防止の詳細は `resources/disable-model-invocation-guide.md` を参照

### 機密情報保護パターン
シークレット検出パターンは `resources/secret-protection-patterns.md` を参照

### セキュリティチェックリスト
完全なチェックリストは `resources/security-checklist.md` を参照

### テンプレート
- 読み取り専用: `templates/readonly-command-template.md`
- 制限付き: `templates/restricted-command-template.md`
- 破壊的操作: `templates/destructive-command-template.md`

## 関連スキル

- `.claude/skills/command-structure-fundamentals/SKILL.md` - allowed-tools、disable-model-invocationの基本
- `.claude/skills/command-error-handling/SKILL.md` - セキュリティエラーのハンドリング
- `.claude/skills/command-best-practices/SKILL.md` - 最小権限の原則

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
