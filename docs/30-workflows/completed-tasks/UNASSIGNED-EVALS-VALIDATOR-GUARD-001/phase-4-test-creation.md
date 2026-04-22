# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 4                                                |
| 機能名     | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名   | skill-fixture-runner EVALS.json スキーマ検証追加 |
| 前提Phase  | Phase 3 PASS または MINOR                        |
| 後続Phase  | Phase 5                                          |
| 入力       | `outputs/phase-2/` の設計成果物                  |
| 作成日     | 2026-04-21                                       |
| ステータス | pending                                          |

## 目的

TDD Red フェーズとして、`validate-evals.js` のテストスイートを実装より先に定義する。Phase 2 で設計した 3 層検証アーキテクチャ（L1 JSON パース / L2 必須キー / L3 dual root 一致）の検証可能性をテストコードで担保する。

`implementation_mode: "new"` であるため、既存実装との差分確認は不要。通常の TDD サイクル（Red → Green → Refactor）を適用する。本 Phase では実装コードを一切書かない。

## 前提確認

```bash
# 依存整合を確認する
pnpm install

# 既存スクリプトのグリーン状態を確認する（回帰基準）
node .claude/skills/skill-fixture-runner/scripts/validate-schemas.js --help 2>/dev/null || \
  node .claude/skills/skill-fixture-runner/scripts/validate-schemas.js
node .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js --help 2>/dev/null || \
  node .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js --help 2>/dev/null || \
  node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js

# Phase 1 成果物と Phase 2 成果物が存在することを確認する
ls -1 docs/30-workflows/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/outputs/phase-1/
ls -1 docs/30-workflows/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/outputs/phase-2/
```

確認事項:

- [ ] Phase 1 の `requirements.md` / `acceptance-criteria.md` が存在する
- [ ] Phase 2 の設計成果物（3層検証設計 / dual root 同期方針 / 方言許容モード設計）が存在する
- [ ] Phase 3 の `gate-decision.md` が PASS または MINOR で記録されている
- [ ] `.claude/skills/skill-fixture-runner/scripts/` に既存スクリプト群が存在する

## 実行タスク

1. **Step 1**: テストファイル配置場所を確認する（`.claude/skills/skill-fixture-runner/tests/` または `vitest.config.ts` の設定を確認）
2. **Step 2**: L1 テストケースを設計する（破損 JSON 検出 / 正常 JSON 許容）
3. **Step 3**: L2 テストケースを設計する（必須キー欠落検出 / camelCase・snake_case 方言許容）
4. **Step 4**: L3 テストケースを設計する（dual root ドリフト検出 / `.claude` と `.agents` の一致確認）
5. **Step 5**: fixture 除外テストケースを設計する（TC-004 の skill-fixture-runner 自身の fixture が壊れないこと）
6. **Step 6**: `run-all-validations.js` 統合テストを設計する（1 コマンド起動確認）

### Step 1: テストファイル配置場所の確認

```bash
# テスト設定ファイルの存在確認
ls .claude/skills/skill-fixture-runner/
ls .claude/skills/skill-fixture-runner/scripts/ 2>/dev/null
ls .claude/skills/skill-fixture-runner/tests/ 2>/dev/null

# vitest 設定確認
ls vitest.config.ts vitest.config.js 2>/dev/null
cat vitest.config.ts 2>/dev/null | head -30

# 既存テストの配置パターン確認
find .claude/skills/skill-fixture-runner -name "*.test.*" -o -name "*.spec.*" 2>/dev/null
```

テストファイル配置先（優先順位）:

1. `.claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js`（既存パターンに合わせる）
2. `.claude/skills/skill-fixture-runner/tests/validate-evals.test.js`（`tests/` ディレクトリが存在する場合）

### Step 2: L1 テストケース設計（JSON パース）

**対象 AC**: AC-001（`validate-evals.js` が L1 JSON パース検証を実行できる）

