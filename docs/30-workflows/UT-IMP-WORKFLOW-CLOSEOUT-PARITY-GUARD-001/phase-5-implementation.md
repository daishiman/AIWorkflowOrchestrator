# Phase 5: 実装

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | Phase 4 完了（TDD Red 確立）              |
| 後続Phase  | Phase 6                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 4 で作成した TDD Red 状態のテストを全て通過させる（TDD Green）。本 Phase は実装範囲・変更ファイル一覧・実装手順・責務境界の固定までを仕様化する。実コードの中身は Phase 5 作業者が Phase 2 設計に従い書き下ろす。

## 新規作成ファイル一覧

| ファイルパス                                                                    | 役割                                                                                 |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js` | 新規 validator（read-only）。S1〜S4 status を比較し exit code と JSON レポートを返す |
| `.agents/skills/task-specification-creator/scripts/validate-closeout-parity.js` | `.claude` 正本からのミラー（AC-6 の `.agents/` 同期要件）                            |

## 修正対象ファイル一覧

| ファイルパス                                                            | 修正内容                                                                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `.claude/skills/task-specification-creator/scripts/complete-phase.js`   | S1〜S4 を同一トランザクションで更新し、完了直前に parity validator を呼び出して FAIL 時 rollback |
| `.claude/skills/task-specification-creator/scripts/verify-all-specs.js` | 既存 4 検証の末尾に parity validator 呼び出しを追加し、drift 発生で PASS 判定を抑止              |
| `.agents/skills/task-specification-creator/scripts/complete-phase.js`   | `.claude` 正本のミラー                                                                           |
| `.agents/skills/task-specification-creator/scripts/verify-all-specs.js` | `.claude` 正本のミラー                                                                           |

## 既存ファイルとの責務境界

| 関心                          | 書き手                        | 読み手                    | 本 Phase での変更            |
| ----------------------------- | ----------------------------- | ------------------------- | ---------------------------- |
| S1 `index.md` Phase 表        | `generate-index.js`           | validator, 人             | 変更しない（呼び出し元のみ） |
| S2 root `artifacts.json`      | `complete-phase.js`           | validator, init-artifacts | 書き込みフロー拡張           |
| S3 `outputs/artifacts.json`   | `complete-phase.js`           | validator                 | 書き込みフロー拡張           |
| S4 `phase-N-*.md` frontmatter | `complete-phase.js`           | validator, 人             | 新規書き込み責務を付与       |
| parity 判定                   | `validate-closeout-parity.js` | `verify-all-specs.js`     | 新規作成                     |
| 構造/整合性/品質/完全性検証   | `validate-phase-output.js`    | `verify-all-specs.js`     | 変更しない（責務分離）       |

`validate-phase-output.js` は parity 検証を含めない。parity 専用は新規 validator が単独で担う。

## 実行タスク

1. `validate-closeout-parity.js` を新規作成する（Phase 2 の parity アルゴリズム擬似コードをそのまま写す）
2. `complete-phase.js` の責務を S1〜S4 同値書き込み＋validator 呼び出し＋rollback へ拡張する
3. `verify-all-specs.js` の末尾に parity 検証を組み込み、drift 検出で PASS 抑止する
4. `.agents/` ミラーを同期する（`.claude` 正本と同一ファイル名でコピー）
5. 型/Lint/テストを実行し TDD Green を確認する

## 実行手順

```bash
# Step 1: 新規 validator 作成後、Phase 4 で Red だった validate-closeout-parity テストを実行
node --test .claude/skills/task-specification-creator/scripts/__tests__/validate-closeout-parity.test.js
# 期待: TC-P-01〜TC-P-17 が全 PASS（Green）

# Step 2: complete-phase.js 拡張後にテスト実行
node --test .claude/skills/task-specification-creator/scripts/__tests__/complete-phase.parity.test.js
# 期待: TC-C-01〜TC-C-07 が全 PASS

# Step 3: verify-all-specs.js 拡張後、自 workflow で手動実行し組込み確認
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001
# 期待: 既存 4 検証 + parity 検証の 5 段階出力

# Step 4: .agents/ ミラー同期確認
diff -q .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
       .agents/skills/task-specification-creator/scripts/validate-closeout-parity.js
# 期待: 差分なし

# Step 5: 既存テスト回帰確認
node --test .claude/skills/task-specification-creator/scripts/__tests__/
# 期待: 既存含め全 PASS
```

## 実装方針

### `validate-closeout-parity.js` 実装方針

Phase 2 設計の擬似コードを Node.js で忠実に実装する。主要関数シグネチャと責務のみ固定する（内部 helper は自由）。

- CLI エントリ: `#!/usr/bin/env node`、`--workflow <dir>` 必須、`--json` 任意
- 読み取り関数（read-only 厳守）:
  - `readIndexMdPhaseTable(indexPath)`: Phase 表行から `{ [phase: number]: status }` を返す
  - `readArtifactsJson(jsonPath)`: `phases` オブジェクトから `{ [phase: number]: status }` を返す
  - `readPhaseFrontmatters(workflowDir)`: `phase-N-*.md` を走査し `{ [phase: number]: status }` を返す
