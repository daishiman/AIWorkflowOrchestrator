# Secret Detection Pattern Library

## 汎用Secretパターン

### Password

```regex
(password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']
```

### API Key

```regex
(api[_-]?key|apikey)\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']
```

### Secret/Token

```regex
(secret[_-]?key|token)\s*[:=]\s*["'][^"']{20,}["']
```

### Bearer Token

```regex
(auth|authorization)\s*[:=]\s*["']Bearer\s+[a-zA-Z0-9._-]+["']
```

## クラウドプロバイダー別パターン

### AWS

```regex
# Access Key ID
AKIA[0-9A-Z]{16}

# Secret Access Key
[a-zA-Z0-9/+=]{40}
```

### Google Cloud

```regex
# API Key
AIza[0-9A-Za-z\\-_]{35}

# Service Account
\{[^}]*"type":\s*"service_account"[^}]*\}
```

### OpenAI

```regex
# API Key (current format)
sk-proj-[a-zA-Z0-9]{48}

# Legacy format
sk-[a-zA-Z0-9]{48}
```

### Anthropic

```regex
sk-ant-api03-[a-zA-Z0-9_-]{95}
```

### Stripe

```regex
(sk|pk)_(live|test)_[0-9a-zA-Z]{24,}
```

### GitHub

```regex
# Personal Access Token (classic)
ghp_[a-zA-Z0-9]{36}

# Fine-grained PAT
github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}
```

### Discord

```regex
https://discord\.com/api/webhooks/\d+/[a-zA-Z0-9_-]+
```

## 接続文字列パターン

### SQLite/Turso

```regex
libsql://[^:]+:[^@]+@[^/]+
```

### Turso Auth Token

```regex
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+
```

### MySQL

```regex
mysql://[^:]+:[^@]+@[^/]+/\w+
```

### MongoDB

```regex
mongodb(\+srv)?://[^:]+:[^@]+@[^/]+
```

### Redis

```regex
redis://:[^@]+@[^/]+
```

## 暗号化鍵パターン

### RSA Private Key

```regex
-----BEGIN RSA PRIVATE KEY-----
```

### SSH Private Key

```regex
-----BEGIN OPENSSH PRIVATE KEY-----
```

### PGP Private Key

```regex
-----BEGIN PGP PRIVATE KEY BLOCK-----
```

### Generic Private Key

```regex
-----BEGIN .* PRIVATE KEY-----
```

## エントロピーベース検出

### 高エントロピー文字列

```regex
# 32文字以上の英数字（高確率でSecret）
[a-zA-Z0-9]{32,}

# Base64エンコードされた値
[a-zA-Z0-9+/]{40,}={0,2}

# Hexエンコードされた値
[a-f0-9]{64,}
```

## ホワイトリストパターン

### 除外すべき文字列

- "example"
- "sample"
- "test"
- "mock"
- "fixture"
- "placeholder"
- "your-api-key-here"
- "replace-with"
- "dummy"

### 除外すべきファイルパス

- `.env.example`
- `tests/fixtures/`
- `tests/mocks/`
- `docs/examples/`
- `README.md`
