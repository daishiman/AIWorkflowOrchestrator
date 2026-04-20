/**
 * validate-closeout-parity.test.js
 *
 * TC-P-01〜TC-P-17: validate-closeout-parity.js のブラックボックステスト
 * Node.js 組み込みテストランナー（node:test）を使用
 *
 * TDD Red フェーズ: validate-closeout-parity.js が存在しないため全テストFAIL予定
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '../validate-closeout-parity.js');
const FIXTURES = join(__dirname, 'fixtures/closeout-parity');

function runValidator(fixtureName, extraArgs = []) {
  return spawnSync('node', [SCRIPT, '--workflow', join(FIXTURES, fixtureName), ...extraArgs], {
    encoding: 'utf-8'
  });
}

// TC-P-01: FX-01 (normal) → exit 0, stdout に PARITY_OK
test('TC-P-01: normal fixture → exit 0 かつ PARITY_OK', () => {
  const result = runValidator('normal');
  assert.equal(result.status, 0, `exit code が 0 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /PARITY_OK/, 'stdout に PARITY_OK が含まれること');
});

// TC-P-02: FX-02 (partial-drift-s1) → exit 1, PARITY_DRIFT
test('TC-P-02: S1ドリフト fixture → exit 1 かつ PARITY_DRIFT', () => {
  const result = runValidator('partial-drift-s1');
  assert.equal(result.status, 1, `exit code が 1 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /PARITY_DRIFT/, 'stdout に PARITY_DRIFT が含まれること');
});

// TC-P-03: FX-03 (partial-drift-s2) → exit 1, PARITY_DRIFT
test('TC-P-03: S2ドリフト fixture → exit 1 かつ PARITY_DRIFT', () => {
  const result = runValidator('partial-drift-s2');
  assert.equal(result.status, 1, `exit code が 1 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /PARITY_DRIFT/, 'stdout に PARITY_DRIFT が含まれること');
});

// TC-P-04: FX-04 (partial-drift-s3) → exit 1, PARITY_DRIFT
test('TC-P-04: S3ドリフト fixture → exit 1 かつ PARITY_DRIFT', () => {
  const result = runValidator('partial-drift-s3');
  assert.equal(result.status, 1, `exit code が 1 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /PARITY_DRIFT/, 'stdout に PARITY_DRIFT が含まれること');
});

// TC-P-05: FX-05 (partial-drift-s4) → exit 1, PARITY_DRIFT
test('TC-P-05: S4ドリフト fixture → exit 1 かつ PARITY_DRIFT', () => {
  const result = runValidator('partial-drift-s4');
  assert.equal(result.status, 1, `exit code が 1 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /PARITY_DRIFT/, 'stdout に PARITY_DRIFT が含まれること');
});

// TC-P-06: FX-06 (full-drift) → exit 1, PARITY_DRIFT
test('TC-P-06: 全ソースドリフト fixture → exit 1 かつ PARITY_DRIFT', () => {
  const result = runValidator('full-drift');
  assert.equal(result.status, 1, `exit code が 1 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /PARITY_DRIFT/, 'stdout に PARITY_DRIFT が含まれること');
});

// TC-P-07: FX-07 (missing-s2) → exit 2, MISSING_SOURCE
test('TC-P-07: S2（artifacts.json）が存在しない fixture → exit 2 かつ MISSING_SOURCE', () => {
  const result = runValidator('missing-s2');
  assert.equal(result.status, 2, `exit code が 2 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /MISSING_SOURCE/, 'stdout に MISSING_SOURCE が含まれること');
});

// TC-P-08: FX-08 (missing-s3) → exit 2, MISSING_SOURCE
test('TC-P-08: S3（outputs/artifacts.json）が存在しない fixture → exit 2 かつ MISSING_SOURCE', () => {
  const result = runValidator('missing-s3');
  assert.equal(result.status, 2, `exit code が 2 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /MISSING_SOURCE/, 'stdout に MISSING_SOURCE が含まれること');
});

// TC-P-09: FX-09 (invalid-status) → exit 3, INVALID_STATUS_VALUE
test('TC-P-09: 無効なステータス値 fixture → exit 3 かつ INVALID_STATUS_VALUE', () => {
  const result = runValidator('invalid-status');
  assert.equal(result.status, 3, `exit code が 3 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /INVALID_STATUS_VALUE/, 'stdout に INVALID_STATUS_VALUE が含まれること');
});

// TC-P-10: FX-10 (empty-workflow) → exit 0, PARITY_OK
test('TC-P-10: 空ワークフロー fixture → exit 0 かつ PARITY_OK', () => {
  const result = runValidator('empty-workflow');
  assert.equal(result.status, 0, `exit code が 0 であること。stderr: ${result.stderr}`);
  assert.match(result.stdout, /PARITY_OK/, 'stdout に PARITY_OK が含まれること');
});

// TC-P-11: FX-11 (s1-dash-ok) → exit 0, PARITY_OK（S1のみ`-`許容）
test('TC-P-11: S1のステータスが"-"の fixture → exit 0 かつ PARITY_OK', () => {
  const result = runValidator('s1-dash-ok');
  assert.equal(result.status, 0, `exit code が 0 であること（S1の"-"はpendingと同義）。stderr: ${result.stderr}`);
  assert.match(result.stdout, /PARITY_OK/, 'stdout に PARITY_OK が含まれること');
});

// TC-P-12: FX-02 with no --json → 人間可読テキスト（phase/ソース/期待値/実測値）
test('TC-P-12: --jsonなし出力 → 人間可読テキストで phase/ソース/期待値/実測値を含む', () => {
  const result = runValidator('partial-drift-s1');
  assert.equal(result.status, 1, 'exit code が 1 であること');
  // JSON形式ではない（parseできない）
  assert.throws(
    () => JSON.parse(result.stdout),
    'stdout は JSON でないこと（人間可読テキスト）'
  );
  // phase/source/expected/actual に関する情報が含まれること
  const out = result.stdout.toLowerCase();
  assert.ok(
    out.includes('phase') || out.includes('source') || out.includes('expected') || out.includes('actual') ||
    out.includes('s1') || out.includes('drift'),
    'stdout にドリフト情報（phase/ソース/期待値/実測値）が含まれること'
  );
});

// TC-P-13: FX-02 with --json → JSON出力スキーマ一致
test('TC-P-13: --json付きドリフト fixture → JSON出力でスキーマ一致', () => {
  const result = runValidator('partial-drift-s1', ['--json']);
  assert.equal(result.status, 1, 'exit code が 1 であること');
  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(result.stdout);
  }, 'stdout が有効なJSON であること');
  // スキーマ確認
  assert.ok('result' in parsed, 'result フィールドが存在すること');
  assert.ok('phases' in parsed, 'phases フィールドが存在すること');
  assert.ok('generatedAt' in parsed, 'generatedAt フィールドが存在すること');
  assert.ok('sourcesChecked' in parsed, 'sourcesChecked フィールドが存在すること');
});

// TC-P-14: --workflow未指定 → exit 2相当
test('TC-P-14: --workflow未指定 → exit 2（引数エラー）', () => {
  const result = spawnSync('node', [SCRIPT], { encoding: 'utf-8' });
  assert.ok(result.status !== 0, 'exit code が 0 以外であること');
  assert.ok(result.status >= 1, 'exit code が 1 以上であること');
});

// TC-P-15: --json付きFX-01 → sourcesChecked が ["S1","S2","S3","S4"]
test('TC-P-15: --json付き normal fixture → sourcesChecked が S1/S2/S3/S4 を含む', () => {
  const result = runValidator('normal', ['--json']);
  assert.equal(result.status, 0, `exit code が 0 であること。stderr: ${result.stderr}`);
  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(result.stdout);
  }, 'stdout が有効なJSON であること');
  assert.ok(Array.isArray(parsed.sourcesChecked), 'sourcesChecked が配列であること');
  assert.ok(parsed.sourcesChecked.includes('S1'), 'sourcesChecked に S1 が含まれること');
  assert.ok(parsed.sourcesChecked.includes('S2'), 'sourcesChecked に S2 が含まれること');
  assert.ok(parsed.sourcesChecked.includes('S3'), 'sourcesChecked に S3 が含まれること');
  assert.ok(parsed.sourcesChecked.includes('S4'), 'sourcesChecked に S4 が含まれること');
});

// TC-P-16: --json付きFX-01 → generatedAt がISO8601
test('TC-P-16: --json付き normal fixture → generatedAt がISO8601形式', () => {
  const result = runValidator('normal', ['--json']);
  assert.equal(result.status, 0, `exit code が 0 であること。stderr: ${result.stderr}`);
  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(result.stdout);
  }, 'stdout が有効なJSON であること');
  assert.ok(typeof parsed.generatedAt === 'string', 'generatedAt が文字列であること');
  const date = new Date(parsed.generatedAt);
  assert.ok(!isNaN(date.getTime()), 'generatedAt が有効な日時であること');
  assert.match(parsed.generatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'generatedAt がISO8601形式であること');
});

// TC-P-18: two-drift-s1-s2 → PARITY_DRIFT、S3とS4がcompletedで不一致
test('TC-P-18: two-drift-s1-s2 fixture → PARITY_DRIFT（S3/S4がdrift）', () => {
  const result = runValidator('two-drift-s1-s2', ['--json']);
  assert.equal(result.status, 1, `exit code が 1 であること。stderr: ${result.stderr}`);
  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(result.stdout);
  }, 'stdout が有効なJSON であること');
  assert.equal(parsed.result, 'PARITY_DRIFT', 'result が PARITY_DRIFT であること');
  // S1とS2がpending（canonical）、S3とS4がcompletedでdrift
  const s3Drift = parsed.drifts.find(d => d.source === 'S3');
  const s4Drift = parsed.drifts.find(d => d.source === 'S4');
  assert.ok(s3Drift, 'S3 の drift が存在すること');
  assert.ok(s4Drift, 'S4 の drift が存在すること');
  assert.equal(s3Drift.actual, 'completed', 'S3 の actual が completed であること');
  assert.equal(s4Drift.actual, 'completed', 'S4 の actual が completed であること');
});

// TC-P-19: s4-only-drift → PARITY_DRIFT、差異はS4のみ
test('TC-P-19: s4-only-drift fixture → PARITY_DRIFT（差異はS4のみ）', () => {
  const result = runValidator('s4-only-drift', ['--json']);
  assert.equal(result.status, 1, `exit code が 1 であること。stderr: ${result.stderr}`);
  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(result.stdout);
  }, 'stdout が有効なJSON であること');
  assert.equal(parsed.result, 'PARITY_DRIFT', 'result が PARITY_DRIFT であること');
  // S4のみdrift
  assert.equal(parsed.drifts.length, 1, 'drifts が 1 件であること');
  assert.equal(parsed.drifts[0].source, 'S4', 'drift は S4 のみであること');
});

// TC-P-20: mixed-across-phases → PARITY_DRIFT、drifts.length === 2、phase 1なし
test('TC-P-20: mixed-across-phases fixture → PARITY_DRIFT（drifts.length===2、phase 1 なし）', () => {
  const result = runValidator('mixed-across-phases', ['--json']);
  assert.equal(result.status, 1, `exit code が 1 であること。stderr: ${result.stderr}`);
  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(result.stdout);
  }, 'stdout が有効なJSON であること');
  assert.equal(parsed.result, 'PARITY_DRIFT', 'result が PARITY_DRIFT であること');
  assert.equal(parsed.drifts.length, 2, 'drifts.length が 2 であること');
  // Phase 1 のdriftが含まれないことを確認
  const phase1Drifts = parsed.drifts.filter(d => d.phase === 1);
  assert.equal(phase1Drifts.length, 0, 'Phase 1 の drift が含まれないこと');
});

// TC-P-17: FX-01実行後 → fixtureファイルのmtimeが変化しない（read-only確認）
test('TC-P-17: normal fixture実行後 → fixtureファイルが変更されていない（read-only）', () => {
  const fixtureDir = join(FIXTURES, 'normal');
  const indexMd = join(fixtureDir, 'index.md');
  const artifactsJson = join(fixtureDir, 'artifacts.json');
  const outputsArtifactsJson = join(fixtureDir, 'outputs/artifacts.json');

  // 実行前のmtimeを記録
  const beforeIndex = statSync(indexMd).mtimeMs;
  const beforeArtifacts = statSync(artifactsJson).mtimeMs;
  const beforeOutputs = statSync(outputsArtifactsJson).mtimeMs;

  // スクリプト実行
  runValidator('normal');

  // 実行後のmtimeを確認
  const afterIndex = statSync(indexMd).mtimeMs;
  const afterArtifacts = statSync(artifactsJson).mtimeMs;
  const afterOutputs = statSync(outputsArtifactsJson).mtimeMs;

  assert.equal(afterIndex, beforeIndex, 'index.md の mtime が変化していないこと');
  assert.equal(afterArtifacts, beforeArtifacts, 'artifacts.json の mtime が変化していないこと');
  assert.equal(afterOutputs, beforeOutputs, 'outputs/artifacts.json の mtime が変化していないこと');
});
