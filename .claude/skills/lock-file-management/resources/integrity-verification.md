# 整合性検証方法

## 概要

ロックファイルと依存関係の整合性を検証することで、
再現性の問題やセキュリティリスクを早期に発見できます。

## 検証の種類

### 1. ロックファイルとpackage.jsonの同期確認

**pnpm**:
```bash
# 同期チェック（差分があればエラー）
pnpm install --frozen-lockfile

# 詳細な差分を確認
pnpm install --lockfile-only
git diff pnpm-lock.yaml
```

**pnpm**:
```bash
# 同期チェック（pnpm ci は厳格）
pnpm ci

# 手動での確認
pnpm install --package-lock-only
git diff package-lock.json
```

**yarn**:
```bash
# 同期チェック
yarn install --immutable

# チェックのみ
yarn install --immutable --check-cache
```

### 2. 整合性ハッシュの検証

```bash
# pnpm: 自動的にintegrityを検証
pnpm install

# pnpm: SRIハッシュを検証
pnpm ci

# 手動でのハッシュ確認
sha512sum node_modules/lodash/lodash.js
```

### 3. 依存関係ツリーの検証

```bash
# pnpm: 依存ツリーを表示
pnpm list --depth=Infinity

# 特定パッケージの依存を確認
pnpm why lodash

# 重複を検出
pnpm dedupe --check
```

## 検証スクリプト

### 基本的な整合性チェック

```javascript
#!/usr/bin/env node
// verify-integrity.mjs

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

function detectPackageManager() {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  if (existsSync('package-lock.json')) return 'pnpm';
  return null;
}

function verifyLockfileSync(pm) {
  const commands = {
    pnpm: 'pnpm install --frozen-lockfile --dry-run',
    pnpm: 'pnpm ci --dry-run',
    yarn: 'yarn install --immutable --check-cache'
  };

  try {
    execSync(commands[pm], { stdio: 'pipe' });
    return { success: true, message: 'Lock file is in sync' };
  } catch (error) {
    return { success: false, message: 'Lock file is out of sync' };
  }
}

const pm = detectPackageManager();
if (!pm) {
  console.error('No lock file found');
  process.exit(1);
}

const result = verifyLockfileSync(pm);
console.log(result.message);
process.exit(result.success ? 0 : 1);
```

### 詳細な整合性レポート

```javascript
#!/usr/bin/env node
// detailed-integrity-check.mjs

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

function getPackageJson() {
  return JSON.parse(readFileSync('package.json', 'utf8'));
}

function getLockfileInfo(pm) {
  if (pm === 'pnpm') {
    const lock = readFileSync('pnpm-lock.yaml', 'utf8');
    const versionMatch = lock.match(/lockfileVersion: ['"]?([^'"\n]+)/);
    return { version: versionMatch?.[1] };
  }
  if (pm === 'pnpm') {
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    return { version: lock.lockfileVersion };
  }
  return { version: 'unknown' };
}

function checkDependencies(pm) {
  const pkg = getPackageJson();
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };

  const issues = [];

  Object.entries(deps).forEach(([name, version]) => {
    // 危険なバージョン指定をチェック
    if (version === '*' || version === 'latest') {
      issues.push({
        package: name,
        issue: `Dangerous version specifier: ${version}`
      });
    }

    // file: や link: プロトコルをチェック
    if (version.startsWith('file:') || version.startsWith('link:')) {
      issues.push({
        package: name,
        issue: `Local dependency: ${version}`
      });
    }
  });

  return issues;
}

function main() {
  console.log('=== Dependency Integrity Report ===\n');

  const pm = existsSync('pnpm-lock.yaml') ? 'pnpm' :
             existsSync('package-lock.json') ? 'pnpm' :
             existsSync('yarn.lock') ? 'yarn' : null;

  if (!pm) {
    console.error('No lock file found!');
    process.exit(1);
  }

  console.log(`Package Manager: ${pm}`);

  const lockInfo = getLockfileInfo(pm);
  console.log(`Lock File Version: ${lockInfo.version}`);

  const issues = checkDependencies(pm);

  if (issues.length > 0) {
    console.log('\n⚠️  Issues found:');
    issues.forEach(i => console.log(`  - ${i.package}: ${i.issue}`));
  } else {
    console.log('\n✅ No issues found');
  }
}

main();
```

## CI/CDでの検証

### GitHub Actions

```yaml
name: Dependency Integrity

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Verify lock file integrity
        run: pnpm install --frozen-lockfile

      - name: Check for outdated lock file
        run: |
          pnpm install --lockfile-only
          if ! git diff --exit-code pnpm-lock.yaml; then
            echo "::error::Lock file is out of date"
            exit 1
          fi

      - name: Verify no duplicate dependencies
        run: pnpm dedupe --check
```

### GitLab CI

```yaml
verify-integrity:
  stage: validate
  script:
    - pnpm install --frozen-lockfile
    - pnpm dedupe --check
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## 一般的な整合性問題

### 問題1: ロックファイルの古さ

**症状**:
```
WARN  Cannot find a lockfile in /project
```

**解決策**:
```bash
# ロックファイルを生成
pnpm install

# バージョン管理に追加
git add pnpm-lock.yaml
git commit -m "chore: add lock file"
```

### 問題2: package.jsonとの不整合

**症状**:
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
```

**解決策**:
```bash
# ロックファイルを更新
pnpm install

# 変更をコミット
git add package.json pnpm-lock.yaml
git commit -m "chore: sync lock file with package.json"
```

### 問題3: 整合性ハッシュの不一致

**症状**:
```
EINTEGRITY  sha512-xxx expected sha512-yyy
```

**原因**:
- レジストリの問題
- 中間者攻撃の可能性
- キャッシュの破損

**解決策**:
```bash
# キャッシュをクリア
pnpm store prune
rm -rf node_modules

# 再インストール
pnpm install
```

## 定期的な検証

### 週次チェック

```yaml
# .github/workflows/weekly-integrity-check.yml
name: Weekly Integrity Check

on:
  schedule:
    - cron: '0 9 * * 1'  # 毎週月曜 9:00 UTC

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Check for updates
        run: pnpm outdated || true

      - name: Verify integrity
        run: pnpm install --frozen-lockfile

      - name: Security audit
        run: pnpm audit
```

## チェックリスト

### 日常的な検証
- [ ] `pnpm install --frozen-lockfile` が成功するか？
- [ ] ロックファイルに予期しない変更がないか？
- [ ] セキュリティ監査でエラーがないか？

### リリース前の検証
- [ ] 全ての依存関係が正しく解決されるか？
- [ ] 重複した依存関係がないか？
- [ ] 整合性ハッシュが正しいか？
- [ ] ローカルとCIで同じ結果になるか？
