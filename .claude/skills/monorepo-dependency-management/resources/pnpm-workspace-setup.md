# pnpm Workspaces設定

## 概要

pnpm workspacesは、モノレポ内の複数パッケージを効率的に管理するための機能です。
単一のロックファイル、共有依存、内部パッケージの相互参照を提供します。

## 基本設定

### pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  # パッケージディレクトリ
  - 'packages/*'

  # アプリケーションディレクトリ
  - 'apps/*'

  # ツールディレクトリ
  - 'tools/*'

  # 特定のパッケージを除外
  - '!**/test/**'

  # ネストしたパッケージ
  - 'packages/*/subpackages/*'
```

### ルートpackage.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint",
    "typecheck": "pnpm -r run typecheck",
    "clean": "pnpm -r run clean",
    "dev": "pnpm --filter @app/web run dev"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

### 個別パッケージのpackage.json

```json
{
  "name": "@app/core",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "vitest": "^1.2.0"
  }
}
```

## .npmrc設定

### 基本設定

```ini
# .npmrc

# ホイスティング設定
shamefully-hoist=false
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=@types/*

# ピア依存設定
auto-install-peers=true
strict-peer-dependencies=false

# ストア設定
store-dir=~/.pnpm-store

# パフォーマンス設定
prefer-frozen-lockfile=true

# リンク設定
link-workspace-packages=true
```

### CI環境用設定

```ini
# .npmrc (CI用)
prefer-frozen-lockfile=true
audit=false
ignore-scripts=false
```

## ディレクトリ構造パターン

### 標準パターン

```
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .npmrc
├── tsconfig.json              # 共通TypeScript設定
├── tsconfig.base.json         # 基本設定
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   ├── tsconfig.json      # 継承設定
│   │   └── src/
│   ├── utils/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   └── ui/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   └── src/
│   └── api/
│       ├── package.json
│       └── src/
└── tools/
    └── cli/
        ├── package.json
        └── src/
```

### レイヤードアーキテクチャパターン

```
my-monorepo/
├── packages/
│   ├── domain/          # ドメインロジック
│   ├── application/     # アプリケーションロジック
│   ├── infrastructure/  # インフラストラクチャ
│   └── presentation/    # UI/API
└── apps/
    ├── frontend/
    └── backend/
```

## 内部依存の設定

### workspace:プロトコル

```json
// apps/web/package.json
{
  "dependencies": {
    // 常に最新（開発中のパッケージ向け）
    "@app/core": "workspace:*",

    // semver範囲（安定版向け）
    "@app/utils": "workspace:^1.0.0",

    // パッチのみ許可
    "@app/config": "workspace:~1.0.0",

    // 厳密なバージョン
    "@app/types": "workspace:1.0.0"
  }
}
```

### 依存の方向性ルール

```
┌─────────────┐
│    apps     │  ←─ アプリケーション層
└──────┬──────┘
       │ depends on
       ▼
┌─────────────┐
│  packages   │  ←─ ライブラリ層
└──────┬──────┘
       │ depends on
       ▼
┌─────────────┐
│   shared    │  ←─ 共通層
└─────────────┘

✅ 上位 → 下位 の依存は許可
❌ 下位 → 上位 の依存は禁止
❌ 同一層内の循環依存は禁止
```

## TypeScript設定

### ルートtsconfig.json

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true,
    "paths": {
      "@app/*": ["./packages/*/src"]
    }
  }
}
```

### パッケージのtsconfig.json

```json
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../utils" }
  ]
}
```

## コマンド実行パターン

### 全パッケージでの実行

```bash
# 全パッケージで順次実行
pnpm -r run build

# 並列実行
pnpm -r --parallel run build

# ストリーム出力
pnpm -r --stream run build
```

### フィルタリング実行

```bash
# 特定パッケージ
pnpm --filter @app/web run build

# 依存パッケージも含める（...）
pnpm --filter @app/web... run build

# 被依存パッケージも含める（^）
pnpm --filter ...^@app/core run test

# 変更されたパッケージのみ
pnpm --filter "[origin/main]" run test

# 複数フィルタ
pnpm --filter @app/web --filter @app/api run build
```

### 依存関係の追加

```bash
# 特定パッケージに追加
pnpm --filter @app/web add lodash

# ルートに追加
pnpm add -w typescript

# devDependencyとして追加
pnpm --filter @app/core add -D vitest

# 内部パッケージを追加
pnpm --filter @app/web add @app/core
```

## チェックリスト

### 初期セットアップ
- [ ] pnpm-workspace.yamlを作成したか？
- [ ] ルートpackage.jsonを設定したか？
- [ ] .npmrcを設定したか？
- [ ] 共通のtsconfig.jsonを設定したか？

### パッケージ追加時
- [ ] 適切なディレクトリに配置したか？
- [ ] package.jsonを正しく設定したか？
- [ ] 内部依存を適切に定義したか？
- [ ] tsconfig.jsonを設定したか？
