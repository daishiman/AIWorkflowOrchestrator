#!/usr/bin/env node

/**
 * Claude Code Quality Validation Script
 * 目的: Claude生成コードの品質指標を検証
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
};

class QualityValidator {
  constructor(threshold = 80) {
    this.coverageThreshold = threshold;
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
    };
  }

  validateCoverage() {
    log.info('Validating test coverage...');
    
    try {
      const output = execSync('npm test -- --coverage --json 2>/dev/null', {
        encoding: 'utf-8',
      });
      
      const coverage = JSON.parse(output);
      const lineCoverage = coverage.total.lines.pct;
      
      if (lineCoverage < this.coverageThreshold) {
        this.results.failed.push(
          `Coverage ${lineCoverage}% below threshold ${this.coverageThreshold}%`
        );
        log.error(`Coverage: ${lineCoverage}% < ${this.coverageThreshold}%`);
      } else {
        this.results.passed.push(`Coverage: ${lineCoverage}%`);
        log.success(`Coverage: ${lineCoverage}%`);
      }
    } catch (error) {
      this.results.warning = 'Could not determine coverage';
      log.warning('Could not determine coverage');
    }
  }

  validateTypeScript() {
    log.info('Validating TypeScript...');
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'ignore' });
      this.results.passed.push('TypeScript: OK');
      log.success('TypeScript: OK');
    } catch (error) {
      this.results.failed.push('TypeScript compilation failed');
      log.error('TypeScript compilation failed');
    }
  }

  validateLinting() {
    log.info('Validating ESLint...');
    
    try {
      execSync('npx eslint src/ --max-warnings 0', { stdio: 'ignore' });
      this.results.passed.push('ESLint: OK');
      log.success('ESLint: OK');
    } catch (error) {
      this.results.warnings.push('ESLint warnings detected');
      log.warning('ESLint warnings detected');
    }
  }

  validateSecurityAudit() {
    log.info('Running security audit...');
    
    try {
      execSync('npm audit --production 2>/dev/null', { stdio: 'ignore' });
      this.results.passed.push('Security: OK');
      log.success('Security: OK');
    } catch (error) {
      this.results.warnings.push('Security vulnerabilities detected');
      log.warning('Security vulnerabilities detected');
    }
  }

  validateComplexity() {
    log.info('Checking code complexity...');
    
    try {
      const output = execSync('npx eslint src/ --format=json 2>/dev/null', {
        encoding: 'utf-8',
      });
      
      const results = JSON.parse(output);
      let maxComplexity = 0;
      
      for (const file of results) {
        for (const msg of file.messages) {
          if (msg.ruleId === 'complexity') {
            const complexity = parseInt(msg.message.match(/\d+/)[0]);
            maxComplexity = Math.max(maxComplexity, complexity);
          }
        }
      }
      
      if (maxComplexity > 10) {
        this.results.failed.push(`Complexity ${maxComplexity} exceeds threshold`);
        log.error(`Complexity: ${maxComplexity} > 10`);
      } else {
        this.results.passed.push(`Complexity: ${maxComplexity}`);
        log.success(`Complexity: ${maxComplexity}`);
      }
    } catch (error) {
      log.warning('Could not determine complexity');
    }
  }

  validateTests() {
    log.info('Validating tests...');
    
    try {
      execSync('npm test -- --bail', { stdio: 'ignore' });
      this.results.passed.push('Tests: All passed');
      log.success('Tests: All passed');
    } catch (error) {
      this.results.failed.push('Test failures detected');
      log.error('Test failures detected');
    }
  }

  runAllValidations() {
    log.info('Starting Claude Code Quality Validation\n');
    
    this.validateTypeScript();
    this.validateLinting();
    this.validateCoverage();
    this.validateComplexity();
    this.validateSecurityAudit();
    this.validateTests();
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('Quality Validation Summary');
    console.log('='.repeat(50));
    
    if (this.results.passed.length > 0) {
      console.log(`\n${colors.green}Passed:${colors.reset}`);
      this.results.passed.forEach(p => console.log(`  ✅ ${p}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
      this.results.warnings.forEach(w => console.log(`  ⚠️ ${w}`));
    }
    
    if (this.results.failed.length > 0) {
      console.log(`\n${colors.red}Failed:${colors.reset}`);
      this.results.failed.forEach(f => console.log(`  ❌ ${f}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.results.failed.length > 0) {
      process.exit(1);
    }
  }
}

const validator = new QualityValidator(80);
validator.runAllValidations();
