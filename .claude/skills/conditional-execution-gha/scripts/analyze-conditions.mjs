#!/usr/bin/env node

/**
 * GitHub Actions 条件式分析ツール
 *
 * ワークフローファイルから条件式を抽出し、最適化の提案を行います。
 *
 * 使用方法:
 *   node analyze-conditions.mjs <workflow.yml>
 *
 * 機能:
 * - if 条件の抽出
 * - ステータス関数の使用状況分析
 * - 複雑な条件の検出
 * - 最適化の提案
 */

import { readFileSync } from 'fs';
import { parse } from 'yaml';

// 条件式のパターン
const PATTERNS = {
  statusFunctions: /(success|failure|always|cancelled)\(\)/g,
  githubContext: /github\.\w+/g,
  needsContext: /needs\.\w+/g,
  secretsContext: /secrets\.\w+/g,
  matrixContext: /matrix\.\w+/g,
  contains: /contains\([^)]+\)/g,
  startsWith: /startsWith\([^)]+\)/g,
  endsWith: /endsWith\([^)]+\)/g,
  logicalOperators: /&&|\|\||!/g,
};

class ConditionAnalyzer {
  constructor(workflowPath) {
    this.workflowPath = workflowPath;
    this.workflow = null;
    this.conditions = [];
    this.issues = [];
    this.suggestions = [];
  }

