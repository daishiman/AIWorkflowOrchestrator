# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | Phase 5 完了（TDD Green）                 |
| 後続Phase  | Phase 7                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 4 で未カバーの AC-3（`verify-all-specs.js` 組込み E2E）・AC-5（`phase-12-completion-checklist.md` 連携）・AC-7（既存完了 workflow の遡及修正なし）を検証する拡張テストを追加する。drift の境界条件・fail path・補助コマンドの回帰ガードを網羅し、本 guard の運用信頼性を確立する。

## 実行タスク

1. `verify-all-specs.js` の E2E 統合テストを追加する（AC-3）
2. `phase-12-completion-checklist.md` 連携テストを追加する（AC-5）
3. 既存完了 workflow が遡及修正されないことの回帰テストを追加する（AC-7）
4. drift の境界条件テストを追加する（S4 のみ / 2 ソース / 全ソース）
5. parity bypass 用の未知フラグが usage error で reject されることのテストを追加する
6. 全テスト実行で TC-P-01〜TC-P-17 / TC-C-01〜TC-C-07 と新規 TC-E-01〜TC-E-12 が全 PASS であることを確認する

## 追加テストケース

### E2E: verify-all-specs 組込みテスト（AC-3）

**ファイルパス**: `.claude/skills/task-specification-creator/scripts/__tests__/verify-all-specs.parity.test.js`

| テストケース | fixture                             | シナリオ                                    | 期待結果                                                        |
| ------------ | ----------------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| TC-E-01      | FX-01（normal）                     | `verify-all-specs --workflow <fx>` を実行   | 既存 4 検証 + parity 全て PASS、exit 0                          |
| TC-E-02      | FX-02（partial-drift-s1）           | 同上                                        | 既存 4 検証 PASS でも parity FAIL で全体 FAIL、exit 非 0        |
| TC-E-03      | FX-06（full-drift）                 | 同上                                        | 全体 FAIL、JSON レポートに `parity.driftCount >= 1`             |
| TC-E-04      | FX-07（missing-s2）                 | 同上                                        | 全体 FAIL、JSON レポートに `parity.code = MISSING_SOURCE`       |
| TC-E-05      | FX-09（invalid-status）             | 同上                                        | 全体 FAIL、JSON レポートに `parity.code = INVALID_STATUS_VALUE` |
| TC-E-06      | FX-01                               | JSON レポートの `parity` フィールド存在確認 | `report.parity` オブジェクトが含まれる                          |
| TC-E-07      | 既存 consumer 模擬（parity 非認識） | JSON レポート読み取り時に破壊しない         | 旧 consumer が `parity` 以外のフィールドで動作継続              |

### AC-5: phase-12-completion-checklist 連携テスト

**ファイルパス**: `.claude/skills/task-specification-creator/scripts/__tests__/checklist-gate.parity.test.js`

| テストケース | シナリオ                                                                                       | 期待結果                                                         |
| ------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| TC-E-08      | `phase-12-completion-checklist.md` に `validate-closeout-parity.js` のコマンド文字列が含まれる | 文字列 `validate-closeout-parity.js --workflow` が1回以上マッチ  |
| TC-E-09      | `phase-12-completion-checklist.md` に `PARITY_OK` を必須条件とする文言が含まれる               | 文字列 `PARITY_OK` が含まれる                                    |
| TC-E-10      | `phase-12-completion-checklist.md` に parity bypass を認めない文言が含まれる                   | 「bypass なし」または「未知のフラグは reject」の趣旨が確認できる |

### AC-7: 既存完了 workflow 遡及修正なし回帰テスト

**ファイルパス**: `.claude/skills/task-specification-creator/scripts/__tests__/no-retroactive-modification.parity.test.js`

| テストケース | シナリオ                                                                                                                         | 期待結果                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| TC-E-11      | `docs/30-workflows/completed-tasks/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001/` を `validate-closeout-parity.js` で実行 | exit 0 または exit 1 のいずれでも、実行後のファイル mtime が変化しない |
| TC-E-12      | Phase 1 の `drift-inventory.md` に記録された baseline と本 Phase での再観測結果が一致する                                        | baseline 一致（既存 drift が観測範囲から増減しない）                   |

### drift 境界条件テスト（TC-P シリーズ拡張）

`validate-closeout-parity.test.js` に以下を追加する。

