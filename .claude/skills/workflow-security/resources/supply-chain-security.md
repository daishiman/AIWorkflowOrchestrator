# サプライチェーンセキュリティ

GitHub Actions におけるサプライチェーン攻撃の対策、アクションの固定、依存関係レビュー、Sigstore による署名検証。

## サプライチェーン攻撃のリスク

### 攻撃ベクター

1. **アクションの改ざん**: タグの上書き、悪意あるコードの注入
2. **依存関係の汚染**: トロイの木馬パッケージ、タイポスクワッティング
3. **ビルドツールの侵害**: コンパイラ、バンドラーのバックドア
4. **インフラストラクチャ攻撃**: Runner、レジストリの侵害

### 実例

- **2022年**: `actions/checkout@v2` タグの上書き試行
- **2021年**: CodeCovトークン流出によるCI/CD侵害
- **2020年**: SolarWinds ビルドシステム侵害

## アクションの固定（Pinning）

### コミットSHA固定（推奨）

```yaml
# ❌ 危険: タグは変更可能
uses: actions/checkout@v4

# ❌ 危険: ブランチは常に最新コミット
uses: actions/checkout@main

# ✅ 安全: コミットSHAは不変
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

**理由**:
- タグは削除・再作成可能（`git tag -f v4 <malicious-commit>`）
- ブランチは常に最新コミットを参照
- コミットSHAは暗号学的に一意で不変

### 固定の実装

#### 手動固定

```bash
# 1. 最新リリースのコミットSHAを取得
git ls-remote https://github.com/actions/checkout refs/tags/v4.1.1
# b4ffde65f46336ab88eb53be808477a3936bae11	refs/tags/v4.1.1

# 2. ワークフローを更新
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

**コメントの重要性**: SHA のみでは人間に読めないため、タグをコメントで明記。

#### 自動固定（Dependabot）

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    # コミットSHAで固定
    open-pull-requests-limit: 10
```

Dependabot が自動的に:
1. 新しいリリースを検出
2. コミットSHAを取得
3. PRを作成（タグコメント付き）

### 固定のトレードオフ

| 方式 | セキュリティ | メンテナンス | 推奨度 |
|------|------------|------------|--------|
| タグ | 🔴 低 | 🟢 簡単 | ❌ 非推奨 |
| ブランチ | 🔴 低 | 🟢 自動 | ❌ 非推奨 |
| コミットSHA | 🟢 高 | 🟡 手動 | ✅ 推奨 |
| SHA + Dependabot | 🟢 高 | 🟢 自動 | ✅ 最推奨 |

## 依存関係レビュー

### Dependabot アラート

**有効化**: Settings → Security & analysis → Dependabot alerts

```yaml
# .github/dependabot.yml
version: 2
updates:
  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"

  # npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 5

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Dependency Review Action

**自動PR検証**:

```yaml
name: Dependency Review
on: [pull_request]

permissions:
  contents: read

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
      - uses: actions/dependency-review-action@v4
        with:
          # 高・致命的脆弱性でPR失敗
          fail-on-severity: high
          # 非推奨パッケージ警告
          warn-on-deprecated: true
```

### SBOM（Software Bill of Materials）生成

```yaml
- name: Generate SBOM
  uses: anchore/sbom-action@v0
  with:
    path: ./
    format: cyclonedx-json

- name: Upload SBOM
  uses: actions/upload-artifact@v4
  with:
    name: sbom
    path: sbom.json
```

## 署名検証（Sigstore）

### Sigstore とは

- **目的**: アクション、コンテナイメージの改ざん検出
- **仕組み**: 公開鍵暗号とタイムスタンプによる署名
- **利点**: 中間者攻撃、タグ上書き攻撃の防止

### アクションの署名検証

```yaml
- name: Verify action signature
  uses: sigstore/cosign-installer@v3

- name: Verify checkout action
  run: |
    cosign verify-blob \
      --certificate-identity 'https://github.com/actions/checkout/.github/workflows/release.yml@refs/tags/v4.1.1' \
      --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
      --bundle actions-checkout-v4.1.1.bundle \
      actions-checkout-v4.1.1.tar.gz
```

### コンテナイメージの署名

```yaml
- name: Sign Docker image
  run: |
    cosign sign --key cosign.key \
      ghcr.io/${{ github.repository }}:${{ github.sha }}
```

## アクション許可リスト

### リポジトリ設定

Settings → Actions → General → Actions permissions:

```
✅ Allow <organization> actions and reusable workflows
✅ Allow actions created by GitHub
✅ Allow specified actions and reusable workflows

Allowed actions:
  actions/checkout@*
  actions/setup-node@*
  docker/build-push-action@*
```

### ワークフローレベル制限

