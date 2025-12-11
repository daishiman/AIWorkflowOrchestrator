# バージョン同期戦略

## 概要

モノレポ内で複数のパッケージが同じ外部依存を使用する場合、
バージョンの同期を維持することで、互換性の問題を防ぎ、
バンドルサイズを最適化できます。

## pnpm Catalogs（推奨）

### 基本設定

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"

catalog:
  # 共通依存のバージョンを一元管理
  react: ^18.2.0
  react-dom: ^18.2.0
  typescript: ^5.3.0
  zod: ^3.22.0
  lodash: ^4.17.21
```

### パッケージでの使用

```json
// packages/web/package.json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:",
    "zod": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

### 名前付きカタログ

```yaml
# pnpm-workspace.yaml
catalogs:
  # デフォルトカタログ
  default:
    react: ^18.2.0
    typescript: ^5.3.0

  # React 17用（レガシーアプリ向け）
  legacy:
    react: ^17.0.2
    react-dom: ^17.0.2

  # テストツール
  testing:
    vitest: ^1.2.0
    playwright: ^1.40.0
```

```json
// 使用例
{
  "dependencies": {
    "react": "catalog:", // default
    "vitest": "catalog:testing" // 名前付き
  }
}
```

## 手動でのバージョン同期

### syncpack使用

```bash
# インストール
pnpm add -w -D syncpack

# 設定
# syncpack.config.mjs
export default {
  sortFirst: ['name', 'version', 'description'],
  semverGroups: [
    {
      packages: ['**'],
      dependencies: ['react', 'react-dom'],
      dependencyTypes: ['prod', 'dev', 'peer'],
      range: '^',
    },
  ],
  versionGroups: [
    {
      packages: ['**'],
      dependencies: ['typescript'],
      pinVersion: '5.3.3',
    },
  ],
};

# 不整合をチェック
pnpm syncpack list-mismatches

# 自動修正
pnpm syncpack fix-mismatches
```

### 手動スクリプト

```javascript
#!/usr/bin/env node
// scripts/sync-versions.mjs

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const SYNC_DEPS = {
  react: "^18.2.0",
  "react-dom": "^18.2.0",
  typescript: "^5.3.0",
  zod: "^3.22.0",
};

function getPackages() {
  const packages = [];
  const dirs = ["packages", "apps"];

  dirs.forEach((dir) => {
    try {
      const subdirs = readdirSync(dir);
      subdirs.forEach((subdir) => {
        const pkgPath = join(dir, subdir, "package.json");
        try {
          packages.push(pkgPath);
        } catch {}
      });
    } catch {}
  });

  return packages;
}

function syncVersions() {
  const packages = getPackages();

  packages.forEach((pkgPath) => {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      let modified = false;

      ["dependencies", "devDependencies", "peerDependencies"].forEach(
        (depType) => {
          if (pkg[depType]) {
            Object.keys(SYNC_DEPS).forEach((dep) => {
              if (pkg[depType][dep] && pkg[depType][dep] !== SYNC_DEPS[dep]) {
                console.log(
                  `${pkgPath}: ${dep} ${pkg[depType][dep]} -> ${SYNC_DEPS[dep]}`,
                );
                pkg[depType][dep] = SYNC_DEPS[dep];
                modified = true;
              }
            });
          }
        },
      );

      if (modified) {
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
      }
    } catch (e) {
      console.error(`Error processing ${pkgPath}:`, e.message);
    }
  });
}

syncVersions();
```

## バージョン同期のパターン

### パターン1: 完全同期

すべてのパッケージで同じバージョンを使用

```yaml
# pnpm-workspace.yaml
catalog:
  react: 18.2.0 # 固定バージョン
  typescript: 5.3.3 # 固定バージョン
```

**メリット**:

- 互換性の問題がない
- バンドルサイズが最適化される

**デメリット**:

- 柔軟性が低い
- 更新時に全パッケージのテストが必要

### パターン2: 範囲同期

同じバージョン範囲を使用

```yaml
catalog:
  react: ^18.2.0 # Minor/Patch許可
  typescript: ~5.3.0 # Patchのみ許可
```

**メリット**:

- ある程度の柔軟性
- セキュリティパッチが自動適用

**デメリット**:

- バージョンのずれが発生する可能性

### パターン3: グループ同期

関連パッケージをグループで同期

```yaml
catalogs:
  react:
    react: ^18.2.0
    react-dom: ^18.2.0
    react-router-dom: ^6.20.0

  testing:
    vitest: ^1.2.0
    @testing-library/react: ^14.1.0
```

## Renovate/Dependabot設定

### Renovateでのグループ更新

```json
// renovate.json
{
  "packageRules": [
    {
      "description": "Group React packages",
      "matchPackagePatterns": ["^react", "^react-dom", "^react-router"],
      "groupName": "react packages",
      "groupSlug": "react"
    },
    {
      "description": "Group testing packages",
      "matchPackagePatterns": ["vitest", "@testing-library/"],
      "groupName": "testing packages",
      "groupSlug": "testing"
    }
  ]
}
```

### Dependabotでのグループ更新

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "pnpm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      react:
        patterns:
          - "react"
          - "react-dom"
          - "react-router*"
      testing:
        patterns:
          - "vitest"
          - "@testing-library/*"
```

## CI/CDでのバージョン検証

### GitHub Actions

```yaml
name: Version Check

on: [pull_request]

jobs:
  check-versions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2

      - name: Install syncpack
        run: pnpm add -g syncpack

      - name: Check version mismatches
        run: |
          if syncpack list-mismatches; then
            echo "✅ Versions are in sync"
          else
            echo "❌ Version mismatches found"
            exit 1
          fi
```

## チェックリスト

### 設定時

- [ ] バージョン同期の方法を選択したか？（catalog/syncpack/手動）
- [ ] 同期対象の依存関係を特定したか？
- [ ] CI/CDでの検証を設定したか？

### 運用時

- [ ] 定期的にバージョンの不整合をチェックしているか？
- [ ] 更新時にグループで更新しているか？
- [ ] 変更の影響範囲を確認しているか？
