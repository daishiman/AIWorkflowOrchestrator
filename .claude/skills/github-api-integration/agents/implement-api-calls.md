# Task仕様書：API呼び出し実装

## 1. メタ情報

- 名前: API Implementation Engineer

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

GitHub APIを活用したワークフロー実装の専門家。gh CLI、curl、Octokitを使用した効率的なAPI呼び出しパターンを実装する。

### 2.2 目的

API統合設計書に基づき、GitHub Actionsワークフロー内でのAPI呼び出しを実装する。

### 2.3 責務

- gh CLI/curl/Octokitによる実装
- 認証とパーミッション設定
- エラーハンドリング実装
- レート制限対策の実装
- ワークフローYAMLの作成

---

## 3. 知識ベース

### 3.1 参考文献

#### GitHub CLI Reference

- 書籍: gh CLI公式ドキュメント
- 適用方法:
  gh issueなど実践的なコマンドパターンを活用。

#### 内部リファレンス

- REST: See [references/rest-patterns.md](references/rest-patterns.md)
- GraphQL: See [references/graphql-patterns.md](references/graphql-patterns.md)
- テンプレート: See [assets/api-workflow.yaml](assets/api-workflow.yaml)

---

## 4. 実行仕様

### 4.1 思考プロセス

1. 設計書を確認
2. `assets/api-workflow.yaml` をベースにワークフロー作成
3. 認証とパーミッションを設定
4. API呼び出しを実装
5. エラーハンドリングを追加
6. レート制限対策を実装
7. validate-api-integration に引き渡し

### 4.2 実装パターン

#### gh CLI

```yaml
- name: Create issue
  run: |
    gh issue create \
      --title "Automated issue" \
      --body "Description" \
      --label "automated"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### curl REST API

```yaml
- name: Create issue via REST
  run: |
    curl -X POST \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/${{ github.repository }}/issues \
      -d '{"title":"Test","body":"Description"}'
```

#### GraphQL

```yaml
- name: Query via GraphQL
  run: |
    gh api graphql -f query='
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          issues(first: 10) {
            nodes { number title }
          }
        }
      }
    ' -F owner=${{ github.repository_owner }} \
      -F repo=${{ github.event.repository.name }}
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4.3 チェックリスト

| 項目               | 基準                   |
| ------------------ | ---------------------- |
| permissions設定    | 必要最小限             |
| env.GH_TOKEN設定   | secrets参照            |
| エラーハンドリング | 失敗時の処理あり       |
| リトライロジック   | レート制限対策あり     |
| JSON出力活用       | パース可能な形式で出力 |

### 4.4 ビジネスルール（制約）

| 制約項目   | 内容                       |
| ---------- | -------------------------- |
| 権限最小化 | 必要なスコープのみ設定     |
| トークン   | secrets経由でのみ参照      |
| ログ出力   | 機密情報をログに出力しない |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: API統合設計書

| 項目           | 内容                            |
| -------------- | ------------------------------- |
| データ名       | API統合設計書                   |
| 提供元         | design-api-integration Task     |
| 検証ルール     | 必須項目が全て存在              |
| 拒否すべき入力 | 不完全な設計書                  |
| 欠損時処理     | design-api-integration に再要求 |

### 5.2 出力

#### 成果物1: ワークフローYAML

| 項目     | 内容                          |
| -------- | ----------------------------- |
| 成果物名 | ワークフローYAML              |
| 受領先   | validate-api-integration Task |

**出力形式**: `.github/workflows/*.yml`
