#!/usr/bin/env node

/**
 * Integration Design Review Tool
 *
 * 統合設計ドキュメントをレビューし、改善点を提案します。
 *
 * 使用方法:
 *   node review-integration-design.mjs <design.md>
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const designPath = process.argv[2];

if (!designPath) {
  console.log('使用方法: node review-integration-design.mjs <design.md>');
  process.exit(1);
}

if (!existsSync(designPath)) {
  console.error(`❌ ファイルが見つかりません: ${designPath}`);
  process.exit(1);
}

/**
 * レビューチェック項目
 */
const reviewChecks = {
  // 基本情報セクション
  basicInfo: {
    name: '基本情報',
    required: ['プロジェクト名', '作成日', '作成者', 'バージョン'],
    weight: 1
  },

  // 統合概要
  overview: {
    name: '統合概要',
    required: ['目的', 'スコープ', '要件'],
    patterns: [
      { pattern: /機能要件/, score: 1 },
      { pattern: /非機能要件/, score: 2 },
      { pattern: /レスポンス時間|スループット|可用性/, score: 1 }
    ],
    weight: 2
  },

  // アーキテクチャ
  architecture: {
    name: 'アーキテクチャ設計',
    required: ['システム構成', '統合パターン', 'データフロー'],
    patterns: [
      { pattern: /選択理由/, score: 2 },
      { pattern: /代替案/, score: 1 },
      { pattern: /┌|└|│|─/, score: 1 } // ASCII図
    ],
    weight: 3
  },

  // インターフェース
  interface: {
    name: 'インターフェース仕様',
    required: ['エンドポイント'],
    patterns: [
      { pattern: /リクエスト例/, score: 1 },
      { pattern: /レスポンス例/, score: 1 },
      { pattern: /```json/, score: 1 }
    ],
    weight: 2
  },

  // メッセージ/イベント
  messaging: {
    name: 'メッセージ/イベント仕様',
    patterns: [
      { pattern: /イベント一覧/, score: 1 },
      { pattern: /イベントスキーマ/, score: 2 },
      { pattern: /\$schema/, score: 1 }
    ],
    weight: 2
  },

  // エラーハンドリング
  errorHandling: {
    name: 'エラーハンドリング',
    required: ['エラー分類'],
    patterns: [
      { pattern: /リトライ戦略/, score: 2 },
      { pattern: /Dead Letter Queue|DLQ/, score: 2 },
      { pattern: /タイムアウト/, score: 1 },
      { pattern: /バックオフ/, score: 1 }
    ],
    weight: 3
  },

  // セキュリティ
  security: {
    name: 'セキュリティ',
    required: ['認証', '認可'],
    patterns: [
      { pattern: /OAuth|JWT|API Key|mTLS/, score: 2 },
      { pattern: /暗号化/, score: 2 },
      { pattern: /TLS/, score: 1 },
      { pattern: /マスキング/, score: 1 }
    ],
    weight: 3
  },

  // 監視・運用
  monitoring: {
    name: '監視・運用',
    required: ['メトリクス', 'ログ', 'アラート'],
    patterns: [
      { pattern: /エラー率/, score: 1 },
      { pattern: /レイテンシ|レスポンス時間/, score: 1 },
      { pattern: /スループット/, score: 1 },
      { pattern: /閾値/, score: 1 }
    ],
    weight: 2
  },

  // テスト
  testing: {
    name: 'テスト計画',
    patterns: [
      { pattern: /単体テスト/, score: 1 },
      { pattern: /統合テスト/, score: 2 },
      { pattern: /性能テスト/, score: 2 }
    ],
    weight: 2
  },

  // デプロイ
  deployment: {
    name: 'デプロイ計画',
    patterns: [
      { pattern: /前提条件/, score: 1 },
      { pattern: /デプロイ手順/, score: 1 },
      { pattern: /ロールバック/, score: 2 }
    ],
    weight: 2
  },

  // リスク
  risk: {
    name: 'リスク管理',
    patterns: [
      { pattern: /リスク/, score: 1 },
      { pattern: /軽減策/, score: 2 },
      { pattern: /影響度|発生確率/, score: 1 }
    ],
    weight: 2
  }
};

/**
 * ドキュメントをレビュー
 */
function reviewDesign(content) {
  const results = [];
  let totalScore = 0;
  let maxScore = 0;

  for (const [key, check] of Object.entries(reviewChecks)) {
    const result = {
      section: check.name,
      found: [],
      missing: [],
      suggestions: [],
      score: 0,
      maxScore: 0
    };

    // 必須項目チェック
    if (check.required) {
      for (const item of check.required) {
        if (content.includes(item)) {
          result.found.push(item);
          result.score += check.weight;
        } else {
          result.missing.push(item);
        }
        result.maxScore += check.weight;
      }
    }

    // パターンマッチング
    if (check.patterns) {
      for (const { pattern, score } of check.patterns) {
        if (pattern.test(content)) {
          result.score += score * check.weight;
        }
        result.maxScore += score * check.weight;
      }
    }

    // 提案生成
    if (result.missing.length > 0) {
      result.suggestions.push(`以下の項目を追加してください: ${result.missing.join(', ')}`);
    }

    results.push(result);
    totalScore += result.score;
    maxScore += result.maxScore;
  }

  return {
    results,
    totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100)
  };
}

/**
 * 追加の推奨事項を生成
 */
function generateRecommendations(content, reviewResult) {
  const recommendations = [];

  // 図の有無
  if (!content.includes('┌') && !content.includes('```mermaid')) {
    recommendations.push({
      severity: 'medium',
      message: 'アーキテクチャ図またはシーケンス図の追加を検討してください'
    });
  }

  // JSONスキーマ
  if (content.includes('イベント') && !content.includes('$schema')) {
    recommendations.push({
      severity: 'high',
      message: 'イベントスキーマにJSON Schemaを使用することを推奨します'
    });
  }

  // リトライ戦略
  if (!content.includes('exponential') && !content.includes('指数') && content.includes('リトライ')) {
    recommendations.push({
      severity: 'medium',
      message: 'Exponential backoffリトライ戦略の採用を検討してください'
    });
  }

  // サーキットブレーカー
  if (!content.includes('サーキットブレーカー') && !content.includes('Circuit Breaker')) {
    recommendations.push({
      severity: 'medium',
      message: 'サーキットブレーカーパターンの導入を検討してください'
    });
  }

  // 冪等性
  if (!content.includes('冪等') && !content.includes('idempoten')) {
    recommendations.push({
      severity: 'high',
      message: 'メッセージ処理の冪等性について記述を追加してください'
    });
  }

  // 監視
  if (reviewResult.percentage < 80 && !content.includes('Prometheus') && !content.includes('Datadog')) {
    recommendations.push({
      severity: 'low',
      message: '具体的な監視ツールの指定を検討してください'
    });
  }

  return recommendations;
}

/**
 * 結果を表示
 */
function displayResults(reviewResult, recommendations) {
  console.log('\n🔍 統合設計レビュー結果\n');
  console.log('═'.repeat(60));

  // スコアサマリー
  let scoreIcon;
  if (reviewResult.percentage >= 80) scoreIcon = '🟢';
  else if (reviewResult.percentage >= 60) scoreIcon = '🟡';
  else scoreIcon = '🔴';

  console.log(`\n${scoreIcon} 総合スコア: ${reviewResult.percentage}% (${reviewResult.totalScore}/${reviewResult.maxScore})\n`);

  // セクション別結果
  console.log('📊 セクション別評価:');
  console.log('─'.repeat(60));

  for (const result of reviewResult.results) {
    const sectionScore = result.maxScore > 0
      ? Math.round((result.score / result.maxScore) * 100)
      : 0;

    let sectionIcon;
    if (sectionScore >= 80) sectionIcon = '✅';
    else if (sectionScore >= 50) sectionIcon = '⚠️';
    else if (sectionScore > 0) sectionIcon = '❌';
    else sectionIcon = '⬜';

    console.log(`\n${sectionIcon} ${result.section} (${sectionScore}%)`);

    if (result.found.length > 0) {
      console.log(`   ✓ 確認済み: ${result.found.join(', ')}`);
    }

    if (result.missing.length > 0) {
      console.log(`   ✗ 不足: ${result.missing.join(', ')}`);
    }
  }

  // 推奨事項
  if (recommendations.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('\n💡 推奨事項:');

    for (const rec of recommendations) {
      const icon = rec.severity === 'high' ? '🔴' :
                   rec.severity === 'medium' ? '🟡' : '🟢';
      console.log(`   ${icon} ${rec.message}`);
    }
  }

  // 総評
  console.log('\n' + '═'.repeat(60));

  if (reviewResult.percentage >= 80) {
    console.log('\n✅ 統合設計は十分な詳細を含んでいます');
  } else if (reviewResult.percentage >= 60) {
    console.log('\n⚠️  統合設計にいくつかの改善点があります');
  } else {
    console.log('\n❌ 統合設計に重要な情報が不足しています');
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    const content = await readFile(designPath, 'utf-8');

    const reviewResult = reviewDesign(content);
    const recommendations = generateRecommendations(content, reviewResult);

    displayResults(reviewResult, recommendations);

    process.exit(reviewResult.percentage >= 60 ? 0 : 1);
  } catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  }
}

main();
