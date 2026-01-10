# Glob Pattern Complete Guide

## 概要

Glob パターンは、ファイルパス名のマッチングに使用されるワイルドカード構文。`.gitignore`、ファイル監視ツール、ビルドシステムで広く使用される。

## 基本構文

### ワイルドカード

| パターン | 意味                               | 例               | マッチ                       | 非マッチ         |
| -------- | ---------------------------------- | ---------------- | ---------------------------- | ---------------- |
| `*`      | 0文字以上の任意の文字（`/`を除く） | `*.log`          | `error.log`, `app.log`       | `logs/error.log` |
| `**`     | 0個以上のディレクトリ              | `**/temp`        | `temp`, `a/temp`, `a/b/temp` | `temporary`      |
| `?`      | 任意の1文字（`/`を除く）           | `file?.txt`      | `file1.txt`, `fileA.txt`     | `file12.txt`     |
| `[abc]`  | 括弧内の任意の1文字                | `file[123].txt`  | `file1.txt`, `file2.txt`     | `file4.txt`      |
| `[a-z]`  | 範囲内の任意の1文字                | `[a-c]*.txt`     | `abc.txt`, `b.txt`           | `d.txt`          |
| `[!abc]` | 括弧内以外の任意の1文字            | `file[!0-9].txt` | `fileA.txt`                  | `file1.txt`      |

### ディレクトリマッチング

```bash
# ディレクトリのみマッチ（末尾スラッシュ）
node_modules/          # node_modulesディレクトリとその中身すべて
*.tmp/                 # .tmpで終わるディレクトリ

# ディレクトリ内のすべてのファイル
logs/*                 # logsディレクトリ直下のファイル
logs/**                # logsディレクトリとすべてのサブディレクトリ

# 特定の深さ
src/*/test/            # src直下の任意のディレクトリ内のtestディレクトリ
**/node_modules/**     # すべてのnode_modulesディレクトリとその中身
```

## .gitignore特有のルール

### コメント

```bash
# これはコメント
*.log    # これもコメント
```

### 否定パターン（!）

```bash
# すべての.logファイルを除外
*.log

# ただしimportant.logは含める
!important.log

# ルール: 否定パターンは除外パターンより後に書く必要がある
```

### 先頭スラッシュ

```bash
# ルートディレクトリのみマッチ
/TODO          # ルートのTODOファイルのみ

# サブディレクトリもマッチ
TODO           # すべてのTODOファイル（src/TODO等も含む）
```

### 末尾スラッシュ

```bash
# ディレクトリのみマッチ
build/         # buildディレクトリ（ファイル名buildは除外しない）

# ファイルもディレクトリもマッチ
build          # buildファイルまたはディレクトリ
```

## よくある使用例

### プロジェクト共通

```bash
# 依存関係
node_modules/
vendor/
__pycache__/

# ビルド成果物
dist/
build/
*.o
*.pyc

# ログ・一時ファイル
*.log
*.tmp
*.swp
*~

# IDE設定
.vscode/
.idea/
*.sublime-*
```

### プラットフォーム固有

```bash
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~
.directory
```

### 言語別

#### Node.js / JavaScript

```bash
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.eslintcache
.next/
.nuxt/
dist/
```

#### Python

```bash
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/
.pytest_cache/
*.egg-info/
```

#### Rust

```bash
target/
Cargo.lock
**/*.rs.bk
```

## アンチパターン（避けるべきパターン）

### 誤った二重アスタリスク

```bash
# 誤り
**/node_modules/*/     # 末尾の*は不要

# 正しい
**/node_modules/
**/node_modules/**
```

### 過度に複雑なパターン

```bash
# 誤り（保守が困難）
**/**/test/**/**/tmp/**/*.tmp

# 正しい（シンプルに）
**/test/tmp/*.tmp
```

### 過剰な否定パターン

```bash
# 誤り（複雑すぎる）
*.log
!important.log
!critical.log
!system.log
# ... 多数の否定

# 正しい（ディレクトリ分けを検討）
logs/*.log
!logs/keep/
```

## パフォーマンス最適化

### パターンの順序

```bash
# 推奨: 頻繁にマッチするパターンを先に
node_modules/       # 大量のファイル、早期除外
.git/               # 大量のファイル、早期除外
dist/               # ビルド成果物
*.log               # 個別ファイル

# 非推奨: 個別ファイルパターンが先
*.log
*.tmp
node_modules/       # 遅すぎる
```

### ディレクトリ除外の優先

```bash
# 推奨: ディレクトリ全体を除外
build/

# 非推奨: ディレクトリ内の個別ファイルを除外
build/*.js
build/*.css
build/*.html
# ... すべてのファイルタイプを列挙
```

## トラブルシューティング

### パターンが効かない

1. **キャッシュの問題**: `.gitignore`変更後、既にgit追跡されているファイルには効かない

   ```bash
   git rm --cached <file>
   ```

2. **順序の問題**: 否定パターン（`!`）は除外パターンの後に書く

3. **パスの問題**: `/`で始まるパターンはルートからの相対パス

### 意図しないファイルが除外される

```bash
# デバッグ用: パターンのテスト
git check-ignore -v <file-path>
```

## 参考資料

- `.gitignore` official documentation: https://git-scm.com/docs/gitignore
- Glob pattern syntax: https://en.wikipedia.org/wiki/Glob_(programming)
