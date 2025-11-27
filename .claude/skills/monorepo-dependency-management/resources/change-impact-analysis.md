# 変更影響分析

## 概要

モノレポでパッケージを変更する際、その変更が他のパッケージに
どのような影響を与えるかを分析することで、適切なテスト範囲を決定し、
予期しない問題を防ぐことができます。

## 影響分析の基本

### 依存グラフの理解

```
@app/web ──depends on──> @app/core ──depends on──> @app/utils
    │                        │
    └──depends on──> @app/ui ┘

@app/coreを変更すると:
  - @app/web が影響を受ける（直接依存）
  - @app/ui は影響を受けない（依存していない）
```

### 影響の種類

1. **直接影響**: 変更されたパッケージを直接依存するパッケージ
2. **間接影響**: 直接影響を受けるパッケージに依存するパッケージ
3. **型影響**: 型定義の変更による影響
4. **ランタイム影響**: 実行時の動作変更による影響

## pnpmフィルタによる影響分析

### 依存パッケージの特定

```bash
# @app/core を依存するパッケージを表示
pnpm --filter "...@app/core" ls --depth 0

# @app/core とそれに依存するすべてのパッケージ
pnpm --filter "...@app/core" exec pwd
```

### 変更されたパッケージの特定

```bash
# main ブランチからの変更
pnpm --filter "[origin/main]" ls

# 変更されたパッケージでテスト
pnpm --filter "[origin/main]" run test

# 変更されたパッケージとその依存パッケージでテスト
pnpm --filter "...[origin/main]" run test
```

### フィルタ構文

| 構文 | 説明 |
|------|-----|
| `@app/core` | 特定のパッケージ |
| `@app/core...` | パッケージとその依存先 |
| `...@app/core` | パッケージとそれに依存するパッケージ |
| `...[origin/main]` | 変更されたパッケージとその被依存パッケージ |
| `{packages/*}` | globパターン |

## 影響分析スクリプト

### 基本的な分析スクリプト

```javascript
#!/usr/bin/env node
// scripts/analyze-impact.mjs

import { execSync } from 'child_process';

function getAffectedPackages(changedPackage) {
  const output = execSync(
    `pnpm --filter "...${changedPackage}" ls --json`,
    { encoding: 'utf8' }
  );

  const packages = JSON.parse(output);
  return packages.map(pkg => pkg.name);
}

function getDependencyTree(packageName) {
  const output = execSync(
    `pnpm why ${packageName} --json`,
    { encoding: 'utf8' }
  );

  return JSON.parse(output);
}

const changedPackage = process.argv[2];
if (!changedPackage) {
  console.error('Usage: node analyze-impact.mjs <package-name>');
  process.exit(1);
}

console.log(`\n影響分析: ${changedPackage}\n`);
console.log('影響を受けるパッケージ:');

const affected = getAffectedPackages(changedPackage);
affected.forEach(pkg => console.log(`  - ${pkg}`));

console.log(`\n合計: ${affected.length} パッケージ`);
```

### 詳細な分析レポート

