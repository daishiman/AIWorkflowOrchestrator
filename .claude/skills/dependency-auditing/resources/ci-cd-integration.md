# CI/CD統合パターン

## 概要

セキュリティ監査をCI/CDパイプラインに統合することで、
脆弱性の早期発見と継続的なセキュリティ確保を実現します。

## GitHub Actions統合

### 基本的な監査ワークフロー

```yaml
# .github/workflows/security-audit.yml
name: Security Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # 毎日午前3時（UTC）に実行
    - cron: '0 3 * * *'

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run security audit
        run: pnpm audit --audit-level=high

      - name: Upload audit report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: audit-report
          path: audit-report.json
```

### 高度な監査ワークフロー

```yaml
# .github/workflows/advanced-security-audit.yml
name: Advanced Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  pnpm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - name: Run pnpm audit
        run: |
          pnpm audit --json > pnpm-audit.json || true
          cat pnpm-audit.json
      - uses: actions/upload-artifact@v4
        with:
          name: pnpm-audit
          path: pnpm-audit.json

  snyk-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  aggregate-results:
    needs: [pnpm-audit, snyk-scan, trivy-scan]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4
      - name: Analyze results
        run: |
          echo "=== Security Audit Summary ==="
          # 結果の集計と分析
```

### PRブロックワークフロー

```yaml
# .github/workflows/pr-security-gate.yml
name: PR Security Gate

on:
  pull_request:
    branches: [main]

jobs:
  security-gate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check for Critical/High vulnerabilities
        id: audit
        run: |
          # Critical/Highの脆弱性数をカウント
          CRITICAL=$(pnpm audit --json 2>/dev/null | jq '[.advisories[] | select(.severity == "critical")] | length')
          HIGH=$(pnpm audit --json 2>/dev/null | jq '[.advisories[] | select(.severity == "high")] | length')

          echo "critical=$CRITICAL" >> $GITHUB_OUTPUT
          echo "high=$HIGH" >> $GITHUB_OUTPUT

          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::Found $CRITICAL critical vulnerabilities"
            exit 1
          fi

          if [ "$HIGH" -gt 0 ]; then
            echo "::warning::Found $HIGH high vulnerabilities"
          fi

      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚨 **Security vulnerabilities detected!**\n\nThis PR introduces or contains critical security vulnerabilities. Please run `pnpm audit` and fix the issues before merging.'
            })
```

## Dependabot設定

### 基本設定

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "pnpm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10

    # セキュリティアップデートを優先
    groups:
      security-updates:
        applies-to: security-updates
        patterns:
          - "*"

    # 自動マージの設定
    allow:
      - dependency-type: "direct"
      - dependency-type: "production"

    # 無視するパッケージ
    ignore:
      - dependency-name: "typescript"
        update-types: ["version-update:semver-major"]

    # コミットメッセージのカスタマイズ
    commit-message:
      prefix: "deps"
      prefix-development: "deps(dev)"
      include: "scope"
```

### セキュリティアラートの自動修正

```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Dependabot Auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"

      - name: Auto-merge patch updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-merge security updates
        if: steps.metadata.outputs.dependency-type == 'direct:production' && steps.metadata.outputs.update-type != 'version-update:semver-major'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## GitLab CI/CD統合

```yaml
# .gitlab-ci.yml
stages:
  - security

security-audit:
  stage: security
  image: node:20

  before_script:
    - pnpm install -g pnpm
    - pnpm install --frozen-lockfile

  script:
    - pnpm audit --audit-level=high --json > audit-report.json

  artifacts:
    reports:
      dependency_scanning: audit-report.json
    paths:
      - audit-report.json
    expire_in: 1 week

  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_PIPELINE_SOURCE == "schedule"

container-scanning:
  stage: security
  image: docker:stable

  services:
    - docker:dind

  variables:
    DOCKER_DRIVER: overlay2

  script:
    - docker pull aquasec/trivy
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

## Jenkins統合

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        SNYK_TOKEN = credentials('snyk-token')
    }

    stages {
        stage('Install') {
            steps {
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Security Audit') {
            parallel {
                stage('pnpm audit') {
                    steps {
                        sh '''
                            pnpm audit --json > pnpm-audit.json || true
                            cat pnpm-audit.json
                        '''
                    }
                }

                stage('Snyk scan') {
                    steps {
                        sh '''
                            snyk test --severity-threshold=high --json > snyk-report.json || true
                        '''
                    }
                }
            }
        }

        stage('Evaluate Results') {
            steps {
                script {
                    def auditResult = readJSON file: 'pnpm-audit.json'
                    def criticalCount = auditResult.metadata?.vulnerabilities?.critical ?: 0

                    if (criticalCount > 0) {
                        error "Found ${criticalCount} critical vulnerabilities!"
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '*-report.json', fingerprint: true
        }

        failure {
            emailext (
                subject: "Security Audit Failed: ${env.JOB_NAME}",
                body: "Critical vulnerabilities were found. Please check the build logs.",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }
    }
}
```

## セキュリティゲートの設定

### 重大度別ブロック設定

```yaml
# security-policy.yml
version: 1

# ビルドをブロックする条件
block_on:
  critical: true      # Critical は常にブロック
  high: true          # High もブロック
  medium: false       # Medium は警告のみ
  low: false          # Low は無視

# 例外設定
exceptions:
  # 特定のCVEを一時的に許可
  - cve: "CVE-2023-XXXXX"
    reason: "パッチ待ち、2025-12-01まで"
    expires: "2025-12-01"

  # 開発依存は許可
  - type: "devDependencies"
    severity: ["medium", "low"]
```

### 通知設定

```yaml
# .github/workflows/security-notification.yml
name: Security Notification

on:
  schedule:
    - cron: '0 9 * * 1'  # 毎週月曜 9:00 UTC
  workflow_dispatch:

jobs:
  weekly-report:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run audit
        run: pnpm audit --json > audit.json || true

      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          payload-file-path: audit.json
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## チェックリスト

### CI/CD統合時
- [ ] 基本的な監査ワークフローを設定したか？
- [ ] PRブロック条件を定義したか？
- [ ] Dependabotを有効化したか？
- [ ] 通知設定を行ったか？

### 運用時
- [ ] 監査結果を定期的にレビューしているか？
- [ ] 例外リストを最新に保っているか？
- [ ] ブロック条件が適切か定期的に見直しているか？
