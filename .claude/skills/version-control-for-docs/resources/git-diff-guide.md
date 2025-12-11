# Git Diff ガイド

## 概要

Git Diffを使用して文書の変更を効果的に追跡・レビューする方法を説明します。

## 基本コマンド

### 変更の確認

```bash
# ステージングされていない変更を表示
git diff

# ステージングされた変更を表示
git diff --staged

# 特定ファイルの変更を表示
git diff path/to/file.md

# コミット間の差分を表示
git diff commit1..commit2
```

### 統計情報

```bash
# 変更ファイルと行数の統計
git diff --stat

# 変更されたファイル名のみ表示
git diff --name-only

# 変更状態を表示（A: 追加, M: 変更, D: 削除）
git diff --name-status
```

## 文書レビュー向けオプション

### 単語単位の差分

行単位ではなく単語単位で差分を表示。文書レビューに最適。

```bash
# 単語単位の差分
git diff --word-diff

# カラー表示
git diff --word-diff=color

# 区切り文字をカスタマイズ
git diff --word-diff-regex='[^[:space:]]+'
```

**出力例**:

```
ユーザーは[-古い機能-]{+新しい機能+}を使用できます。
```

### 空白の無視

```bash
# 行末の空白を無視
git diff -b

# すべての空白変更を無視
git diff -w

# 空行の追加・削除を無視
git diff --ignore-blank-lines
```

### コンテキスト行数

```bash
# 前後のコンテキストを5行に
git diff -U5

# コンテキストを10行に（長い変更の把握に）
git diff -U10
```

## 文書変更の分析

### 見出し単位での追跡

```bash
# Markdownの見出しを関数名として表示
git diff --function-context '*.md'
```

`.gitattributes` に追加:

```
*.md diff=markdown
```

`.gitconfig` に追加:

```ini
[diff "markdown"]
    xfuncname = "^#{1,6}\\s+.*$"
```

### 変更量の把握

```bash
# 追加・削除行数を表示
git diff --numstat

# 短い統計（ファイルごと）
git diff --shortstat
```

## 差分出力形式

### パッチ形式

```bash
# パッチファイルとして出力
git diff > changes.patch

# パッチを適用
git apply changes.patch
```

### HTML形式

```bash
# diff2htmlを使用（別途インストール必要）
git diff | diff2html -i stdin -o stdout > diff.html
```

### 並列表示

```bash
# delta（別途インストール必要）を使用した並列表示
git diff | delta --side-by-side
```

## ブランチ間の比較

```bash
# 現在のブランチとmainの差分
git diff main

# ブランチの分岐点からの差分
git diff main...feature-branch

# 特定ディレクトリのみ
git diff main -- docs/
```

## コミット履歴との比較

```bash
# 直前のコミットとの差分
git diff HEAD~1

# 特定コミットとの差分
git diff abc1234

# 特定の日時以降の変更
git diff HEAD@{yesterday}
git diff HEAD@{'2 weeks ago'}
```

## 差分レビューのベストプラクティス

### 1. 変更の全体像を把握

```bash
# まず統計を確認
git diff --stat

# 変更ファイル一覧
git diff --name-only
```

### 2. ファイルごとにレビュー

```bash
# 重要なファイルから順に
git diff path/to/important-file.md
```

### 3. 単語単位で詳細確認

```bash
# 細かい表現の変更を確認
git diff --word-diff path/to/file.md
```

### 4. コンテキストを広げて確認

```bash
# 変更の文脈を理解
git diff -U10 path/to/file.md
```

## エイリアス設定

`.gitconfig` に追加:

```ini
[alias]
    # 文書レビュー向け差分
    ddiff = diff --word-diff
    # 統計情報
    dstat = diff --stat
    # ステージング済み変更
    dstaged = diff --staged --word-diff
```

使用例:

```bash
git ddiff    # 単語単位の差分
git dstat    # 統計情報
git dstaged  # ステージング済みの単語差分
```
