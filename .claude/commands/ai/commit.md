---
description: |
  Conventional Commitsに準拠したGitコミットを自動生成・実行するシンプルなコマンド。

  変更内容を分析し、適切なコミットタイプ（feat/fix/docs等）とメッセージを自動生成します。
  エージェント不要のシンプルな自動化コマンドです。

  🤖 起動エージェント: なし（直接実行）

  📚 参照規約:
  - Conventional Commits 1.0.0: https://www.conventionalcommits.org/
  - Angular Commit Message Guidelines

  ⚙️ このコマンドの設定:
  - argument-hint: "[commit-message]"（オプション、未指定時は自動生成）
  - allowed-tools: Git操作のみ
    • Bash(git*): Git操作専用（status, diff, add, commit）
  - model: sonnet（シンプルなコミットメッセージ生成）

  📋 成果物:
  - Gitコミット（Conventional Commits準拠）
  - コミットメッセージ（type(scope): subject形式）

  🎯 コミットタイプ:
  - feat: 新機能
  - fix: バグ修正
  - docs: ドキュメントのみ変更
  - style: コードの意味に影響しない変更（フォーマット、セミコロン等）
  - refactor: リファクタリング（機能変更なし）
  - perf: パフォーマンス改善
  - test: テスト追加・修正
  - chore: ビルドプロセス、補助ツール変更

  トリガーキーワード: commit, git commit, conventional commits, コミット作成, 変更コミット
argument-hint: "[commit-message]"
allowed-tools:
  - Bash(git*)
model: sonnet
---

# Conventional Commits自動生成

このコマンドは、変更内容を分析してConventional Commitsに準拠したコミットを作成します。

## 📋 実行フロー

### 1. 変更内容の確認

```bash
# ステージング状態確認
git status

# 変更差分確認
git diff
git diff --staged
```

### 2. 変更分析とコミットタイプ決定

**分析基準**:

```bash
# feat: 新機能
新しいファイル追加、新機能実装

# fix: バグ修正
バグ修正、エラーハンドリング追加

# docs: ドキュメント
*.md ファイルのみ変更

# style: フォーマット
Prettier、ESLint自動修正のみ

# refactor: リファクタリング
機能変更なし、構造改善

# test: テスト
*. test.ts, *.spec.ts 追加・修正

# chore: その他
package.json、設定ファイル更新
```

### 3. スコープ決定

```bash
# 変更ファイルのディレクトリから判断
src/features/auth/ → scope: auth
src/app/components/ → scope: ui
src/shared/infrastructure/database/ → scope: db
```

### 4. コミットメッセージ生成

**フォーマット**:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**例**:

```bash
# 新機能追加
feat(auth): add JWT authentication

# バグ修正
fix(api): handle timeout errors properly

# ドキュメント更新
docs(readme): update setup instructions

# リファクタリング
refactor(executor): extract validation logic
```

### 5. コミット実行

```bash
# ステージング（未ステージングファイルがある場合）
git add <files>

# コミット実行
git commit -m "<generated-message>"

# 確認
git log -1
```

## 使用例

### 自動メッセージ生成

```bash
/ai:commit
```

実行内容:

1. `git status` で変更確認
2. `git diff` で差分分析
3. コミットタイプ・スコープ・メッセージ自動生成
4. `git commit` 実行
5. コミットハッシュ表示

### カスタムメッセージ指定

```bash
/ai:commit "feat(auth): implement OAuth2 flow"
```

指定されたメッセージでコミット（Conventional Commits形式検証あり）

## Conventional Commits詳細

### タイプ一覧

| タイプ       | 説明             | 例                                            |
| ------------ | ---------------- | --------------------------------------------- |
| **feat**     | 新機能           | `feat(api): add webhook endpoint`             |
| **fix**      | バグ修正         | `fix(db): resolve connection pool leak`       |
| **docs**     | ドキュメント     | `docs(api): update endpoint documentation`    |
| **style**    | フォーマット     | `style: run prettier on all files`            |
| **refactor** | リファクタリング | `refactor(executor): simplify error handling` |
| **perf**     | パフォーマンス   | `perf(query): add database index`             |
| **test**     | テスト           | `test(auth): add edge case tests`             |
| **chore**    | その他           | `chore(deps): upgrade dependencies`           |

### 破壊的変更（Breaking Changes）

```bash
# フッターに BREAKING CHANGE を含める
feat(api)!: redesign authentication flow

BREAKING CHANGE: old auth endpoints are removed, migrate to /api/v2/auth
```

### スコープ例

```bash
# 機能別
(auth), (dashboard), (api)

# レイヤー別
(ui), (db), (core)

# コンポーネント別
(button), (form), (executor)
```

## トラブルシューティング

### コミット失敗（pre-commit hookエラー）

**原因**: ESLint、Prettier、型チェック失敗

**解決策**:

```bash
# ESLint自動修正
pnpm lint --fix

# Prettier自動修正
pnpm format

# 型エラー修正
pnpm typecheck
```

### コミットメッセージ形式エラー

**原因**: Conventional Commits形式違反

**解決策**:

```bash
# 正しい形式
<type>(<scope>): <subject>

# NG例
fix auth bug  # スコープなし
Fix: auth bug  # タイプが大文字
fix(auth) add validation  # コロン欠落
```

### 大量のファイル変更

**原因**: 一度に多すぎる変更をコミット

**解決策**:

```bash
# 論理的なまとまりで分割コミット
git add src/features/auth/
/ai:commit "feat(auth): add authentication"

git add src/features/dashboard/
/ai:commit "feat(dashboard): add dashboard"
```

## ベストプラクティス

### 小さく頻繁にコミット

```bash
# ✅ 良い: 論理的な単位
feat(auth): add JWT token generation
feat(auth): add token validation middleware
feat(auth): add refresh token endpoint

# ❌ 悪い: 大きすぎるコミット
feat(auth): implement entire authentication system
```

### 意味のあるメッセージ

```bash
# ✅ 良い: 何をしたか明確
fix(api): handle network timeout in retry logic

# ❌ 悪い: 不明確
fix: update code
```

## 参照

- Conventional Commits: https://www.conventionalcommits.org/
- Angular Commit Guidelines: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit
