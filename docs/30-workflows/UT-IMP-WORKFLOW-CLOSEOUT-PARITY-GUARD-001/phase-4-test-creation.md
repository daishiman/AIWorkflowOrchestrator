# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | Phase 3 PASS または MINOR                 |
| 後続Phase  | Phase 5                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 2 で設計した `validate-closeout-parity.js`（新規）と `complete-phase.js` 拡張部のテストを先行作成し、TDD Red（全テストが FAIL である）状態を確立する。AC-1 / AC-2 / AC-4 の検証可能性をテストコードで担保する。本Phaseでは実装コードを一切書かない。

## 前提確認

```bash
# 依存整合を確認する
pnpm install

# 既存スクリプトのグリーン状態を確認する（回帰基準）
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --help
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js --help
node .claude/skills/task-specification-creator/scripts/complete-phase.js --help

# Phase 1 成果物と Phase 2 成果物が存在することを確認する
ls -1 docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001/outputs/phase-1/
ls -1 docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001/outputs/phase-2/
```

確認事項:

- [ ] Phase 1 の `requirements.md` / `acceptance-criteria.md` / `drift-inventory.md` が存在する
- [ ] Phase 2 の 4 成果物（parity-algorithm / validator-placement / complete-phase-extension / checklist-gate）が存在する
- [ ] Phase 3 の `gate-decision.md` が PASS または MINOR で記録されている

## 実行タスク

1. fixture 6 種（正常 / 部分drift / 完全drift / 欠損 / 不正値 / 空ワークフロー）を設計する
2. `validate-closeout-parity.js` のユニットテスト仕様を作成する（exit code / JSON 出力スキーマ / 4 ソース比較）
3. `complete-phase.js` 拡張部のユニットテスト仕様を作成する（S1〜S4 同値書き込み / rollback）
4. TDD Red（全テスト FAIL）を確認する
5. AC-1 / AC-2 / AC-4 とテストケースの対応表を作成する

## テスト仕様

### fixture 設計

**配置先**: `.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/`

| fixture ID | ディレクトリ名      | S1        | S2          | S3        | S4        | 期待結果                                 |
| ---------- | ------------------- | --------- | ----------- | --------- | --------- | ---------------------------------------- |
| FX-01      | `normal/`           | completed | completed   | completed | completed | `PARITY_OK` / exit 0                     |
| FX-02      | `partial-drift-s1/` | pending   | completed   | completed | completed | `PARITY_DRIFT` / exit 1 / phase=N        |
| FX-03      | `partial-drift-s2/` | completed | pending     | completed | completed | `PARITY_DRIFT` / exit 1 / phase=N        |
| FX-04      | `partial-drift-s3/` | completed | completed   | pending   | completed | `PARITY_DRIFT` / exit 1 / phase=N        |
| FX-05      | `partial-drift-s4/` | completed | completed   | completed | pending   | `PARITY_DRIFT` / exit 1 / phase=N        |
| FX-06      | `full-drift/`       | pending   | in_progress | completed | blocked   | `PARITY_DRIFT` / exit 1 / 全 4 ソース    |
| FX-07      | `missing-s2/`       | -         | (欠損)      | completed | completed | `MISSING_SOURCE` / exit 2                |
| FX-08      | `missing-s3/`       | -         | completed   | (欠損)    | completed | `MISSING_SOURCE` / exit 2                |
| FX-09      | `invalid-status/`   | completed | completed   | FOO       | completed | `INVALID_STATUS_VALUE` / exit 3          |
| FX-10      | `empty-workflow/`   | -         | (空配列)    | (空配列)  | (なし)    | `PARITY_OK` / exit 0（0 phase 扱い）     |
| FX-11      | `s1-dash-ok/`       | -         | pending     | pending   | pending   | `PARITY_OK` / exit 0（S1 のみ `-` 許容） |

fixture の構成要素:

- `index.md`: frontmatter + Phase 表（13 phase 分行）
- `artifacts.json`: `{ "phases": { "1": { "status": "..." }, ... } }`
- `outputs/artifacts.json`: 上と同形式
- `phase-N-*.md`: frontmatter テーブルに `| ステータス | ... |` 行を持つ

### テスト1: validate-closeout-parity ユニットテスト

**ファイルパス**: `.claude/skills/task-specification-creator/scripts/__tests__/validate-closeout-parity.test.js`

| テストケース | 入力 fixture | 期待 exit code | 期待 JSON `code`       | 期待 `drifts[]` 件数 |
| ------------ | ------------ | -------------- | ---------------------- | -------------------- |
| TC-P-01      | FX-01        | 0              | `PARITY_OK`            | 0                    |
| TC-P-02      | FX-02        | 1              | `PARITY_DRIFT`         | 1                    |
| TC-P-03      | FX-03        | 1              | `PARITY_DRIFT`         | 1                    |
| TC-P-04      | FX-04        | 1              | `PARITY_DRIFT`         | 1                    |
| TC-P-05      | FX-05        | 1              | `PARITY_DRIFT`         | 1                    |
| TC-P-06      | FX-06        | 1              | `PARITY_DRIFT`         | 1 以上               |
| TC-P-07      | FX-07        | 2              | `MISSING_SOURCE`       | -                    |
| TC-P-08      | FX-08        | 2              | `MISSING_SOURCE`       | -                    |
| TC-P-09      | FX-09        | 3              | `INVALID_STATUS_VALUE` | -                    |
| TC-P-10      | FX-10        | 0              | `PARITY_OK`            | 0                    |
| TC-P-11      | FX-11        | 0              | `PARITY_OK`            | 0                    |

追加シナリオ:

| テストケース | シナリオ                                          | 期待結果                                       |
| ------------ | ------------------------------------------------- | ---------------------------------------------- |
| TC-P-12      | `--json` なしで FX-02 実行                        | 人間可読テキスト（phase/ソース/期待値/実測値） |
| TC-P-13      | `--json` 付与で FX-02 実行                        | JSON 出力スキーマに一致                        |
| TC-P-14      | `--workflow` 引数未指定                           | exit 2 相当のエラー（usage 表示）              |
| TC-P-15      | JSON 出力の `sourcesChecked` が `[S1..S4]` 固定   | 配列長 4、順序保持                             |
| TC-P-16      | JSON 出力の `generatedAt` が ISO8601 形式         | 正規表現でフォーマット検証                     |
| TC-P-17      | read-only 契約検証（実行後ファイルの mtime 不変） | fixture ファイルが書き換わっていない           |

### テスト2: complete-phase 拡張ユニットテスト

**ファイルパス**: `.claude/skills/task-specification-creator/scripts/__tests__/complete-phase.parity.test.js`

| テストケース | シナリオ                                                | 期待結果                                                    |
| ------------ | ------------------------------------------------------- | ----------------------------------------------------------- | ------- | ------ | ---------- | --------- | ------------ | -------------------------- |
| TC-C-01      | Phase N 完了実行後に S1 / S2 / S3 / S4 の status が一致 | 4 ソース全てが `completed` に更新される                     |
| TC-C-02      | 途中で S3 書き込みに失敗（権限エラー模擬）              | 既に書き込んだ S1 / S2 が rollback され、元の status に戻る |
| TC-C-03      | 書き込み後の parity 検証が FAIL                         | 3 ソースを rollback し、exit 非 0、stderr に drift 理由表示 |
| TC-C-04      | 未知のフラグ `--skip-parity-check` を付与時             | usage error で exit 非 0、書き込みを開始しない              |
| TC-C-05      | 既存 `--workflow` / `--phase` 引数の後方互換性          | 既存コマンドラインで動作継続                                |
| TC-C-06      | S4（phase 本文 frontmatter）の `                        | ステータス                                                  | pending | `行を` | ステータス | completed | ` に更新する | 正規表現マッチ後の置換確認 |
| TC-C-07      | 存在しない Phase 番号指定                               | exit 非 0、エラーメッセージ出力                             |

