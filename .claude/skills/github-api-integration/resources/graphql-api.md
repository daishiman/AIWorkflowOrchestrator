# GitHub GraphQL API in Actions

## 目次

1. [GraphQL基礎](#graphql基礎)
2. [gh CLI での GraphQL](#gh-cli-での-graphql)
3. [実践的なクエリ例](#実践的なクエリ例)
4. [ミューテーション](#ミューテーション)
5. [最適化テクニック](#最適化テクニック)
6. [エラーハンドリング](#エラーハンドリング)

## GraphQL基礎

### REST API との比較

| 特徴 | REST API | GraphQL API |
|------|---------|-------------|
| リクエスト数 | 複数必要 | 1回で完結 |
| データ取得 | 過剰/不足あり | 必要なデータのみ |
| 型安全性 | なし | スキーマベース |
| バージョニング | v3, v4 | スキーマ進化 |
| 学習曲線 | 緩やか | やや急 |

### いつ GraphQL を使うべきか

**GraphQL が適している場合**:
- 複数のリソースから関連データを取得
- ネストした関係データ (PR + レビュー + コミット)
- 必要なフィールドのみ取得して効率化
- リクエスト数を最小化したい

**REST API が適している場合**:
- 単純な操作 (Issue作成、ラベル追加)
- 既存のスクリプト/ツールとの互換性
- GraphQL スキーマの学習コスト回避

## gh CLI での GraphQL

### 基本構文

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

### JSON ファイルからクエリを読み込み

```yaml
- name: Run query from file
  run: |
    gh api graphql \
      --paginate \
      -F owner=${{ github.repository_owner }} \
      -F name=${{ github.event.repository.name }} \
      -f query=@.github/queries/pull-requests.graphql
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 実践的なクエリ例

### Pull Request 一覧取得

#### 基本的なPR一覧

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
              author {
                login
              }
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

#### PRとレビューステータス

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
              author { login }
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
                    statusCheckRollup {
                      state
                    }
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

#### 変更ファイル付きPR情報

```yaml
- name: PRs with changed files
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 10, states: OPEN) {
            nodes {
              number
              title
              files(first: 50) {
                nodes {
                  path
                  additions
                  deletions
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

### Issue 操作

#### Issueとラベル取得

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
              author { login }
              labels(first: 10) {
                nodes {
                  name
                  color
                }
              }
              assignees(first: 5) {
                nodes {
                  login
                }
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

#### Issueコメント付き取得

```yaml
- name: Issue with comments
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $number) {
            title
            body
            comments(first: 50) {
              nodes {
                author { login }
                body
                createdAt
              }
            }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }} \
      -F number=${{ github.event.issue.number }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### リリース情報取得

```yaml
- name: Get latest releases
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          releases(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              name
              tagName
              isPrerelease
              createdAt
              releaseAssets(first: 10) {
                nodes {
                  name
                  downloadCount
                  downloadUrl
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
                    author {
                      name
                      email
                      date
                    }
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

### Organization 情報

```yaml
- name: Get organization repos
  run: |
    gh api graphql -f query='
      query($org: String!) {
        organization(login: $org) {
          repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              name
              description
              isPrivate
              stargazerCount
              forkCount
              primaryLanguage {
                name
              }
              updatedAt
            }
          }
        }
      }
    ' -F org=${{ github.repository_owner }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## ミューテーション

### Issue 作成

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
      -F body="Created via GraphQL mutation"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### ラベル追加

```yaml
- name: Add labels to issue
  run: |
    gh api graphql -f query='
      mutation($issueId: ID!, $labelIds: [ID!]!) {
        addLabelsToLabelable(input: {
          labelableId: $issueId
          labelIds: $labelIds
        }) {
          labelable {
            ... on Issue {
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    ' -F issueId=${{ github.event.issue.node_id }} \
      -F labelIds='["LA_kwDOABCD12MAAAABgHZ3Zw"]'
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
            node {
              id
              url
            }
          }
        }
      }
    ' -F subjectId=${{ github.event.issue.node_id }} \
      -F body="Thank you for your contribution!"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### PR マージ

```yaml
- name: Merge PR
  run: |
    gh api graphql -f query='
      mutation($pullRequestId: ID!, $mergeMethod: PullRequestMergeMethod!) {
        mergePullRequest(input: {
          pullRequestId: $pullRequestId
          mergeMethod: $mergeMethod
        }) {
          pullRequest {
            merged
            mergedAt
          }
        }
      }
    ' -F pullRequestId=${{ github.event.pull_request.node_id }} \
      -F mergeMethod="SQUASH"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Issue クローズ

```yaml
- name: Close issue
  run: |
    gh api graphql -f query='
      mutation($issueId: ID!, $reason: IssueClosedStateReason) {
        closeIssue(input: {
          issueId: $issueId
          stateReason: $reason
        }) {
          issue {
            closed
            closedAt
          }
        }
      }
    ' -F issueId=${{ github.event.issue.node_id }} \
      -F reason="COMPLETED"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

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
            nodes {
              number
              title
            }
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
        labels(first: 5) {
          nodes { name }
        }
      }

      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          openIssues: issues(first: 10, states: OPEN) {
            nodes {
              ...IssueFields
            }
          }
          closedIssues: issues(first: 10, states: CLOSED) {
            nodes {
              ...IssueFields
            }
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
          bugs: issues(first: 10, labels: ["bug"]) {
            totalCount
          }
          features: issues(first: 10, labels: ["enhancement"]) {
            totalCount
          }
          docs: issues(first: 10, labels: ["documentation"]) {
            totalCount
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### バッチクエリ

複数のリポジトリ情報を一度に取得:

```yaml
- name: Batch query multiple repos
  run: |
    gh api graphql -f query='
      query {
        repo1: repository(owner: "owner1", name: "repo1") {
          name
          stargazerCount
        }
        repo2: repository(owner: "owner2", name: "repo2") {
          name
          stargazerCount
        }
        repo3: repository(owner: "owner3", name: "repo3") {
          name
          stargazerCount
        }
      }
    '
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## エラーハンドリング

### エラーレスポンス構造

```json
{
  "data": null,
  "errors": [
    {
      "type": "NOT_FOUND",
      "path": ["repository"],
      "locations": [{"line": 2, "column": 3}],
      "message": "Could not resolve to a Repository with the name 'invalid-repo'."
    }
  ]
}
```

### エラーチェック

```yaml
- name: Handle GraphQL errors
  run: |
    response=$(gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          name
        }
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

## 実践パターン

### PR自動レビューリクエスト

```yaml
- name: Auto request review
  run: |
    # PRの変更ファイルを取得
    result=$(gh api graphql -f query='
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            id
            files(first: 100) {
              nodes {
                path
              }
            }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }} \
      -F number=${{ github.event.pull_request.number }})

    # ファイルパスに基づいてレビュアーを決定
    if echo "$result" | jq -e '.data.repository.pullRequest.files.nodes[].path' | grep -q "frontend/"; then
      # フロントエンドチームにレビューリクエスト
      gh api graphql -f query='
        mutation($prId: ID!, $userIds: [ID!]!) {
          requestReviews(input: {
            pullRequestId: $prId
            userIds: $userIds
          }) {
            pullRequest { id }
          }
        }
      ' -F prId="$(echo "$result" | jq -r '.data.repository.pullRequest.id')" \
        -F userIds='["MDQ6VXNlcjEyMzQ1Njc4"]'
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### ステータスチェック集約

```yaml
- name: Check all PR statuses
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 50, states: OPEN) {
            nodes {
              number
              title
              commits(last: 1) {
                nodes {
                  commit {
                    statusCheckRollup {
                      state
                      contexts(first: 100) {
                        nodes {
                          ... on CheckRun {
                            name
                            conclusion
                          }
                          ... on StatusContext {
                            context
                            state
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }} \
      | jq '.data.repository.pullRequests.nodes[] |
            select(.commits.nodes[0].commit.statusCheckRollup.state == "SUCCESS") |
            .number'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## ベストプラクティス

### 1. 必要なフィールドのみ取得

```yaml
# ❌ 悪い例: すべてのフィールド取得
query {
  repository(owner: "owner", name: "repo") {
    issues(first: 100) {
      nodes {
        # すべてのフィールド
      }
    }
  }
}

# ✅ 良い例: 必要なフィールドのみ
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

### 2. ページネーション活用

```yaml
# --paginate フラグで自動ページネーション
gh api graphql --paginate -f query='...'
```

### 3. フラグメントで重複削減

```yaml
fragment CommonFields on Issue {
  number
  title
  author { login }
}

query {
  openIssues: issues(states: OPEN) {
    nodes { ...CommonFields }
  }
  closedIssues: issues(states: CLOSED) {
    nodes { ...CommonFields }
  }
}
```

### 4. エラーハンドリング実装

すべてのクエリにエラーチェックを追加。

### 5. レート制限考慮

GraphQL はコスト計算が異なるため、複雑なクエリは注意が必要。
