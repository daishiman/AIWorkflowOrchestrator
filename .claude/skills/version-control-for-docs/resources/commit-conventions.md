# コミット規約

## 概要

文書の変更を追跡しやすくするための一貫したコミットメッセージ規約です。

## コミットメッセージ形式

### 基本構造

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 例

```
docs(api): add authentication endpoint documentation

- Added OAuth 2.0 flow diagram
- Added request/response examples
- Added error codes table

Closes #123
```

## タイプ（Type）

| タイプ | 用途 | 例 |
|:-------|:-----|:---|
| `docs` | 新規文書の追加 | `docs(guide): add getting started guide` |
| `update` | 既存文書の更新 | `update(api): revise authentication section` |
| `fix` | 誤字・誤り修正 | `fix(readme): correct installation command` |
| `style` | フォーマット変更 | `style(all): apply consistent heading format` |
| `refactor` | 構造の再編成 | `refactor(guide): split into multiple files` |
| `remove` | 文書の削除 | `remove(legacy): delete deprecated api docs` |
| `translate` | 翻訳 | `translate(guide): add Japanese version` |

## スコープ（Scope）

変更対象の範囲を示します。

| スコープ | 説明 |
|:---------|:-----|
| `api` | API文書 |
| `guide` | ユーザーガイド |
| `tutorial` | チュートリアル |
| `reference` | リファレンス |
| `readme` | READMEファイル |
| `changelog` | 変更履歴 |
| `all` | 複数ファイル全体 |

## サブジェクト（Subject）

### ルール

1. **50文字以内**
2. **小文字で開始**
3. **末尾にピリオドを付けない**
4. **命令形で記述**

### 良い例

```
docs(api): add pagination endpoint documentation
update(guide): clarify installation requirements
fix(readme): correct broken link to api docs
```

### 悪い例

```
docs(api): Added pagination.    # 過去形、ピリオド
update(guide): Update guide     # 大文字開始、曖昧
fix: fix                        # 情報不足
```

## ボディ（Body）

### ルール

1. **72文字で折り返し**
2. **変更内容と理由を説明**
3. **箇条書きを活用**

### 例

```
docs(architecture): add system design documentation

This commit adds comprehensive system architecture documentation
including:

- High-level architecture diagram
- Component interaction flows
- Data flow diagrams
- Deployment topology

The documentation helps new team members understand the system
and supports architectural decision records.
```

## フッター（Footer）

### Issue参照

```
Closes #123
Fixes #456
Related to #789
```

### 破壊的変更

```
BREAKING CHANGE: renamed configuration file from config.yaml to settings.yaml

Update your deployment scripts to reference the new filename.
```

### 共同作業者

```
Co-authored-by: Name <email@example.com>
```

## 文書固有の規約

### 新規文書追加

```
docs(<scope>): add <document-title>

- Added <main sections>
- Included <diagrams/examples>
- Related to <feature/component>
```

### 内容更新

```
update(<scope>): <what was updated>

Why:
- <reason for update>

Changes:
- <specific changes>
```

### 誤り修正

```
fix(<scope>): correct <what was wrong>

- Fixed <specific error>
- Location: <file:line or section>
```

### 構造変更

```
refactor(<scope>): reorganize <section/document>

- Moved <content> to <location>
- Split <large file> into <smaller files>
- Merged <files> into <single file>
```

## 自動化

### コミットテンプレート

`.gitmessage`:
```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Type: docs | update | fix | style | refactor | remove | translate
# Scope: api | guide | tutorial | reference | readme | changelog | all
#
# Subject: 50 chars, lowercase, imperative, no period
# Body: 72 chars wrap, explain what and why
# Footer: Closes #issue, BREAKING CHANGE:
```

設定:
```bash
git config commit.template .gitmessage
```

### commitlint設定

`.commitlintrc.js`:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'docs', 'update', 'fix', 'style',
      'refactor', 'remove', 'translate'
    ]],
    'scope-enum': [2, 'always', [
      'api', 'guide', 'tutorial', 'reference',
      'readme', 'changelog', 'all'
    ]]
  }
};
```

## クイックリファレンス

```bash
# 新規文書
git commit -m "docs(api): add user management endpoints"

# 更新
git commit -m "update(guide): clarify authentication flow"

# 修正
git commit -m "fix(readme): correct code example syntax"

# スタイル
git commit -m "style(all): standardize heading capitalization"

# リファクタ
git commit -m "refactor(guide): split into chapter files"

# 削除
git commit -m "remove(legacy): delete v1 api documentation"

# 翻訳
git commit -m "translate(guide): add Japanese localization"
```
