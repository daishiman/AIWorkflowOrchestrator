#!/usr/bin/env node
/**
 * validate-evals.js
 * EVALS.json の L1/L2/L3 3層スキーマ検証スクリプト
 *
 * L1: JSON.parse による構文検証
 * L2: 必須キー存在確認（camelCase/snake_case 両方言許容モード）
 * L3: .claude/skills/ と .agents/skills/ の dual root bit-for-bit 一致検証
 *
 * 使い方:
 *   node validate-evals.js --all-skills
 *   node validate-evals.js --skill <skill-id>
 *   node validate-evals.js --path <file>
 *   node validate-evals.js --all-skills --check-dual-root --json --verbose
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// スキルallowlist（固定6件。新スキル追加時はここを更新する）
const SKILL_ALLOWLIST = [
  'aiworkflow-requirements',
  'github-issue-manager',
  'int-test-skill',
  'skill-creator',
  'skill-fixture-runner',
  'task-specification-creator',
];

// fixture除外リスト（Phase 2 契約: glob ではなく allowlist ベースで管理する）
const FIXTURE_EXCLUSION_LIST = [
  'apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json',
];

const DIALECT_PAIRS = [
  ['skillName', 'skill_name'],
  ['currentLevel', 'current_level'],
];

/**
 * L1: JSON.parse 構文検証
 * @returns {{ ok: boolean, layer: string, reason?: string, parsed?: object }}
 */
function validateL1(filePath) {
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (err) {
    return { ok: false, layer: 'L1', reason: `ファイル読み込みエラー: ${err.message}` };
  }

  if (content.trim().length === 0) {
    return { ok: false, layer: 'L1', reason: '空ファイル' };
  }

  try {
    const parsed = JSON.parse(content);
    return { ok: true, layer: 'L1', parsed };
  } catch (err) {
    return { ok: false, layer: 'L1', reason: `JSON構文エラー: ${err.message}` };
  }
}

/**
 * L2: 必須キー検証（方言許容モード）
 *
 * 方言自動検出:
 *   - skillName が存在 → camelCase 方言として検証
 *   - skill_name が存在 → snake_case 方言として検証
 *   - どちらも存在しない → L2エラー（方言検出不能）
 *
 * @returns {{ ok: boolean, layer: string, missing?: string[], warnings?: string[] }}
 */
function validateL2(parsed, strict = false) {
  const missing = [];
  const warnings = [];

  for (const [camelKey, snakeKey] of DIALECT_PAIRS) {
    const hasCamel = parsed[camelKey] !== undefined;
    const hasSnake = parsed[snakeKey] !== undefined;
    if (strict) {
      if (!hasCamel || !hasSnake) {
        missing.push(`${camelKey} / ${snakeKey}（strictモード: 両方必須）`);
      }
      continue;
    }
    if (!hasCamel && !hasSnake) {
      missing.push(`${camelKey} / ${snakeKey}（どちらも存在しない）`);
    } else if (hasCamel && hasSnake) {
      warnings.push(`方言混在: ${camelKey} と ${snakeKey} が共存`);
    }
  }

  // metrics は方言非依存の共通必須キー
  if (parsed.metrics === undefined) {
    missing.push('metrics');
  }

  return { ok: missing.length === 0, layer: 'L2', missing, warnings };
}

/**
 * L3: dual root 一致検証（Buffer.compare によるバイト単位比較）
 * @returns {{ ok: boolean, layer: string, reason?: string }}
 */
function validateL3(skillName, repoRoot) {
  const claudePath = join(repoRoot, '.claude', 'skills', skillName, 'EVALS.json');
  const agentsPath = join(repoRoot, '.agents', 'skills', skillName, 'EVALS.json');

  if (!existsSync(claudePath)) {
    return { ok: false, layer: 'L3', reason: `.claude 側が存在しない: ${claudePath}` };
  }
  if (!existsSync(agentsPath)) {
    return { ok: false, layer: 'L3', reason: `ミラー欠損: ${agentsPath}` };
  }

  const claudeBuf = readFileSync(claudePath);
  const agentsBuf = readFileSync(agentsPath);

  if (Buffer.compare(claudeBuf, agentsBuf) !== 0) {
    return { ok: false, layer: 'L3', reason: `dual root ドリフト検出: ${skillName}` };
  }
  return { ok: true, layer: 'L3' };
}

