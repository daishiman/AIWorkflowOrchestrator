# SBOM生成

## 概要

SBOM（Software Bill of Materials）は、ソフトウェアを構成するすべてのコンポーネント、
ライブラリ、依存関係のリストです。サプライチェーンセキュリティの基盤となります。

## 重要性

- **脆弱性追跡**: 影響を受けるコンポーネントの迅速な特定
- **ライセンスコンプライアンス**: 使用ライブラリのライセンス確認
- **規制対応**: 米国大統領令14028（ソフトウェアサプライチェーンセキュリティ）
- **インシデント対応**: Log4j等の脆弱性発覚時の影響範囲特定

## 標準フォーマット

| フォーマット | 特徴                      | 用途             |
| ------------ | ------------------------- | ---------------- |
| SPDX         | Linux Foundation、ISO標準 | 広範な互換性     |
| CycloneDX    | OWASP、軽量               | セキュリティ重視 |
| SWID         | ISO/IEC 19770-2           | エンタープライズ |

## ツール

### Syft

Anchore社製のSBOM生成ツール。

```bash
# インストール
brew install syft  # macOS
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# コンテナイメージから生成
syft myapp:latest -o spdx-json > sbom-spdx.json
syft myapp:latest -o cyclonedx-json > sbom-cyclonedx.json

# ディレクトリから生成
syft dir:. -o spdx-json > sbom.json

# 複数フォーマット同時出力
syft myapp:latest -o spdx-json=sbom.spdx.json -o cyclonedx-json=sbom.cdx.json
```

### Trivy

脆弱性スキャナーとSBOM生成を統合。

```bash
# SPDX形式
trivy image --format spdx-json myapp:latest > sbom.spdx.json

# CycloneDX形式
trivy image --format cyclonedx myapp:latest > sbom.cdx.json

# 脆弱性スキャンとSBOM生成を同時実行
trivy image --format json --output result.json myapp:latest
```

### @cyclonedx/cyclonedx-pnpm

Node.js専用のCycloneDX生成。

```bash
# インストール
pnpm install -g @cyclonedx/cyclonedx-pnpm

# 生成
cyclonedx-pnpm --output-file sbom.json
```

## GitHub Actions統合

### Syftによる自動生成

```yaml
name: Generate SBOM

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: myapp:${{ github.sha }}
          format: spdx-json
          output-file: sbom.spdx.json

      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.spdx.json

      # リリース時はGitHub Releaseに添付
      - name: Attach SBOM to Release
        if: github.event_name == 'release'
        uses: softprops/action-gh-release@v1
        with:
          files: sbom.spdx.json
```

### 脆弱性スキャンとの連携

```yaml
- name: Generate SBOM
  uses: anchore/sbom-action@v0
  with:
    image: myapp:${{ github.sha }}
    output-file: sbom.json

- name: Scan SBOM with Grype
  uses: anchore/scan-action@v3
  with:
    sbom: sbom.json
    fail-build: true
    severity-cutoff: high
```

## SBOM構造（CycloneDX例）

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "version": 1,
  "metadata": {
    "timestamp": "2024-01-15T10:00:00Z",
    "tools": [
      {
        "vendor": "anchore",
        "name": "syft",
        "version": "0.98.0"
      }
    ],
    "component": {
      "type": "application",
      "name": "myapp",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:pnpm/express@4.18.2",
      "licenses": [
        {
          "license": {
            "id": "MIT"
          }
        }
      ]
    }
  ],
  "dependencies": [
    {
      "ref": "myapp@1.0.0",
      "dependsOn": ["express@4.18.2"]
    }
  ]
}
```

## SBOM管理ベストプラクティス

### 生成タイミング

1. **ビルド時**: CI/CDパイプラインで自動生成
2. **リリース時**: リリースアーティファクトと共に保存
3. **定期更新**: 既存イメージの定期的なSBOM更新

### 保管場所

```
リリースアーティファクト
├── myapp-v1.0.0.tar.gz
├── sbom.spdx.json        # SPDX形式
├── sbom.cyclonedx.json   # CycloneDX形式
└── checksums.txt         # ハッシュ値
```

### 活用方法

1. **脆弱性監視**

   ```bash
   # 既存SBOMを定期スキャン
   grype sbom:./sbom.json
   ```

2. **ライセンス確認**

   ```bash
   # SBOMからライセンス一覧を抽出
   jq '.components[].licenses[].license.id' sbom.cdx.json | sort | uniq
   ```

3. **依存関係分析**
   ```bash
   # 特定パッケージの使用確認
   jq '.components[] | select(.name == "lodash")' sbom.cdx.json
   ```

## コンプライアンス要件

### 米国大統領令14028

- 連邦政府向けソフトウェアにSBOM提供義務
- NTIA Minimum Elements準拠

### 必須項目

1. サプライヤー名
2. コンポーネント名
3. バージョン
4. 一意識別子（PURL等）
5. 依存関係
6. SBOM作成者
7. タイムスタンプ
