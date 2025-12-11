# 標準除外パターンカタログ

## カテゴリ別パターン一覧

### 1. パッケージマネージャー

#### Node.js/JavaScript

```
**/node_modules/**
**/package-lock.json
**/yarn.lock
**/pnpm-lock.yaml
**/.pnpm-store/**
**/.yarn/**
**/.pnpm/**
```

#### Python

```
**/__pycache__/**
**/*.pyc
**/*.pyo
**/*.pyd
**/.Python
**/venv/**
**/.venv/**
**/env/**
**/.env/**
**/pip-log.txt
**/pip-delete-this-directory.txt
**/.tox/**
**/.pytest_cache/**
**/*.egg-info/**
**/dist/**
**/build/**
**/.eggs/**
```

#### Ruby

```
**/vendor/bundle/**
**/.bundle/**
**/Gemfile.lock
```

#### PHP

```
**/vendor/**
**/composer.lock
```

#### Go

```
**/vendor/**
**/go.sum
```

#### Rust

```
**/target/**
**/Cargo.lock
```

---

### 2. バージョン管理システム

```
**/.git/**
**/.gitignore
**/.gitattributes
**/.gitmodules
**/.svn/**
**/.hg/**
**/.hgignore
**/.hgcheck/**
**/.bzr/**
**/.bzrignore
**/CVS/**
**/.cvsignore
```

---

### 3. IDE/エディタ

#### JetBrains (IntelliJ, WebStorm, PyCharm等)

```
**/.idea/**
**/*.iml
**/*.ipr
**/*.iws
```

#### Visual Studio Code

```
**/.vscode/**
**/*.code-workspace
```

#### Visual Studio

```
**/.vs/**
**/*.suo
**/*.user
**/*.userosscache
**/*.sln.docstates
```

#### Vim/Neovim

```
**/*.swp
**/*.swo
**/*~
**/.netrwhist
```

#### Emacs

```
**/*~
**/#*#
**/.#*
**/*.elc
```

#### Sublime Text

```
**/*.sublime-workspace
**/*.sublime-project
```

#### Eclipse

```
**/.project
**/.classpath
**/.settings/**
**/.buildpath
```

---

### 4. ビルド成果物

#### JavaScript/TypeScript

```
**/dist/**
**/build/**
**/out/**
**/.next/**
**/.nuxt/**
**/.output/**
**/.svelte-kit/**
**/.parcel-cache/**
**/.cache/**
**/coverage/**
```

#### Java

```
**/target/**
**/*.class
**/*.jar
**/*.war
**/*.ear
```

#### C/C++

```
**/*.o
**/*.obj
**/*.exe
**/*.dll
**/*.so
**/*.dylib
**/*.a
**/*.lib
**/cmake-build-*/**
```

#### .NET

```
**/bin/**
**/obj/**
**/*.dll
**/*.exe
**/packages/**
```

---

### 5. 一時ファイル

#### エディタ生成

```
**/*.swp
**/*.swo
**/*~
**/.#*
**/#*#
**/*.bak
**/*.backup
**/*.orig
**/*.rej
```

#### Office アプリケーション

```
**/~$*
**/*.tmp
**/*.temp
```

#### システム

```
**/tmp/**
**/temp/**
**/*.log
**/*.cache
```

---

### 6. OS固有ファイル

#### macOS

```
**/.DS_Store
**/.AppleDouble
**/.LSOverride
**/._*
**/.DocumentRevisions-V100/**
**/.fseventsd/**
**/.Spotlight-V100/**
**/.TemporaryItems/**
**/.Trashes/**
**/.VolumeIcon.icns
**/.com.apple.timemachine.donotpresent
```

#### Windows

```
**/Thumbs.db
**/Thumbs.db:encryptable
**/ehthumbs.db
**/ehthumbs_vista.db
**/Desktop.ini
**/$RECYCLE.BIN/**
**/System Volume Information/**
**/*.lnk
```

#### Linux

```
**/.directory
**/*~
**/.fuse_hidden*
**/.Trash-*
**/.nfs*
```

---

### 7. テスト関連

```
**/coverage/**
**/.nyc_output/**
**/.jest/**
**/test-results/**
**/test-reports/**
**/cypress/screenshots/**
**/cypress/videos/**
**/playwright-report/**
**/test-output/**
```

---

### 8. ログファイル

```
**/*.log
**/logs/**
**/*.log.*
**/pnpm-debug.log*
**/yarn-debug.log*
**/yarn-error.log*
**/pnpm-debug.log*
**/lerna-debug.log*
```

---

### 9. 環境・設定ファイル

```
**/.env
**/.env.local
**/.env.*.local
**/.envrc
```

---

### 10. セキュリティ関連（除外推奨）

```
**/*.pem
**/*.key
**/*.crt
**/*.p12
**/*.pfx
**/credentials.*
**/secrets.*
**/.secret*
**/.aws/**
**/.ssh/**
```

---

## 用途別プリセット

### Web開発（フロントエンド）

```typescript
const frontendPatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/.nuxt/**",
  "**/coverage/**",
  "**/.git/**",
  "**/*.log",
  "**/.DS_Store",
  "**/Thumbs.db",
  "**/*.swp",
  "**/*~",
];
```

### Web開発（バックエンド Node.js）

```typescript
const backendPatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.git/**",
  "**/logs/**",
  "**/*.log",
  "**/.env",
  "**/.env.local",
  "**/.DS_Store",
  "**/Thumbs.db",
];
```

### Python プロジェクト

```typescript
const pythonPatterns = [
  "**/__pycache__/**",
  "**/*.pyc",
  "**/venv/**",
  "**/.venv/**",
  "**/dist/**",
  "**/build/**",
  "**/*.egg-info/**",
  "**/.git/**",
  "**/.pytest_cache/**",
  "**/*.log",
  "**/.DS_Store",
];
```

### モノレポ

```typescript
const monorepoPatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.turbo/**",
  "**/.next/**",
  "**/coverage/**",
  "**/.git/**",
  "**/logs/**",
  "**/*.log",
  "**/.DS_Store",
  "**/Thumbs.db",
  // 各パッケージのビルド成果物
  "**/packages/*/dist/**",
  "**/apps/*/dist/**",
];
```

---

## パターン適用の優先順位

1. **セキュリティ関連**: 必ず除外
2. **パッケージマネージャー**: 大量ファイルを含むため優先的に除外
3. **VCS**: 監視対象外
4. **ビルド成果物**: 生成ファイルは除外
5. **一時ファイル**: 不要なイベント防止
6. **OS固有**: クロスプラットフォーム対応
7. **IDE設定**: 開発者ごとに異なるため除外推奨
8. **ログ**: 高頻度更新のため除外推奨