- 判定関数: `validateParity(workflowDir): ParityReport`（戻り値は Phase 2 設計の JSON スキーマに一致）
- exit code: 0=`PARITY_OK` / 1=`PARITY_DRIFT` / 2=`MISSING_SOURCE` / 3=`INVALID_STATUS_VALUE`
- 許可 status 列挙: `['pending', 'in_progress', 'completed', 'blocked']`。S1 のみ追加で `'-'` を許容
- `--json` 未指定時は 1 drift につき 1 行 `Phase {N} | {source} | expected={expected} | actual={actual}` の人間可読 4 項構造を標準出力
- ファイル読み込みのみで書き込み API を一切使用しない（`fs.writeFile` / `fs.appendFile` / `fs.unlink` を import しない契約）
- `generatedAt` は `new Date().toISOString()` 固定
- stderr には進行ログ、stdout には最終レポートのみ出力する（機械処理との分離）

### `complete-phase.js` 拡張方針

既存 CLI 引数 `--workflow` / `--phase` / `--artifacts` は維持したまま、以下の書き込みフローへ差し替える。

1. **pre-snapshot**: S1 / S2 / S3 / S4 の現行内容をメモリに保持する（rollback 用）
2. **S2 書き込み**: root `artifacts.json` の `phases.{N}.status = "completed"` を更新
3. **S3 書き込み**: `outputs/artifacts.json` を同値で更新
4. **S1 書き込み**: `generate-index.js` を `child_process.spawnSync` で呼び出し `index.md` Phase 表を再生成
5. **S4 書き込み**: `phase-N-*.md` の frontmatter 表で `| ステータス | {current} |` 行を `| ステータス | completed |` に正規表現で置換
6. **parity 検証**: `validate-closeout-parity.js` を同プロセス内 require で呼び出し、戻り値 `exitCode !== 0` なら rollback
7. **rollback**: pre-snapshot の内容で 4 ファイルを上書きし、stderr に `ROLLBACK: parity check failed` を出力して exit 非 0

追加 CLI 引数:

- parity bypass 用フラグは追加しない。未知のフラグは usage error として reject し、close-out の安全性を弱める抜け道を残さない

Atomic 契約:

- 4 ファイルの書き込みは逐次だが、validator FAIL 時は必ず 4 ファイル全部を pre-snapshot に戻す
- rollback 中のエラーは stderr に `ROLLBACK_FAILED` を出力し、呼び出し元に「手動復旧が必要」とレポート

### `verify-all-specs.js` 組込み方針

既存の `[構造検証] → [整合性検証] → [品質検証] → [完全性検証] → PASS/FAIL` フローの最終段直前に parity 検証を挿入する。

- 呼び出し方法: `child_process.spawnSync('node', [validatorPath, '--workflow', workflowDir, '--json'])`
- 戻り値: exit code と stdout JSON を解析
- drift > 0（exit 1）検出時: 全体判定を FAIL に格上げし、既存 4 検証が PASS でも PASS にしない
- JSON レポートに `parity` フィールド追加: `{ parity: { code: string, driftCount: number, report: ParityReport } }`
- 既存 consumer（`parity` フィールドを知らない）との後方互換性を保つため、optional フィールド扱い

### `.agents/` ミラー同期方針

- 正本は `.claude/skills/task-specification-creator/scripts/*.js`
- ミラー先は `.agents/skills/task-specification-creator/scripts/*.js`
- 両者は**バイト完全一致**で保つ（差分を生まない）
- 同期は手動 `cp` で実施し、Phase 7 以降で drift チェックツールの導入可否を別途検討（本 Phase では範囲外）
- コミット前に `diff -q` で差分 0 を確認

### エラーメッセージ方針

- ユーザー向けエラーは日本語で出力（例: `エラー: --workflow 引数が必要です`）
- 機械処理向け JSON 出力はフィールド名を英語固定（後方互換性優先）
- スタックトレースは `NODE_ENV === 'debug'` の時のみ出力

## 注意事項

- 実装コード中で TODO / FIXME コメントを残さない（Phase 2 設計が完結済みのため）
- `LLMClient` / `SkillExecutor` / `SkillCreationContext` のような他 Skill 固有コードには一切触らない（責務外）
- `validate-phase-output.js` は本 Phase では変更禁止（parity は新 validator 単独担当）
- Node.js 標準モジュールのみ使用する（外部パッケージを追加しない）
- `pnpm install` による依存追加は禁止（新規パッケージなし）

## 統合テスト連携