| テストケース | 入力                                | 期待 exit code | 期待結果                      |
| ------------ | ----------------------------------- | -------------- | ----------------------------- |
| TC-001       | 破損 JSON（構文エラー）             | 非ゼロ（1〜3） | L1 エラーとして stderr に報告 |
| TC-002       | 空ファイル（0 バイト）              | 非ゼロ         | L1 エラー（空ファイル検出）   |
| TC-003       | 正常な JSON（最小限の必須キーあり） | 0              | L1 PASS、処理継続             |
| TC-004       | 正常な JSON（フルフィールド）       | 0              | L1 PASS                       |

### Step 3: L2 テストケース設計（必須キー検証）

**対象 AC**: AC-002（L2 必須キー検証・方言許容モード）、AC-004（4 種エラー検出）

| テストケース | 入力                                       | 期待 exit code  | 期待結果                               |
| ------------ | ------------------------------------------ | --------------- | -------------------------------------- |
| TC-005       | `skill_name` キー欠落（snake_case 方言）   | 非ゼロ          | L2 エラー、欠落キー名を stderr に出力  |
| TC-006       | `skillName` キー欠落（camelCase 方言）     | 非ゼロ          | L2 エラー、欠落キー名を stderr に出力  |
| TC-007       | `timestamp` キー欠落（共通必須キー）       | 非ゼロ          | L2 エラー                              |
| TC-008       | camelCase 方言で全必須キー揃い             | 0               | L2 PASS（camelCase 方言を許容）        |
| TC-009       | snake_case 方言で全必須キー揃い            | 0               | L2 PASS（snake_case 方言を許容）       |
| TC-010       | 方言混在（camelCase と snake_case が混在） | 0 または 非ゼロ | 設計方針に従う（Phase 2 設計書で決定） |

### Step 4: L3 テストケース設計（dual root 一致）

**対象 AC**: AC-003（L3 dual root 一致検証、6 スキル全件）、AC-007（`diff -u` で差分ゼロ）

| テストケース | 入力                                         | 期待 exit code | 期待結果                                      |
| ------------ | -------------------------------------------- | -------------- | --------------------------------------------- |
| TC-011       | `.claude` と `.agents` が完全一致            | 0              | L3 PASS                                       |
| TC-012       | `.agents` 側の EVALS.json が 1 バイト異なる  | 非ゼロ         | L3 ドリフト検出、差異スキル名を stderr に出力 |
| TC-013       | `.agents` 側の EVALS.json が存在しない       | 非ゼロ         | L3 エラー（ミラー欠損検出）                   |
| TC-014       | 6 スキル全件で `.claude` と `.agents` が一致 | 0              | L3 PASS（全件確認）                           |
| TC-015       | 6 スキル中 1 件のみドリフト                  | 非ゼロ         | ドリフトした 1 件のスキル名と差異を報告       |

検証対象 6 スキル:

- `aiworkflow-requirements`
- `github-issue-manager`
- `int-test-skill`
- `skill-creator`
- `skill-fixture-runner`
- `task-specification-creator`

### Step 5: fixture 除外テストケース設計

**対象 AC**: AC-005（fixture EVALS.json の除外または特別扱い）

skill-fixture-runner スキル自身の `tests/` や `fixtures/` ディレクトリ内の EVALS.json は、テスト用途のため破損・不完全な内容を持つことがある。これらが `validate-evals.js` の対象に含まれると誤検出が発生する。

| テストケース | シナリオ                                                          | 期待結果                                   |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------ |
| TC-016       | `fixtures/` ディレクトリ内の不完全 EVALS.json を validator に渡す | 除外されるか特別扱いされ、エラーにならない |
| TC-017       | `tests/__fixtures__/` 内の破損 EVALS.json を validator に渡す     | 同上                                       |
| TC-018       | `--exclude-fixtures` フラグ付きで実行（設計で採用する場合）       | fixture パスがスキップされる               |
| TC-019       | 通常スキル EVALS.json（fixture ではない）は除外されない           | 正常に検証対象となる                       |