### テスト3: 既存テストの回帰確認

```bash
# 既存 validator / verify-all-specs のテストが PASS 継続
node .claude/skills/task-specification-creator/scripts/__tests__/validate-phase-output.test.js
node .claude/skills/task-specification-creator/scripts/__tests__/verify-all-specs.test.js
```

## TDD 実行手順

```bash
# Step 1: fixture ディレクトリ作成
mkdir -p .claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/{normal,partial-drift-s1,partial-drift-s2,partial-drift-s3,partial-drift-s4,full-drift,missing-s2,missing-s3,invalid-status,empty-workflow,s1-dash-ok}

# Step 2: テストファイル作成後、Red確認
node --test .claude/skills/task-specification-creator/scripts/__tests__/validate-closeout-parity.test.js
# 期待: FAIL（validate-closeout-parity.js 未実装のため require エラーまたは全 TC が fail）

node --test .claude/skills/task-specification-creator/scripts/__tests__/complete-phase.parity.test.js
# 期待: FAIL（complete-phase.js 拡張未実装のため TC-C-01〜TC-C-07 が fail）

# Step 3: 既存テストがグリーンであることを確認
node --test .claude/skills/task-specification-creator/scripts/__tests__/
# 期待: 既存 test は PASS 継続、新規 2 ファイルのみ FAIL
```

## AC 対応表

| AC   | 対応テストケース                | 検証内容                                            |
| ---- | ------------------------------- | --------------------------------------------------- |
| AC-1 | TC-P-01 / TC-P-02 / TC-P-06     | `--workflow` 実行で全一致 exit 0 / drift exit 1     |
| AC-2 | TC-P-12 / TC-P-13 / TC-P-15〜16 | drift レポートの 4 項構造化 / `--json` 出力スキーマ |
| AC-4 | TC-C-01 / TC-C-06               | `complete-phase.js` 単一実行で S1〜S4 同値更新      |

AC-3 / AC-5 / AC-7 は Phase 6 のテスト拡充で扱う（本 Phase では対象外）。

## 参照資料

### 実装・コード

