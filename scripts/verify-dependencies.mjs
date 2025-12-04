#!/usr/bin/env node

/**
 * 依存関係検証スクリプト
 *
 * 全ての必須ツールとライブラリが正しいバージョンでインストールされているか検証する
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 定数定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VERIFICATIONS = [
  {
    name: 'Node.js',
    type: 'runtime',
    versionPattern: /v(22|24)\./,
    required: true,
  },
  {
    name: 'pnpm',
    type: 'command',
    command: 'pnpm',
    versionFlag: '--version',
    versionPattern: /^10\./,
    required: true,
  },
  {
    name: 'Electron',
    type: 'package',
    package: 'electron',
    versionPattern: /^39\./,
    required: true,
  },
  {
    name: 'TypeScript',
    type: 'package',
    package: 'typescript',
    versionPattern: /^5\./,
    required: true,
  },
  {
    name: 'better-sqlite3',
    type: 'load',
    package: 'better-sqlite3',
    required: true,
  },
  {
    name: 'Vitest',
    type: 'package',
    package: 'vitest',
    versionPattern: /^2\./,
    required: true,
  },
  {
    name: 'React',
    type: 'package',
    package: 'react',
    versionPattern: /^18\./,
    required: true,
  },
  {
    name: 'Drizzle',
    type: 'package',
    package: 'drizzle-orm',
    versionPattern: /^0\.39\./,
    required: true,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ユーティリティ関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getCommandVersion(command, versionFlag = '--version') {
  try {
    const output = execSync(`${command} ${versionFlag}`, {
      encoding: 'utf-8',
    });
    return output.trim();
  } catch (error) {
    console.error(`Error getting version for ${command}:`, error.message);
    return null;
  }
}

function getPackageVersion(packageName) {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      return null;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const versionString = (
      packageJson.dependencies?.[packageName] ||
      packageJson.devDependencies?.[packageName] ||
      null
    );

    // ^, ~, >=などのプレフィックスを削除
    if (versionString) {
      return versionString.replace(/^[\^~>=<]+/, '');
    }

    return null;
  } catch (error) {
    return null;
  }
}

function canLoadPackage(packageName) {
  try {
    // パッケージディレクトリの存在確認
    const packageDir = join(process.cwd(), 'node_modules', packageName);
    if (!existsSync(packageDir)) {
      return false;
    }

    // better-sqlite3の場合、ネイティブバインディングファイルの存在も確認
    if (packageName === 'better-sqlite3') {
      const nativeBindingPath = join(
        packageDir,
        'build/Release/better_sqlite3.node'
      );
      return existsSync(nativeBindingPath);
    }

    // package.jsonの存在で確認
    return existsSync(join(packageDir, 'package.json'));
  } catch (error) {
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 検証ロジック
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function verifyDependency(dep) {
  let version = null;
  let success = false;

  if (dep.type === 'runtime') {
    // コマンドラインからNode.jsバージョンを取得（pnpmの内部バージョンではなく）
    version = getCommandVersion('node', '--version');
    success = version !== null && dep.versionPattern.test(version);
  } else if (dep.type === 'command') {
    version = getCommandVersion(dep.command, dep.versionFlag);
    success = version !== null && dep.versionPattern.test(version);
  } else if (dep.type === 'package') {
    version = getPackageVersion(dep.package);
    if (version) {
      success = dep.versionPattern.test(version);
    }
  } else if (dep.type === 'load') {
    success = canLoadPackage(dep.package);
    version = success ? '動作確認 OK' : null;
  }

  return {
    name: dep.name,
    version,
    success,
    required: dep.required,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メイン処理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('依存関係検証結果');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const results = [];

  for (const dep of VERIFICATIONS) {
    const result = await verifyDependency(dep);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${result.name}: ${result.version} (OK)`);
    } else if (result.required) {
      console.log(`❌ ${result.name}: インストールされていません`);
    } else {
      console.log(`⚠️  ${result.name}: インストールされていません（オプション）`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const totalRequired = results.filter((r) => r.required).length;
  const successRequired = results.filter((r) => r.required && r.success).length;

  console.log(`検証結果: ${successRequired}/${totalRequired} 成功`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  if (successRequired === totalRequired) {
    console.log('✅ すべての必須依存関係が正しくインストールされています');
    process.exit(0);
  } else {
    console.log('❌ 一部の必須依存関係がインストールされていません');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ 検証中にエラーが発生しました:', error.message);
  process.exit(1);
});
