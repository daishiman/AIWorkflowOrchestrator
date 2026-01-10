# GitHub GraphQL API 実装パターン

> 18-skills.md §3.5 準拠
> **相対パス**: `references/graphql-patterns.md`

---

## 概要

GitHub GraphQL APIを使用した実装パターン集。複雑なデータ取得とミューテーションの実践的な例を提供。

---

## GraphQL vs REST

| 特徴         | REST API      | GraphQL API      |
| ------------ | ------------- | ---------------- |
| リクエスト数 | 複数必要      | 1回で完結        |
| データ取得   | 過剰/不足あり | 必要なデータのみ |
| 型安全性     | なし          | スキーマベース   |
| 学習曲線     | 緩やか        | やや急           |

### GraphQL適用ケース

- 複数リソースから関連データを取得
- ネストした関係データ（PR + レビュー + コミット）
- 必要なフィールドのみ取得して効率化
- リクエスト数を最小化したい

---

## 基本構文

### gh CLIでのGraphQL

```bash
gh api graphql -f query='<graphql-query>' [variables]
```

### シンプルなクエリ

```yaml
- name: Get repository info
  run: |
    gh api graphql -f query='
      query {
        viewer {
          login
          name
        }
      }
    '
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 変数を使ったクエリ

```yaml
- name: Query with variables
  run: |
    gh api graphql -f query='
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          name
          description
          stargazerCount
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F name=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## クエリパターン

### PR一覧取得

```yaml
- name: List open PRs
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 10, states: OPEN) {
            totalCount
            nodes {
              number
              title
              author { login }
              createdAt
              url
            }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### PRとレビューステータス

```yaml
- name: PRs with review status
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 20, states: OPEN) {
            nodes {
              number
              title
              reviewDecision
              reviews(last: 5) {
                nodes {
                  author { login }
                  state
                  submittedAt
                }
              }
              commits(last: 1) {
                nodes {
                  commit {
                    statusCheckRollup { state }
                  }
                }
              }
            }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Issueとラベル取得

```yaml
- name: Issues with labels
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!, $labels: [String!]) {
        repository(owner: $owner, name: $repo) {
          issues(first: 20, labels: $labels, states: OPEN) {
            nodes {
              number
              title
              labels(first: 10) {
                nodes { name color }
              }
              assignees(first: 5) {
                nodes { login }
              }
            }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }} \
      -F labels='["bug","high-priority"]'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### コミット履歴取得

```yaml
- name: Get commit history
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!, $branch: String!) {
        repository(owner: $owner, name: $repo) {
          ref(qualifiedName: $branch) {
            target {
              ... on Commit {
                history(first: 20) {
                  nodes {
                    oid
                    message
                    author { name email date }
                    additions
                    deletions
                  }
                }
              }
            }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }} \
      -F branch="refs/heads/main"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## ミューテーション

### Issue作成

```yaml
- name: Create issue
  run: |
    gh api graphql -f query='
      mutation($repositoryId: ID!, $title: String!, $body: String!) {
        createIssue(input: {
          repositoryId: $repositoryId
          title: $title
          body: $body
        }) {
          issue {
            number
            url
          }
        }
      }
    ' -F repositoryId=${{ github.event.repository.node_id }} \
      -F title="Automated issue" \
      -F body="Created via GraphQL"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### コメント追加

```yaml
- name: Add comment
  run: |
    gh api graphql -f query='
      mutation($subjectId: ID!, $body: String!) {
        addComment(input: {
          subjectId: $subjectId
          body: $body
        }) {
          commentEdge {
            node { id url }
          }
        }
      }
    ' -F subjectId=${{ github.event.issue.node_id }} \
      -F body="Thank you for your contribution!"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### PRマージ

```yaml
- name: Merge PR
  run: |
    gh api graphql -f query='
      mutation($pullRequestId: ID!, $mergeMethod: PullRequestMergeMethod!) {
        mergePullRequest(input: {
          pullRequestId: $pullRequestId
          mergeMethod: $mergeMethod
        }) {
          pullRequest { merged mergedAt }
        }
      }
    ' -F pullRequestId=${{ github.event.pull_request.node_id }} \
      -F mergeMethod="SQUASH"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Issueクローズ

```yaml
- name: Close issue
  run: |
    gh api graphql -f query='
      mutation($issueId: ID!, $reason: IssueClosedStateReason) {
        closeIssue(input: {
          issueId: $issueId
          stateReason: $reason
        }) {
          issue { closed closedAt }
        }
      }
    ' -F issueId=${{ github.event.issue.node_id }} \
      -F reason="COMPLETED"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 最適化テクニック

### ページネーション

```yaml
- name: Paginate results
  run: |
    gh api graphql --paginate -f query='
      query($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          issues(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes { number title }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### フラグメント活用

```yaml
- name: Use fragments
  run: |
    gh api graphql -f query='
      fragment IssueFields on Issue {
        number
        title
        author { login }
        labels(first: 5) { nodes { name } }
      }

      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          openIssues: issues(first: 10, states: OPEN) {
            nodes { ...IssueFields }
          }
          closedIssues: issues(first: 10, states: CLOSED) {
            nodes { ...IssueFields }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### エイリアス活用

```yaml
- name: Use aliases
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          bugs: issues(first: 10, labels: ["bug"]) { totalCount }
          features: issues(first: 10, labels: ["enhancement"]) { totalCount }
          docs: issues(first: 10, labels: ["documentation"]) { totalCount }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## エラーハンドリング

### エラーチェック

```yaml
- name: Handle GraphQL errors
  run: |
    response=$(gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) { name }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo="nonexistent-repo" 2>&1 || echo "error")

    if echo "$response" | grep -q "error"; then
      echo "Query failed"
      exit 1
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### リトライロジック

```yaml
- name: Retry on failure
  run: |
    max_retries=3
    retry_count=0

    while [ $retry_count -lt $max_retries ]; do
      if gh api graphql -f query='{ viewer { login } }'; then
        echo "Success"
        break
      else
        retry_count=$((retry_count + 1))
        echo "Retry $retry_count/$max_retries"
        sleep 5
      fi
    done

    if [ $retry_count -eq $max_retries ]; then
      echo "Failed after $max_retries retries"
      exit 1
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## ベストプラクティス

### 必要なフィールドのみ取得

```graphql
# 良い例: 必要なフィールドのみ
query {
  repository(owner: "owner", name: "repo") {
    issues(first: 100) {
      nodes {
        number
        title
      }
    }
  }
}
```

### ページネーション活用

```bash
gh api graphql --paginate -f query='...'
```

### フラグメントで重複削減

```graphql
fragment CommonFields on Issue {
  number
  title
  author {
    login
  }
}
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **REST実装**: See [rest-patterns.md](rest-patterns.md)
