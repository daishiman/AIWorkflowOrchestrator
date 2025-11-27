---
name: github-api-integration
description: |
  GitHub API を GitHub Actions 内で活用するための統合スキル。

  専門分野:
  - REST API: gh CLI、GitHub REST APIの利用、認証パターン
  - GraphQL API: GitHub GraphQL API、複雑なクエリ、データ取得最適化
  - API認証: GITHUB_TOKEN、Personal Access Token、権限管理
  - 実践パターン: Issue/PR操作、リリース管理、ラベル操作、コメント投稿

  使用タイミング:
  - ワークフローからGitHub APIを呼び出す時
  - gh CLIやcurlでGitHub操作を自動化する時
  - IssueやPull Requestを自動作成・更新する時
  - GraphQL APIで複雑なデータ取得を行う時
  - API認証や権限設定に関する問題を解決する時

version: 1.0.0
---

# GitHub API Integration in Actions

## 概要

このスキルは、GitHub Actions 内で GitHub API を活用するための実践的な知識を提供します。
REST API、GraphQL API、gh CLI の使用方法、認証パターン、実践的なユースケースを網羅します。

**主要な価値**:
- GitHub APIの効率的な活用
- gh CLIによる簡潔なワークフロー記述
- 適切な認証と権限管理
- 実践的なAPI統合パターン

**適用範囲**: GitHub REST API v3、GraphQL API v4、gh CLI v2.x、GITHUB_TOKEN認証

## リソース構造

```
github-api-integration/
├── SKILL.md                   # 本ファイル
├── resources/
│   ├── rest-api.md           # REST API詳細 (gh CLI, curl, octokit)
│   └── graphql-api.md        # GraphQL API詳細
├── templates/
│   └── api-workflow.yaml     # API統合ワークフロー例
└── scripts/
    └── api-helper.mjs        # API操作ヘルパー
```

## コマンドリファレンス

### リソース読み取り

```bash
# REST API詳細リファレンス
cat .claude/skills/github-api-integration/resources/rest-api.md

# GraphQL API詳細リファレンス
cat .claude/skills/github-api-integration/resources/graphql-api.md
```

### テンプレート/スクリプト

```bash
# API統合ワークフローテンプレート
cat .claude/skills/github-api-integration/templates/api-workflow.yaml

# APIヘルパースクリプト
node .claude/skills/github-api-integration/scripts/api-helper.mjs validate-token
node .claude/skills/github-api-integration/scripts/api-helper.mjs list-issues owner/repo
```

## クイックリファレンス

### gh CLI 基本操作

```yaml
# Issue作成
- name: Create issue
  run: gh issue create --title "Title" --body "Body" --label "bug"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

# PR作成
- name: Create PR
  run: gh pr create --title "Title" --body "Body" --base main --head feature
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

# リリース作成
- name: Create release
  run: gh release create v1.0.0 --title "Release" --notes "Notes"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### REST API (curl)

```yaml
# Issue作成
- name: Create issue via API
  run: |
    curl -X POST \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/${{ github.repository }}/issues \
      -d '{"title":"Title","body":"Body"}'
```

### GraphQL API

```yaml
# GraphQL クエリ
- name: Run GraphQL query
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 10, states: OPEN) {
            nodes { number title }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} -F repo=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## ワークフロー

### Phase 1: 認証設定

**目的**: API認証を正しく構成する

1. GITHUB_TOKEN の権限確認
2. 必要に応じてPAT作成
3. Secrets設定

**詳細**: `resources/rest-api.md` (Authentication)

### Phase 2: API選択

**判断基準**:
- **gh CLI**: 簡潔なコマンド、標準操作
- **REST API**: 詳細制御、カスタムヘッダー
- **GraphQL API**: 複雑なデータ取得、効率重視

### Phase 3: 実装

1. APIエンドポイント構築
2. リクエストボディ作成
3. レスポンス処理
4. エラーハンドリング

**テンプレート**: `templates/api-workflow.yaml`

## 判断基準

### API方式選択

- [ ] 標準的なGitHub操作 → gh CLI
- [ ] 細かい制御が必要 → REST API
- [ ] 複雑なデータ取得 → GraphQL API
- [ ] スクリプト化が必要 → Node.js + Octokit

### 認証方式選択

- [ ] 同一リポジトリ内操作 → GITHUB_TOKEN
- [ ] 他リポジトリアクセス → Personal Access Token
- [ ] Organization操作 → GitHub App Token

## 関連スキル

- **github-actions-syntax** (`.claude/skills/github-actions-syntax/SKILL.md`): ワークフロー構文基礎
- **github-actions-expressions** (`.claude/skills/github-actions-expressions/SKILL.md`): 式と関数
- **secrets-management-gha** (`.claude/skills/secrets-management-gha/SKILL.md`): シークレット管理
- **workflow-security** (`.claude/skills/workflow-security/SKILL.md`): セキュリティベストプラクティス

## 変更履歴

- **1.0.0** (2025-11-27): 初版作成 - REST/GraphQL API、gh CLI統合
