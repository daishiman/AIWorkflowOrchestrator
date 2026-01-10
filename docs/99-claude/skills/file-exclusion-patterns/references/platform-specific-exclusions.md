# Platform-Specific Exclusion Patterns

## 概要

オペレーティングシステムごとに固有の一時ファイルやシステムファイルが存在する。これらを適切に除外することで、クロスプラットフォーム開発をスムーズにする。

## macOS

### システムファイル

```bash
# Finder メタデータ
.DS_Store
.AppleDouble
.LSOverride

# Spotlight インデックス
.Spotlight-V100
.Trashes

# ボリューム設定
.VolumeIcon.icns
.com.apple.timemachine.donotpresent

# ファイルシステム
.fseventsd
.TemporaryItems
.apdisk

# リソースフォーク
._*
```

### アプリケーション固有

```bash
# Xcode
*.xcodeproj/*
!*.xcodeproj/project.pbxproj
*.xcworkspace/*
!*.xcworkspace/contents.xcworkspacedata
DerivedData/
*.hmap
*.ipa
*.dSYM.zip
*.dSYM

# CocoaPods
Pods/
```

## Windows

### システムファイル

```bash
# サムネイルキャッシュ
Thumbs.db
ehthumbs.db
ehthumbs_vista.db

# フォルダ設定
Desktop.ini
$RECYCLE.BIN/

# Windows Installer
*.cab
*.msi
*.msix
*.msm
*.msp

# ショートカット
*.lnk
```

### 開発ツール

```bash
# Visual Studio
.vs/
*.suo
*.user
*.userosscache
*.sln.docstates
*.VC.db
*.VC.opendb

# Visual Studio Code
.vscode/
*.code-workspace
```

## Linux

### システムファイル

```bash
# バックアップファイル
*~
*.swp
*.swo

# ディレクトリ設定
.directory

# プロセス関連
.nfs*
```

### 開発ツール

```bash
# vim
*.swp
*.swo
*~
.*.sw[a-p]

# emacs
\#*\#
.\#*

# 一時ファイル
*.tmp
*.bak
*.old
```

## クロスプラットフォーム統合パターン

### 推奨統合アプローチ

```bash
# ================================
# OS固有の一時ファイル
# ================================

# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# Linux
*~
.directory

# ================================
# IDE / エディタ
# ================================

# Visual Studio Code
.vscode/
*.code-workspace

# JetBrains IDEs
.idea/
*.iml
*.iws

# Vim
*.swp
*.swo
*~

# Emacs
\#*\#
.\#*

# Sublime Text
*.sublime-workspace
*.sublime-project
```

## プラットフォーム検出パターン

### パスセパレータの扱い

- **推奨**: `/` を使用（すべてのOSで動作）
- **非推奨**: `\` はWindowsのみで、Gitでは `/` に自動変換される

```bash
# 正しい（すべてのOSで動作）
src/temp/
build/output/

# 避ける（Windows固有、不要）
src\temp\
build\output\
```

### 大文字小文字の扱い

```bash
# 大文字小文字を区別しないファイルシステム（Windows, macOS）
# では、以下のパターンはすべて同じファイルにマッチする可能性がある

README.md
readme.md
ReadMe.md

# 対策: 特定のケースのみを指定するか、すべてのバリエーションを列挙
README.md
README.MD
readme.md

# または、ディレクトリ単位で除外して問題を回避
docs/
```

## ベストプラクティス

### 1. 共通パターンを優先

プラットフォーム固有パターンよりも、すべてのOSで安全に動作する共通パターンを優先する。

```bash
# 推奨
*.log
*.tmp
temp/
cache/

# プラットフォーム固有は必要な場合のみ追加
.DS_Store
Thumbs.db
```

### 2. セクション分けで可読性向上

```bash
# ================================
# 依存関係
# ================================
node_modules/
vendor/

# ================================
# ビルド成果物
# ================================
dist/
build/
*.o

# ================================
# OS固有ファイル
# ================================

# macOS
.DS_Store

# Windows
Thumbs.db

# Linux
*~
```

### 3. コメントで意図を明示

```bash
# macOS Finder メタデータファイル（共有時に不要）
.DS_Store

# Windows サムネイルキャッシュ（リポジトリに含めない）
Thumbs.db

# Linux バックアップファイル（エディタ自動生成）
*~
```

### 4. 環境変数との組み合わせ

プラットフォーム固有の設定は、`.gitignore` と環境変数を組み合わせて管理する。

```bash
# .gitignore（共通）
.env
.env.local

# 各開発者が .env.local を作成
# macOS開発者用
PLATFORM=darwin
TEMP_DIR=/tmp

# Windows開発者用
PLATFORM=win32
TEMP_DIR=C:\Temp
```

## トラブルシューティング

### 問題: macOSの.DS_Storeが除外されない

**原因**: 既にgit追跡されている

**解決策**:

```bash
# キャッシュから削除
find . -name .DS_Store -print0 | xargs -0 git rm --cached

# .gitignoreに追加
echo ".DS_Store" >> .gitignore

# コミット
git commit -m "Remove .DS_Store and add to .gitignore"
```

### 問題: Windowsでパスセパレータエラー

**原因**: `\` を使用している

**解決策**:

```bash
# すべてのパスで / を使用
src/temp/      # 正しい
src\temp\      # 誤り
```

### 問題: 大文字小文字の違いでマッチしない

**原因**: Linuxは大文字小文字を区別、Windows/macOSは区別しない

**解決策**:

```bash
# すべてのバリエーションを列挙
README.md
readme.md
ReadMe.md

# または、glob パターンで柔軟に
[Rr][Ee][Aa][Dd][Mm][Ee].md
```

## 参考資料

- GitHub's collection of `.gitignore` templates: https://github.com/github/gitignore
- macOS file system documentation: https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/
- Windows file systems: https://docs.microsoft.com/en-us/windows/win32/fileio/file-systems