- SubAgent-A: `validate-closeout-parity.js` 新規作成を担当（Phase 4 の TC-P-01〜TC-P-17 を Green 化）
- SubAgent-B: `complete-phase.js` 拡張を担当（Phase 4 の TC-C-01〜TC-C-07 を Green 化）
- SubAgent-C: `verify-all-specs.js` 組込みを担当
- SubAgent-D: `.agents/` ミラー同期と実装サマリー出力を担当

## 参照資料

### 実装・コード

| 資料名                          | パス                                                                         | 用途                              |
| ------------------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| Phase 2 parity アルゴリズム     | `outputs/phase-2/parity-algorithm-design.md`                                 | 擬似コードを実装に落とす          |
| Phase 2 validator 配置設計      | `outputs/phase-2/validator-placement-design.md`                              | CLI / JSON 契約                   |
| Phase 2 complete-phase 拡張設計 | `outputs/phase-2/complete-phase-extension-design.md`                         | rollback / atomic 実装根拠        |
| Phase 4 test-spec               | `outputs/phase-4/test-spec.md`                                               | Green 化対象のテスト              |
| Phase 4 tdd-red-results         | `outputs/phase-4/tdd-red-results.md`                                         | Red 基準ログ                      |
| Phase 3 gate-decision           | `outputs/phase-3/gate-decision.md`                                           | 実装着手前の合否判定              |
| 既存 complete-phase             | `.claude/skills/task-specification-creator/scripts/complete-phase.js`        | 拡張対象                          |
| 既存 verify-all-specs           | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`      | 組込み対象                        |
| 既存 generate-index             | `.claude/skills/task-specification-creator/scripts/generate-index.js`        | S1 書き手（呼び出し元のみ）       |
| 既存 validate-phase-output      | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js` | 責務境界保持（本 Phase 変更なし） |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                        | 用途                                  |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | current facts 対象（Phase 13 で反映） |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | exit code / rollback 契約             |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | TDD Green 定義                        |

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                                                |
| ------------ | --------------------------------------------------------------------------- |
| セキュリティ | validator が絶対にファイル書き換え API を呼び出さない契約を守っているか     |
| 型安全性     | JSON スキーマが Phase 2 設計の `ParityReport` 型と完全一致しているか        |
| 既存テスト   | `validate-phase-output.test.js` / `verify-all-specs.test.js` が PASS 継続か |
| 責務境界     | `complete-phase.js` が S1〜S4 の唯一の書き手になっているか                  |
| 後方互換     | 既存 CLI 引数 `--workflow` / `--phase` / `--artifacts` が維持されているか   |
| ミラー同期   | `.claude/` と `.agents/` が `diff -q` で差分 0 か                           |

## 成果物

- `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js`（コード成果物: outputs 外）
- `.claude/skills/task-specification-creator/scripts/complete-phase.js`（コード成果物: 拡張）
- `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`（コード成果物: 拡張）
- `.agents/skills/task-specification-creator/scripts/validate-closeout-parity.js`（ミラー）
- `.agents/skills/task-specification-creator/scripts/complete-phase.js`（ミラー）
- `.agents/skills/task-specification-creator/scripts/verify-all-specs.js`（ミラー）
- `outputs/phase-5/implementation-summary.md`: 実装サマリー（変更概要・差分要約・テスト結果）
- `outputs/phase-5/changed-files.md`: 変更ファイル一覧（新規 2 / 修正 2 / ミラー 4）

## 完了条件

- [ ] `validate-closeout-parity.js` が新規作成され、Phase 4 の TC-P-01〜TC-P-17 が全 PASS
- [ ] `complete-phase.js` が拡張され、TC-C-01〜TC-C-07 が全 PASS
- [ ] `verify-all-specs.js` に parity 検証が組込まれ、drift 検出で PASS 抑止する
- [ ] `.agents/` ミラーが `.claude/` 正本と `diff -q` で差分 0
- [ ] 既存テスト（`validate-phase-output.test.js` / `verify-all-specs.test.js` 等）が PASS 継続
- [ ] validator が書き込み API（`fs.writeFile` 等）を import していない（read-only 契約遵守）
- [ ] `outputs/phase-5/implementation-summary.md` と `outputs/phase-5/changed-files.md` が出力されている

## タスク100%実行確認【必須】

- [ ] `validate-closeout-parity.js` 新規作成完了
- [ ] `complete-phase.js` S1〜S4 同値更新拡張完了
- [ ] `complete-phase.js` rollback 実装完了
- [ ] `verify-all-specs.js` parity 検証組込み完了
- [ ] `.agents/` ミラー同期完了（4 ファイル）
- [ ] Phase 4 の全テスト PASS 確認完了
- [ ] 既存テスト回帰確認完了
- [ ] `outputs/phase-5/implementation-summary.md` 出力完了
- [ ] `outputs/phase-5/changed-files.md` 出力完了

## 次Phase

Phase 6（テスト拡充）へ進む。
