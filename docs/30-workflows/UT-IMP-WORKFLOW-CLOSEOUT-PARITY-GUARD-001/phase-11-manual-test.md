# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 11                                        |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | Phase 10 PASS                             |
| 後続Phase  | Phase 12                                  |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## タスク種別判定

**NON_VISUAL タスク**: 本タスクは UI/UX 変更なし。Renderer 側に新規 UI を追加せず、変更対象は CLI スクリプト群（`validate-closeout-parity.js` / `complete-phase.js` / `verify-all-specs.js`）と reference/markdown のみ。スクリーンショット取得は **不要**。

## 目的

実装が完了した close-out parity guard 一式（validator / `complete-phase.js` 拡張 / `verify-all-specs.js` 組込み / `phase-12-completion-checklist.md` 連携）を、自動テストでは網羅しきれない CLI 操作の手触りで確認する。具体的には以下を確定する:

- AC-1〜AC-7 を実 CLI 実行で再現できる
- drift / 欠損 / 不正値の各失敗モードに対し終了コード・JSON レポートが契約通りに返る
- `complete-phase.js` の atomic 書き込みと rollback が CLI 操作で観測できる
- `verify-all-specs.js` 統合実行で parity 検証が PASS/FAIL に正しく寄与する
- UI/UX 変更がないことを `## 視覚証跡` で明記し Phase 12 へ NON_VISUAL ハンドオフする

## 実行タスク

1. NON_VISUAL 判定の根拠を `manual-test-result.md` に記録する
2. 検証環境セットアップ（fixture workflow ディレクトリ準備、validator パス確認）
3. シナリオ 1〜6 を順番に CLI 実行し、stdout / stderr / exit code を取得する
4. `complete-phase.js` の atomic / rollback シナリオを CLI で観測する
5. `verify-all-specs.js` 統合実行を CLI で観測する
6. シナリオ結果を `manual-test-result.md` に集約し、`manual-test-checklist.md` で各 AC へのトレースを残す
7. 発見した HIGH 問題を Phase 12 の `unassigned-task-detection.md` 候補として記録する

## 参照資料

### 実装・コード

| 資料名                           | パス                                                                                    | 用途                              |
| -------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 10 最終レビュー結果        | `outputs/phase-10/final-review-result.md`                                               | Phase 11 着手条件                 |
| Phase 9 品質保証結果             | `outputs/phase-9/quality-assurance-report.md`                                           | テストカバレッジ・欠陥状況の確認  |
| validate-closeout-parity（新規） | `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js`         | 手動 CLI 実行対象                 |
| complete-phase（拡張）           | `.claude/skills/task-specification-creator/scripts/complete-phase.js`                   | atomic / rollback 観測対象        |
| verify-all-specs（拡張）         | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                 | parity gate 統合実行対象          |
| Phase 1 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`                                                | AC-1〜AC-7 のトレース元           |
| Phase 4 テスト fixture           | `.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/` | 手動テストで再利用する fixture 群 |
| 出荷準備チェックリスト           | `outputs/phase-10/shipping-checklist.md`                                                | Phase 10 成果物                   |

### システム仕様（aiworkflow-requirements）

| 資料名                  | パス                                                                                   | 用途                                 |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | current facts 反映状況の確認         |
| task-workflow-phases    | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`            | Phase 12 close-out との接続契約      |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                  | エラー分類コードの正本               |
| quality-requirements    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`            | 品質ゲートの受入条件                 |
| lessons-learned-current | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md` | L-CLOSEOUT-PARITY-001 の追記済み確認 |

## 実行手順

### 0. 検証環境セットアップ

```bash
# 対象 workflow ディレクトリ（自タスク自身）
WORKFLOW_DIR="docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001"

# fixture（正常 / drift / 欠損 / 不正値）パス
FIXTURE_OK="$(pwd)/.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/ok"
FIXTURE_DRIFT="$(pwd)/.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/drift"
FIXTURE_MISSING="$(pwd)/.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/missing"
FIXTURE_INVALID="$(pwd)/.claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/invalid"

# Node 実行確認
node --version
ls .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js
```

### 1. シナリオ 1: 正常系（PARITY_OK / AC-1）

