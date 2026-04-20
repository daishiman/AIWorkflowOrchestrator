#!/usr/bin/env node
/**
 * validate-closeout-parity.js
 *
 * ワークフローのPhaseステータスが S1〜S4 の4つのソース間で一致しているかを検証する。
 *
 * 使用方法:
 *   node validate-closeout-parity.js --workflow <path> [--json]
 *
 * 終了コード:
 *   0: PARITY_OK   - 全ソース一致
 *   1: PARITY_DRIFT - ソース間不一致
 *   2: MISSING_SOURCE - 必須ソースが欠損
 *   3: INVALID_STATUS_VALUE - 許可されていないstatus値
 *
 * ソース定義:
 *   S1: index.md のPhase表（Phase列が数字の行のステータス列）
 *   S2: artifacts.json（ルート）
 *   S3: outputs/artifacts.json
 *   S4: phase-N-*.md ファイルのfrontmatterの | ステータス | ... | 行
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const ALLOWED_STATUS = new Set(['pending', 'in_progress', 'completed', 'blocked']);
const S1_ALLOWED_STATUS = new Set(['pending', 'in_progress', 'completed', 'blocked', '-']);

// S1: index.md のPhase表パース
// | 1 | 名称 | ... | completed | 形式
function readIndexMdPhaseTable(indexPath) {
  const content = readFileSync(indexPath, 'utf-8');
  const result = {};
  const lines = content.split('\n');
  for (const line of lines) {
    // Phase列が数字の行を抽出してステータス列（最後の列）を取得
    const match = line.match(/^\|\s*(\d+)\s*\|.*\|\s*(\S+)\s*\|?\s*$/);
    if (match) {
      result[parseInt(match[1], 10)] = match[2].trim();
    }
  }
  return result;
}

// S2/S3: artifacts.json パース
function readArtifactsJson(jsonPath) {
  const content = readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(content);
  const result = {};
  if (data.phases) {
    for (const [key, val] of Object.entries(data.phases)) {
      result[parseInt(key, 10)] = val.status;
    }
  }
  return result;
}

// S4: phase-N-*.md frontmatter パース
// | ステータス | completed | の行を抽出
function readPhaseFrontmatters(workflowDir) {
  const result = {};
  let files;
  try {
    files = readdirSync(workflowDir);
  } catch {
    return result;
  }

  for (const file of files) {
    const match = file.match(/^phase-(\d+)-.*\.md$/);
    if (!match) continue;

    const phaseNum = parseInt(match[1], 10);
    const filePath = join(workflowDir, file);
    try {
      const content = readFileSync(filePath, 'utf-8');
      // | ステータス | ... | の行を抽出
      const statusMatch = content.match(/^\|\s*ステータス\s*\|\s*(\S+)\s*\|/m);
      if (statusMatch) {
        result[phaseNum] = statusMatch[1].trim();
      }
    } catch {
      // 読み取れないファイルはスキップ
    }
  }

  return result;
}

// CLI引数パース
function parseArgs(args) {
  const result = { workflow: null, json: false };
  const knownFlags = ['--workflow', '--json'];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--workflow' && args[i + 1]) {
      result.workflow = args[i + 1];
      i++;
    } else if (args[i] === '--json') {
      result.json = true;
    } else if (args[i].startsWith('--')) {
      console.error(`エラー: 未知のオプション: ${args[i]}`);
      console.error('使用方法: node validate-closeout-parity.js --workflow <path> [--json]');
      process.exit(2);
    }
  }

  return result;
}

// parity検証メイン
function validateParity(workflowDir) {
  const workflowPath = workflowDir;

  // S2: ルート artifacts.json
  const s2Path = join(workflowPath, 'artifacts.json');
  if (!existsSync(s2Path)) {
    return {
      outcome: 'MISSING_SOURCE',
      exitCode: 2,
      message: `MISSING_SOURCE: artifacts.json が見つかりません: ${s2Path}`,
      drifts: [],
      sourcesChecked: ['S2']
    };
  }

  // S3: outputs/artifacts.json
  const s3Path = join(workflowPath, 'outputs', 'artifacts.json');
  if (!existsSync(s3Path)) {
    return {
      outcome: 'MISSING_SOURCE',
      exitCode: 2,
      message: `MISSING_SOURCE: outputs/artifacts.json が見つかりません: ${s3Path}`,
      drifts: [],
      sourcesChecked: ['S2', 'S3']
    };
  }

  // S1: index.md
  const indexPath = join(workflowPath, 'index.md');
  if (!existsSync(indexPath)) {
    return {
      outcome: 'MISSING_SOURCE',
      exitCode: 2,
      message: `MISSING_SOURCE: index.md が見つかりません: ${indexPath}`,
      drifts: [],
      sourcesChecked: ['S2', 'S3', 'S1']
    };
  }

  // 各ソースを読み取る
  const s2Data = readArtifactsJson(s2Path);
  const s3Data = readArtifactsJson(s3Path);
  const s1Data = readIndexMdPhaseTable(indexPath);
  const s4Data = readPhaseFrontmatters(workflowPath);

  const hasS4 = Object.keys(s4Data).length > 0;

  // 全ソースからPhaseの和集合を取得
  const allPhases = new Set([
    ...Object.keys(s2Data).map(Number),
    ...Object.keys(s3Data).map(Number),
    ...Object.keys(s1Data).map(Number),
    ...Object.keys(s4Data).map(Number),
  ]);

  // INVALID_STATUS_VALUE チェック（S1〜S4全ソース）
  for (const phase of allPhases) {
    const s1Val = s1Data[phase];
    const s2Val = s2Data[phase];
    const s3Val = s3Data[phase];
    const s4Val = s4Data[phase];

    // S1の'-'は許可
    if (s1Val !== undefined && !S1_ALLOWED_STATUS.has(s1Val)) {
      return {
        outcome: 'INVALID_STATUS_VALUE',
        exitCode: 3,
        message: `INVALID_STATUS_VALUE: Phase ${phase} S1 に無効なステータス値 "${s1Val}" があります`,
        drifts: [],
        sourcesChecked: ['S1', 'S2', 'S3', 'S4']
      };
    }
    if (s2Val !== undefined && !ALLOWED_STATUS.has(s2Val)) {
      return {
        outcome: 'INVALID_STATUS_VALUE',
        exitCode: 3,
        message: `INVALID_STATUS_VALUE: Phase ${phase} S2 に無効なステータス値 "${s2Val}" があります`,
        drifts: [],
        sourcesChecked: ['S1', 'S2', 'S3', 'S4']
      };
    }
    if (s3Val !== undefined && !ALLOWED_STATUS.has(s3Val)) {
      return {
        outcome: 'INVALID_STATUS_VALUE',
        exitCode: 3,
        message: `INVALID_STATUS_VALUE: Phase ${phase} S3 に無効なステータス値 "${s3Val}" があります`,
        drifts: [],
        sourcesChecked: ['S1', 'S2', 'S3', 'S4']
      };
    }
    if (s4Val !== undefined && !ALLOWED_STATUS.has(s4Val)) {
      return {
        outcome: 'INVALID_STATUS_VALUE',
        exitCode: 3,
        message: `INVALID_STATUS_VALUE: Phase ${phase} S4 に無効なステータス値 "${s4Val}" があります`,
        drifts: [],
        sourcesChecked: ['S1', 'S2', 'S3', 'S4']
      };
    }
  }

  // phasesが全部空なら PARITY_OK
  if (allPhases.size === 0) {
    return {
      outcome: 'PARITY_OK',
      exitCode: 0,
      message: 'PARITY_OK: 全ソース一致（Phaseなし）',
      drifts: [],
      sourcesChecked: hasS4 ? ['S1', 'S2', 'S3', 'S4'] : ['S1', 'S2', 'S3']
    };
  }

  // parity比較
  const drifts = [];
  const phaseResults = {};

  for (const phase of [...allPhases].sort((a, b) => a - b)) {
    const s1Raw = s1Data[phase];
    // S1の'-'はpendingと同義
    const s1Val = s1Raw === '-' ? 'pending' : s1Raw;
    const s2Val = s2Data[phase];
    const s3Val = s3Data[phase];
    const s4Val = s4Data[phase];

    // canonical値: S2→S3→S1→S4の優先順位
    const canonical = s2Val ?? s3Val ?? s1Val ?? s4Val;

    const phaseDrifts = [];

    if (s1Val !== undefined && s1Val !== canonical) {
      phaseDrifts.push({
        source: 'S1',
        expected: canonical,
        actual: s1Val
      });
    }
    if (s2Val !== undefined && s2Val !== canonical) {
      phaseDrifts.push({
        source: 'S2',
        expected: canonical,
        actual: s2Val
      });
    }
    if (s3Val !== undefined && s3Val !== canonical) {
      phaseDrifts.push({
        source: 'S3',
        expected: canonical,
        actual: s3Val
      });
    }
    if (hasS4 && s4Val !== undefined && s4Val !== canonical) {
      phaseDrifts.push({
        source: 'S4',
        expected: canonical,
        actual: s4Val
      });
    }

    phaseResults[phase] = {
      canonical,
      s1: s1Raw,
      s2: s2Val,
      s3: s3Val,
      s4: s4Val,
      drifts: phaseDrifts
    };

    drifts.push(...phaseDrifts.map(d => ({ phase, ...d })));
  }

  const sourcesChecked = hasS4 ? ['S1', 'S2', 'S3', 'S4'] : ['S1', 'S2', 'S3'];

  if (drifts.length > 0) {
    return {
      outcome: 'PARITY_DRIFT',
      exitCode: 1,
      message: `PARITY_DRIFT: ${drifts.length} 件のドリフトを検出`,
      drifts,
      phaseResults,
      sourcesChecked
    };
  }

  return {
    outcome: 'PARITY_OK',
    exitCode: 0,
    message: 'PARITY_OK: 全ソース一致',
    drifts: [],
    phaseResults,
    sourcesChecked
  };
}

// メイン
function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.workflow) {
    console.error('エラー: --workflow オプションは必須です');
    console.error('使用方法: node validate-closeout-parity.js --workflow <path> [--json]');
    process.exit(2);
  }

  if (!existsSync(options.workflow)) {
    console.error(`エラー: ワークフローディレクトリが存在しません: ${options.workflow}`);
    process.exit(2);
  }

  process.stderr.write(`[validate-closeout-parity] 検証開始: ${options.workflow}\n`);

  let parityResult;
  try {
    parityResult = validateParity(options.workflow);
  } catch (err) {
    console.error(`エラー: 検証中に例外が発生しました: ${err.message}`);
    process.exit(2);
  }

  process.stderr.write(`[validate-closeout-parity] 結果: ${parityResult.outcome}\n`);

  if (options.json) {
    const output = {
      result: parityResult.outcome,
      phases: parityResult.phaseResults || {},
      drifts: parityResult.drifts,
      sourcesChecked: parityResult.sourcesChecked,
      generatedAt: new Date().toISOString()
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    // 人間可読出力
    console.log(parityResult.message);

    if (parityResult.drifts && parityResult.drifts.length > 0) {
      console.log('');
      console.log('ドリフト詳細:');
      for (const drift of parityResult.drifts) {
        console.log(`  Phase ${drift.phase} | ${drift.source} | expected=${drift.expected} | actual=${drift.actual}`);
      }
    }
  }

  process.exit(parityResult.exitCode);
}

main();