  /**
   * ワークフローファイルを読み込んで解析
   */
  analyze() {
    try {
      const content = readFileSync(this.workflowPath, 'utf8');
      this.workflow = parse(content);

      console.log('🔍 Analyzing workflow conditions...\n');

      this.extractConditions();
      this.analyzeConditionComplexity();
      this.detectCommonIssues();
      this.generateSuggestions();

      this.printReport();
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * ワークフローから条件式を抽出
   */
  extractConditions() {
    const jobs = this.workflow.jobs || {};

    Object.entries(jobs).forEach(([jobName, job]) => {
      // ジョブレベルの条件
      if (job.if) {
        this.conditions.push({
          type: 'job',
          name: jobName,
          condition: job.if,
          location: `jobs.${jobName}.if`,
        });
      }

      // ステップレベルの条件
      const steps = job.steps || [];
      steps.forEach((step, index) => {
        if (step.if) {
          this.conditions.push({
            type: 'step',
            name: step.name || `step-${index}`,
            job: jobName,
            condition: step.if,
            location: `jobs.${jobName}.steps[${index}].if`,
          });
        }
      });
    });

    console.log(`📊 Found ${this.conditions.length} conditions\n`);
  }

  /**
   * 条件の複雑度を分析
   */
  analyzeConditionComplexity() {
    this.conditions.forEach((item) => {
      const condition = String(item.condition);

      // 複雑度の計算
      const operators = (condition.match(PATTERNS.logicalOperators) || []).length;
      const functions = (condition.match(/\w+\(/g) || []).length;
      const contextRefs = (condition.match(/\w+\.\w+/g) || []).length;

      const complexity = operators + functions + contextRefs;

      item.complexity = complexity;
      item.metrics = {
        operators,
        functions,
        contextRefs,
        lines: condition.split('\n').length,
      };

      // 複雑すぎる条件を警告
      if (complexity > 5) {
        this.issues.push({
          severity: 'warning',
          location: item.location,
          message: `Complex condition detected (complexity: ${complexity})`,
          suggestion: 'Consider simplifying or breaking into multiple steps',
        });
      }

      // 長すぎる条件を警告
      if (condition.length > 200) {
        this.issues.push({
          severity: 'warning',
          location: item.location,
          message: `Long condition (${condition.length} characters)`,
          suggestion: 'Consider using a script for complex logic',
        });
      }
    });
  }

  /**
   * 一般的な問題を検出
   */
  detectCommonIssues() {
    this.conditions.forEach((item) => {
      const condition = String(item.condition);

      // success() の明示的使用（デフォルトなので不要）
      if (condition.trim() === 'success()') {
        this.issues.push({
          severity: 'info',
          location: item.location,
          message: 'Explicit success() is redundant (default behavior)',
          suggestion: 'Remove the condition or add additional checks',
        });
      }

      // シークレットの直接比較（セキュリティリスク）
      if (condition.match(/secrets\.\w+\s*==\s*['"][^'"]+['"]/)) {
        this.issues.push({
          severity: 'critical',
          location: item.location,
          message: 'Comparing secrets directly in condition (security risk)',
          suggestion: 'Only check if secret exists: secrets.KEY != \'\'',
        });
      }

      // 括弧の使用（サポート外）
      if (condition.match(/\([^()]*\s*(&&|\|\|)\s*[^()]*\)/)) {
        this.issues.push({
          severity: 'error',
          location: item.location,
          message: 'Parentheses not supported in GitHub Actions conditions',
          suggestion: 'Remove parentheses or use multi-line format',
        });
      }

      // needs コンテキストの不適切な使用
      if (condition.match(/needs\.\w+\s*==\s*['"]?true['"]?/)) {
        this.issues.push({
          severity: 'warning',
          location: item.location,
          message: 'Checking needs as boolean may not work as expected',
          suggestion: 'Use needs.job_name.result == \'success\' instead',
        });
      }
    });
  }

  /**
   * 最適化の提案を生成
   */
  generateSuggestions() {
    // ステータス関数の使用状況を分析
    const statusFunctionUsage = {
      success: 0,
      failure: 0,
      always: 0,
      cancelled: 0,
    };

    this.conditions.forEach((item) => {
      const condition = String(item.condition);
      Object.keys(statusFunctionUsage).forEach((fn) => {
        if (condition.includes(`${fn}()`)) {
          statusFunctionUsage[fn]++;
        }
      });
    });

    // 使用されていないステータス関数を提案
    if (statusFunctionUsage.failure === 0) {
      this.suggestions.push({
        type: 'enhancement',
        message: 'No failure() handlers detected',
        suggestion: 'Consider adding failure notifications or cleanup steps',
      });
    }

    if (statusFunctionUsage.always === 0) {
      this.suggestions.push({
        type: 'enhancement',
        message: 'No always() steps detected',
        suggestion: 'Consider adding cleanup steps with always() condition',
      });
    }

    // ジョブレベルとステップレベルの条件の分布
    const jobConditions = this.conditions.filter((c) => c.type === 'job').length;
    const stepConditions = this.conditions.filter((c) => c.type === 'step').length;

    if (stepConditions > jobConditions * 3) {
      this.suggestions.push({
        type: 'optimization',
        message: `Many step-level conditions (${stepConditions}) vs job-level (${jobConditions})`,
        suggestion: 'Consider moving common conditions to job level for clarity',
      });
    }
  }

  /**
   * レポートを出力
   */
  printReport() {
    console.log('=' .repeat(60));
    console.log('📋 CONDITION ANALYSIS REPORT');
    console.log('='.repeat(60));
    console.log();

    // 概要
    console.log('📊 Summary:');
    console.log(`  Total conditions: ${this.conditions.length}`);
    console.log(`  Job-level: ${this.conditions.filter((c) => c.type === 'job').length}`);
    console.log(`  Step-level: ${this.conditions.filter((c) => c.type === 'step').length}`);
    console.log();

    // 条件の詳細
    if (this.conditions.length > 0) {
      console.log('🔍 Conditions:');
      this.conditions.forEach((item, index) => {
        console.log(`  ${index + 1}. [${item.type}] ${item.name}`);
        console.log(`     Location: ${item.location}`);
        console.log(`     Complexity: ${item.complexity}`);
        console.log(`     Condition: ${String(item.condition).substring(0, 80)}${String(item.condition).length > 80 ? '...' : ''}`);
        console.log();
      });
    }

    // 問題
    if (this.issues.length > 0) {
      console.log('⚠️  Issues:');
      this.issues.forEach((issue, index) => {
        const icon = {
          critical: '🔴',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️',
        }[issue.severity];

        console.log(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.location}`);
        console.log(`     ${issue.message}`);
        console.log(`     💡 ${issue.suggestion}`);
        console.log();
      });
    }

    // 提案
    if (this.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      this.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. [${suggestion.type}] ${suggestion.message}`);
        console.log(`     ${suggestion.suggestion}`);
        console.log();
      });
    }

    // スコア計算
    const score = this.calculateScore();
    console.log('='.repeat(60));
    console.log(`Overall Score: ${score}/100`);
    console.log('='.repeat(60));
  }

  /**
   * スコアを計算
   */
  calculateScore() {
    let score = 100;

    // 問題による減点
    this.issues.forEach((issue) => {
      const penalties = {
        critical: 20,
        error: 10,
        warning: 5,
        info: 2,
      };
      score -= penalties[issue.severity] || 0;
    });

    // 複雑度による減点
    this.conditions.forEach((item) => {
      if (item.complexity > 5) {
        score -= 3;
      }
    });

    return Math.max(0, score);
  }
}

// メイン処理
if (process.argv.length < 3) {
  console.error('Usage: node analyze-conditions.mjs <workflow.yml>');
  process.exit(1);
}

const workflowPath = process.argv[2];
const analyzer = new ConditionAnalyzer(workflowPath);
analyzer.analyze();