| テストケース | fixture                     | シナリオ                                              | 期待結果                                              |
| ------------ | --------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| TC-P-18      | 新規 `two-drift-s1-s2/`     | S1=pending, S2=pending, S3=completed, S4=completed    | `PARITY_DRIFT` / drifts[].phase が S1/S2 の差異を示す |
| TC-P-19      | 新規 `s4-only-drift/`       | S1=completed, S2=completed, S3=completed, S4=pending  | `PARITY_DRIFT` / 差異が S4 のみ示される               |
| TC-P-20      | 新規 `mixed-across-phases/` | Phase 1 は全一致、Phase 5 は drift、Phase 12 は drift | `drifts[].length === 2`、phase 番号 1 は含まない      |

### escape hatch 回帰テスト（TC-C シリーズ拡張）

`complete-phase.parity.test.js` に以下を追加する。

| テストケース | シナリオ                                            | 期待結果                                         |
| ------------ | --------------------------------------------------- | ------------------------------------------------ |
| TC-C-08      | 未知のフラグ `--skip-parity-check` を付与           | usage error、書き込み開始前に終了                |
| TC-C-09      | rollback 中にファイル書き込み失敗（権限エラー模擬） | stderr に `ROLLBACK_FAILED` が出力され exit 非 0 |
| TC-C-10      | rollback failure 後に drift が残る                  | 失敗ソースと未復旧ソースがレポートに記録される   |

### 回帰ガード

```bash
# Phase 6 完了後の全テスト実行（新旧テスト全網羅）
node --test .claude/skills/task-specification-creator/scripts/__tests__/validate-closeout-parity.test.js
node --test .claude/skills/task-specification-creator/scripts/__tests__/complete-phase.parity.test.js
node --test .claude/skills/task-specification-creator/scripts/__tests__/verify-all-specs.parity.test.js
node --test .claude/skills/task-specification-creator/scripts/__tests__/checklist-gate.parity.test.js
node --test .claude/skills/task-specification-creator/scripts/__tests__/no-retroactive-modification.parity.test.js

# 既存テストが引き続きグリーンであること
node --test .claude/skills/task-specification-creator/scripts/__tests__/validate-phase-output.test.js
node --test .claude/skills/task-specification-creator/scripts/__tests__/verify-all-specs.test.js
```

## AC 対応表

| AC   | 対応テストケース            | 検証内容                                                               |
| ---- | --------------------------- | ---------------------------------------------------------------------- |
| AC-3 | TC-E-01〜TC-E-07            | `verify-all-specs.js` 組込み E2E / drift で PASS 抑止 / 後方互換       |
| AC-5 | TC-E-08 / TC-E-09 / TC-E-10 | checklist にコマンド文字列 / `PARITY_OK` / bypass 不許可方針が含まれる |
| AC-7 | TC-E-11 / TC-E-12           | 既存 workflow 無修正 / baseline 一致                                   |
| 境界 | TC-P-18 / TC-P-19 / TC-P-20 | 2 drift / S4 単独 drift / Phase 跨ぎ drift                             |
| 運用 | TC-C-08 / TC-C-09 / TC-C-10 | 未知フラグ reject / rollback 失敗時の振る舞い                          |

## 実行手順

1. `verify-all-specs.parity.test.js` を新規作成する（TC-E-01〜TC-E-07）
2. `checklist-gate.parity.test.js` を新規作成する（TC-E-08〜TC-E-10）
3. `no-retroactive-modification.parity.test.js` を新規作成する（TC-E-11〜TC-E-12）
4. `validate-closeout-parity.test.js` に TC-P-18〜TC-P-20 を追記し、対応 fixture（`two-drift-s1-s2/` / `s4-only-drift/` / `mixed-across-phases/`）を追加する
5. `complete-phase.parity.test.js` に TC-C-08〜TC-C-10 を追記する
6. 全テストを実行し全 PASS を確認する
7. 既存テストの回帰ガードを確認する
8. 拡張テスト結果ログを出力する

## 統合テスト連携

- SubAgent-A: TC-E-01〜TC-E-07 の verify-all-specs 組込み E2E テスト担当
- SubAgent-B: TC-E-08〜TC-E-10 の checklist 連携テスト担当
- SubAgent-C: TC-E-11〜TC-E-12 の回帰テストと TC-P-18〜TC-P-20 の境界テスト担当
- SubAgent-D: TC-C-08〜TC-C-10 の escape hatch テスト担当

## 参照資料

### 実装・コード

