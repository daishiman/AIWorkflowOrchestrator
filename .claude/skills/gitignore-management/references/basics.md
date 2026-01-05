# .gitignore 基礎

> 18-skills.md §3.5 準拠
> **相対パス**: `references/basics.md`

---

## 概要

.gitignoreファイルの基本構文、パターン記法、優先順位を解説。

---

## 基本構文

### パターン記法

| 記法             | 意味                     | 例            |
| ---------------- | ------------------------ | ------------- |
| `file.txt`       | 全階層のfile.txt         | logs/file.txt |
| `/file.txt`      | ルート直下のfile.txt     | ./file.txt    |
| `dir/`           | ディレクトリ             | build/        |
| `*.log`          | 拡張子マッチ             | error.log     |
| `**/logs`        | 全階層のlogsディレクトリ | src/logs      |
| `dir/**`         | dir以下のすべて          | dist/\*\*     |
| `!important.log` | 除外から除外（例外）     | !README.md    |
| `[abc]`          | 文字クラス               | file[123].txt |
| `?`              | 任意の1文字              | file?.txt     |

### コメント

```gitignore
# これはコメント
*.log  # 行末コメントは無効
```

### 空行

空行は無視される。セクション分けに活用。

---

## 優先順位

### ファイルの優先順位

1. コマンドラインパターン
2. `.gitignore`（同じディレクトリ）
3. `.gitignore`（親ディレクトリ）
4. `$GIT_DIR/info/exclude`
5. `core.excludesFile`（グローバル）

### パターンの優先順位

後に記載されたパターンが優先。

```gitignore
*.log           # すべての.logを除外
!important.log  # important.logは例外
```

---

## ファイル配置

### プロジェクト.gitignore

```
project/
├── .gitignore      # プロジェクト全体
├── src/
│   └── .gitignore  # src配下のみ
└── tests/
    └── .gitignore  # tests配下のみ
```

### グローバル.gitignore

```bash
# 設定
git config --global core.excludesFile ~/.gitignore_global

# ~/.gitignore_global
.DS_Store
Thumbs.db
.idea/
.vscode/
```

---

## 基本パターン集

### 環境変数

```gitignore
.env
.env.local
.env.*.local
!.env.example
```

### 依存関係

```gitignore
node_modules/
vendor/
__pycache__/
*.pyc
```

### ビルド成果物

```gitignore
dist/
build/
out/
*.min.js
*.min.css
```

### IDE・エディタ

```gitignore
.vscode/
.idea/
*.swp
*.swo
*~
```

### OS固有

```gitignore
.DS_Store
Thumbs.db
Desktop.ini
```

### ログ・テンポラリ

```gitignore
*.log
logs/
tmp/
*.tmp
.cache/
```

---

## 検証方法

### git check-ignore

```bash
# ファイルが除外されるか確認
git check-ignore -v path/to/file

# 出力例
# .gitignore:5:*.log	logs/error.log
```

### git status --ignored

```bash
# 除外されたファイル一覧
git status --ignored

# 詳細表示
git status --ignored --porcelain
```

---

## よくある問題

### 既に追跡済みのファイル

.gitignoreに追加しても追跡は継続される。

```bash
# 追跡を停止
git rm --cached path/to/file

# ディレクトリの場合
git rm -r --cached path/to/dir
```

### パターンが効かない

1. 先頭/末尾のスペースを確認
2. パスの区切り文字を確認（`/` vs `\`）
3. `git check-ignore -v` で診断

### ネスト除外の矛盾

```gitignore
# 矛盾した設定（動作しない）
dir/
!dir/important.txt

# 正しい設定
dir/*
!dir/important.txt
```

---

## 関連リソース

- **実装パターン**: See [patterns.md](patterns.md)
- **パターンライブラリ**: See [pattern-library.md](pattern-library.md)
