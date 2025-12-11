# ブランチ戦略

## 概要

文書プロジェクトに適したGitブランチ戦略を説明します。

## 推奨ブランチモデル

### GitHub Flow（推奨）

シンプルで文書プロジェクトに最適。

```
main ────●────●────●────●────●────●────
          \        /    \        /
feature/  ●──●──●        ●──●──●
```

### ブランチ構成

| ブランチ    | 目的           | 保護 |
| :---------- | :------------- | :--: |
| `main`      | 本番公開版     |  ○   |
| `feature/*` | 新規・更新作業 |  -   |
| `fix/*`     | 誤り修正       |  -   |

## ブランチ命名規則

### 形式

```
<type>/<short-description>
```

### タイプ

| タイプ      | 用途           | 例                                   |
| :---------- | :------------- | :----------------------------------- |
| `feature`   | 新規文書・機能 | `feature/api-authentication-guide`   |
| `update`    | 既存文書の更新 | `update/installation-for-v2`         |
| `fix`       | 誤り修正       | `fix/broken-links-readme`            |
| `refactor`  | 構造変更       | `refactor/reorganize-tutorials`      |
| `translate` | 翻訳           | `translate/japanese-getting-started` |

### 命名ルール

1. **小文字とハイフンを使用**
2. **Issue番号を含める（推奨）**
3. **簡潔で説明的に**

```bash
# 良い例
feature/123-oauth-guide
update/456-update-api-examples
fix/789-typo-readme

# 悪い例
Feature/OAuth_Guide        # 大文字、アンダースコア
new-docs                   # タイプなし、曖昧
feature/update-the-documentation-for-the-new-api-endpoints  # 長すぎる
```

## ワークフロー

### 1. ブランチ作成

```bash
# mainを最新に
git checkout main
git pull origin main

# ブランチを作成
git checkout -b feature/123-oauth-guide
```

### 2. 作業とコミット

```bash
# 変更を加える
# ...

# ステージングとコミット
git add docs/guides/oauth.md
git commit -m "docs(guide): add OAuth 2.0 authentication guide"

# 追加のコミット
git add docs/guides/oauth-examples.md
git commit -m "docs(guide): add OAuth code examples"
```

### 3. プッシュとPR作成

```bash
# リモートにプッシュ
git push -u origin feature/123-oauth-guide

# GitHubでPRを作成
```

### 4. レビューと修正

```bash
# レビュー指摘に対応
git add .
git commit -m "update(guide): address review comments"
git push
```

### 5. マージ

```bash
# PRがマージされたらローカルを更新
git checkout main
git pull origin main

# 作業ブランチを削除
git branch -d feature/123-oauth-guide
```

## バージョン管理

### 製品バージョンとの同期

```
docs/
├── v1/                 # v1.x用ドキュメント
│   ├── guides/
│   └── reference/
├── v2/                 # v2.x用ドキュメント
│   ├── guides/
│   └── reference/
└── latest/             # 最新版へのシンボリックリンク
```

### バージョンブランチ（必要な場合）

```
main ────●────●────●────●────●
          \
docs/v1.x  ●────●────●
           (メンテナンスのみ)
```

## コンフリクト解消

### 予防策

1. **こまめにmainをマージ**

   ```bash
   git fetch origin
   git merge origin/main
   ```

2. **小さな単位でコミット**

3. **1つのPRで1つの変更**

### 解消手順

```bash
# コンフリクトが発生した場合
git fetch origin
git merge origin/main

# コンフリクトを手動で解消
# ファイルを編集...

# 解消をマーク
git add <resolved-files>
git commit -m "merge: resolve conflicts with main"
git push
```

## ブランチ保護設定

### main ブランチ

```yaml
# GitHub設定
Branch protection rules:
  - Require pull request reviews: Yes
  - Required approving reviews: 1
  - Require status checks: Yes
  - Require branches to be up to date: Yes
  - Include administrators: Yes
```

### 推奨ステータスチェック

- `docs-lint` - Markdownリント
- `link-check` - リンク確認
- `spell-check` - スペルチェック

## クリーンアップ

### 古いブランチの削除

```bash
# マージ済みのローカルブランチを削除
git branch --merged | grep -v main | xargs git branch -d

# リモートの古いブランチを確認
git remote prune origin --dry-run

# 実際に削除
git remote prune origin
```

### 定期メンテナンス

| タスク                   | 頻度   |
| :----------------------- | :----- |
| マージ済みブランチの削除 | 週1回  |
| 古いPRのクローズ         | 月1回  |
| ブランチ命名規則の監査   | 四半期 |
