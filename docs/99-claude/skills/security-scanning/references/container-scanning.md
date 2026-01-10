# コンテナスキャン

## 概要

Dockerイメージに含まれる脆弱性（OS、パッケージ、アプリケーション）を検出します。

## ツール比較

| ツール         | 特徴                    | コスト     |
| -------------- | ----------------------- | ---------- |
| Trivy          | 高速、包括的、CI/CD向け | OSS        |
| Grype          | 軽量、SBOM連携          | OSS        |
| Snyk Container | 詳細な修正提案          | 無料枠あり |
| Docker Scout   | Docker Desktop統合      | 無料枠あり |

## Trivy

### インストール

```bash
# macOS
brew install trivy

# Linux
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Docker
docker pull aquasec/trivy
```

### 基本使用法

```bash
# イメージスキャン
trivy image myapp:latest

# ファイルシステムスキャン
trivy fs .

# 設定ファイルスキャン
trivy config .

# SBOM生成
trivy image --format spdx-json myapp:latest > sbom.json
```

### 重大度フィルター

```bash
# Critical/Highのみ
trivy image --severity CRITICAL,HIGH myapp:latest

# CI/CD用（脆弱性があれば終了コード1）
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
```

### 出力フォーマット

```bash
# テーブル（デフォルト）
trivy image myapp:latest

# JSON
trivy image --format json myapp:latest

# SARIF（GitHub Code Scanning用）
trivy image --format sarif myapp:latest > trivy-results.sarif
```

### 設定ファイル

```yaml
# trivy.yaml
severity:
  - CRITICAL
  - HIGH

vulnerability:
  type:
    - os
    - library

ignore-unfixed: true

ignorefile: .trivyignore
```

### .trivyignore

```
# 誤検知や許容するCVEを記載
CVE-2021-12345
CVE-2022-67890
```

## Grype

### インストール

```bash
# macOS
brew install grype

# Linux
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
```

### 基本使用法

```bash
# イメージスキャン
grype myapp:latest

# SBOM入力
grype sbom:./sbom.json

# 重大度フィルター
grype myapp:latest --fail-on high
```

## GitHub Actions統合

### Trivy

```yaml
name: Container Security Scan

on:
  push:
    branches: [main]
  pull_request:

jobs:
  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          format: "sarif"
          output: "trivy-results.sarif"
          severity: "CRITICAL,HIGH"

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: "trivy-results.sarif"
```

### Grype

```yaml
- name: Scan image with Grype
  uses: anchore/scan-action@v3
  with:
    image: myapp:${{ github.sha }}
    fail-build: true
    severity-cutoff: high
```

## スキャン戦略

### ビルド時スキャン

```dockerfile
# マルチステージビルドで検証
FROM node:20-alpine AS builder
# ... ビルド処理 ...

# スキャン用の中間イメージ
FROM builder AS scanner
RUN apk add --no-cache trivy
RUN trivy filesystem --exit-code 1 --severity HIGH,CRITICAL /app

# 本番イメージ
FROM node:20-alpine AS runner
# ... 本番設定 ...
```

### レジストリスキャン

```bash
# プッシュ前にスキャン
trivy image myapp:latest
docker push myapp:latest

# 定期スキャン（既存イメージ）
trivy image registry.example.com/myapp:latest
```

## 脆弱性対応

### 対応優先度

| 重大度   | CVSS     | 対応期限 |
| -------- | -------- | -------- |
| Critical | 9.0-10.0 | 24時間   |
| High     | 7.0-8.9  | 1週間    |
| Medium   | 4.0-6.9  | 1ヶ月    |
| Low      | 0.1-3.9  | 任意     |

### 修正方法

1. **ベースイメージ更新**

   ```dockerfile
   # Before
   FROM node:18-alpine

   # After（パッチ適用版）
   FROM node:18.19-alpine
   ```

2. **パッケージ更新**

   ```dockerfile
   RUN apk upgrade --no-cache
   ```

3. **依存関係更新**
   ```bash
   pnpm update package-name
   ```

## ベストプラクティス

### すべきこと

1. **最小ベースイメージ**: alpine、distroless使用
2. **定期更新**: ベースイメージを定期的に更新
3. **CI/CD統合**: PRマージ前にスキャン
4. **SBOM生成**: ソフトウェア構成を記録
5. **例外管理**: 誤検知は適切に除外

### 避けるべきこと

1. **古いベースイメージ**: セキュリティパッチ未適用
2. **不要なパッケージ**: 攻撃対象面を増やす
3. **rootユーザー**: コンテナ内で権限昇格リスク
4. **警告の無視**: Critical/Highは必ず対応