### Step 6: run-all-validations.js 統合テスト設計

**対象 AC**: AC-006（`run-all-validations.js` から 1 コマンドで新 validator を起動）

| テストケース | シナリオ                                                         | 期待結果                                           |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------------- |
| TC-020       | `run-all-validations.js` を実行し validate-evals.js が呼ばれる   | stdout または stderr に evals 検証の出力が含まれる |
| TC-021       | 全スキルの EVALS.json が正常な場合の run-all-validations.js 実行 | exit 0、evals 検証 PASS の表示                     |
| TC-022       | 1 件ドリフトがある場合の run-all-validations.js 実行             | exit 非ゼロ、run-all-validations の全体判定が FAIL |

## テストケース一覧

| テストケース | 層   | シナリオ                                     | 期待 exit code | 対応 AC |
| ------------ | ---- | -------------------------------------------- | -------------- | ------- |
| TC-001       | L1   | 破損 JSON（構文エラー）                      | 非ゼロ         | AC-001  |
| TC-002       | L1   | 空ファイル                                   | 非ゼロ         | AC-001  |
| TC-003       | L1   | 正常 JSON（最小限）                          | 0              | AC-001  |
| TC-004       | L1   | 正常 JSON（フルフィールド）                  | 0              | AC-001  |
| TC-005       | L2   | `skill_name` キー欠落                        | 非ゼロ         | AC-002  |
| TC-006       | L2   | `skillName` キー欠落                         | 非ゼロ         | AC-002  |
| TC-007       | L2   | `timestamp` キー欠落                         | 非ゼロ         | AC-002  |
| TC-008       | L2   | camelCase 方言で全必須キー揃い               | 0              | AC-002  |
| TC-009       | L2   | snake_case 方言で全必須キー揃い              | 0              | AC-002  |
| TC-010       | L2   | 方言混在                                     | 設計依存       | AC-004  |
| TC-011       | L3   | `.claude` と `.agents` が完全一致            | 0              | AC-003  |
| TC-012       | L3   | `.agents` 側が 1 バイト異なる                | 非ゼロ         | AC-003  |
| TC-013       | L3   | `.agents` 側の EVALS.json が存在しない       | 非ゼロ         | AC-003  |
| TC-014       | L3   | 6 スキル全件一致確認                         | 0              | AC-003  |
| TC-015       | L3   | 6 スキル中 1 件のみドリフト                  | 非ゼロ         | AC-004  |
| TC-016       | 除外 | fixtures/ 内の不完全 EVALS.json              | 0（除外）      | AC-005  |
| TC-017       | 除外 | tests/**fixtures**/ 内の破損 EVALS.json      | 0（除外）      | AC-005  |
| TC-018       | 除外 | --exclude-fixtures フラグ付き実行            | 0              | AC-005  |
| TC-019       | 除外 | 通常スキル EVALS.json は除外されない         | 0 or 非ゼロ    | AC-005  |
| TC-020       | 統合 | run-all-validations.js で evals 呼び出し確認 | -              | AC-006  |
| TC-021       | 統合 | 全件正常の run-all-validations.js            | 0              | AC-006  |
| TC-022       | 統合 | 1 件ドリフト時の run-all-validations.js      | 非ゼロ         | AC-006  |

## TDD 実行手順（Red 確認）

```bash
# Step 1: テストファイル作成後、Red 確認（validate-evals.js 未実装のため全 TC が fail）
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js
# 期待: FAIL（validate-evals.js が存在しないため require/import エラー or 全 TC fail）

# Step 2: 既存スクリプトがグリーンであることを確認
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/ 2>/dev/null || \
  echo "既存テストが存在しない場合は既存スクリプトの手動実行で確認"

# Step 3: 既存 validate-*.js が引き続き正常動作することを確認（回帰基準）
node .claude/skills/skill-fixture-runner/scripts/validate-schemas.js
node .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js
node .claude/skills/skill-fixture-runner/scripts/validate-agents.js
node .claude/skills/skill-fixture-runner/scripts/validate-skill-md.js
```

