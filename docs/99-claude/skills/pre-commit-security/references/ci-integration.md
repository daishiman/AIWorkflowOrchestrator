# CI/CD統合ガイド

## 概要

CI/CDパイプラインにシークレット検出を統合し、ローカルhookをバイパスされても最終防衛線として機能させる。GitHub Actions、GitLab CI、その他CI/CDサービスでの実装方法をカバーする。

## なぜCI/CD統合が必要か

### ローカルhookの限界

**問題点**:

- `git commit --no-verify` でバイパス可能
- チームメンバー全員がhookをセットアップしているとは限らない
- ツールのバージョン差異

**対策**:
CI/CDで必須チェックを実施し、pushやPRマージ前に確実にブロックする。

### 多層防御戦略

```
第1層: ローカルpre-commit hook
  ↓ バイパスされた場合
第2層: CI/CDでのスキャン（PR時）
  ↓ 検出時
第3層: マージブロック
```

## GitHub Actions統合

### 基本設定

**.github/workflows/security.yml**:

```yaml
name: Secret Scan
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 履歴全体を取得

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### SARIF形式でのレポート出力

**高度な設定**:

```yaml
name: Secret Scan
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write # SARIF upload用

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload SARIF report
        if: failure()
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: gitleaks-report.sarif

      - name: Upload artifact
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: gitleaks-report
          path: gitleaks-report.sarif
```

**メリット**:

- GitHub Security タブで可視化
- 検出されたシークレットの行番号を表示
- 履歴追跡

### git-secrets使用例

```yaml
name: Secret Scan (git-secrets)
on: [push, pull_request]

jobs:
  git-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install git-secrets
        run: |
          git clone https://github.com/awslabs/git-secrets.git
          cd git-secrets
          sudo make install

      - name: Configure git-secrets
        run: |
          git secrets --install
          git secrets --register-aws
          git secrets --add 'sk-proj-[a-zA-Z0-9]{48}'
          git secrets --add 'sk-ant-api03-[a-zA-Z0-9_-]{95}'

      - name: Scan history
        run: |
          git secrets --scan-history
```

### 必須チェック設定

**Branch Protection Rulesで強制**:

1. GitHub リポジトリ → Settings → Branches
2. Branch protection rule 追加（`main`、`develop`など）
3. "Require status checks to pass before merging" を有効化
4. "gitleaks" を必須チェックに追加

**結果**:

- シークレット検出時はPRマージ不可
- 確実にブロック

## GitLab CI統合

### 基本設定

**.gitlab-ci.yml**:

```yaml
gitleaks:
  stage: test
  image: zricethezav/gitleaks:latest
  script:
    - gitleaks detect --verbose --report-format json --report-path gitleaks-report.json
  artifacts:
    reports:
      sast: gitleaks-report.json
    when: always
  allow_failure: false # 検出時にパイプライン失敗
```

### SAST統合

**GitLab Security Dashboard統合**:

```yaml
include:
  - template: Security/SAST.gitlab-ci.yml

gitleaks-sast:
  stage: test
  image: zricethezav/gitleaks:latest
  script:
    - gitleaks detect --verbose --report-format sarif --report-path gl-sast-report.json
  artifacts:
    reports:
      sast: gl-sast-report.json
```

**メリット**:

- GitLab Security Dashboardで可視化
- Merge Request画面で直接確認
- 履歴追跡

### 必須チェック設定

**Merge Request承認ルール**:

1. GitLab リポジトリ → Settings → Merge requests
2. "Pipelines must succeed" を有効化

**結果**:

- パイプライン失敗時はMR承認不可

## その他CI/CDサービス

### CircleCI

**.circleci/config.yml**:

```yaml
version: 2.1

jobs:
  gitleaks:
    docker:
      - image: zricethezav/gitleaks:latest
    steps:
      - checkout
      - run:
          name: Run Gitleaks
          command: gitleaks detect --verbose --report-format json --report-path gitleaks-report.json
      - store_artifacts:
          path: gitleaks-report.json

workflows:
  version: 2
  main:
    jobs:
      - gitleaks
```

### Jenkins

**Jenkinsfile**:

```groovy
pipeline {
  agent any

  stages {
    stage('Secret Scan') {
      steps {
        script {
          docker.image('zricethezav/gitleaks:latest').inside {
            sh 'gitleaks detect --verbose --report-format json --report-path gitleaks-report.json'
          }
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'gitleaks-report.json', fingerprint: true
        }
        failure {
          emailext(
            subject: "Secret detected in ${env.JOB_NAME}",
            body: "Please check the build log.",
            to: "${env.CHANGE_AUTHOR_EMAIL}"
          )
        }
      }
    }
  }
}
```

### Azure Pipelines

**azure-pipelines.yml**:

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: "ubuntu-latest"

steps:
  - task: Docker@2
    displayName: "Run Gitleaks"
    inputs:
      command: "run"
      arguments: "--rm -v $(Build.SourcesDirectory):/repo zricethezav/gitleaks:latest detect --source /repo --verbose --report-format sarif --report-path /repo/gitleaks-report.sarif"

  - task: PublishBuildArtifacts@1
    condition: failed()
    inputs:
      pathToPublish: "gitleaks-report.sarif"
      artifactName: "gitleaks-report"
```

## スキャン範囲の最適化

### 差分のみスキャン（高速化）

**PR時は差分のみ**:

```yaml
# GitHub Actions
- name: Run Gitleaks (PR only)
  if: github.event_name == 'pull_request'
  run: |
    gitleaks detect --verbose --log-opts="origin/${{ github.base_ref }}..HEAD"

# 全履歴スキャン（mainへのpush時のみ）
- name: Run Gitleaks (Full scan)
  if: github.ref == 'refs/heads/main'
  run: |
    gitleaks detect --verbose --log-opts="--all"
```

**メリット**:

- PR時は高速
- mainへのpush時のみ全履歴スキャン

### キャッシュ活用

**gitleaksキャッシュ（GitHub Actions）**:

```yaml
- name: Cache Gitleaks
  uses: actions/cache@v3
  with:
    path: ~/.cache/gitleaks
    key: ${{ runner.os }}-gitleaks-${{ hashFiles('.gitleaks.toml') }}

- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
```

## 通知設定

### Slack通知

**GitHub Actions + Slack**:

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: |
      🚨 Secret detected in ${{ github.repository }}
      Branch: ${{ github.ref }}
      Author: ${{ github.actor }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Discord通知

```yaml
- name: Notify Discord on failure
  if: failure()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    title: "Secret Scan Failed"
    description: "Secret detected in commit ${{ github.sha }}"
```

### Email通知

**GitLab CI**:

```yaml
gitleaks:
  stage: test
  script:
    - gitleaks detect --verbose
  after_script:
    - |
      if [ $CI_JOB_STATUS == "failed" ]; then
        echo "Secret detected!" | mail -s "Security Alert" security-team@example.com
      fi
```

## レポート管理

### アーティファクト保存

**GitHub Actions**:

```yaml
- name: Upload report
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: gitleaks-report-${{ github.sha }}
    path: gitleaks-report.sarif
    retention-days: 90
```

**GitLab CI**:

```yaml
artifacts:
  reports:
    sast: gitleaks-report.json
  paths:
    - gitleaks-report.json
  expire_in: 90 days
```

### S3へのアップロード

**長期保存用**:

```yaml
- name: Upload to S3
  if: always()
  run: |
    aws s3 cp gitleaks-report.sarif s3://security-reports/gitleaks/${{ github.sha }}.sarif
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## パフォーマンス最適化

### 並列実行

**モノレポでの分割スキャン**:

```yaml
strategy:
  matrix:
    path:
      - apps/web
      - apps/desktop
      - packages/shared

steps:
  - name: Run Gitleaks
    run: |
      gitleaks detect --source ${{ matrix.path }} --verbose
```

### タイムアウト設定

```yaml
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    timeout-minutes: 10 # 10分でタイムアウト
    steps:
      - name: Run Gitleaks
        run: gitleaks detect --verbose
```

## トラブルシューティング

### CI/CDでのみ検出される

**原因**:

- ローカルとCI/CDでツールバージョンが異なる
- 設定ファイル（.gitleaks.toml）の差異

**対策**:

```yaml
# バージョン固定
- uses: gitleaks/gitleaks-action@v2
  with:
    version: 8.18.0 # バージョン指定
```

### 誤検知が多い

**対策**:

```yaml
# .gitleaks.toml をCI/CDで使用
- name: Run Gitleaks with config
  run: |
    gitleaks detect --config .gitleaks.toml --verbose
```

### パフォーマンスが遅い

**対策**:

1. 差分のみスキャン
2. 並列実行
3. キャッシュ活用
4. 不要なブランチでスキャンしない

```yaml
on:
  pull_request:
    branches: [main, develop] # 特定ブランチのみ
```

## セキュリティベストプラクティス

### 1. Secretsの安全な管理

```yaml
# ❌ 悪い例
- run: echo $MY_SECRET

# ✅ 良い例
- run: |
    echo "::add-mask::${{ secrets.MY_SECRET }}"
    echo ${{ secrets.MY_SECRET }}
```

### 2. 最小権限の原則

```yaml
permissions:
  contents: read # 読み取りのみ
  security-events: write # SARIF upload用のみ
```

### 3. 検出時の即座な対応

**自動Issue作成**:

```yaml
- name: Create Issue on detection
  if: failure()
  uses: actions/github-script@v6
  with:
    script: |
      github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: '🚨 Secret detected in commit ${{ github.sha }}',
        body: 'Please review and rotate the exposed secret immediately.',
        labels: ['security', 'urgent']
      })
```

## 完全な例：GitHub Actions（本番推奨）

**.github/workflows/security.yml**:

```yaml
name: Security Scan
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Gitleaks (PR)
        if: github.event_name == 'pull_request'
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Run Gitleaks (Full scan on main)
        if: github.ref == 'refs/heads/main'
        run: |
          docker run --rm -v $(pwd):/repo zricethezav/gitleaks:latest \
            detect --source /repo --verbose --log-opts="--all" \
            --report-format sarif --report-path /repo/gitleaks-report.sarif

      - name: Upload SARIF
        if: failure()
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: gitleaks-report.sarif

      - name: Notify Slack
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: "🚨 Secret detected in ${{ github.repository }}"
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Create Issue
        if: failure() && github.ref == 'refs/heads/main'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Secret detected in production branch',
              body: 'Immediate action required. Review commit ${{ github.sha }}.',
              labels: ['security', 'critical']
            })
```

## 次のステップ

- **チーム展開**: See [deployment.md](deployment.md)
- **パターン設計**: See [patterns.md](patterns.md)
- **基礎ガイド**: See [basics.md](basics.md)