/**
 * fixture パスかどうかを判定（allowlist + パターンマッチ）
 */
function isFixturePath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return FIXTURE_EXCLUSION_LIST.some(ex => normalized.endsWith(ex) || normalized.includes(ex));
}

function collectEvalsFiles(targetPath) {
  const stats = statSync(targetPath);
  if (stats.isFile()) {
    return [targetPath];
  }
  if (!stats.isDirectory()) {
    return [];
  }
  const results = [];
  const walk = (currentPath) => {
    for (const entry of readdirSync(currentPath, { withFileTypes: true })) {
      const entryPath = join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (entry.isFile() && entry.name === 'EVALS.json') {
        results.push(entryPath);
      }
    }
  };
  walk(targetPath);
  return results;
}

/**
 * 単一ファイルの L1+L2 検証
 */
function validateFile(filePath, options = {}) {
  const { strict = false } = options;
  const result = { path: filePath, excluded: false, ok: false };

  if (isFixturePath(filePath)) {
    return { ...result, excluded: true, ok: true };
  }

  const l1 = validateL1(filePath);
  result.l1 = l1;
  if (!l1.ok) {
    return { ...result, ok: false };
  }

  const l2 = validateL2(l1.parsed, strict);
  result.l2 = l2;
  if (!l2.ok) {
    return { ...result, ok: false };
  }

  return { ...result, ok: true };
}

/**
 * スキル単体の L1+L2(+L3) 検証
 */
function validateSkill(skillName, repoRoot, options = {}) {
  const { strict = false, checkDualRoot = true } = options;

  if (!SKILL_ALLOWLIST.includes(skillName)) {
    return { skillName, ok: false, error: `スキルが allowlist にない: ${skillName}` };
  }

  const claudePath = join(repoRoot, '.claude', 'skills', skillName, 'EVALS.json');
  if (!existsSync(claudePath)) {
    return { skillName, ok: false, error: `.claude 側 EVALS.json が存在しない: ${claudePath}` };
  }

  const fileResult = validateFile(claudePath, { strict });
  if (!fileResult.ok) {
    return { skillName, ...fileResult, ok: false };
  }

  if (checkDualRoot) {
    const l3 = validateL3(skillName, repoRoot);
    fileResult.l3 = l3;
    if (!l3.ok) {
      return { skillName, ...fileResult, ok: false };
    }
  }

  return { skillName, ...fileResult, ok: true };
}

/**
 * 結果をテキスト形式で stdout に出力
 */
function printResult(result, verbose = false) {
  const label = result.skillName || result.path;
  const { ok, excluded, l1, l2, l3, error } = result;

  if (excluded) {
    if (verbose) process.stderr.write(`  ⊘ ${label} (fixture 除外)\n`);
    return;
  }

  if (ok) {
    const layers = [l1 && 'L1', l2 && 'L2', l3 && 'L3'].filter(Boolean).join('+');
    process.stdout.write(`✓ ${label}${layers ? ` (${layers})` : ''}\n`);
  } else {
    process.stdout.write(`✗ ${label}\n`);
    if (error) process.stdout.write(`  エラー: ${error}\n`);
    if (l1 && !l1.ok) process.stdout.write(`  L1: ${l1.reason}\n`);
    if (l2 && !l2.ok) process.stdout.write(`  L2: 必須フィールド不足: ${l2.missing.join(', ')}\n`);
    if (l3 && !l3.ok) process.stdout.write(`  L3: ${l3.reason}\n`);
  }
}