## AC 対応表

| AC     | 対応テストケース                           | 検証内容                                          |
| ------ | ------------------------------------------ | ------------------------------------------------- |
| AC-001 | TC-001 / TC-002 / TC-003 / TC-004          | L1 JSON パース検証（破損検出 / 正常許容）         |
| AC-002 | TC-005 / TC-006 / TC-007 / TC-008 / TC-009 | L2 必須キー検証・方言許容モード                   |
| AC-003 | TC-011 / TC-012 / TC-013 / TC-014          | L3 dual root 一致検証（6 スキル全件）             |
| AC-004 | TC-010 / TC-015                            | 4 種エラー検出（方言不整合 / dual root ドリフト） |
| AC-005 | TC-016 / TC-017 / TC-018 / TC-019          | fixture 除外または特別扱い                        |
| AC-006 | TC-020 / TC-021 / TC-022                   | run-all-validations.js 統合（1 コマンド起動）     |

AC-007（`.claude` と `.agents` の diff -u 差分ゼロ）は Phase 5 実装後の確認事項であり、Phase 6 のテスト拡充で扱う。

## 統合テスト連携

- Phase 5 は本 Phase の TC-001〜TC-022 を Green にするまで完了扱いにしない
- Phase 6 / 7 は本 Phase のケース ID を継承し、命名を変更しない

## 成果物

- `outputs/phase-4/test-design.md`: テスト設計書（テストケース一覧 TC-001〜TC-022 / AC 対応表 / Red 確認手順）

## 完了条件

- [ ] Step 1: テストファイル配置場所を確認済み
- [ ] Step 2: L1 テストケース（TC-001〜TC-004）を設計済み
- [ ] Step 3: L2 テストケース（TC-005〜TC-010）を設計済み
- [ ] Step 4: L3 テストケース（TC-011〜TC-015）を設計済み
- [ ] Step 5: fixture 除外テストケース（TC-016〜TC-019）を設計済み
- [ ] Step 6: run-all-validations.js 統合テスト（TC-020〜TC-022）を設計済み
- [ ] テストファイル（`validate-evals.test.js`）が作成され、全テストが Red（FAIL）であることを確認済み
- [ ] 既存スクリプト群（validate-schemas.js 等）が引き続き正常動作することを確認済み
- [ ] AC 対応表（AC-001〜AC-006）が出力されている
- [ ] `outputs/phase-4/test-design.md` が出力されている

## 参照資料

### 実装・コード

| 資料名                           | パス                                                                      | 用途                        |
| -------------------------------- | ------------------------------------------------------------------------- | --------------------------- |
| Phase 1 要件定義書               | `outputs/phase-1/requirements.md`                                         | AC-001〜AC-007 の確定版参照 |
| Phase 1 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`                                  | TC 対応表の入力             |
| Phase 2 3層検証設計              | `outputs/phase-2/three-layer-validation-design.md`                        | L1/L2/L3 テスト化の根拠     |
| Phase 2 dual root 同期設計       | `outputs/phase-2/dual-root-sync-design.md`                                | L3 テスト設計の根拠         |
| Phase 2 方言許容モード設計       | `outputs/phase-2/dialect-tolerance-design.md`                             | L2 方言テスト設計の根拠     |
| Phase 3 gate-decision            | `outputs/phase-3/gate-decision.md`                                        | Phase 3 成果物              |
| 既存 validate-schemas.js         | `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js`         | 回帰基準                    |
| 既存 validate-skill-structure.js | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js` | 回帰基準・拡張対象          |
| 既存 run-all-validations.js      | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`      | 統合テストの対象            |

## 次Phase

Phase 5（実装）へ進む。