| 資料名                          | パス                                                                         | 用途                     |
| ------------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件定義書              | `outputs/phase-1/requirements.md`                                            | AC-1〜AC-7 の確定版参照  |
| Phase 1 受け入れ基準            | `outputs/phase-1/acceptance-criteria.md`                                     | TC 対応表の入力          |
| Phase 1 drift baseline          | `outputs/phase-1/drift-inventory.md`                                         | fixture の現実データ     |
| Phase 2 parity アルゴリズム     | `outputs/phase-2/parity-algorithm-design.md`                                 | 擬似コードをテスト化     |
| Phase 2 validator 配置設計      | `outputs/phase-2/validator-placement-design.md`                              | CLI / JSON 契約          |
| Phase 2 complete-phase 拡張設計 | `outputs/phase-2/complete-phase-extension-design.md`                         | atomic / rollback テスト |
| 既存 validator                  | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js` | 回帰基準                 |
| 既存 verify-all-specs           | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`      | 回帰基準                 |
| 既存 complete-phase             | `.claude/skills/task-specification-creator/scripts/complete-phase.js`        | 拡張前の挙動確認         |
| checklist gate設計              | `outputs/phase-2/checklist-gate-design.md`                                   | Phase 2 成果物           |
| 設計レビューゲート判定書        | `outputs/phase-3/gate-decision.md`                                           | Phase 3 成果物           |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                        | 用途                        |
| -------------------- | --------------------------------------------------------------------------- | --------------------------- |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | current facts               |
| task-workflow-phases | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md` | Phase 契約                  |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | TDD Red 定義                |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | exit code / JSON エラー契約 |

## 実行手順

1. 前提確認コマンドを順に実行し、前提 Phase 成果物の存在を確認する
2. fixture 11 種のディレクトリ骨格を作成する（中身の `index.md` / `artifacts.json` / `outputs/artifacts.json` / `phase-N-*.md` はテーブル形式で表に従い用意する）
3. `validate-closeout-parity.test.js` を作成する（TC-P-01〜TC-P-17）
4. `complete-phase.parity.test.js` を作成する（TC-C-01〜TC-C-07）
5. 両テストを実行し全 FAIL（Red）を確認する
6. 既存テストが PASS 継続であることを確認する
7. AC 対応表・Red 実行ログを成果物として出力する

## Private method テスト方針

- `validate-closeout-parity.js` の内部関数（`readIndexMdPhaseTable` / `readPhaseFrontmatters` / `compareParitySources`）は module.exports で直接エクスポートするのではなく、CLI 経由のブラックボックステストで検証する
- どうしても直接テストが必要な場合は、ファイル末尾で `if (require.main !== module) module.exports = { ... }` の形で限定公開する設計とし、テスト専用フラグ `process.env.NODE_ENV === 'test'` を条件に参照する

## 統合テスト連携

- SubAgent-A: FX-01〜FX-11 の fixture 作成を担当する
- SubAgent-B: TC-P-01〜TC-P-17 の `validate-closeout-parity` テストを作成する
- SubAgent-C: TC-C-01〜TC-C-07 の `complete-phase` 拡張テストを作成する
- SubAgent-D: AC 対応表と Red 実行ログをまとめる

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                                      |
| ------------ | ----------------------------------------------------------------- |
| TDD準拠      | 新規 2 テストファイルが全て FAIL（Red）で起動することを確認したか |
| 命名規則     | テスト ID（TC-P-NN / TC-C-NN）が設計書と一致しているか            |
| fixture 粒度 | 1 fixture が 1 目的のみを検証しているか（混在していないか）       |
| read-only    | TC-P-17 が parity validator の副作用なしを担保しているか          |
| 既存回帰     | 既存テストが Red 化していないか                                   |

## 成果物

- `.claude/skills/task-specification-creator/scripts/__tests__/validate-closeout-parity.test.js`（コード成果物: outputs 外）
- `.claude/skills/task-specification-creator/scripts/__tests__/complete-phase.parity.test.js`（コード成果物: outputs 外）
- `.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/`配下 FX-01〜FX-11（コード成果物: outputs 外）
- `outputs/phase-4/test-spec.md`: テスト仕様書（fixture 表 + TC-P-01〜TC-P-17 + TC-C-01〜TC-C-07 + AC 対応表）
- `outputs/phase-4/tdd-red-results.md`: TDD Red 確認ログ（全 FAIL の実行結果貼付）

## 完了条件

- [ ] fixture FX-01〜FX-11 が作成されている
- [ ] `validate-closeout-parity.test.js` に TC-P-01〜TC-P-17 が実装されている
- [ ] `complete-phase.parity.test.js` に TC-C-01〜TC-C-07 が実装されている
- [ ] 新規 2 テストファイルが全 FAIL（Red）であることを確認した
- [ ] 既存テストが PASS 継続であることを確認した
- [ ] AC 対応表（AC-1 / AC-2 / AC-4）が出力されている
- [ ] `outputs/phase-4/test-spec.md` と `outputs/phase-4/tdd-red-results.md` が出力されている

## タスク100%実行確認【必須】

- [ ] 前提確認コマンド完了（Phase 1-3 成果物の存在確認）
- [ ] fixture 11 種作成完了
- [ ] `validate-closeout-parity.test.js` 作成完了（TC-P-01〜TC-P-17）
- [ ] `complete-phase.parity.test.js` 作成完了（TC-C-01〜TC-C-07）
- [ ] TDD Red 確認完了（全 FAIL）
- [ ] 既存テスト回帰確認完了（PASS 継続）
- [ ] `outputs/phase-4/test-spec.md` 出力完了
- [ ] `outputs/phase-4/tdd-red-results.md` 出力完了

## 次Phase

Phase 5（実装）へ進む。
