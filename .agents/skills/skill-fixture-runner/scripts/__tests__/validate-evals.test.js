#!/usr/bin/env node
/**
 * validate-evals.test.js
 * Node.js built-in test runner を使用した validate-evals.js テストスイート
 * Phase 4: TC-001〜TC-022 (TDD Red フェーズ)
 * Phase 6: TC-E-001〜TC-E-013 (エッジケース・エラーパス拡充)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, rmSync, readFileSync, copyFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPT_PATH = join(__dirname, '..', 'validate-evals.js');
const RUN_ALL_SCRIPT = join(__dirname, '..', 'run-all-validations.js');
const TMP_DIR = join(__dirname, 'tmp-evals-test');

// リポジトリルート（__tests__ から5階層上）
const REPO_ROOT = join(__dirname, '..', '..', '..', '..', '..');

function run(args = [], cwd = REPO_ROOT) {
  return spawnSync('node', [SCRIPT_PATH, ...args], {
    encoding: 'utf-8',
    cwd,
  });
}

function writeJson(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    typeof content === 'string' ? content : JSON.stringify(content, null, 2),
    'utf-8'
  );
}

function withTemporaryFileMutation(targetPath, temporaryContent, fn) {
  const backupPath = `${targetPath}.bak-test`;
  copyFileSync(targetPath, backupPath);
  try {
    writeFileSync(targetPath, temporaryContent, 'utf-8');
    fn();
  } finally {
    copyFileSync(backupPath, targetPath);
    unlinkSync(backupPath);
  }
}

before(() => {
  mkdirSync(TMP_DIR, { recursive: true });

  // L1 テスト用
  writeFileSync(join(TMP_DIR, 'broken.json'), '{ invalid json }', 'utf-8');
  writeFileSync(join(TMP_DIR, 'empty.json'), '', 'utf-8');
  writeJson(join(TMP_DIR, 'minimal-camel.json'), { skillName: 'test', currentLevel: 1, metrics: {} });
  writeJson(join(TMP_DIR, 'full-snake.json'), {
    skill_name: 'test-skill',
    current_level: 2,
    metrics: { total_usage_count: 10, success_count: 10, failure_count: 0 },
  });

  // L2 テスト用
  writeJson(join(TMP_DIR, 'missing-skill-name-snake.json'), { current_level: 1, metrics: {} });
  writeJson(join(TMP_DIR, 'missing-skill-name-camel.json'), { currentLevel: 1, metrics: {} });
  writeJson(join(TMP_DIR, 'missing-level.json'), { skillName: 'test', metrics: {} });
  writeJson(join(TMP_DIR, 'valid-camel.json'), { skillName: 'test', currentLevel: 1, metrics: {} });
  writeJson(join(TMP_DIR, 'valid-snake.json'), { skill_name: 'test', current_level: 1, metrics: {} });
  // 方言混在: skillName + skill_name の両方を持つケース（本来の混在）
  writeJson(join(TMP_DIR, 'mixed-dialect.json'), { skillName: 'test', skill_name: 'test', currentLevel: 1, metrics: {} });
  writeJson(join(TMP_DIR, 'empty-object.json'), {});

  // fixture パス除外テスト用
  const fixtureDir = join(TMP_DIR, '__fixtures__');
  mkdirSync(fixtureDir, { recursive: true });
  writeFileSync(join(fixtureDir, 'broken.json'), '{ invalid }', 'utf-8');
  writeJson(join(TMP_DIR, 'dir-mode', 'nested', 'EVALS.json'), {
    skillName: 'dir-mode',
    currentLevel: 1,
    metrics: {},
  });
  writeJson(join(TMP_DIR, 'strict-missing-snake.json'), {
    skillName: 'strict-only-camel',
    currentLevel: 1,
    metrics: {},
  });
});

after(() => {
  rmSync(TMP_DIR, { recursive: true, force: true });
});

describe('L1: JSON パース検証', () => {
  it('TC-001: 破損JSON（構文エラー）→ exit 非ゼロ', () => {
    const r = run(['--path', join(TMP_DIR, 'broken.json')]);
    assert.notStrictEqual(r.status, 0, '破損JSONはexitコード非ゼロであること');
  });

  it('TC-002: 空ファイル → exit 非ゼロ', () => {
    const r = run(['--path', join(TMP_DIR, 'empty.json')]);
    assert.notStrictEqual(r.status, 0, '空ファイルはexitコード非ゼロであること');
  });

  it('TC-003: 正常JSON（最小限・camelCase） → exit 0', () => {
    const r = run(['--path', join(TMP_DIR, 'minimal-camel.json')]);
    assert.strictEqual(r.status, 0, '最小限正常JSONはexit 0であること');
  });

  it('TC-004: 正常JSON（フルフィールド・snake_case） → exit 0', () => {
    const r = run(['--path', join(TMP_DIR, 'full-snake.json')]);
    assert.strictEqual(r.status, 0, 'フルフィールドJSONはexit 0であること');
  });
});

describe('L2: 必須キー検証（方言許容モード）', () => {
  it('TC-005: skill_name欠落 → exit 非ゼロ', () => {
    const r = run(['--path', join(TMP_DIR, 'missing-skill-name-snake.json')]);
    assert.notStrictEqual(r.status, 0, 'skill_name欠落はexitコード非ゼロであること');
  });

  it('TC-006: skillName欠落 → exit 非ゼロ', () => {
    const r = run(['--path', join(TMP_DIR, 'missing-skill-name-camel.json')]);
    assert.notStrictEqual(r.status, 0, 'skillName欠落はexitコード非ゼロであること');
  });

  it('TC-007: currentLevel欠落（camelCase方言） → exit 非ゼロ', () => {
    const r = run(['--path', join(TMP_DIR, 'missing-level.json')]);
    assert.notStrictEqual(r.status, 0, 'currentLevel欠落はexitコード非ゼロであること');
  });

  it('TC-008: camelCase方言で全必須キー揃い → exit 0', () => {
    const r = run(['--path', join(TMP_DIR, 'valid-camel.json')]);
    assert.strictEqual(r.status, 0, 'camelCase方言の正常JSONはexit 0であること');
  });

  it('TC-009: snake_case方言で全必須キー揃い → exit 0', () => {
    const r = run(['--path', join(TMP_DIR, 'valid-snake.json')]);
    assert.strictEqual(r.status, 0, 'snake_case方言の正常JSONはexit 0であること');
  });

  it('TC-010: 方言混在（camelCase+snake_case） → exit 0（許容モード）', () => {
    const r = run(['--path', join(TMP_DIR, 'mixed-dialect.json')]);
    assert.strictEqual(r.status, 0, '方言混在は許容モードではexit 0であること');
  });
});

describe('L3: dual root 一致検証', () => {
  it('TC-011: aiworkflow-requirements: .claudeと.agentsが一致 → exit 0', () => {
    const r = run(['--skill', 'aiworkflow-requirements', '--check-dual-root']);
    assert.strictEqual(r.status, 0, 'dual root一致はexit 0であること');
  });

  it('TC-012: .agents側が異なる → exit 非ゼロ（一時差分化）', () => {
    const mirrorPath = join(REPO_ROOT, '.agents', 'skills', 'skill-fixture-runner', 'EVALS.json');
    withTemporaryFileMutation(mirrorPath, JSON.stringify({ drifted: true }, null, 2), () => {
      const r = run(['--skill', 'skill-fixture-runner', '--check-dual-root']);
      assert.notStrictEqual(r.status, 0, 'dual rootドリフトはexitコード非ゼロであること');
    });
  });

  it('TC-013: .agents側のEVALS.jsonが存在しない → exit 非ゼロ', () => {
    const mirrorPath = join(REPO_ROOT, '.agents', 'skills', 'skill-fixture-runner', 'EVALS.json');
    const backupPath = `${mirrorPath}.bak-test`;
    copyFileSync(mirrorPath, backupPath);
    unlinkSync(mirrorPath);
    try {
      const r = run(['--skill', 'skill-fixture-runner', '--check-dual-root']);
      assert.notStrictEqual(r.status, 0, 'ミラー欠損はexitコード非ゼロであること');
    } finally {
      copyFileSync(backupPath, mirrorPath);
      unlinkSync(backupPath);
    }
  });

  it('TC-015: --path でディレクトリ指定時、配下の EVALS.json を検証できる', () => {
    const r = run(['--path', join(TMP_DIR, 'dir-mode')]);
    assert.strictEqual(r.status, 0, 'ディレクトリ指定でもexit 0であること');
    assert.ok(r.stdout.includes('EVALS.json'), '配下の EVALS.json が出力されること');
  });
});

describe('fixture 除外テスト', () => {
  it('TC-016: FIXTURE_EXCLUSION_LIST内のパス → exit 0（除外）', () => {
    const fixturePath = 'apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json';
    const r = run(['--path', fixturePath]);
    assert.strictEqual(r.status, 0, 'fixture除外はexit 0であること');
  });

  it('TC-017: allowlist外の fixture 風パスは除外されず fail する', () => {
    const brokenFixture = join(TMP_DIR, '__fixtures__', 'broken.json');
    const r = run(['--path', brokenFixture]);
    assert.notStrictEqual(r.status, 0, 'allowlist外の fixture 風パスは検証されること');
  });

  it('TC-018: --check-excluded単独起動 → exit 0で除外リストを表示', () => {
    const r = run(['--check-excluded']);
    assert.strictEqual(r.status, 0, '--check-excludedはexit 0であること');
    assert.ok(r.stdout.includes('complete-skill/EVALS.json'), 'allowlist が出力されること');
  });

  it('TC-019: 通常スキルは除外されず検証される → exit 0（正常JSON）', () => {
    const r = run(['--skill', 'skill-creator']);
    assert.strictEqual(r.status, 0, '通常スキルは検証されてexit 0であること');
  });
});

describe('run-all-validations.js 統合テスト', () => {
  it('TC-020: run-all-validations.jsのソースにvalidate-evalsの参照がある', () => {
    const source = readFileSync(RUN_ALL_SCRIPT, 'utf-8');
    assert.ok(
      source.includes('validate-evals'),
      'run-all-validations.jsにvalidate-evalsの呼び出しが含まれること'
    );
  });

  it('TC-021: skill-fixture-runnerスキルディレクトリでrun-all-validations.jsを実行 → exit 0', () => {
    const skillDir = join(__dirname, '..', '..');
    const r = spawnSync('node', [RUN_ALL_SCRIPT, '--target', skillDir], {
      encoding: 'utf-8',
      cwd: REPO_ROOT,
    });
    assert.strictEqual(r.status, 0, '全スキル正常時はexit 0であること');
  });

  it('TC-022: L3ドリフト時はrun-all-validations.jsがexit 非ゼロ', () => {
    const mirrorPath = join(REPO_ROOT, '.agents', 'skills', 'skill-fixture-runner', 'EVALS.json');
    withTemporaryFileMutation(mirrorPath, JSON.stringify({ drifted: true }, null, 2), () => {
      const skillDir = join(__dirname, '..', '..');
      const r = spawnSync('node', [RUN_ALL_SCRIPT, '--target', skillDir], {
        encoding: 'utf-8',
        cwd: REPO_ROOT,
      });
      assert.notStrictEqual(r.status, 0, 'drift時はrun-all-validationsも非ゼロであること');
    });
  });
});

describe('正常系追加確認', () => {
  it('TC-014: 6スキル全件で--all-skills --check-dual-root → exit 0', () => {
    const r = run(['--all-skills', '--check-dual-root']);
    assert.strictEqual(r.status, 0, '6スキル全件dual root一致はexit 0であること');
  });
});

describe('エッジケース（Phase 6拡充）', () => {
  it('TC-E-009: 空オブジェクト{} → L2エラー（必須キー全欠落）', () => {
    const r = run(['--path', join(TMP_DIR, 'empty-object.json')]);
    assert.notStrictEqual(r.status, 0, '空オブジェクトはexitコード非ゼロであること');
  });

  it('TC-E-012: allowlist外のスキル名 → exit 非ゼロ', () => {
    const r = run(['--skill', 'unknown-skill-xyz']);
    assert.notStrictEqual(r.status, 0, '不明スキルはexitコード非ゼロであること');
  });

  it('TC-E-013: --strict は両方言のペアを要求する', () => {
    const r = run(['--path', join(TMP_DIR, 'strict-missing-snake.json'), '--strict']);
    assert.notStrictEqual(r.status, 0, 'strict モードでは片方のみ存在は非ゼロであること');
  });

  it('TC-E-014: --all-skillsで6スキル全件正常 → exit 0', () => {
    const r = run(['--all-skills']);
    assert.strictEqual(r.status, 0, '6スキル全件正常はexit 0であること');
  });

  it('TC-E-015: --skill フラグで特定スキルのみ検証', () => {
    const r = run(['--skill', 'github-issue-manager']);
    assert.strictEqual(r.status, 0, '特定スキル指定はexit 0であること');
  });

  it('TC-E-016: --json フラグで JSON 形式出力', () => {
    const r = run(['--skill', 'skill-creator', '--json']);
    assert.strictEqual(r.status, 0, '--jsonはexit 0であること');
    let parsed;
    assert.doesNotThrow(() => { parsed = JSON.parse(r.stdout); }, 'JSON出力がパース可能であること');
    assert.ok(parsed.summary, 'summaryキーが存在すること');
  });
});
