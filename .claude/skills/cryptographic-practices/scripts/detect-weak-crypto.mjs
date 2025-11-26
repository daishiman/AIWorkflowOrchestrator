#!/usr/bin/env node

/**
 * 弱い暗号化検出スクリプト
 *
 * 目的: プロジェクト内の弱い暗号化アルゴリズムとMath.random()使用を検出
 *
 * 使用方法:
 *   node detect-weak-crypto.mjs <target-directory>
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// 検出パターン
const weakCryptoPatterns = {
  weakHash: {
    md5: /\bmd5\b/i,
    sha1: /\bsha1\b|sha-1/i,
    md4: /\bmd4\b/i
  },
  weakCipher: {
    des: /\bdes\b/i,
    rc4: /\brc4\b/i,
    ecb: /ecb/i
  },
  weakRandom: {
    mathRandom: /Math\.random\s*\(/,
    dateNow: /Date\.now\s*\(\)\s*\.\s*toString/
  },
  weakKeySize: {
    rsa1024: /modulusLength\s*:\s*(512|1024)\b/,
    aes128: /aes-128-ecb/i
  },
  hardcodedSecrets: {
    password: /password\s*=\s*['"][^'"]+['"]/i,
    apiKey: /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
    secret: /secret\s*=\s*['"][^'"]{10,}['"]/i
  }
};

class WeakCryptoDetector {
  constructor(targetDir) {
    this.targetDir = targetDir;
    this.findings = [];
  }

  scan() {
    console.log(`${colors.cyan}=== 弱い暗号化検出 ===${colors.reset}\n`);
    console.log(`対象: ${this.targetDir}\n`);

    this.scanDirectory(this.targetDir);
    this.printResults();
  }

  scanDirectory(dir) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
          this.scanDirectory(filePath);
        }
      } else if (this.isTargetFile(file)) {
        this.analyzeFile(filePath);
      }
    }
  }

  isTargetFile(filename) {
    const ext = extname(filename);
    return ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.py'].includes(ext);
  }

  analyzeFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        this.checkLine(filePath, line, index + 1);
      });
    } catch (error) {
      // ファイル読み取りエラーは無視
    }
  }

  checkLine(filePath, line, lineNumber) {
    // 弱いハッシュ
    for (const [name, pattern] of Object.entries(weakCryptoPatterns.weakHash)) {
      if (pattern.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        this.findings.push({
          file: filePath,
          line: lineNumber,
          category: 'weak_hash',
          type: name.toUpperCase(),
          severity: 'high',
          message: `${name.toUpperCase()}は衝突攻撃に脆弱です。SHA-256以上を使用してください`,
          code: line.trim()
        });
      }
    }

    // 弱い暗号
    for (const [name, pattern] of Object.entries(weakCryptoPatterns.weakCipher)) {
      if (pattern.test(line) && !line.trim().startsWith('//')) {
        this.findings.push({
          file: filePath,
          line: lineNumber,
          category: 'weak_cipher',
          type: name.toUpperCase(),
          severity: 'critical',
          message: `${name.toUpperCase()}は脆弱です。AES-256-GCMを使用してください`,
          code: line.trim()
        });
      }
    }

    // 弱い乱数生成
    for (const [name, pattern] of Object.entries(weakCryptoPatterns.weakRandom)) {
      if (pattern.test(line)) {
        this.findings.push({
          file: filePath,
          line: lineNumber,
          category: 'weak_random',
          type: name,
          severity: 'high',
          message: `${name}は予測可能です。crypto.randomBytes()を使用してください`,
          code: line.trim()
        });
      }
    }

    // ハードコードされたシークレット
    for (const [name, pattern] of Object.entries(weakCryptoPatterns.hardcodedSecrets)) {
      if (pattern.test(line) && !line.includes('process.env')) {
        this.findings.push({
          file: filePath,
          line: lineNumber,
          category: 'hardcoded_secret',
          type: name,
          severity: 'critical',
          message: `シークレットがハードコードされています。環境変数を使用してください`,
          code: line.trim().substring(0, 50) + '...'
        });
      }
    }
  }

  printResults() {
    if (this.findings.length === 0) {
      console.log(`${colors.green}✅ 弱い暗号化は検出されませんでした${colors.reset}\n`);
      return;
    }

    console.log(`${colors.red}検出された問題: ${this.findings.length}件${colors.reset}\n`);

    // Critical
    const critical = this.findings.filter(f => f.severity === 'critical');
    if (critical.length > 0) {
      console.log(`${colors.red}🚨 Critical (${critical.length}):${colors.reset}`);
      critical.forEach(f => {
        console.log(`  ${f.file}:${f.line}`);
        console.log(`    タイプ: ${f.type}`);
        console.log(`    メッセージ: ${f.message}`);
        console.log(`    コード: ${f.code}\n`);
      });
    }

    // High
    const high = this.findings.filter(f => f.severity === 'high');
    if (high.length > 0) {
      console.log(`${colors.yellow}⚠️  High (${high.length}):${colors.reset}`);
      high.slice(0, 10).forEach(f => {
        console.log(`  ${f.file}:${f.line} - ${f.message}`);
      });
      if (high.length > 10) {
        console.log(`  ... 他 ${high.length - 10} 件`);
      }
      console.log();
    }

    // 推奨事項
    console.log(`${colors.cyan}=== 推奨事項 ===${colors.reset}\n`);
    console.log(`${colors.green}✅ 推奨アルゴリズム:${colors.reset}`);
    console.log(`  ハッシング: SHA-256、SHA-512、BLAKE2b`);
    console.log(`  暗号化: AES-256-GCM、ChaCha20-Poly1305`);
    console.log(`  パスワード: argon2id、bcrypt（cost=12）`);
    console.log(`  乱数: crypto.randomBytes()、secrets（Python）\n`);
  }
}

// メイン実行
const targetDir = process.argv[2] || './src';

try {
  const detector = new WeakCryptoDetector(targetDir);
  detector.scan();
} catch (error) {
  console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
  process.exit(1);
}
