#!/usr/bin/env node

/**
 * バージョン変更影響分析スクリプト
 *
 * 使用方法:
 *   node analyze-version-impact.mjs <package-name> <current-version> <target-version>
 *
 * 例:
 *   node analyze-version-impact.mjs lodash 4.17.19 4.17.21
 *   node analyze-version-impact.mjs react 17.0.2 18.2.0
 *
 * 出力:
 *   - 変更タイプ（Major/Minor/Patch）
 *   - リスクレベル
 *   - 推奨アプローチ
 *   - CHANGELOGのURL（利用可能な場合）
 */

import { execSync } from 'child_process';

// バージョン文字列をパース
function parseVersion(version) {
  // v接頭辞を削除
  const cleaned = version.replace(/^v/, '');
  // プレリリースとビルドメタデータを分離
  const [main, prerelease] = cleaned.split('-');
  const [major, minor, patch] = main.split('.').map(n => parseInt(n, 10));

  return {
    major: major || 0,
    minor: minor || 0,
    patch: patch || 0,
    prerelease: prerelease || null,
    original: version
  };
}

// 変更タイプを判定
function determineChangeType(current, target) {
  const curr = parseVersion(current);
  const tgt = parseVersion(target);

  if (tgt.major > curr.major) {
    return 'MAJOR';
  } else if (tgt.major < curr.major) {
    return 'DOWNGRADE_MAJOR';
  } else if (tgt.minor > curr.minor) {
    return 'MINOR';
  } else if (tgt.minor < curr.minor) {
    return 'DOWNGRADE_MINOR';
  } else if (tgt.patch > curr.patch) {
    return 'PATCH';
  } else if (tgt.patch < curr.patch) {
    return 'DOWNGRADE_PATCH';
  } else {
    return 'NO_CHANGE';
  }
}

// リスクレベルを評価
function assessRiskLevel(changeType, packageInfo) {
  const baseRisk = {
    'MAJOR': 'HIGH',
    'MINOR': 'MEDIUM',
    'PATCH': 'LOW',
    'DOWNGRADE_MAJOR': 'HIGH',
    'DOWNGRADE_MINOR': 'MEDIUM',
    'DOWNGRADE_PATCH': 'LOW',
    'NO_CHANGE': 'NONE'
  };

  let risk = baseRisk[changeType] || 'UNKNOWN';

  // 0.x.xバージョンは追加リスク
  if (packageInfo.targetVersion.startsWith('0.')) {
    if (risk === 'MEDIUM') risk = 'HIGH';
    if (risk === 'LOW') risk = 'MEDIUM';
  }

  return risk;
}

// 推奨アプローチを生成
function getRecommendedApproach(changeType, riskLevel) {
  const approaches = {
    'MAJOR': {
      steps: [
        'CHANGELOGとマイグレーションガイドを確認',
        '破壊的変更の影響範囲を調査',
        'テスト環境で動作確認',
        '段階的な移行計画を策定',
        'ロールバック計画を準備'
      ],
      strategy: '段階的移行を推奨'
    },
    'MINOR': {
      steps: [
        '新機能のリリースノートを確認',
        '自動テストで動作確認',
        '新機能の活用機会を評価',
        'パフォーマンス影響を確認'
      ],
      strategy: '一括移行が可能'
    },
    'PATCH': {
      steps: [
        'リリースノートで修正内容を確認',
        'セキュリティパッチの場合は優先適用',
        '自動テストで回帰確認'
      ],
      strategy: '即座に適用可能'
    },
    'DOWNGRADE_MAJOR': {
      steps: [
        'ダウングレード理由を明確化',
        '失われる機能を特定',
        '代替手段を準備',
        '十分なテストを実施'
      ],
      strategy: '慎重に検討が必要'
    },
    'DOWNGRADE_MINOR': {
      steps: [
        'ダウングレード理由を確認',
        '機能の後方互換性を確認',
        'テストを実施'
      ],
      strategy: '注意して実施'
    },
    'DOWNGRADE_PATCH': {
      steps: [
        'ダウングレード理由を確認',
        '修正されたバグが影響しないことを確認'
      ],
      strategy: 'テスト後に実施可能'
    },
    'NO_CHANGE': {
      steps: ['変更なし'],
      strategy: 'アクション不要'
    }
  };

  return approaches[changeType] || {
    steps: ['変更タイプを手動で確認'],
    strategy: '不明'
  };
}

