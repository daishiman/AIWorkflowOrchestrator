#!/usr/bin/env node
/**
 * calculate-quality-score.mjs
 * エージェントの品質スコアを計算するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/agent-quality-standards/scripts/calculate-quality-score.mjs <agent_file.md>
 *
 * 出力:
 *   5つのカテゴリ（構造、設計原則、セキュリティ、ドキュメンテーション、統合）の
 *   品質スコアを算出し、総合評価を表示します。
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const CATEGORIES = {
  structure: {
    name: '構造的品質',
    checks: [
      { id: 'yaml_name', desc: 'YAML name属性', weight: 2 },
      { id: 'yaml_description', desc: 'YAML description属性', weight: 2 },
      { id: 'yaml_tools', desc: 'YAML tools属性', weight: 1 },
      { id: 'yaml_model', desc: 'YAML model属性', weight: 1 },
      { id: 'yaml_version', desc: 'YAML version属性', weight: 1 },
      { id: 'sections', desc: '必須セクション', weight: 2 },
      { id: 'workflow', desc: 'ワークフロー定義', weight: 1 }
    ]
  },
  design: {
    name: '設計原則準拠',
    checks: [
      { id: 'single_responsibility', desc: '単一責任', weight: 3 },
      { id: 'context_separation', desc: 'コンテキスト分離', weight: 2 },
      { id: 'minimal_privilege', desc: '最小権限', weight: 2 },
      { id: 'progressive_disclosure', desc: 'Progressive Disclosure', weight: 3 }
    ]
  },
  security: {
    name: 'セキュリティ品質',
    checks: [
      { id: 'path_restriction', desc: 'パス制限', weight: 3 },
      { id: 'sensitive_protection', desc: 'センシティブ保護', weight: 3 },
      { id: 'bash_restriction', desc: 'Bash制限', weight: 2 },
      { id: 'approval_gate', desc: '承認ゲート', weight: 2 }
    ]
  },
  documentation: {
    name: 'ドキュメンテーション品質',
    checks: [
      { id: 'description_detail', desc: 'description具体性', weight: 2 },
      { id: 'reference_accuracy', desc: '参照の正確性', weight: 2 },
      { id: 'examples', desc: '例の充実', weight: 1 },
      { id: 'checklist', desc: 'チェックリスト', weight: 2 }
    ]
  },
  integration: {
    name: '統合品質',
    checks: [
      { id: 'dependency_validity', desc: '依存関係の妥当性', weight: 2 },
      { id: 'handoff_clarity', desc: 'ハンドオフの明確性', weight: 2 },
      { id: 'test_cases', desc: 'テストケース', weight: 2 },
      { id: 'ecosystem_fit', desc: 'エコシステム適合', weight: 2 }
    ]
  }
};

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let multilineValue = '';

  for (const line of lines) {
    if (line.match(/^\w+:/)) {
      if (currentKey && multilineValue) {
        yaml[currentKey] = multilineValue.trim();
        multilineValue = '';
      }
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim();
      if (value && value !== '|') {
        yaml[currentKey] = value;
        currentKey = null;
      }
    } else if (currentKey && line.startsWith('  ')) {
      multilineValue += line.trim() + '\n';
    }
  }

  if (currentKey && multilineValue) {
    yaml[currentKey] = multilineValue.trim();
  }

  return yaml;
}

function checkStructure(content, yaml) {
  const scores = {};

  scores.yaml_name = yaml.name ? 10 : 0;
  scores.yaml_description = yaml.description && yaml.description.length > 50 ? 10 :
                            yaml.description ? 5 : 0;
  scores.yaml_tools = yaml.tools ? 10 : 0;
  scores.yaml_model = yaml.model ? 10 : 0;
  scores.yaml_version = yaml.version ? 10 : 0;

  const requiredSections = ['## 役割定義', '## ワークフロー', '## 品質基準', '## 依存関係'];
  const foundSections = requiredSections.filter(s => content.includes(s));
  scores.sections = (foundSections.length / requiredSections.length) * 10;

  const phaseCount = (content.match(/### Phase \d+/g) || []).length;
  scores.workflow = phaseCount >= 3 ? 10 : phaseCount >= 2 ? 7 : phaseCount >= 1 ? 4 : 0;

  return scores;
}

function checkDesign(content, yaml) {
  const scores = {};

  // 単一責任: 専門分野が明確に定義されているか
  const specialtyMatch = content.match(/専門分野[:：]/);
  const constraintMatch = content.match(/制約[:：]/);
  scores.single_responsibility = (specialtyMatch ? 5 : 0) + (constraintMatch ? 5 : 0);

  // コンテキスト分離: スキル参照があるか
  const skillRefs = content.match(/\.claude\/skills\/[\w-]+\/SKILL\.md/g) || [];
  scores.context_separation = Math.min(skillRefs.length * 2, 10);

  // 最小権限: ツールが適切に制限されているか
  const tools = yaml.tools || '';
  const toolCount = (tools.match(/\w+/g) || []).length;
  scores.minimal_privilege = toolCount <= 4 ? 10 : toolCount <= 6 ? 7 : 4;

  // Progressive Disclosure: 3層構造か
  const hasResources = content.includes('resources/');
  const hasTemplates = content.includes('templates/');
  scores.progressive_disclosure = (hasResources ? 5 : 0) + (hasTemplates ? 5 : 0);

  return scores;
}

function checkSecurity(content, yaml) {
  const scores = {};

  // パス制限
  const hasPathRestriction = content.includes('write_allowed_paths') ||
                              content.includes('対象ファイルパターン');
  scores.path_restriction = hasPathRestriction ? 10 : 0;

  // センシティブ保護
  const hasSensitiveProtection = content.includes('.env') ||
                                  content.includes('センシティブ') ||
                                  content.includes('禁止事項');
  scores.sensitive_protection = hasSensitiveProtection ? 10 : 0;

  // Bash制限
  const hasBashRestriction = content.includes('禁止されるコマンド') ||
                              content.includes('Bash制限');
  const tools = yaml.tools || '';
  scores.bash_restriction = !tools.includes('Bash') ? 10 : hasBashRestriction ? 7 : 3;

  // 承認ゲート
  const hasApprovalGate = content.includes('approval_required') ||
                           content.includes('承認') ||
                           content.includes('エスカレーション');
  scores.approval_gate = hasApprovalGate ? 10 : 5;

  return scores;
}

function checkDocumentation(content, yaml) {
  const scores = {};

  // description具体性
  const descLines = (yaml.description || '').split('\n').filter(l => l.trim()).length;
  scores.description_detail = descLines >= 8 ? 10 : descLines >= 4 ? 7 : descLines >= 2 ? 4 : 0;

  // 参照の正確性
  const hasSkillPaths = content.includes('.claude/skills/');
  const hasResourcePaths = content.includes('resources/') || content.includes('templates/');
  scores.reference_accuracy = (hasSkillPaths ? 5 : 0) + (hasResourcePaths ? 5 : 0);

  // 例の充実
  const codeBlockCount = (content.match(/```/g) || []).length / 2;
  scores.examples = Math.min(codeBlockCount * 2, 10);

  // チェックリスト
  const checklistCount = (content.match(/- \[ \]/g) || []).length;
  scores.checklist = Math.min(checklistCount * 2, 10);

  return scores;
}

function checkIntegration(content) {
  const scores = {};

  // 依存関係の妥当性
  const hasDependencySection = content.includes('## 依存関係') || content.includes('依存スキル');
  scores.dependency_validity = hasDependencySection ? 10 : 0;

  // ハンドオフの明確性
  const hasHandoff = content.includes('ハンドオフ') || content.includes('連携');
  scores.handoff_clarity = hasHandoff ? 10 : 5;

  // テストケース
  const hasTestSection = content.includes('テスト') || content.includes('検証');
  scores.test_cases = hasTestSection ? 10 : 0;

  // エコシステム適合
  const hasChangeLog = content.includes('変更履歴') || content.includes('バージョン');
  const hasRelatedSkills = content.includes('関連スキル');
  scores.ecosystem_fit = (hasChangeLog ? 5 : 0) + (hasRelatedSkills ? 5 : 0);

  return scores;
}

function calculateCategoryScore(scores, checks) {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const check of checks) {
    const score = scores[check.id] || 0;
    weightedSum += score * check.weight;
    totalWeight += 10 * check.weight;
  }

  return (weightedSum / totalWeight) * 10;
}

function getGrade(score) {
  if (score >= 9) return '優秀（A）';
  if (score >= 7) return '良好（B）';
  if (score >= 5) return '要改善（C）';
  return '不合格（D）';
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node calculate-quality-score.mjs <agent_file.md>');
    process.exit(1);
  }

  const filePath = resolve(args[0]);
  let content;

  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`エラー: ファイル "${filePath}" を読み込めません`);
    process.exit(1);
  }

  const yaml = parseYamlFrontmatter(content);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    品質スコア分析レポート                   ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`ファイル: ${filePath}`);
  console.log(`エージェント名: ${yaml.name || '不明'}`);
  console.log('───────────────────────────────────────────────────────────');

  const allScores = {
    structure: checkStructure(content, yaml),
    design: checkDesign(content, yaml),
    security: checkSecurity(content, yaml),
    documentation: checkDocumentation(content, yaml),
    integration: checkIntegration(content)
  };

  const categoryScores = {};
  let totalScore = 0;

  for (const [categoryId, category] of Object.entries(CATEGORIES)) {
    const score = calculateCategoryScore(allScores[categoryId], category.checks);
    categoryScores[categoryId] = score;
    totalScore += score;

    console.log(`\n【${category.name}】 ${score.toFixed(1)}/10 - ${getGrade(score)}`);

    for (const check of category.checks) {
      const checkScore = allScores[categoryId][check.id] || 0;
      const status = checkScore >= 7 ? '✅' : checkScore >= 4 ? '⚠️' : '❌';
      console.log(`  ${status} ${check.desc}: ${checkScore.toFixed(1)}/10`);
    }
  }

  const averageScore = totalScore / 5;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`総合スコア: ${averageScore.toFixed(1)}/10 - ${getGrade(averageScore)}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (averageScore < 7) {
    console.log('\n改善が必要な項目:');
    for (const [categoryId, category] of Object.entries(CATEGORIES)) {
      for (const check of category.checks) {
        const checkScore = allScores[categoryId][check.id] || 0;
        if (checkScore < 7) {
          console.log(`  - ${category.name} > ${check.desc}`);
        }
      }
    }
  }
}

main();
