# GitHub REST API in Actions

## 目次

1. [認証 (Authentication)](#認証-authentication)
2. [gh CLI](#gh-cli)
3. [curl による REST API](#curl-による-rest-api)
4. [Octokit (Node.js)](#octokit-nodejs)
5. [実践パターン](#実践パターン)
6. [エラーハンドリング](#エラーハンドリング)

## 認証 (Authentication)

### GITHUB_TOKEN

デフォルトで利用可能な自動生成トークン:

```yaml
- name: Use GITHUB_TOKEN
  run: gh issue list
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**権限設定**:

```yaml
permissions:
  contents: read # リポジトリコンテンツ読み取り
  issues: write # Issue作成・編集
  pull-requests: write # PR作成・編集
  packages: write # パッケージ公開
```

### Personal Access Token (PAT)

他リポジトリやOrganization操作が必要な場合:

```yaml
- name: Use PAT
  run: gh issue create --repo other-owner/other-repo --title "Test"
  env:
    GH_TOKEN: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```

**PAT作成手順**:

1. Settings → Developer settings → Personal access tokens
2. Generate new token (classic or fine-grained)
3. 必要なスコープを選択
4. リポジトリのSecrets に追加

### GitHub App Token

高度な認証が必要な場合:

```yaml
- name: Generate App Token
  id: generate_token
  uses: actions/create-github-app-token@v1
  with:
    app-id: ${{ secrets.APP_ID }}
    private-key: ${{ secrets.APP_PRIVATE_KEY }}

- name: Use App Token
  run: gh api /repos/${{ github.repository }}/issues
  env:
    GH_TOKEN: ${{ steps.generate_token.outputs.token }}
```

## gh CLI

### 基本構文

```bash
gh <command> <subcommand> [flags]
```

**主要コマンド**:

- `gh issue`: Issue操作
- `gh pr`: Pull Request操作
- `gh release`: リリース操作
- `gh api`: 直接API呼び出し
- `gh repo`: リポジトリ操作

### Issue 操作

#### Issue作成

```yaml
- name: Create issue
  run: |
    gh issue create \
      --title "Bug: Login fails" \
      --body "Description of the bug" \
      --label "bug,high-priority" \
      --assignee octocat \
      --milestone "v1.0"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Issue一覧取得

```yaml
- name: List open issues
  run: |
    gh issue list \
      --state open \
      --label bug \
      --limit 10 \
      --json number,title,author
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Issue更新

```yaml
- name: Close issue
  run: gh issue close ${{ github.event.issue.number }} --comment "Fixed in v1.0"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Issueコメント追加

```yaml
- name: Add comment
  run: |
    gh issue comment ${{ github.event.issue.number }} \
      --body "Thank you for reporting this issue!"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Pull Request 操作

#### PR作成

```yaml
- name: Create PR
  run: |
    gh pr create \
      --title "feat: Add new feature" \
      --body "Implements feature X" \
      --base main \
      --head feature-branch \
      --label "enhancement" \
      --reviewer octocat,hubot
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### PR一覧取得

```yaml
- name: List PRs
  run: |
    gh pr list \
      --state open \
      --label ready-for-review \
      --json number,title,author,reviews
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### PRマージ

```yaml
- name: Merge PR
  run: |
    gh pr merge ${{ github.event.pull_request.number }} \
      --squash \
      --delete-branch \
      --body "Merged by automation"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### PRレビュー

```yaml
- name: Approve PR
  run: |
    gh pr review ${{ github.event.pull_request.number }} \
      --approve \
      --body "LGTM! 🚀"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Release 操作

#### リリース作成

```yaml
- name: Create release
  run: |
    gh release create v${{ github.run_number }} \
      --title "Release v${{ github.run_number }}" \
      --notes "Release notes here" \
      --draft \
      dist/*.zip
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### リリース一覧取得

```yaml
- name: List releases
  run: gh release list --limit 5
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### リリース公開

```yaml
- name: Publish release
  run: gh release edit v${{ github.run_number }} --draft=false
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### リポジトリ操作

#### リポジトリ情報取得

```yaml
- name: Get repo info
  run: gh repo view ${{ github.repository }} --json name,description,stargazersCount
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### ラベル管理

```yaml
- name: Create label
  run: |
    gh label create "automated" \
      --description "Created by automation" \
      --color "FF6B6B"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### API 直接呼び出し

```yaml
- name: Call API directly
  run: |
    gh api \
      -X POST \
      -H "Accept: application/vnd.github.v3+json" \
      /repos/${{ github.repository }}/dispatches \
      -f event_type=deploy \
      -f client_payload='{"version":"1.0"}'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## curl による REST API

### 基本構文

```bash
curl -X <METHOD> \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/<endpoint> \
  -d '<json-body>'
```

### Issue 操作

#### Issue作成

```yaml
- name: Create issue with curl
  run: |
    curl -X POST \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/${{ github.repository }}/issues \
      -d '{
        "title": "Bug report",
        "body": "Description of the bug",
        "labels": ["bug"],
        "assignees": ["octocat"]
      }'
```

#### Issue一覧取得

```yaml
- name: List issues
  run: |
    curl \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/${{ github.repository }}/issues?state=open&per_page=10"
```

#### Issue更新

```yaml
- name: Update issue
  run: |
    curl -X PATCH \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/${{ github.repository }}/issues/${{ github.event.issue.number }} \
      -d '{"state": "closed"}'
```

### Pull Request 操作

#### PR作成

```yaml
- name: Create PR with curl
  run: |
    curl -X POST \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/${{ github.repository }}/pulls \
      -d '{
        "title": "Feature: New feature",
        "body": "Implements feature X",
        "head": "feature-branch",
        "base": "main"
      }'
```

#### PRマージ

```yaml
- name: Merge PR
  run: |
    curl -X PUT \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }}/merge \
      -d '{
        "merge_method": "squash",
        "commit_title": "feat: Add feature X",
        "commit_message": "Merged via automation"
      }'
```

### Repository Dispatch

カスタムワークフローイベントをトリガー:

```yaml
- name: Trigger workflow
  run: |
    curl -X POST \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/${{ github.repository }}/dispatches \
      -d '{
        "event_type": "deploy",
        "client_payload": {
          "version": "1.0.0",
          "environment": "production"
        }
      }'
```

## Octokit (Node.js)

### セットアップ

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "20"

- name: Install Octokit
  run: pnpm install @octokit/rest

- name: Run script
  run: node scripts/github-api.js
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 基本パターン

```javascript
// scripts/github-api.js
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Issue作成
const { data: issue } = await octokit.issues.create({
  owner: "octocat",
  repo: "hello-world",
  title: "Bug report",
  body: "Description of the bug",
  labels: ["bug"],
});

console.log(`Created issue #${issue.number}`);
```

### 実践例

```javascript
// 複数操作の組み合わせ
async function automateWorkflow() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // 1. PR一覧取得
  const { data: prs } = await octokit.pulls.list({
    owner: "octocat",
    repo: "hello-world",
    state: "open",
  });

  // 2. ラベル付け
  for (const pr of prs) {
    if (pr.title.startsWith("feat:")) {
      await octokit.issues.addLabels({
        owner: "octocat",
        repo: "hello-world",
        issue_number: pr.number,
        labels: ["enhancement"],
      });
    }
  }

  // 3. リリースノート生成
  const { data: release } = await octokit.repos.generateReleaseNotes({
    owner: "octocat",
    repo: "hello-world",
    tag_name: "v1.0.0",
  });

  console.log(release.body);
}
```

## 実践パターン

### 自動ラベル付け

```yaml
name: Auto Label

on:
  pull_request:
    types: [opened]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Label PR based on files
        run: |
          files=$(gh pr view ${{ github.event.pull_request.number }} --json files -q '.files[].path')

          if echo "$files" | grep -q "src/"; then
            gh pr edit ${{ github.event.pull_request.number }} --add-label "backend"
          fi

          if echo "$files" | grep -q "frontend/"; then
            gh pr edit ${{ github.event.pull_request.number }} --add-label "frontend"
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Issue自動クローズ

```yaml
name: Auto Close Stale Issues

on:
  schedule:
    - cron: "0 0 * * 0" # 毎週日曜日

jobs:
  close-stale:
    runs-on: ubuntu-latest
    steps:
      - name: Close stale issues
        run: |
          # 30日以上更新されていないIssueを取得
          gh issue list \
            --state open \
            --label "stale" \
            --json number,updatedAt \
            --jq '.[] | select(.updatedAt | fromdateiso8601 < (now - 2592000)) | .number' \
            | while read issue; do
              gh issue close $issue --comment "Closing due to inactivity"
            done
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### PR自動承認

```yaml
name: Auto Approve Dependabot PRs

on:
  pull_request:
    types: [opened]

jobs:
  auto-approve:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Approve PR
        run: |
          gh pr review ${{ github.event.pull_request.number }} \
            --approve \
            --body "Auto-approved Dependabot PR"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## エラーハンドリング

### レート制限処理

```yaml
- name: Handle rate limits
  run: |
    # レート制限状況確認
    gh api rate_limit

    # リトライロジック
    for i in {1..3}; do
      if gh issue create --title "Test"; then
        break
      else
        echo "Retry $i/3"
        sleep 60
      fi
    done
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### エラーハンドリング

```yaml
- name: Safe API call
  run: |
    if ! gh issue create --title "Test" 2>/dev/null; then
      echo "Failed to create issue"
      exit 1
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### ステータスコードチェック (curl)

```yaml
- name: Check response status
  run: |
    response=$(curl -s -w "\n%{http_code}" \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      https://api.github.com/repos/${{ github.repository }}/issues)

    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status" -ne 200 ]; then
      echo "API call failed with status $status"
      exit 1
    fi

    echo "$body"
```

## ベストプラクティス

### 1. 最小権限の原則

必要な権限のみを付与:

```yaml
permissions:
  issues: write # Issueのみ書き込み可能
```

### 2. トークン管理

環境変数を適切に使用:

```yaml
env:
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. エラーハンドリング

失敗時の処理を実装:

```yaml
- name: Create issue
  continue-on-error: true
  run: gh issue create --title "Test"
```

### 4. レート制限対応

不必要なAPI呼び出しを避ける:

```yaml
# ❌ 悪い例: ループ内でAPI呼び出し
- run: |
    for file in *.txt; do
      gh issue create --title "$file"
    done

# ✅ 良い例: バッチ処理
- run: |
    files=$(ls *.txt | jq -R -s -c 'split("\n")[:-1]')
    gh api -X POST /repos/${{ github.repository }}/issues \
      -f title="Multiple files" \
      -f body="Files: $files"
```

### 5. JSON出力活用

パース可能な形式で出力:

```yaml
- name: Get issue data
  id: issue
  run: |
    issue=$(gh issue view ${{ github.event.issue.number }} --json number,title,body)
    echo "data=$issue" >> $GITHUB_OUTPUT
```
