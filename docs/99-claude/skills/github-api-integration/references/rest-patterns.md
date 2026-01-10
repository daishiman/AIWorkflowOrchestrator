# GitHub REST API 実装パターン

> 18-skills.md §3.5 準拠
> **相対パス**: `references/rest-patterns.md`

---

## 概要

GitHub REST APIとgh CLIを使用した実装パターン集。Issue、PR、Release操作の実践的な例を提供。

---

## gh CLI パターン

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

#### Issueクローズ

```yaml
- name: Close issue
  run: gh issue close ${{ github.event.issue.number }} --comment "Fixed in v1.0"
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
      --body "LGTM!"
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

#### リリース公開

```yaml
- name: Publish release
  run: gh release edit v${{ github.run_number }} --draft=false
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## curl REST API パターン

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
        "body": "Description",
        "labels": ["bug"],
        "assignees": ["octocat"]
      }'
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

### Repository Dispatch

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

---

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
    permissions:
      pull-requests: write
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
    - cron: "0 0 * * 0"

jobs:
  close-stale:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - name: Close stale issues
        run: |
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

### Dependabot PR自動承認

```yaml
name: Auto Approve Dependabot PRs

on:
  pull_request:
    types: [opened]

jobs:
  auto-approve:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    permissions:
      pull-requests: write
    steps:
      - name: Approve PR
        run: |
          gh pr review ${{ github.event.pull_request.number }} \
            --approve \
            --body "Auto-approved Dependabot PR"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## エラーハンドリング

### レート制限処理

```yaml
- name: Handle rate limits
  run: |
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

### ステータスコードチェック

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

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **GraphQL実装**: See [graphql-patterns.md](graphql-patterns.md)
