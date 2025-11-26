# .gitignore Pattern Library

## 環境変数パターン

```gitignore
# All .env files
.env
.env.local
.env.*.local
.env.development
.env.development.local
.env.test.local
.env.staging.local
.env.production.local

# Exceptions (template files)
!.env.example
!.env.template
!.env.sample
```

## Secret ファイルパターン

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

# SSH
.ssh/
id_rsa
id_dsa
id_ecdsa
id_ed25519

# GPG
*.gpg
*.asc
.gnupg/

# Credentials
credentials.json
credentials.yaml
token.json
.credentials
.token

# Directories
secrets/
.secrets/
private/
.private/
```

## クラウドプロバイダーパターン

```gitignore
# AWS
.aws/
aws-credentials
.boto

# GCP
gcp-credentials.json
service-account.json
.gcloud/
application_default_credentials.json

# Azure
azure-credentials
.azure/
```

## プラットフォームパターン

```gitignore
# Railway
.railway/

# Vercel
.vercel/

# Netlify
.netlify/

# Heroku
.heroku/
```

## 開発ツールパターン

```gitignore
# VS Code
.vscode/settings.json
!.vscode/extensions.json

# JetBrains
.idea/
*.iml

# OS
.DS_Store
Thumbs.db
```

## ビルド成果物パターン

```gitignore
# Node.js
node_modules/
npm-debug.log*
.npm

# Build
dist/
build/
out/
.next/

# Logs
logs/
*.log

# Temporary
/tmp/
*.tmp
.cache/
```
