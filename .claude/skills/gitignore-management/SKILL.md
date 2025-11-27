---
name: gitignore-management
description: |
    .gitignore設計と管理スキル。機密ファイルパターン、プロジェクト固有除外、
    プラットフォーム別パターン、.gitignore検証手法を提供します。
    使用タイミング:
    - .gitignoreを新規作成する時
    - .gitignoreに機密パターンを追加する時
    - プロジェクト固有の除外パターンを設計する時
    - .gitignoreの完全性を検証する時
    - Gitignoreベストプラクティスを適用する時
    Use when designing .gitignore, adding secret patterns,
    or validating gitignore completeness.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/gitignore-management/resources/pattern-library.md`: 機密ファイル、クラウドプロバイダー、プラットフォーム別の除外パターンライブラリ
  - `.claude/skills/gitignore-management/templates/gitignore-template.txt`: プロジェクト別の.gitignore基本テンプレート
  - `.claude/skills/gitignore-management/scripts/validate-gitignore.mjs`: .gitignore完全性検証とパターン欠落チェックスクリプト

  Use proactively when implementing gitignore-management patterns or solving related problems.
version: 1.0.0
---

# .gitignore Management

## 概要

.gitignore は、機密情報の Git 混入を防ぐ第一防衛線です。
このスキルは、包括的な.gitignore 設計と管理手法を提供します。

## 基本構造

### 配置場所

**必須**: プロジェクトルート（`/`）に配置

### 基本セクション構成

```gitignore
# ═══════════════════════════════════════
# Environment Variables
# ═══════════════════════════════════════
.env
.env.local
.env.*.local
!.env.example

# ═══════════════════════════════════════
# Secret Files
# ═══════════════════════════════════════
*.key
*.pem
secrets/

# ═══════════════════════════════════════
# Cloud Provider Specific
# ═══════════════════════════════════════
.aws/
gcp-credentials.json

# ═══════════════════════════════════════
# Platform Specific
# ═══════════════════════════════════════
.railway/

# ═══════════════════════════════════════
# Development Tools
# ═══════════════════════════════════════
.vscode/settings.json
.idea/

# ═══════════════════════════════════════
# Build Artifacts
# ═══════════════════════════════════════
node_modules/
dist/
.next/

# ═══════════════════════════════════════
# Logs & Temporary
# ═══════════════════════════════════════
logs/
*.log
/tmp/

# ═══════════════════════════════════════
# Project Specific
# ═══════════════════════════════════════
# （プロジェクト固有パターンを追加）
```

## 環境変数パターン

### 基本パターン

```gitignore
# すべての.envファイルを除外
.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.staging
.env.staging.local
.env.production
.env.production.local

# テンプレートは除外しない（!で例外）
!.env.example
!.env.template
!.env.sample
```

**重要**: `!`による例外指定は慎重に使用

### プロジェクト固有パターン

```gitignore
# Next.js
.env.local

# Vite
.env.local
.env.*.local

# Create React App
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## Secret ファイルパターン

### 秘密鍵・証明書

```gitignore
# Private Keys
*.key
*.pem
*.p12
*.pfx

# Certificates
*.cer
*.crt
*.der

# SSH Keys
id_rsa
id_dsa
id_ecdsa
id_ed25519
*.pub

# GPG
*.gpg
*.asc
```

### 認証情報ファイル

```gitignore
# Generic credentials
credentials.json
credentials.yaml
credentials.yml
token.json
token.txt
.credentials
.token
auth.json
auth.yaml

# Secret directories
secrets/
.secrets/
private/
.private/
```

## クラウドプロバイダー別パターン

### AWS

```gitignore
.aws/
aws-credentials
.boto
credentials
```

### Google Cloud Platform

```gitignore
gcp-credentials.json
service-account.json
.gcloud/
application_default_credentials.json
```

### Azure

```gitignore
azure-credentials
.azure/
```

## プラットフォーム別パターン

### Railway

```gitignore
.railway/
```

### Vercel

```gitignore
.vercel/
```

### Netlify

```gitignore
.netlify/
```

## 開発ツール除外

### IDE 設定（個人設定のみ除外）

```gitignore
# VS Code（個人設定のみ）
.vscode/settings.json
.vscode/launch.json

# プロジェクト共有設定は除外しない
!.vscode/extensions.json
!.vscode/tasks.json

# JetBrains IDEs
.idea/
*.iml

# Vim
*.swp
*.swo
*~

# Emacs
*~
\#*\#
```

### OS 固有ファイル

```gitignore
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~
.directory
```

## プロジェクト固有パターン追加

### Next.js プロジェクト

```gitignore
# Next.js
.next/
out/
.vercel/

# Testing
.coverage/
playwright-report/
test-results/
```

### Local Agent プロジェクト

```gitignore
# Local Agent Logs
local-agent/logs/
local-agent/*.log

# Temporary uploads
local-agent/tmp/
uploads/tmp/
```

## .gitignore 検証

### 検証スクリプト

```bash
#!/bin/bash
# .gitignore検証スクリプト

echo "🔍 Validating .gitignore..."

REQUIRED_PATTERNS=(
  ".env"
  "*.key"
  "*.pem"
  "secrets/"
  "node_modules/"
)

MISSING=()

for pattern in "${REQUIRED_PATTERNS[@]}"; do
  if ! grep -q "$pattern" .gitignore 2>/dev/null; then
    MISSING+=("$pattern")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "❌ Missing required patterns:"
  for p in "${MISSING[@]}"; do
    echo "  - $p"
  done
  exit 1
fi

echo "✅ .gitignore validation passed"
```

### 動作確認

```bash
# .gitignoreが機能しているか確認
git add --dry-run .

# 除外されるべきファイルが追加されないことを確認
touch .env
git add --dry-run .env
# → .env は追加されないはず
```

## トラブルシューティング

### 問題 1: .gitignore が効かない

**原因**: ファイルが既に Git 管理下にある

**解決策**:

```bash
# Git管理から削除（ファイル自体は削除しない）
git rm --cached .env

# .gitignoreを適用
git add .gitignore
git commit -m "chore: update .gitignore to exclude .env"
```

### 問題 2: 除外したくないファイルが除外される

**原因**: パターンが広すぎる

**解決策**:

```gitignore
# 広いパターン
*.log

# 特定ファイルは除外しない
!important.log
```

## 実装チェックリスト

- [ ] プロジェクトルート（`/`）に配置されているか？
- [ ] すべての機密ファイルパターンが含まれているか？
- [ ] .env.example が除外されずに.env\*が除外されているか？
- [ ] プロジェクト固有のパターンが追加されているか？
- [ ] クラウドプロバイダー固有パターンが含まれているか？
- [ ] プラットフォーム固有パターン（Railway 等）が含まれているか？

## 関連スキル

- `.claude/skills/pre-commit-security/SKILL.md` - pre-commit hook 実装
- `.claude/skills/secret-management-architecture/SKILL.md` - Secret 分類
- `.claude/skills/environment-isolation/SKILL.md` - 環境別設定

## リソースファイル

- `resources/pattern-library.md` - パターンライブラリ

## スクリプト

- `scripts/validate-gitignore.mjs` - .gitignore 検証スクリプト

## テンプレート

- `templates/gitignore-template.txt` - 基本テンプレート
