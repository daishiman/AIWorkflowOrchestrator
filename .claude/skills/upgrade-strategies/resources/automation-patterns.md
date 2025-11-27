# 自動化パターン

## 概要

依存関係のアップグレードを自動化することで、
セキュリティパッチの迅速な適用と継続的なメンテナンスを実現します。

## Dependabot設定

### 基本設定

```yaml
# .github/dependabot.yml
version: 2

updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
      time: "09:00"
      timezone: "Asia/Tokyo"
    open-pull-requests-limit: 10

    # グループ化設定
    groups:
      production-dependencies:
        applies-to: version-updates
        patterns:
          - "*"
        exclude-patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
        update-types:
          - "minor"
          - "patch"

      dev-dependencies:
        applies-to: version-updates
        patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
          - "typescript"
        update-types:
          - "minor"
          - "patch"

    # レビュアーとラベル
    reviewers:
      - "team/engineering"
    labels:
      - "dependencies"
      - "automated"

    # コミットメッセージ
    commit-message:
      prefix: "deps"
      prefix-development: "deps(dev)"
      include: "scope"
```

### セキュリティアップデートの設定

```yaml
# .github/dependabot.yml (続き)
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"

    # セキュリティアップデートは特別扱い
    groups:
      security-updates:
        applies-to: security-updates
        patterns:
          - "*"

    # セキュリティアップデートは即時
    security-updates:
      open-pull-requests-limit: 20
```

## Renovate設定

### 基本設定

```json
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:base",
    ":disableRateLimiting"
  ],
  "schedule": ["before 9am on Monday"],
  "timezone": "Asia/Tokyo",
  "labels": ["dependencies", "automated"],
  "prConcurrentLimit": 10,

  "packageRules": [
    {
      "description": "Automerge patch updates",
      "matchUpdateTypes": ["patch"],
      "automerge": true
    },
    {
      "description": "Group dev dependencies",
      "matchDepTypes": ["devDependencies"],
      "groupName": "dev dependencies"
    },
    {
      "description": "Group type definitions",
      "matchPackagePatterns": ["^@types/"],
      "groupName": "type definitions"
    }
  ]
}
```

### 高度な設定

```json
// renovate.json（高度な設定）
{
  "extends": ["config:base"],

  "packageRules": [
    {
      "description": "Security updates - immediate",
      "matchUpdateTypes": ["patch", "minor"],
      "matchCategories": ["security"],
      "automerge": true,
      "schedule": ["at any time"]
    },
    {
      "description": "Major updates - manual review",
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "labels": ["breaking-change"]
    },
    {
      "description": "Framework updates - careful",
      "matchPackagePatterns": ["^react", "^vue", "^angular"],
      "automerge": false,
      "labels": ["framework"],
      "prPriority": 1
    },
    {
      "description": "Pin GitHub Actions",
      "matchManagers": ["github-actions"],
      "pinDigests": true
    }
  ],

  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"]
  },

  "prBodyDefinitions": {
    "Release": "[![Release Notes](https://img.shields.io/badge/Release-Notes-blue)]({{{releaseUrl}}})"
  }
}
```

## GitHub Actions自動マージ

### Dependabot PRの自動マージ

```yaml
# .github/workflows/dependabot-automerge.yml
name: Dependabot Auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"

      - name: Wait for CI
        uses: lewagon/wait-on-check-action@v1.3.3
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          check-name: 'test'
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          wait-interval: 10

      - name: Auto-merge patch updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-merge minor dev dependencies
        if: |
          steps.metadata.outputs.update-type == 'version-update:semver-minor' &&
          steps.metadata.outputs.dependency-type == 'direct:development'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 自動リリースノート

```yaml
# .github/workflows/release-notes.yml
name: Update Release Notes

on:
  pull_request:
    types: [closed]
    paths:
      - 'package.json'
      - 'pnpm-lock.yaml'

jobs:
  update-changelog:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Extract dependency changes
        id: changes
        run: |
          git diff HEAD~1 HEAD -- package.json | grep -E '^\+.*"version"' > changes.txt || true
          echo "changes=$(cat changes.txt)" >> $GITHUB_OUTPUT

      - name: Update CHANGELOG
        if: steps.changes.outputs.changes != ''
        run: |
          # CHANGELOGを更新するスクリプト
          echo "## $(date +%Y-%m-%d)" >> CHANGELOG.md
          echo "### Dependencies" >> CHANGELOG.md
          cat changes.txt >> CHANGELOG.md
```

## 定期スキャンワークフロー

### 週次アップグレードチェック

```yaml
# .github/workflows/weekly-upgrade-check.yml
name: Weekly Upgrade Check

on:
  schedule:
    - cron: '0 9 * * 1'  # 毎週月曜 9:00 UTC
  workflow_dispatch:

jobs:
  check-upgrades:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Check outdated packages
        id: outdated
        run: |
          pnpm outdated --format json > outdated.json || true
          echo "count=$(jq length outdated.json)" >> $GITHUB_OUTPUT

      - name: Create issue if updates available
        if: steps.outdated.outputs.count > 0
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const outdated = JSON.parse(fs.readFileSync('outdated.json', 'utf8'));

            const body = `## 更新可能なパッケージ\n\n` +
              Object.entries(outdated).map(([pkg, info]) =>
                `- **${pkg}**: ${info.current} → ${info.latest}`
              ).join('\n');

            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `[Automated] ${Object.keys(outdated).length}個のパッケージが更新可能です`,
              body: body,
              labels: ['dependencies', 'automated']
            });
```

### セキュリティスキャン

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 3 * * *'  # 毎日 3:00 UTC
  push:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2

      - name: Run audit
        run: pnpm audit --json > audit.json || true

      - name: Check for critical vulnerabilities
        id: check
        run: |
          CRITICAL=$(jq '.metadata.vulnerabilities.critical' audit.json)
          HIGH=$(jq '.metadata.vulnerabilities.high' audit.json)
          echo "critical=$CRITICAL" >> $GITHUB_OUTPUT
          echo "high=$HIGH" >> $GITHUB_OUTPUT

      - name: Alert on critical
        if: steps.check.outputs.critical > 0
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚨 Critical vulnerability detected!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Critical vulnerabilities found in dependencies*\nPlease review immediately."
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## チェックリスト

### 自動化設定時
- [ ] Dependabot/Renovateを設定したか？
- [ ] 自動マージ条件を定義したか？
- [ ] セキュリティアラートを有効化したか？
- [ ] 通知設定を行ったか？

### 運用時
- [ ] 自動PRが正常に作成されているか？
- [ ] CIが正常に動作しているか？
- [ ] 自動マージが期待通りに動作しているか？
- [ ] セキュリティアラートが適切に通知されているか？
