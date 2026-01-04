# GitHub API 基礎

> 18-skills.md §3.5 準拠
> **相対パス**: `references/basics.md`

---

## 概要

GitHub APIの基本概念、認証方式、パーミッション設定を解説。

---

## API種別

| API種別  | 特徴                       | 用途               |
| -------- | -------------------------- | ------------------ |
| gh CLI   | GitHub公式CLI              | 一般的なGitHub操作 |
| REST API | RESTful HTTPエンドポイント | シンプルなCRUD操作 |
| GraphQL  | 単一エンドポイント         | 複雑なデータ取得   |
| Octokit  | JavaScript/TypeScript SDK  | Node.jsスクリプト  |

### 選択基準

| ユースケース                 | 推奨API  |
| ---------------------------- | -------- |
| Issue/PRの単純操作           | gh CLI   |
| 単一リソースのCRUD           | REST API |
| 複数リソースの関連データ取得 | GraphQL  |
| Node.jsベースの自動化        | Octokit  |

---

## 認証方式

### GITHUB_TOKEN

デフォルトで利用可能な自動生成トークン。

```yaml
- name: Use GITHUB_TOKEN
  run: gh issue list
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**特徴**:

- ワークフロー実行時に自動生成
- 同一リポジトリ内での操作に限定
- ワークフロー終了で無効化

### Personal Access Token (PAT)

他リポジトリやOrganization操作が必要な場合。

```yaml
- name: Use PAT
  run: gh issue create --repo other-owner/other-repo --title "Test"
  env:
    GH_TOKEN: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```

**作成手順**:

1. Settings → Developer settings → Personal access tokens
2. Generate new token
3. 必要なスコープを選択
4. リポジトリのSecrets に追加

### GitHub App Token

高度な認証が必要な場合。

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

---

## パーミッション

### 基本設定

```yaml
permissions:
  contents: read # リポジトリコンテンツ
  issues: write # Issue操作
  pull-requests: write # PR操作
  packages: write # パッケージ公開
  actions: read # ワークフロー情報
```

### 権限レベル

| レベル  | 説明         |
| ------- | ------------ |
| `read`  | 読み取りのみ |
| `write` | 読み書き可能 |
| `none`  | アクセス不可 |

### 最小権限の原則

```yaml
# 良い例: 必要な権限のみ
permissions:
  issues: write

# 悪い例: 過剰な権限
permissions: write-all
```

---

## レート制限

### 制限値

| API種別     | 制限               |
| ----------- | ------------------ |
| REST API    | 5,000リクエスト/時 |
| GraphQL API | 5,000ポイント/時   |
| 検索API     | 30リクエスト/分    |

### レート制限確認

```bash
gh api rate_limit
```

### リトライロジック

```bash
for i in {1..3}; do
  if gh issue create --title "Test"; then
    break
  else
    echo "Retry $i/3"
    sleep 60
  fi
done
```

---

## エラーハンドリング

### 基本パターン

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

### HTTPステータスコード

| コード | 意味                 | 対応                 |
| ------ | -------------------- | -------------------- |
| 200    | 成功                 | 処理続行             |
| 401    | 認証エラー           | トークン確認         |
| 403    | 権限不足/レート制限  | パーミッション/待機  |
| 404    | リソース不存在       | パス確認             |
| 422    | バリデーションエラー | リクエストボディ確認 |

---

## ベストプラクティス

### すべきこと

- GITHUB_TOKENはsecretsとして管理する
- 必要最小限のパーミッションを設定する
- エラーハンドリングを実装する
- レート制限を監視しリトライロジックを実装する
- JSON出力を活用してパース可能な形式で出力する

### 避けるべきこと

- トークンをワークフローファイルに直接記載しない
- 不必要に高い権限スコープを設定しない
- ループ内で複数回APIを呼び出さない
- APIレスポンスの機密情報をログに出力しない

---

## 関連リソース

- **REST実装**: See [rest-patterns.md](rest-patterns.md)
- **GraphQL実装**: See [graphql-patterns.md](graphql-patterns.md)
