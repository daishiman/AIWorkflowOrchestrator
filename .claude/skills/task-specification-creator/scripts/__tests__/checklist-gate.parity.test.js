/**
 * checklist-gate.parity.test.js
 *
 * TC-E-08〜TC-E-10: phase-12-completion-checklist.md の parity 関連チェック
 * Node.js 組み込みテストランナー（node:test）を使用
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHECKLIST_PATH = join(__dirname, '../../references/phase-12-completion-checklist.md');

// チェックリストファイルを読み込む
let checklistContent = '';
try {
  checklistContent = readFileSync(CHECKLIST_PATH, 'utf-8');
} catch (err) {
  // ファイルが読み込めない場合はテストで失敗
}

// TC-E-08: phase-12-completion-checklist.md に validate-closeout-parity.js --workflow が含まれる
test('TC-E-08: phase-12-completion-checklist.md に validate-closeout-parity.js --workflow が含まれる', () => {
  assert.ok(
    checklistContent.length > 0,
    `phase-12-completion-checklist.md が読み込めること。パス: ${CHECKLIST_PATH}`
  );
  assert.ok(
    checklistContent.includes('validate-closeout-parity.js') &&
    checklistContent.includes('--workflow'),
    'checklist に validate-closeout-parity.js --workflow の実行コマンドが含まれること'
  );
});

// TC-E-09: 同ファイルに PARITY_OK が含まれる
test('TC-E-09: phase-12-completion-checklist.md に PARITY_OK が含まれる', () => {
  assert.ok(
    checklistContent.includes('PARITY_OK'),
    'checklist に PARITY_OK が含まれること'
  );
});

// TC-E-10: 同ファイルに bypass不許可の文言が含まれる（PARITY_DRIFTでPhase 12 PASSにしない）
test('TC-E-10: phase-12-completion-checklist.md に PARITY_DRIFT bypass不許可の文言が含まれる', () => {
  // "PARITY_DRIFT が検出された状態で Phase 12 PASS にしない" または同等の文言が含まれること
  const hasBypassProhibition =
    (checklistContent.includes('PARITY_DRIFT') &&
     (checklistContent.includes('Phase 12 PASS にしない') ||
      checklistContent.includes('Phase 12 PASSにしない') ||
      checklistContent.includes('bypass') ||
      checklistContent.includes('禁止')));

  assert.ok(
    hasBypassProhibition,
    'checklist に PARITY_DRIFT 状態での Phase 12 PASS 禁止の文言が含まれること'
  );
});