**手順**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow "$FIXTURE_OK"
echo "exit=$?"
```

**期待結果**:

- stdout に `PARITY_OK` を含む人間可読サマリ
- `exit=0`

### 2. シナリオ 2: drift 検出（PARITY_DRIFT / AC-1, AC-2）

**手順**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow "$FIXTURE_DRIFT" --json
echo "exit=$?"
```

**期待結果**:

- `exit=1`
- JSON に `code: "PARITY_DRIFT"`, `drifts[].phase`, `drifts[].sources.{S1,S2,S3,S4}`, `drifts[].expected` の 4 項が揃う
- `severity` が `error` であること

### 3. シナリオ 3: 欠損検出（MISSING_SOURCE / AC-1）

**手順**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow "$FIXTURE_MISSING" --json
echo "exit=$?"
```

**期待結果**:

- `exit=2`
- JSON に `code: "MISSING_SOURCE"`, `missing.source ∈ {S1,S2,S3,S4}`, `missing.reason`

### 4. シナリオ 4: 不正値検出（INVALID_STATUS_VALUE / AC-1）

**手順**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow "$FIXTURE_INVALID" --json
echo "exit=$?"
```

**期待結果**:

- `exit=3`
- JSON に `code: "INVALID_STATUS_VALUE"`, `invalid.phase`, `invalid.source`, `invalid.value`
- `value` が許可列挙（`pending`/`in_progress`/`completed`/`blocked`、S1 のみ `-`）外であること

### 5. シナリオ 5: complete-phase.js の atomic / rollback（AC-4）

**手順**:

```bash
# atomic 書き込み確認（PARITY_OK へ収束する Phase に対して実行）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "$WORKFLOW_DIR" --phase 11
echo "exit=$?"
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow "$WORKFLOW_DIR"

# rollback 観測（drift fixture を一時的に対象として実行し、validator FAIL → 3 ファイル復旧を確認）
cp -R "$FIXTURE_DRIFT" /tmp/closeout-parity-rollback-test
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow /tmp/closeout-parity-rollback-test --phase 5 || echo "rollback triggered"
diff -r "$FIXTURE_DRIFT" /tmp/closeout-parity-rollback-test
```

**期待結果**:

- 正常系: 1 コマンドで `index.md` / root `artifacts.json` / `outputs/artifacts.json` / `phase-N-*.md` frontmatter の 4 源が同値更新され、その後の validator が `PARITY_OK / exit=0`
- rollback 系: validator FAIL を内部検出し、書き込み前の状態（`diff -r` で差分なし）に巻き戻ること
- parity bypass 用の未知フラグを渡さないこと。未知フラグは usage error として reject されること

### 6. シナリオ 6: verify-all-specs.js 統合実行（AC-3）

**手順**:

```bash
# parity OK の workflow を含めた統合実行
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js
echo "exit=$?"

# parity NG の fixture を一時投入して統合 PASS が抑止されることを確認
cp -R "$FIXTURE_DRIFT" docs/30-workflows/__manual-test-drift-tmp__
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js
echo "exit=$?"
rm -rf docs/30-workflows/__manual-test-drift-tmp__
```

**期待結果**:

- parity OK セット: 既存の構造/整合性/品質/完全性検証 + parity が全て PASS で `exit=0`
- parity NG セット: 既存検証が全て PASS であっても、parity drift により全体が FAIL（`exit≠0`）に格上げされる
- JSON レポート（出力する場合）に `parity` フィールドが含まれる（後方互換のため optional）

### 7. checklist ゲート文言の確認（AC-5）

```bash
rg -n "validate-closeout-parity|PARITY_OK" \
  .claude/skills/task-specification-creator/references/phase-12-completion-checklist.md
```

**期待結果**:

- 【初手チェック】に `validate-closeout-parity.js --workflow <workflow-path>` が PASS / `exit=0` であることの確認項目が存在
- artifacts.json 二重管理チェックが手動から validator 実行へ置換済み
- PARITY_DRIFT で Phase 12 PASS にしない記述が存在

### 8. 教訓還流の確認（AC-6）

```bash
# task-specification-creator
rg -n "close-out parity|validate-closeout-parity|L-CLOSEOUT-PARITY-001" \
  .claude/skills/task-specification-creator/{SKILL.md,LOGS.md,references}
# aiworkflow-requirements
rg -n "close-out parity|validate-closeout-parity|L-CLOSEOUT-PARITY-001" \
  .claude/skills/aiworkflow-requirements/{SKILL.md,LOGS.md,references}
# .agents ミラー
rg -n "close-out parity|validate-closeout-parity|L-CLOSEOUT-PARITY-001" .agents/skills/
```

