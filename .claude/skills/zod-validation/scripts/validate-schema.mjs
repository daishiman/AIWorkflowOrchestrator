#!/usr/bin/env node
/**
 * Zodスキーマファイルの検証スクリプト
 *
 * 使用方法:
 *   node validate-schema.mjs <schema.ts>
 *
 * 検証項目:
 *   - 必須エクスポート（スキーマと型）の存在
 *   - 命名規則の遵守
 *   - 型推論の使用
 *   - セキュリティパターンの存在
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 検証結果
const results = {
  errors: [],
  warnings: [],
  info: [],
};

// 検証ルール
const rules = {
  // 必須パターン
  required: {
    zodImport: {
      pattern: /import\s+{\s*z\s*}\s+from\s+['"]zod['"]/,
      message: 'Zodのインポートが見つかりません: import { z } from "zod"',
    },
    schemaExport: {
      pattern: /export\s+(const|let)\s+\w+Schema\s*=/,
      message: 'スキーマのエクスポートが見つかりません（例: export const userSchema = ...）',
    },
    typeInference: {
      pattern: /z\.infer<typeof\s+\w+Schema>/,
      message: '型推論（z.infer<typeof ...>）を使用してください',
    },
  },

  // 推奨パターン
  recommended: {
    typeExport: {
      pattern: /export\s+type\s+\w+\s*=\s*z\.infer/,
      message: '推論した型もエクスポートすることを推奨します',
    },
    errorMessages: {
      pattern: /\.(min|max|email|url|uuid)\([^)]*,?\s*['"][^'"]+['"]\s*\)/,
      message: 'カスタムエラーメッセージの使用を推奨します',
    },
  },

  // セキュリティ関連
  security: {
    inputValidation: {
      pattern: /\.(min|max|length)\(/,
      message: '入力長の制限がありません。DoS対策として長さ制限を追加してください',
      invert: true, // パターンが見つからない場合に警告
    },
    noAny: {
      pattern: /z\.any\(\)/,
      message: 'z.any() の使用は型安全性を損ないます。具体的な型を指定してください',
      invert: false, // パターンが見つかった場合に警告
    },
    noUnknown: {
      pattern: /z\.unknown\(\)(?!\.)/,
      message: 'z.unknown() は追加の検証なしで使用しないでください',
      invert: false,
    },
  },

  // 命名規則
  naming: {
    schemaName: {
      pattern: /const\s+(\w+)Schema\s*=/g,
      validator: (matches) => {
        const invalidNames = [];
        for (const match of matches) {
          const name = match[1];
          if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
            invalidNames.push(name);
          }
        }
        return invalidNames.length === 0
          ? null
          : `スキーマ名はcamelCaseで始めてください: ${invalidNames.join(', ')}`;
      },
    },
  },
};

/**
 * ファイルを検証
 */
async function validateFile(filePath) {
  console.log(`\n📄 検証中: ${filePath}\n`);

  // ファイル存在チェック
  if (!existsSync(filePath)) {
    results.errors.push(`ファイルが見つかりません: ${filePath}`);
    return;
  }

  // ファイル拡張子チェック
  const ext = path.extname(filePath);
  if (!['.ts', '.tsx'].includes(ext)) {
    results.errors.push(`TypeScriptファイル（.ts, .tsx）を指定してください: ${filePath}`);
    return;
  }

  // ファイル読み込み
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  // 必須パターンチェック
  console.log('🔍 必須パターンをチェック中...');
  for (const [name, rule] of Object.entries(rules.required)) {
    if (!rule.pattern.test(content)) {
      results.errors.push(`[必須] ${rule.message}`);
    } else {
      results.info.push(`✅ ${name}: OK`);
    }
  }

  // 推奨パターンチェック
  console.log('🔍 推奨パターンをチェック中...');
  for (const [name, rule] of Object.entries(rules.recommended)) {
    if (!rule.pattern.test(content)) {
      results.warnings.push(`[推奨] ${rule.message}`);
    } else {
      results.info.push(`✅ ${name}: OK`);
    }
  }

  // セキュリティチェック
  console.log('🔍 セキュリティパターンをチェック中...');
  for (const [name, rule] of Object.entries(rules.security)) {
    const found = rule.pattern.test(content);
    if (rule.invert) {
      // パターンが見つからない場合に警告
      if (!found) {
        results.warnings.push(`[セキュリティ] ${rule.message}`);
      }
    } else {
      // パターンが見つかった場合に警告
      if (found) {
        results.warnings.push(`[セキュリティ] ${rule.message}`);
      }
    }
  }

  // 命名規則チェック
  console.log('🔍 命名規則をチェック中...');
  for (const [name, rule] of Object.entries(rules.naming)) {
    if (rule.validator) {
      const matches = [...content.matchAll(rule.pattern)];
      const error = rule.validator(matches);
      if (error) {
        results.warnings.push(`[命名規則] ${error}`);
      }
    }
  }

  // 行数チェック
  if (lines.length > 500) {
    results.warnings.push(`[構造] ファイルが${lines.length}行あります。分割を検討してください（推奨: 500行以下）`);
  }

  // 複雑なネストのチェック
  const deepNestMatch = content.match(/z\.object\(\{[\s\S]*z\.object\(\{[\s\S]*z\.object\(\{[\s\S]*z\.object\(/);
  if (deepNestMatch) {
    results.warnings.push('[構造] 深いネスト（4層以上）が検出されました。フラット化を検討してください');
  }
}

/**
 * 結果を表示
 */
function displayResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 検証結果');
  console.log('='.repeat(60));

  if (results.errors.length > 0) {
    console.log('\n❌ エラー:');
    results.errors.forEach((e) => console.log(`   - ${e}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    results.warnings.forEach((w) => console.log(`   - ${w}`));
  }

  if (results.info.length > 0) {
    console.log('\nℹ️  情報:');
    results.info.forEach((i) => console.log(`   - ${i}`));
  }

  console.log('\n' + '-'.repeat(60));
  console.log(`📈 サマリー: ${results.errors.length} エラー, ${results.warnings.length} 警告`);

  if (results.errors.length === 0) {
    console.log('✅ 検証に合格しました！\n');
    return 0;
  } else {
    console.log('❌ 検証に失敗しました。エラーを修正してください。\n');
    return 1;
  }
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
使用方法: node validate-schema.mjs <schema.ts>

オプション:
  <schema.ts>  検証するZodスキーマファイルのパス

例:
  node validate-schema.mjs src/features/user/schema.ts
  node validate-schema.mjs ./schema.ts
`);
    process.exit(1);
  }

  for (const filePath of args) {
    await validateFile(filePath);
  }

  const exitCode = displayResults();
  process.exit(exitCode);
}

main().catch((error) => {
  console.error('予期せぬエラーが発生しました:', error);
  process.exit(1);
});
