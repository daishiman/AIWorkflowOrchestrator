# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 5                               |
| 機能名    | imp-layer12-check-id-script-006 |
| 作成日    | 2026-04-04                      |
| 前提Phase | Phase 4                         |
| 後続Phase | Phase 6                         |

## 目的

Phase 2 の設計に基づき、check ID 突き合わせスクリプトを実装し、Phase 4 の全ユニットテストが PASS になること（TDD Green）を確認する。

## 実行タスク

### タスク1: スクリプト本体の実装

**目的**: `verify-check-id-parity.js` を実装する

**手順**:

1. Phase 2 設計書のアーキテクチャに従って実装する

**実装スケルトン**:

```javascript
#!/usr/bin/env node
/**
 * verify-check-id-parity.js
 *
 * SkillCreatorVerificationEngine の check ID と
 * interfaces-skill-verify-contract.md の定義を突き合わせる。
 *
 * 使用方法:
 *   node scripts/verify-check-id-parity.js [options]
 *
 * オプション:
 *   --impl <path>   実装ファイルのパス（デフォルト: apps/desktop/.../SkillCreatorVerificationEngine.ts）
 *   --spec <path>   仕様書ファイルのパス（デフォルト: .claude/skills/.../interfaces-skill-verify-contract.md）
 *   --help          このヘルプを表示
 *
 * 終了コード:
 *   0: PASS（差分なし）
 *   1: FAIL（差分あり）
 *   2: エラー（ファイルが見つからない等）
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_IMPL_PATH =
  "apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts";
const DEFAULT_SPEC_PATH =
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md";

/**
 * 実装ファイルから check ID を抽出する
 * @param {string} content - ファイル内容
 * @returns {string[]} ソート済み一意の check ID リスト
 */
function extractCheckIdsFromImpl(content) {
  // 実装ファイル内の check ID パターン（文字列リテラル）
  const pattern = /['"`](L[1-4]-\d{3})['"`]/g;
  const ids = new Set();
  let match;
  while ((match = pattern.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return Array.from(ids).sort();
}

/**
 * 仕様書のテーブル行から check ID を抽出する（例示値は除外）
 * @param {string} content - ファイル内容
 * @returns {string[]} ソート済み一意の check ID リスト
 */
function extractCheckIdsFromSpec(content) {
  // テーブル行（行頭 | の後にスペースと check ID が続くパターン）のみマッチ
  // 例示値（「例: L2-008」等）はマッチしない
  const pattern = /^\|\s+(L[1-4]-\d{3})\s+\|/gm;
  const ids = new Set();
  let match;
  while ((match = pattern.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return Array.from(ids).sort();
}

/**
 * 実装と仕様書の check ID を突き合わせる
 * @param {string[]} implIds - 実装の check ID リスト
 * @param {string[]} specIds - 仕様書の check ID リスト
 * @returns {{ passed: boolean, onlyInImpl: string[], onlyInSpec: string[] }}
 */
function compareCheckIds(implIds, specIds) {
  const implSet = new Set(implIds);
  const specSet = new Set(specIds);
  const onlyInImpl = implIds.filter((id) => !specSet.has(id));
  const onlyInSpec = specIds.filter((id) => !implSet.has(id));
  return {
    passed: onlyInImpl.length === 0 && onlyInSpec.length === 0,
    onlyInImpl,
    onlyInSpec,
  };
}

function main() {
  // CLI 引数パース・ファイル読み込み・突き合わせ・出力
}

if (require.main === module) {
  main();
}

module.exports = {
  extractCheckIdsFromImpl,
  extractCheckIdsFromSpec,
  compareCheckIds,
};
```

2. `extractCheckIdsFromImpl` の実装:
   - TypeScript の文字列リテラル（`'L1-001'`, `"L1-001"`, `` `L1-001` ``）をすべて対象とする
   - 重複除去・ソートを行う

3. `extractCheckIdsFromSpec` の実装:
   - テーブル行スコープの正規表現 `/^\|\s+(L[1-4]-\d{3})\s+\|/gm` を使用する
   - 重複除去・ソートを行う

4. `main()` 関数の実装:
   - CLI 引数（`--impl`, `--spec`, `--help`）をパースする
   - ファイルを読み込む（存在しない場合は終了コード 2 で終了）
   - 突き合わせを実行し、結果を出力する
   - 終了コード（0/1/2）を設定する

### タスク2: Phase 4 ユニットテストの実行（TDD Green 確認）

**手順**:

1. 実装後にユニットテストを実行する:

```bash
pnpm vitest run scripts/__tests__/verify-check-id-parity.test.js
```

2. 全テストが PASS であることを確認する
3. FAIL がある場合はタスク1の実装を修正する

### タスク3: 実際のファイルでの動作確認

**手順**:

1. デフォルトパスで実際のファイルを対象にスクリプトを実行する:

```bash
node scripts/verify-check-id-parity.js
```

2. 以下を確認する:
   - 終了コード 0（PASS）が返る
   - 出力に「19 IDs」が表示される
   - 例示値 `L2-008` が「In spec but not in impl」に現れない

### 新規作成/修正ファイルパス一覧

| 操作 | ファイルパス                                                      | 説明                     |
| ---- | ----------------------------------------------------------------- | ------------------------ |
| 作成 | `scripts/verify-check-id-parity.js`（または設計書で決定したパス） | 突き合わせスクリプト本体 |
| 作成 | `outputs/phase-5/implementation-summary.md`                       | 実装サマリー             |

## 参照資料

| 資料名         | パス                                     |
| -------------- | ---------------------------------------- |
| Phase 2 設計書 | `outputs/phase-2/design.md`              |
| Phase 4 テスト | （設計書で決定したテストファイルパス）   |
| Phase 1 要件   | `outputs/phase-1/script-requirements.md` |

## 成果物

| 成果物         | パス                                                              |
| -------------- | ----------------------------------------------------------------- |
| スクリプト本体 | `scripts/verify-check-id-parity.js`（または設計書で決定したパス） |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`                       |

## 完了条件

- [ ] `extractCheckIdsFromImpl` が実装されている
- [ ] `extractCheckIdsFromSpec` が実装されている（テーブル行スコープの正規表現使用）
- [ ] `compareCheckIds` が実装されている
- [ ] `main()` 関数が実装されている（CLI 引数・終了コード対応）
- [ ] Phase 4 の全ユニットテストが PASS になっている（TDD Green）
- [ ] 実際のファイルで `node scripts/verify-check-id-parity.js` が終了コード 0 で PASS する
- [ ] 例示値 `L2-008` が誤検知されないことを確認した
- [ ] 新規作成/修正ファイルパス一覧が記載されている
- [ ] 実装サマリーが `outputs/phase-5/implementation-summary.md` に記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 6: テスト拡充