**期待結果**:

- 両 skill の `SKILL.md` 変更履歴 / `LOGS.md` / 該当 reference / `.agents/` ミラーすべてに current facts が反映済み

### 9. 既存完了 workflow 非変更の確認（AC-7）

```bash
git status --porcelain docs/30-workflows/completed-tasks/
```

**期待結果**: 出力 0 行（完了済み workflow への遡及修正なし）。`drift-inventory.md` は baseline として残置。

## 3層評価

| 評価層   | 内容                                                                          | 結果               |
| -------- | ----------------------------------------------------------------------------- | ------------------ |
| Semantic | validator の exit code / JSON code が契約通りで PARITY_DRIFT を取りこぼさない | {{Phase 11で記録}} |
| Visual   | NON_VISUAL タスクのため N/A（UI/UX 変更なし）                                 | N/A                |
| AI UX    | drift レポートの phase/source/expected/actual が運用者にとって読みやすい      | {{Phase 11で記録}} |

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`outputs/phase-11/screenshots/` ディレクトリは作成しない（作成する場合は `.gitkeep` のみとし、no-op 根拠を `manual-test-result.md` に明記する）。

## 統合テスト連携

- SubAgent-A: シナリオ 1〜4 の CLI 実行ログを採取し、JSON スキーマ整合を確認する
- SubAgent-B: シナリオ 5（complete-phase atomic / rollback）の差分計測を担当
- SubAgent-C: シナリオ 6（verify-all-specs 統合）の PASS/FAIL 寄与を確認
- SubAgent-D: AC-1〜AC-7 とシナリオ結果のトレース一覧を `manual-test-checklist.md` に固定

## 発見した HIGH 問題の処理

Phase 11 で HIGH 問題が発見された場合は、`docs/30-workflows/unassigned-task/` に指示書を作成し、Phase 12 の `unassigned-task-detection.md` から参照する。drift 関連の HIGH 問題は遡及修正タスクではなく、**guard 自体の bugfix** として登録する（既存 workflow の遡及修正は AC-7 に基づき本タスク範囲外）。

## 成果物

- `outputs/phase-11/manual-test-result.md`: シナリオ 1〜6 の実行結果（stdout / stderr / exit code・観測値・期待値の対比）
- `outputs/phase-11/manual-test-checklist.md`: AC-1〜AC-7 と各シナリオのトレース一覧（PASS/FAIL/N-A の判定）

## 完了条件

- [ ] シナリオ 1〜6 のすべてが CLI 実行され、結果が `manual-test-result.md` に記録されている
- [ ] AC-1〜AC-7 のすべてが `manual-test-checklist.md` で PASS / N-A 判定されている
- [ ] HIGH 問題が存在しないか、存在する場合は `unassigned-task/` に記録されている
- [ ] `## 視覚証跡` セクションに「UI/UX変更なしのため Phase 11 スクリーンショット不要」が明記されている
- [ ] checklist ゲート文言（AC-5）と教訓還流（AC-6）の確認結果が記録されている
- [ ] 既存完了 workflow への遡及修正が 0 件である（AC-7）

## タスク100%実行確認【必須】

- [ ] 検証環境セットアップ完了（fixture / validator パス確認）
- [ ] シナリオ 1（PARITY_OK）確認完了
- [ ] シナリオ 2（PARITY_DRIFT）確認完了
- [ ] シナリオ 3（MISSING_SOURCE）確認完了
- [ ] シナリオ 4（INVALID_STATUS_VALUE）確認完了
- [ ] シナリオ 5（complete-phase atomic / rollback）確認完了
- [ ] シナリオ 6（verify-all-specs 統合）確認完了
- [ ] checklist ゲート文言確認（AC-5）完了
- [ ] 教訓還流確認（AC-6）完了
- [ ] 既存完了 workflow 非変更確認（AC-7）完了
- [ ] `manual-test-result.md` / `manual-test-checklist.md` 出力完了

## 次Phase

Phase 12（ドキュメント更新）へ進む。
