#!/usr/bin/env node
/**
 * session-management スキル使用記録スクリプト
 *
 * 使用例:
 *   node scripts/log_usage.mjs --result success
 *   node scripts/log_usage.mjs --result failure --reason "エラー詳細"
 */

import { appendFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_PATH = join(__dirname, '..', 'LOGS.md');

function parseArgs(args) {
  const result = { result: null, reason: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--result' && args[i + 1]) {
      result.result = args[i + 1];
      i++;
    } else if (args[i] === '--reason' && args[i + 1]) {
      result.reason = args[i + 1];
      i++;
    } else if (args[i] === '-h' || args[i] === '--help') {
      console.log(`
Usage: node log_usage.mjs --result <success|failure> [--reason <reason>]

Options:
  --result   結果 (success または failure)
  --reason   失敗理由 (任意)
  -h, --help ヘルプを表示
`);
      process.exit(0);
    }
  }
  return result;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.result || !['success', 'failure'].includes(args.result)) {
    console.error('Error: --result は success または failure を指定してください');
    process.exit(2);
  }

  const timestamp = new Date().toISOString();
  const entry = `
## ${timestamp}
- スキル: session-management
- 結果: ${args.result}
${args.reason ? `- 理由: ${args.reason}` : ''}
`;

  try {
    appendFileSync(LOGS_PATH, entry);
    console.log(`使用記録を追加しました: ${args.result}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ログの書き込みに失敗しました: ${error.message}`);
    process.exit(1);
  }
}

main();
