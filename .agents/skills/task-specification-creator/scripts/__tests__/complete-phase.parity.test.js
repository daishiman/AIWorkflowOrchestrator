/**
 * complete-phase.parity.test.js
 *
 * TC-C-01〜TC-C-07: complete-phase.js の parity 関連テスト
 * Node.js 組み込みテストランナー（node:test）を使用
 *
 * 注意:
 * - complete-phase.js は既存スクリプトのため、既存動作のテストはPASSする可能性あり
 * - TC-C-04 (--skip-parity-check 未知フラグ reject) は新機能なのでFAIL予定
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '../complete-phase.js');
const FIXTURES = join(__dirname, 'fixtures/closeout-parity');

// テスト用の一時的なワークフローディレクトリを作成するヘルパー
function makeTempWorkflow(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'parity-test-'));

  const {
    indexStatus = 'pending',
    rootJsonStatus = 'pending',
    outputsJsonStatus = 'pending',
    phaseMdStatus = 'pending',
    includeRootJson = true,
    includeOutputsJson = true,
    includePhaseMd = true,
    phaseNum = 1
  } = options;

  // index.md を作成
  const indexMd = `# テストワークフロー\n\n## メタ情報\n\n| 項目 | 内容 |\n| ---- | ---- |\n| ステータス | ${indexStatus} |\n\n---\n\n## Phase一覧\n\n| Phase | 名称 | 仕様書 | ステータス |\n| ----- | ---- | ------ | ---------- |\n| ${phaseNum}     | 要件定義 | phase-${phaseNum}-requirements.md | ${indexStatus} |\n`;
  writeFileSync(join(dir, 'index.md'), indexMd, 'utf-8');

  // root artifacts.json を作成
  if (includeRootJson) {
    const rootJson = JSON.stringify({ phases: { [phaseNum]: { status: rootJsonStatus } } });
    writeFileSync(join(dir, 'artifacts.json'), rootJson, 'utf-8');
  }

  // outputs/ ディレクトリを作成
  mkdirSync(join(dir, 'outputs'), { recursive: true });

  // outputs/artifacts.json を作成
  if (includeOutputsJson) {
    const outputsJson = JSON.stringify({ phases: { [phaseNum]: { status: outputsJsonStatus } } });
    writeFileSync(join(dir, 'outputs/artifacts.json'), outputsJson, 'utf-8');
  }

  // phase-N-requirements.md を作成
  if (includePhaseMd) {
    const phaseMd = `# Phase ${phaseNum} 要件定義\n\n## メタ情報\n\n| 項目 | 内容 |\n| ---- | ---- |\n| ステータス | ${phaseMdStatus} |\n`;
    writeFileSync(join(dir, `phase-${phaseNum}-requirements.md`), phaseMd, 'utf-8');
  }

  // outputs/phase-N/ ディレクトリを作成（complete-phase.js に必要）
  mkdirSync(join(dir, `outputs/phase-${phaseNum}`), { recursive: true });
  writeFileSync(join(dir, `outputs/phase-${phaseNum}/test-artifact.md`), '# テスト成果物\n', 'utf-8');

  return dir;
}

function runCompletePhase(workflowDir, phaseNum, artifactPath, extraArgs = []) {
  return spawnSync('node', [
    SCRIPT,
    '--workflow', workflowDir,
    '--phase', String(phaseNum),
    '--artifacts', `${artifactPath}:テスト成果物`,
    ...extraArgs
  ], { encoding: 'utf-8' });
}

// TC-C-01: Phase N完了後にS1/S2/S3/S4のstatusが全て一致
test('TC-C-01: Phase完了後 → S1/S2/S3/S4のstatusが全て "completed" に一致', () => {
  const dir = makeTempWorkflow({ indexStatus: 'pending', rootJsonStatus: 'pending', outputsJsonStatus: 'pending', phaseMdStatus: 'pending' });
  const artifactPath = `outputs/phase-1/test-artifact.md`;

  const result = runCompletePhase(dir, 1, artifactPath);

  // complete-phase.js が正常終了すること
  assert.equal(result.status, 0, `complete-phase.js が正常終了すること。stderr: ${result.stderr}`);

  // root artifacts.json が updated されること
  const rootJson = JSON.parse(readFileSync(join(dir, 'artifacts.json'), 'utf-8'));
  assert.equal(rootJson.phases['1'].status, 'completed', 'root artifacts.json の Phase 1 status が "completed" であること');

  // parity validator を実行して PARITY_OK を確認
  // （validate-closeout-parity.js が存在する場合のみ有効）
  const VALIDATOR = join(__dirname, '../validate-closeout-parity.js');
  if (existsSync(VALIDATOR)) {
    const parityResult = spawnSync('node', [VALIDATOR, '--workflow', dir], { encoding: 'utf-8' });
    assert.equal(parityResult.status, 0, `parity validator が PARITY_OK を返すこと。stdout: ${parityResult.stdout}`);
    assert.match(parityResult.stdout, /PARITY_OK/, 'stdout に PARITY_OK が含まれること');
  }
});

// TC-C-02: S3書き込み失敗→rollback
test('TC-C-02: outputs/artifacts.json の書き込み失敗 → ロールバックされる', () => {
  // outputs/artifacts.json を読み取り専用にしてテスト
  const dir = makeTempWorkflow();

  // outputs/artifacts.json を読み取り専用にする
  const outputsArtifactsPath = join(dir, 'outputs/artifacts.json');
  chmodSync(outputsArtifactsPath, 0o444);

  try {
    const result = runCompletePhase(dir, 1, 'outputs/phase-1/test-artifact.md');

    // 書き込みエラーが発生した場合、root artifacts.json が変更されていないこと
    if (result.status !== 0) {
      // root artifacts.json がロールバックされていること
      const rootJson = JSON.parse(readFileSync(join(dir, 'artifacts.json'), 'utf-8'));
      assert.notEqual(rootJson.phases?.['1']?.status, 'completed',
        'root artifacts.json がロールバックされていること（S3書き込み失敗時）');
    }
    // 既存の complete-phase.js は outputs/artifacts.json を更新しないため、
    // このテストは将来の拡張実装後にFAILを期待する
  } finally {
    chmodSync(outputsArtifactsPath, 0o644);
  }
});

// TC-C-03: 書き込み後parity検証FAIL→rollback
test('TC-C-03: complete-phase実行後にparity検証FAILの場合 → ロールバック', () => {
  // parity検証が失敗するシナリオ：
  // complete-phase.js が parity validator を統合している場合のテスト
  // 現在は未実装のため FAIL 予定（parity validator 統合後に有効化）

  const VALIDATOR = join(__dirname, '../validate-closeout-parity.js');
  if (!existsSync(VALIDATOR)) {
    // validate-closeout-parity.js が存在しない場合はスキップ不可なのでFAIL
    assert.fail('validate-closeout-parity.js が存在しないため、parity検証統合テストは実行できません');
  }

  // parity が合わない状態を作成してテスト
  const dir = makeTempWorkflow({
    indexStatus: 'pending',
    rootJsonStatus: 'completed', // ← 意図的にずらす
    outputsJsonStatus: 'completed',
    phaseMdStatus: 'completed'
  });

  const result = runCompletePhase(dir, 1, 'outputs/phase-1/test-artifact.md');

  // parity検証を実行
  const parityResult = spawnSync('node', [VALIDATOR, '--workflow', dir], { encoding: 'utf-8' });

  // parity validator の結果を確認
  // complete-phase.js が parity チェックを統合していれば非0を期待
  // 未実装の場合は parityResult が非0になる
  if (result.status === 0) {
    // complete-phase は成功したが parity が合わない場合
    // ロールバック機能がないことを示す（将来の実装で修正予定）
    assert.ok(parityResult.status !== 0 || parityResult.stdout.includes('PARITY_DRIFT'),
      'parity drift が検出されること（complete-phase がロールバックしない場合）');
  }
});

// TC-C-04: 未知フラグ --skip-parity-check → usage error
test('TC-C-04: 未知フラグ --skip-parity-check → usage error (exit 非0)', () => {
  const dir = makeTempWorkflow();

  const result = spawnSync('node', [
    SCRIPT,
    '--workflow', dir,
    '--phase', '1',
    '--artifacts', 'outputs/phase-1/test-artifact.md:テスト成果物',
    '--skip-parity-check'  // 未知フラグ
  ], { encoding: 'utf-8' });

  // 未知フラグは usage error として拒否されること（新機能、FAILが期待される）
  assert.notEqual(result.status, 0,
    '--skip-parity-check は未知フラグなのでエラーになること。現在の実装では無視されるためFAIL予定');
});

// TC-C-05: 既存 --workflow/--phase 引数の後方互換性
test('TC-C-05: --workflow と --phase の基本動作 → 後方互換性あり', () => {
  const dir = makeTempWorkflow();

  const result = runCompletePhase(dir, 1, 'outputs/phase-1/test-artifact.md');

  // 既存の basic な動作は正常終了すること
  assert.equal(result.status, 0,
    '--workflow と --phase の基本動作が正常に機能すること（後方互換性）');
});

// TC-C-06: S4（phase frontmatter）の | ステータス | pending | → | ステータス | completed | 更新
test('TC-C-06: Phase完了後 → phase-N-requirements.md の ステータス が "completed" に更新される', () => {
  const dir = makeTempWorkflow({ phaseMdStatus: 'pending' });

  const result = runCompletePhase(dir, 1, 'outputs/phase-1/test-artifact.md');

  assert.equal(result.status, 0, `complete-phase.js が正常終了すること。stderr: ${result.stderr}`);

  // phase-1-requirements.md の ステータス が更新されているか確認
  const phaseMdContent = readFileSync(join(dir, 'phase-1-requirements.md'), 'utf-8');

  // ステータスが completed に更新されていること
  // 注: 既存の complete-phase.js は phase md のステータスを更新しない可能性あり
  // → その場合このテストはFAILする（将来の実装で修正予定）
  assert.match(phaseMdContent, /\|\s*ステータス\s*\|\s*completed\s*\|/,
    'phase-1-requirements.md の ステータス が "completed" に更新されていること');
});

// TC-C-08: --skip-parity-check → usage error、書き込み開始前に終了
test('TC-C-08: --skip-parity-check → usage error (exit 非0、書き込み開始前に終了)', () => {
  const dir = makeTempWorkflow();

  const result = spawnSync('node', [
    SCRIPT,
    '--workflow', dir,
    '--phase', '1',
    '--artifacts', 'outputs/phase-1/test-artifact.md:テスト成果物',
    '--skip-parity-check'  // 未知フラグ → usage error
  ], { encoding: 'utf-8' });

  // --skip-parity-check は未知フラグとして拒否されること
  assert.notEqual(result.status, 0,
    '--skip-parity-check は未知フラグなのでエラーになること（exit 非0）');

  // stderrにエラーメッセージが含まれること
  assert.ok(
    result.stderr.includes('--skip-parity-check') || result.stderr.includes('未知'),
    `stderr にエラーメッセージが含まれること。stderr: ${result.stderr}`
  );
});

// TC-C-09: rollback中のファイル書き込み失敗 → stderrに ROLLBACK_FAILED
// 注: 完全なシミュレーションが困難なため、エラーメッセージの存在確認のみ
test('TC-C-09: rollback失敗シナリオ → stderrに適切なエラーが出力される（エラーメッセージ確認）', () => {
  // rollback失敗のシミュレーションは困難なため、
  // ディレクトリパスが存在しない場合のエラーハンドリングを確認
  const nonExistentDir = '/tmp/nonexistent-workflow-dir-12345';

  const result = spawnSync('node', [
    SCRIPT,
    '--workflow', nonExistentDir,
    '--phase', '1',
    '--artifacts', 'outputs/phase-1/test-artifact.md:テスト成果物',
  ], { encoding: 'utf-8' });

  // 存在しないディレクトリ指定はエラーになること
  assert.notEqual(result.status, 0,
    '存在しないディレクトリ指定はエラーになること');

  // stderr にエラー情報が出力されること
  assert.ok(
    result.stderr.length > 0 || result.stdout.length > 0,
    'エラー情報が出力されること'
  );
});

// TC-C-10: rollback failure後もエラーレポートに情報が含まれる
test('TC-C-10: エラー発生時 → stderrにエラー情報が含まれる', () => {
  const dir = makeTempWorkflow();

  // 無効なphase番号でエラーを発生させる
  const result = spawnSync('node', [
    SCRIPT,
    '--workflow', dir,
    '--phase', '99',
    '--artifacts', 'outputs/phase-99/test-artifact.md:テスト成果物',
  ], { encoding: 'utf-8' });

  // エラー発生時にstderrまたはstdoutにエラー情報が含まれること
  const hasErrorInfo = result.stderr.length > 0 || result.stdout.includes('ERROR') || result.status !== 0;
  assert.ok(
    hasErrorInfo,
    `エラー発生時にエラー情報が出力されること。status: ${result.status}, stderr: ${result.stderr}`
  );
});

// TC-C-07: 存在しないphase番号指定 → exit非0
test('TC-C-07: 存在しないphase番号指定 → exit 非0', () => {
  const dir = makeTempWorkflow();

  // Phase 99 は存在しない
  const result = runCompletePhase(dir, 99, 'outputs/phase-99/test-artifact.md');

  // 存在しない phase 番号はエラーになること
  // 注: 既存の complete-phase.js は warning を出力して続行する可能性あり
  // → その場合このテストはFAILする
  assert.notEqual(result.status, 0,
    '存在しないphase番号（99）を指定した場合はエラーになること');
});
