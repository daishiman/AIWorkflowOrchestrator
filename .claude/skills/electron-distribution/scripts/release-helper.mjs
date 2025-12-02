#!/usr/bin/env node

/**
 * リリースヘルパースクリプト
 *
 * 使用方法:
 *   node .claude/skills/electron-distribution/scripts/release-helper.mjs <command> [options]
 *
 * コマンド:
 *   version <type>     - バージョンを更新 (patch/minor/major/prerelease)
 *   changelog          - CHANGELOGを生成
 *   check              - リリース前チェック
 *   tag                - Gitタグを作成
 *
 * 例:
 *   node release-helper.mjs version patch
 *   node release-helper.mjs changelog
 *   node release-helper.mjs check
 *   node release-helper.mjs tag
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const projectDir = process.cwd();
const command = process.argv[2];
const arg = process.argv[3];

// =====================================
// ユーティリティ
// =====================================

async function readPackageJson() {
  const content = await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8');
  return JSON.parse(content);
}

async function writePackageJson(data) {
  await fs.writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(data, null, 2) + '\n'
  );
}

function exec(cmd, options = {}) {
  return execSync(cmd, {
    cwd: projectDir,
    encoding: 'utf-8',
    stdio: options.silent ? 'pipe' : 'inherit',
    ...options,
  });
}

function bumpVersion(current, type) {
  const [major, minor, patch, prerelease] = current
    .replace(/^v/, '')
    .split(/[.-]/)
    .map((v, i) => (i < 3 ? parseInt(v, 10) : v));

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'prerelease':
      if (prerelease) {
        const [preName, preNum] = prerelease.match(/([a-z]+)(\d+)?/i)?.slice(1) || ['beta', '0'];
        return `${major}.${minor}.${patch}-${preName}${parseInt(preNum || '0', 10) + 1}`;
      }
      return `${major}.${minor}.${patch}-beta.1`;
    default:
      throw new Error(`Unknown version type: ${type}`);
  }
}

// =====================================
// コマンド: version
// =====================================

async function cmdVersion() {
  if (!arg || !['patch', 'minor', 'major', 'prerelease'].includes(arg)) {
    console.log('使用方法: release-helper.mjs version <patch|minor|major|prerelease>');
    process.exit(1);
  }

  const pkg = await readPackageJson();
  const currentVersion = pkg.version;
  const newVersion = bumpVersion(currentVersion, arg);

  console.log(`📦 バージョン更新: ${currentVersion} → ${newVersion}\n`);

  // package.json更新
  pkg.version = newVersion;
  await writePackageJson(pkg);
  console.log('✓ package.json 更新');

  // electron-builder.ymlのバージョンも更新（存在する場合）
  try {
    const builderPath = path.join(projectDir, 'electron-builder.yml');
    let builderContent = await fs.readFile(builderPath, 'utf-8');
    builderContent = builderContent.replace(
      /^(buildVersion:\s*).*$/m,
      `$1${newVersion}`
    );
    await fs.writeFile(builderPath, builderContent);
    console.log('✓ electron-builder.yml 更新');
  } catch {
    // ファイルがない場合は無視
  }

  console.log(`\n✅ バージョンを ${newVersion} に更新しました`);
  console.log('\n次のステップ:');
  console.log('  1. git add -A');
  console.log(`  2. git commit -m "chore: bump version to ${newVersion}"`);
  console.log(`  3. git tag v${newVersion}`);
  console.log('  4. git push && git push --tags');
}

// =====================================
// コマンド: changelog
// =====================================

async function cmdChangelog() {
  console.log('📝 CHANGELOG生成中...\n');

  const pkg = await readPackageJson();
  const version = pkg.version;

  // 前回のタグを取得
  let lastTag = '';
  try {
    lastTag = exec('git describe --tags --abbrev=0 HEAD^', { silent: true }).trim();
  } catch {
    lastTag = '';
  }

  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';

  // コミットログを取得
  const log = exec(`git log ${range} --pretty=format:"%s"`, { silent: true });
  const commits = log.split('\n').filter(Boolean);

  // コミットを分類
  const categories = {
    feat: { title: '✨ 新機能', commits: [] },
    fix: { title: '🐛 バグ修正', commits: [] },
    perf: { title: '⚡ パフォーマンス', commits: [] },
    refactor: { title: '♻️ リファクタリング', commits: [] },
    docs: { title: '📚 ドキュメント', commits: [] },
    style: { title: '💄 スタイル', commits: [] },
    test: { title: '✅ テスト', commits: [] },
    build: { title: '📦 ビルド', commits: [] },
    ci: { title: '👷 CI', commits: [] },
    chore: { title: '🔧 雑務', commits: [] },
    other: { title: '📝 その他', commits: [] },
  };

  for (const commit of commits) {
    const match = commit.match(/^(\w+)(?:\(.+\))?:\s*(.+)$/);
    if (match) {
      const [, type, message] = match;
      if (categories[type]) {
        categories[type].commits.push(message);
      } else {
        categories.other.commits.push(commit);
      }
    } else {
      categories.other.commits.push(commit);
    }
  }

  // CHANGELOG生成
  const date = new Date().toISOString().split('T')[0];
  let changelog = `## [${version}] - ${date}\n\n`;

  for (const [, category] of Object.entries(categories)) {
    if (category.commits.length > 0) {
      changelog += `### ${category.title}\n\n`;
      for (const commit of category.commits) {
        changelog += `- ${commit}\n`;
      }
      changelog += '\n';
    }
  }

  console.log(changelog);

  // CHANGELOG.mdに追記
  const changelogPath = path.join(projectDir, 'CHANGELOG.md');
  try {
    let existingChangelog = await fs.readFile(changelogPath, 'utf-8');
    existingChangelog = existingChangelog.replace(
      /^(# Changelog\n+)/,
      `$1${changelog}`
    );
    await fs.writeFile(changelogPath, existingChangelog);
    console.log('✅ CHANGELOG.md を更新しました');
  } catch {
    const newChangelog = `# Changelog\n\n${changelog}`;
    await fs.writeFile(changelogPath, newChangelog);
    console.log('✅ CHANGELOG.md を作成しました');
  }
}

// =====================================
// コマンド: check
// =====================================

async function cmdCheck() {
  console.log('🔍 リリース前チェック...\n');

  const checks = [];

  // 1. 未コミットの変更がないか
  try {
    const status = exec('git status --porcelain', { silent: true });
    if (status.trim()) {
      checks.push({ name: '未コミットの変更', status: 'fail', message: '変更をコミットしてください' });
    } else {
      checks.push({ name: '未コミットの変更', status: 'pass' });
    }
  } catch {
    checks.push({ name: 'Gitステータス', status: 'warn', message: 'Git確認失敗' });
  }

  // 2. テストの実行
  try {
    exec('npm test', { silent: true });
    checks.push({ name: 'テスト', status: 'pass' });
  } catch {
    checks.push({ name: 'テスト', status: 'fail', message: 'テストが失敗しました' });
  }

  // 3. ビルドの実行
  try {
    exec('npm run build', { silent: true });
    checks.push({ name: 'ビルド', status: 'pass' });
  } catch {
    checks.push({ name: 'ビルド', status: 'fail', message: 'ビルドが失敗しました' });
  }

  // 4. 依存関係の脆弱性
  try {
    exec('npm audit --audit-level=high', { silent: true });
    checks.push({ name: '依存関係の脆弱性', status: 'pass' });
  } catch {
    checks.push({ name: '依存関係の脆弱性', status: 'warn', message: '脆弱性が検出されました' });
  }

  // 結果表示
  console.log('チェック結果:\n');
  let hasFailure = false;

  for (const check of checks) {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}${check.message ? `: ${check.message}` : ''}`);
    if (check.status === 'fail') hasFailure = true;
  }

  console.log();

  if (hasFailure) {
    console.log('❌ チェックに失敗しました。問題を修正してからリリースしてください。');
    process.exit(1);
  } else {
    console.log('✅ すべてのチェックに合格しました！');
  }
}

// =====================================
// コマンド: tag
// =====================================

async function cmdTag() {
  const pkg = await readPackageJson();
  const version = pkg.version;
  const tagName = `v${version}`;

  console.log(`🏷️ Gitタグを作成: ${tagName}\n`);

  try {
    exec(`git tag -a ${tagName} -m "Release ${tagName}"`);
    console.log(`✅ タグ ${tagName} を作成しました`);
    console.log('\n次のステップ:');
    console.log('  git push --tags');
  } catch (error) {
    console.error('❌ タグ作成に失敗しました:', error.message);
    process.exit(1);
  }
}

// =====================================
// メイン
// =====================================

async function main() {
  if (!command) {
    console.log(`
📦 Electronリリースヘルパー

使用方法:
  node release-helper.mjs <command> [options]

コマンド:
  version <type>  バージョン更新 (patch/minor/major/prerelease)
  changelog       CHANGELOG生成
  check           リリース前チェック
  tag             Gitタグ作成

例:
  node release-helper.mjs version patch
  node release-helper.mjs changelog
  node release-helper.mjs check
  node release-helper.mjs tag
`);
    process.exit(0);
  }

  switch (command) {
    case 'version':
      await cmdVersion();
      break;
    case 'changelog':
      await cmdChangelog();
      break;
    case 'check':
      await cmdCheck();
      break;
    case 'tag':
      await cmdTag();
      break;
    default:
      console.error(`❌ 不明なコマンド: ${command}`);
      process.exit(1);
  }
}

main().catch(console.error);