function main() {
  const args = process.argv.slice(2);

  const allSkills = args.includes('--all-skills');
  const skillIdx = args.indexOf('--skill');
  const skillArg = skillIdx !== -1 ? args[skillIdx + 1] : null;
  const pathIdx = args.indexOf('--path');
  const pathArg = pathIdx !== -1 ? args[pathIdx + 1] : null;
  const checkDualRoot = args.includes('--check-dual-root') || allSkills;
  const checkExcluded = args.includes('--check-excluded');
  const strict = args.includes('--strict');
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose');

  // validate-evals.js から4階層上がリポジトリルート
  // scripts/ → skill-fixture-runner/ → skills/ → .claude/ → repo root
  const repoRoot = resolve(__dirname, '..', '..', '..', '..');

  const options = { strict, checkDualRoot, verbose };
  const results = [];
  let hasError = false;

  if (pathArg) {
    const resolvedPath = resolve(repoRoot, pathArg);
    if (!existsSync(resolvedPath)) {
      results.push({ path: resolvedPath, excluded: false, ok: false, error: `パスが存在しない: ${resolvedPath}` });
      hasError = true;
    } else {
      const targets = collectEvalsFiles(resolvedPath);
      if (targets.length === 0) {
        results.push({ path: resolvedPath, excluded: false, ok: false, error: `EVALS.json が見つからない: ${resolvedPath}` });
        hasError = true;
      } else {
        for (const target of targets) {
          const result = validateFile(target, options);
          results.push(result);
          if (!result.ok) hasError = true;
        }
      }
    }

  } else if (skillArg) {
    if (!SKILL_ALLOWLIST.includes(skillArg)) {
      process.stderr.write(`エラー: スキル "${skillArg}" は allowlist にありません\n`);
      process.stderr.write(`利用可能なスキル: ${SKILL_ALLOWLIST.join(', ')}\n`);
      process.exit(1);
    }
    const result = validateSkill(skillArg, repoRoot, options);
    results.push(result);
    if (!result.ok) hasError = true;

  } else if (allSkills) {
    process.stderr.write(`[EVALS Validator] 開始: ${SKILL_ALLOWLIST.length} スキルを検証\n`);
    for (const skill of SKILL_ALLOWLIST) {
      const result = validateSkill(skill, repoRoot, options);
      results.push(result);
      if (!result.ok) hasError = true;
    }

  } else if (checkExcluded) {
    process.stdout.write('[EVALS Validator] --check-excluded: 除外リスト\n');
    FIXTURE_EXCLUSION_LIST.forEach(p => process.stdout.write(`  除外: ${p}\n`));
    process.exit(0);

  } else {
    process.stdout.write(`使い方:
  node validate-evals.js --all-skills              allowlist 6件を一括検証
  node validate-evals.js --skill <id>              特定スキルのみ検証
  node validate-evals.js --path <file>             単一ファイルを検証
  node validate-evals.js --check-dual-root         L3 dual root比較を強制実行
  node validate-evals.js --check-excluded          除外リストを表示
  node validate-evals.js --strict                  strictモード（両方言必須）
  node validate-evals.js --json                    JSON形式で出力
  node validate-evals.js --verbose                 詳細ログを出力
`);
    process.exit(0);
  }

  if (jsonOutput) {
    const pass = results.filter(r => r.ok).length;
    const fail = results.filter(r => !r.ok).length;
    process.stdout.write(JSON.stringify({
      summary: { total: results.length, pass, fail },
      results,
    }, null, 2) + '\n');
  } else {
    results.forEach(r => printResult(r, verbose));
    if (allSkills) {
      const pass = results.filter(r => r.ok).length;
      const fail = results.filter(r => !r.ok).length;
      process.stdout.write(`\n[EVALS Validator] 結果: ${pass}/${results.length} PASS, ${fail}/${results.length} FAIL\n`);
    }
  }

  process.exit(hasError ? 1 : 0);
}

main();