| 資料名                          | パス                                                                                     | 用途                             |
| ------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 4 test-spec               | `outputs/phase-4/test-spec.md`                                                           | 基底テストケース一覧             |
| Phase 5 implementation-summary  | `outputs/phase-5/implementation-summary.md`                                              | Green 化した実装の前提           |
| Phase 5 changed-files           | `outputs/phase-5/changed-files.md`                                                       | 本 Phase で回帰確認する変更範囲  |
| Phase 1 drift-inventory         | `outputs/phase-1/drift-inventory.md`                                                     | AC-7 の baseline 再観測対象      |
| 既存完了 workflow               | `docs/30-workflows/completed-tasks/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001/` | TC-E-11 の回帰対象               |
| validate-closeout-parity (新規) | `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js`          | E2E 呼び出し対象                 |
| verify-all-specs (拡張)         | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                  | 組込み E2E 呼び出し対象          |
| complete-phase (拡張)           | `.claude/skills/task-specification-creator/scripts/complete-phase.js`                    | escape hatch / rollback E2E 対象 |
| phase-12-completion-checklist   | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`  | AC-5 文字列マッチ対象            |
| TDD Red確認ログ                 | `outputs/phase-4/tdd-red-results.md`                                                     | Phase 4 成果物                   |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                                   | 用途                         |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------------- |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | current facts 確認           |
| task-workflow-phases | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`            | Phase 12 連携契約            |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`            | 回帰ガード・拡充観点         |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md` | L-CLOSEOUT-PARITY-001 反映先 |

## 多角的チェック観点（AIが判断）

| 観点       | チェック内容                                                                         |
| ---------- | ------------------------------------------------------------------------------------ |
| 網羅性     | drift の 4 源それぞれが単独 / 2 組 / 全組の境界で検証されているか                    |
| 副作用     | E2E テストが `docs/30-workflows/` の実ファイルを書き換えていないか                   |
| 後方互換   | 既存 `verify-all-specs` consumer が `parity` フィールド追加で破綻しないか            |
| 運用性     | parity bypass 用の未知フラグが reject され、rollback failure が観測可能か            |
| ゲート連動 | `phase-12-completion-checklist.md` の文言変更が次回 close-out で自動チェックされるか |
| 既存回帰   | `validate-phase-output.test.js` / `verify-all-specs.test.js` が PASS 継続か          |

## 成果物

- `.claude/skills/task-specification-creator/scripts/__tests__/verify-all-specs.parity.test.js`（コード成果物: outputs 外）
- `.claude/skills/task-specification-creator/scripts/__tests__/checklist-gate.parity.test.js`（コード成果物: outputs 外）
- `.claude/skills/task-specification-creator/scripts/__tests__/no-retroactive-modification.parity.test.js`（コード成果物: outputs 外）
- 拡張された `validate-closeout-parity.test.js`（TC-P-18〜TC-P-20 追加）
- 拡張された `complete-phase.parity.test.js`（TC-C-08〜TC-C-10 追加）
- 新規 fixture: `.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/{two-drift-s1-s2,s4-only-drift,mixed-across-phases}/`
- `outputs/phase-6/extended-test-cases.md`: 拡張テストケース一覧と全テスト実行ログ

## 完了条件

- [ ] TC-E-01〜TC-E-12 が全て実装され PASS している
- [ ] TC-P-18〜TC-P-20 が追加され PASS している
- [ ] TC-C-08〜TC-C-10 が追加され PASS している
- [ ] 新規 fixture 3 種（`two-drift-s1-s2/` / `s4-only-drift/` / `mixed-across-phases/`）が追加されている
- [ ] 既存完了 workflow（`UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001`）のファイル mtime が実行前後で変化していない
- [ ] `phase-12-completion-checklist.md` 連携テスト（AC-5）が PASS している
- [ ] Phase 1 の `drift-inventory.md` baseline と TC-E-12 の再観測結果が一致している
- [ ] 既存テスト（`validate-phase-output.test.js` 等）が PASS 継続
- [ ] `outputs/phase-6/extended-test-cases.md` が出力されている

## タスク100%実行確認【必須】

- [ ] AC-3 E2E テスト（TC-E-01〜TC-E-07）追加完了
- [ ] AC-5 checklist 連携テスト（TC-E-08〜TC-E-10）追加完了
- [ ] AC-7 回帰テスト（TC-E-11〜TC-E-12）追加完了
- [ ] 境界条件テスト（TC-P-18〜TC-P-20）追加完了
- [ ] escape hatch テスト（TC-C-08〜TC-C-10）追加完了
- [ ] 新規 fixture 3 種追加完了
- [ ] 全テスト PASS 確認完了
- [ ] 既存テスト回帰確認完了
- [ ] `outputs/phase-6/extended-test-cases.md` 出力完了

## 次Phase

Phase 7（カバレッジ確認）へ進む。