```yaml
# .github/workflows/allowed-actions.txt
actions/checkout
actions/setup-node
docker/build-push-action
```

```yaml
- name: Validate actions
  run: |
    # ワークフロー内のアクション抽出
    grep -oP 'uses:\s+\K[^@]+' .github/workflows/*.yml | sort -u > used-actions.txt

    # 許可リストと比較
    if ! diff -q used-actions.txt .github/workflows/allowed-actions.txt; then
      echo "❌ Unauthorized action detected"
      exit 1
    fi
```

## プライベートアクションの管理

### 内部アクションリポジトリ

```yaml
# ❌ パブリックアクション（サプライチェーンリスク）
uses: third-party/action@v1

# ✅ フォークして内部管理
uses: my-org/action@b4ffde65  # 内部レビュー済み
```

**手順**:
1. パブリックアクションをフォーク
2. セキュリティレビュー実施
3. 内部リポジトリで管理
4. 定期的にアップストリーム同期

### カスタムアクションの開発

```yaml
# .github/actions/custom-action/action.yml
name: 'Custom Action'
description: 'Internal verified action'
inputs:
  token:
    required: true
runs:
  using: 'node20'
  main: 'dist/index.js'
```

**使用**:
```yaml
- uses: ./.github/actions/custom-action
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

## ネットワークセキュリティ

### self-hosted runners のファイアウォール

```yaml
# 許可リスト（egress）
allow:
  - github.com:443
  - api.github.com:443
  - ghcr.io:443
  - registry.npmjs.org:443

# 拒否リスト
deny:
  - 0.0.0.0/0  # デフォルト拒否
```

### アウトバウンド通信の監視

```yaml
- name: Monitor network
  run: |
    # tcpdumpでパケットキャプチャ
    sudo tcpdump -i any -w capture.pcap &
    TCPDUMP_PID=$!

    # ワークフロー実行
    npm install
    npm test

    # tcpdump停止
    sudo kill $TCPDUMP_PID

    # 不審な通信チェック
    tshark -r capture.pcap -T fields -e ip.dst | sort -u
```

## セキュリティスキャンの統合

### CodeQL（SAST）

```yaml
name: CodeQL
on: [push, pull_request]

permissions:
  security-events: write
  contents: read

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, python
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3
```

### Trivy（脆弱性スキャン）

```yaml
- name: Run Trivy
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
    output: 'trivy-results.sarif'

- name: Upload to GitHub Security
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
```

### Semgrep（パターンマッチング）

```yaml
- name: Semgrep scan
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/secrets
      p/ci
```

## サプライチェーンポリシー

### 組織レベルポリシー

```yaml
# .github/security-policy.yml
require:
  - commit_sha_pinning: true
  - dependabot_enabled: true
  - codeql_enabled: true
  - signed_commits: true
  - two_person_review: true

block:
  - unverified_actions: true
  - high_severity_vulnerabilities: true
  - secrets_in_logs: true
```

### ポリシー検証ワークフロー

```yaml
name: Policy Enforcement
on: [pull_request]

jobs:
  enforce:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11
      - name: Check pinning
        run: |
          if grep -r 'uses:.*@v[0-9]' .github/workflows/; then
            echo "❌ Tag-based action reference found"
            exit 1
          fi
      - name: Check Dependabot
        run: |
          if [ ! -f .github/dependabot.yml ]; then
            echo "❌ Dependabot not configured"
            exit 1
          fi
```

## インシデント対応

### 侵害検出

```yaml
- name: Check for compromised dependencies
  run: |
    # npm audit
    npm audit --audit-level=high

    # 不審なネットワーク通信
    if netstat -an | grep ESTABLISHED | grep -v 'github.com\|npmjs.org'; then
      echo "⚠️ Suspicious network activity"
      exit 1
    fi
```

### ロールバック手順

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    # 前回の安全なコミットに戻す
    git revert HEAD
    git push origin main
```

## セキュリティ監査ログ

### 実行履歴の記録

```yaml
- name: Audit log
  run: |
    cat <<EOF >> audit.log
    Workflow: ${{ github.workflow }}
    Run ID: ${{ github.run_id }}
    Actor: ${{ github.actor }}
    Event: ${{ github.event_name }}
    Ref: ${{ github.ref }}
    SHA: ${{ github.sha }}
    Timestamp: $(date -Iseconds)
    EOF

- name: Upload audit log
  uses: actions/upload-artifact@v4
  with:
    name: audit-log
    path: audit.log
    retention-days: 90
```

---

**参考リンク**:
- [Sigstore](https://www.sigstore.dev/)
- [Dependency Review Action](https://github.com/actions/dependency-review-action)
- [GitHub Supply Chain Security](https://docs.github.com/en/code-security/supply-chain-security)