```javascript
#!/usr/bin/env node
// scripts/detailed-impact-analysis.mjs

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function getWorkspacePackages() {
  const output = execSync('pnpm -r ls --json --depth 0', { encoding: 'utf8' });
  return JSON.parse(output);
}

function getPackageDependencies(packagePath) {
  const pkgJson = JSON.parse(
    readFileSync(`${packagePath}/package.json`, 'utf8')
  );

  return {
    dependencies: Object.keys(pkgJson.dependencies || {}),
    devDependencies: Object.keys(pkgJson.devDependencies || {}),
    peerDependencies: Object.keys(pkgJson.peerDependencies || {}),
  };
}

function buildDependencyGraph(packages) {
  const graph = {};

  packages.forEach(pkg => {
    const deps = getPackageDependencies(pkg.path);
    graph[pkg.name] = {
      ...deps,
      dependents: [], // 後で埋める
    };
  });

  // 被依存関係を構築
  packages.forEach(pkg => {
    const deps = graph[pkg.name].dependencies;
    deps.forEach(dep => {
      if (graph[dep]) {
        graph[dep].dependents.push(pkg.name);
      }
    });
  });

  return graph;
}

function getTransitiveDependents(graph, packageName, visited = new Set()) {
  if (visited.has(packageName)) return [];
  visited.add(packageName);

  const dependents = graph[packageName]?.dependents || [];
  const transitive = dependents.flatMap(dep =>
    [dep, ...getTransitiveDependents(graph, dep, visited)]
  );

  return [...new Set(transitive)];
}

function main() {
  const changedPackage = process.argv[2];
  if (!changedPackage) {
    console.error('Usage: node detailed-impact-analysis.mjs <package-name>');
    process.exit(1);
  }

  const packages = getWorkspacePackages();
  const graph = buildDependencyGraph(packages);

  const directDependents = graph[changedPackage]?.dependents || [];
  const transitiveDependents = getTransitiveDependents(graph, changedPackage);

  console.log(`\n========================================`);
  console.log(`影響分析レポート: ${changedPackage}`);
  console.log(`========================================\n`);

  console.log(`直接影響を受けるパッケージ (${directDependents.length}):`);
  directDependents.forEach(dep => console.log(`  - ${dep}`));

  console.log(`\n間接的に影響を受けるパッケージ (${transitiveDependents.length}):`);
  transitiveDependents
    .filter(dep => !directDependents.includes(dep))
    .forEach(dep => console.log(`  - ${dep}`));

  console.log(`\n推奨テスト範囲:`);
  console.log(`  pnpm --filter "...${changedPackage}" run test`);
}

main();
```

## CI/CDでの影響ベースビルド

### GitHub Actions

```yaml
name: Impact-based CI

on:
  pull_request:
    branches: [main]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      affected: ${{ steps.affected.outputs.packages }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v2

      - name: Get affected packages
        id: affected
        run: |
          AFFECTED=$(pnpm --filter "...[origin/main]" ls --json | jq -r '.[].name' | tr '\n' ',')
          echo "packages=$AFFECTED" >> $GITHUB_OUTPUT

  test-affected:
    needs: detect-changes
    if: needs.detect-changes.outputs.affected != ''
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Test affected packages
        run: pnpm --filter "...[origin/main]" run test

  build-affected:
    needs: detect-changes
    if: needs.detect-changes.outputs.affected != ''
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build affected packages
        run: pnpm --filter "...[origin/main]..." run build
```

### Turborepo統合

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

```bash
# 変更されたパッケージのみビルド
turbo run build --filter="...[origin/main]"
```

## 視覚化

### 依存グラフの生成

```bash
# Graphviz形式で出力
pnpm -r ls --json | node -e "
const packages = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log('digraph G {');
packages.forEach(pkg => {
  Object.keys(pkg.dependencies || {}).forEach(dep => {
    if (dep.startsWith('@app/')) {
      console.log(\`  \"\${pkg.name}\" -> \"\${dep}\"\`);
    }
  });
});
console.log('}');
" > deps.dot

# 画像に変換
dot -Tpng deps.dot -o deps.png
```

### Mermaidダイアグラム

```javascript
// scripts/generate-mermaid.mjs
import { execSync } from 'child_process';

const packages = JSON.parse(
  execSync('pnpm -r ls --json', { encoding: 'utf8' })
);

console.log('```mermaid');
console.log('graph TD');

packages.forEach(pkg => {
  const deps = pkg.dependencies || {};
  Object.keys(deps)
    .filter(dep => dep.startsWith('@app/'))
    .forEach(dep => {
      console.log(`  ${pkg.name.replace('@app/', '')} --> ${dep.replace('@app/', '')}`);
    });
});

console.log('```');
```

## チェックリスト

### 変更前
- [ ] 変更するパッケージを特定したか？
- [ ] 影響を受けるパッケージを分析したか？
- [ ] テスト範囲を決定したか？

### 変更後
- [ ] 影響を受けるパッケージでテストを実行したか？
- [ ] ビルドが成功することを確認したか？
- [ ] 型チェックが通ることを確認したか？

### CI/CD
- [ ] 影響ベースのテスト/ビルドを設定したか？
- [ ] 変更検出が正しく動作しているか？
- [ ] 依存グラフを可視化しているか？