// npmレジストリからパッケージ情報を取得
function getPackageInfo(packageName) {
  try {
    const result = execSync(`pnpm view ${packageName} --json`, {
      encoding: 'utf8',
      timeout: 30000
    });
    return JSON.parse(result);
  } catch (error) {
    return null;
  }
}

// CHANGELOGのURLを推測
function guessChangelogUrl(packageInfo) {
  if (!packageInfo || !packageInfo.repository) {
    return null;
  }

  let repoUrl = packageInfo.repository.url || packageInfo.repository;

  // git+https://github.com/user/repo.git のような形式を処理
  repoUrl = repoUrl
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/^git:\/\//, 'https://');

  if (repoUrl.includes('github.com')) {
    return `${repoUrl}/blob/main/CHANGELOG.md`;
  }

  return repoUrl;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('使用方法: node analyze-version-impact.mjs <package-name> <current-version> <target-version>');
    console.log('例: node analyze-version-impact.mjs lodash 4.17.19 4.17.21');
    process.exit(1);
  }

  const [packageName, currentVersion, targetVersion] = args;

  console.log('\n========================================');
  console.log('バージョン変更影響分析レポート');
  console.log('========================================\n');

  console.log(`パッケージ: ${packageName}`);
  console.log(`現在バージョン: ${currentVersion}`);
  console.log(`目標バージョン: ${targetVersion}`);
  console.log('');

  // 変更タイプを判定
  const changeType = determineChangeType(currentVersion, targetVersion);
  console.log(`変更タイプ: ${changeType}`);

  // リスクレベルを評価
  const packageInfo = {
    name: packageName,
    currentVersion,
    targetVersion
  };
  const riskLevel = assessRiskLevel(changeType, packageInfo);

  const riskEmoji = {
    'HIGH': '🔴',
    'MEDIUM': '🟡',
    'LOW': '🟢',
    'NONE': '⚪'
  };
  console.log(`リスクレベル: ${riskEmoji[riskLevel] || '❓'} ${riskLevel}`);
  console.log('');

  // 推奨アプローチを表示
  const approach = getRecommendedApproach(changeType, riskLevel);
  console.log(`推奨戦略: ${approach.strategy}`);
  console.log('');
  console.log('推奨手順:');
  approach.steps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step}`);
  });
  console.log('');

  // パッケージ情報を取得
  console.log('パッケージ情報を取得中...');
  const npmInfo = getPackageInfo(packageName);

  if (npmInfo) {
    const changelogUrl = guessChangelogUrl(npmInfo);
    if (changelogUrl) {
      console.log(`\nCHANGELOG: ${changelogUrl}`);
    }

    if (npmInfo.homepage) {
      console.log(`ホームページ: ${npmInfo.homepage}`);
    }

    // 利用可能なバージョンの範囲を表示
    if (npmInfo.versions && Array.isArray(npmInfo.versions)) {
      const versions = npmInfo.versions;
      const currentIndex = versions.indexOf(currentVersion);
      const targetIndex = versions.indexOf(targetVersion);

      if (currentIndex !== -1 && targetIndex !== -1) {
        const versionsBetween = targetIndex - currentIndex - 1;
        if (versionsBetween > 0) {
          console.log(`\n中間バージョン数: ${versionsBetween}`);
          if (versionsBetween > 5) {
            console.log('⚠️  多数の中間バージョンがあります。段階的移行を検討してください。');
          }
        }
      }
    }
  } else {
    console.log('\n⚠️  パッケージ情報を取得できませんでした。手動で確認してください。');
  }

  // 0.x.xバージョンの警告
  if (targetVersion.startsWith('0.')) {
    console.log('\n⚠️  警告: 0.x.xバージョンは初期開発段階を示します。');
    console.log('   Minor更新でも破壊的変更が含まれる可能性があります。');
  }

  console.log('\n========================================');
  console.log('分析完了');
  console.log('========================================\n');
}

main();
