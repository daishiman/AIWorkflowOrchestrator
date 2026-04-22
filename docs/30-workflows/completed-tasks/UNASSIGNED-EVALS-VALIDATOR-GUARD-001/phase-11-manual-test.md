# Phase 11: 手動テスト検証

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 11                                               |
| 機能名       | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名     | skill-fixture-runner EVALS.json スキーマ検証追加 |
| タスク種別   | NON_VISUAL（UI/UX 変更なし）                     |
| 前提Phase    | Phase 10 PASS                                    |
| 後続Phase    | Phase 12                                         |
| 作成日       | 2026-04-21                                       |
| ステータス   | completed                                        |
| GitHub Issue | #2325（CLOSED）                                  |

## タスク種別判定

**NON_VISUAL タスク**: 本タスクは UI/UX 変更なし。Renderer 側に新規 UI を追加せず、変更対象は CLI スクリプト群（`validate-evals.js` / `run-all-validations.js`）と reference/markdown のみ。スクリーンショット取得は **不要**。

---

## 目的

実装が完了した EVALS.json スキーマ検証機能一式（`validate-evals.js` / `run-all-validations.js` 統合 / fixture 除外 allowlist / SKILL.md 更新）を、自動テストでは網羅しきれない CLI 操作の手触りで確認する。具体的には以下を確定する:

- AC-001〜AC-007 を実 CLI 実行で再現できる
- L1/L2/L3 の各失敗モードに対し exit code・エラーメッセージが契約通りに返る
- fixture EVALS.json が検証対象外であることを CLI で確認できる
- `run-all-validations.js` 統合実行で新 validator が PASS/FAIL に正しく寄与する
- SKILL.md の手順通りに実行できることを確認する
- UI/UX 変更がないことを `## 視覚証跡` で明記し Phase 12 へ NON_VISUAL ハンドオフする

---

## 実行タスク

1. NON_VISUAL 判定の根拠を `manual-test-result.md` に記録する
2. 検証環境セットアップ（validator パス確認、6 スキルの EVALS.json 存在確認）
3. MT-001〜MT-007 を順番に CLI 実行し、stdout / stderr / exit code を取得する
4. MT-005（fixture 除外）で allowlist の動作を CLI で観測する
5. MT-006（統合確認）で `run-all-validations.js` からの一括実行を観測する
6. MT-007（SKILL.md 手順確認）で記載通りの手順で実行できることを確認する
7. シナリオ結果を `manual-test-result.md` に集約する
8. 発見した HIGH 問題を Phase 12 の `unassigned-task-detection.md` 候補として記録する

---

## 参照資料

### 実装・コード

| 資料名                         | パス                                                                 | 用途                              |
| ------------------------------ | -------------------------------------------------------------------- | --------------------------------- |
| Phase 10 最終レビュー結果      | `outputs/phase-10/final-review-result.md`                            | Phase 11 着手条件                 |
| validate-evals.js（新規）      | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`      | 手動 CLI 実行対象                 |
| run-all-validations.js（拡張） | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js` | 統合実行確認対象                  |
| SKILL.md                       | `.claude/skills/skill-fixture-runner/SKILL.md`                       | fixture 除外方針・手順確認        |
| Phase 1 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                             | AC-001〜AC-007 のトレース元       |
| Phase 4 テスト fixture         | `.claude/skills/skill-fixture-runner/scripts/__tests__/fixtures/`    | 手動テストで再利用する fixture 群 |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                        | 用途                         |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------- |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | current facts 反映状況の確認 |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲートの受入条件         |

---

## 実行手順

### 0. 検証環境セットアップ

```bash
# 対象 skills ディレクトリ確認
ls .claude/skills/skill-fixture-runner/scripts/validate-evals.js
ls .claude/skills/skill-fixture-runner/scripts/run-all-validations.js

# 6 スキルの EVALS.json 存在確認
ls .claude/skills/*/EVALS.json

# fixture パス確認
ls .claude/skills/skill-fixture-runner/scripts/__tests__/fixtures/

# Node 実行確認
node --version
```

### MT-001: 正常系 - 6スキル全件でexit 0

**手順**:

```bash
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  --all-skills
echo "exit=$?"
```

**期待結果**:

- stdout に検証 PASS サマリを含む人間可読出力
- 6 スキル全件が PASS と表示される
- `exit=0`

---

### MT-002: L1エラー系 - 破損JSONで exit 1

**手順**:

```bash
# 破損 JSON fixture を使用
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  --path ".claude/skills/skill-fixture-runner/scripts/__tests__/fixtures/broken-evals.json"
echo "exit=$?"
```

**期待結果**:

- `exit=1`
- stderr に `L1 JSON parse error` または同等のエラーメッセージを含む
- エラー箇所（ファイルパス）が明示される

---

### MT-003: L2エラー系 - 必須キー欠落で exit 1

**手順**:

```bash
# 必須キー欠落 fixture を使用
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  --path ".claude/skills/skill-fixture-runner/scripts/__tests__/fixtures/missing-keys-evals.json"
echo "exit=$?"
```

**期待結果**:

- `exit=1`
- stderr に `L2 required key missing` または同等のエラーメッセージを含む
- 欠落したキー名が明示される

---

### MT-004: L3エラー系 - .agents/側を差分化してexit 1

**手順**:

```bash
# .agents/ 側の EVALS.json を一時的に差分化
cp .agents/skills/skill-fixture-runner/EVALS.json /tmp/evals-backup.json
echo '{"modified": true}' >> .agents/skills/skill-fixture-runner/EVALS.json

node .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  --skill skill-fixture-runner --check-dual-root
echo "exit=$?"

# 元に戻す
mv /tmp/evals-backup.json .agents/skills/skill-fixture-runner/EVALS.json
```

**期待結果**:

- `exit=1`
- stderr に `L3 dual root drift` または同等のエラーメッセージを含む
- `.claude/` と `.agents/` の差分が明示される

---

### MT-005: fixture 除外確認 - fixture EVALS.jsonが検証対象外

**手順**:

```bash
# allowlist に含まれる fixture パスを直接渡した場合の動作確認
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  --all-skills --verbose
echo "exit=$?"

# fixture ディレクトリが検証対象外であることを確認
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  --path ".claude/skills/skill-fixture-runner/scripts/__tests__/fixtures/" \
  --check-excluded
echo "exit=$?"
```

**期待結果**:

- `--all-skills` 実行時に fixture ディレクトリ内の EVALS.json がスキップされること
- fixture が除外されていることが verbose ログに表示される
- `exit=0`（fixture を含めても全体判定に影響しない）

---

### MT-006: 統合確認 - run-all-validations.js から一括実行

**手順**:

```bash
# 統合バリデーション実行（EVALS validator が含まれることを確認）
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
  --target .claude/skills/skill-fixture-runner
echo "exit=$?"

# `.agents` 側を一時差分化して FAIL が伝播することを確認
cp .agents/skills/skill-fixture-runner/EVALS.json /tmp/skill-fixture-runner-EVALS.json
printf '{\"drifted\":true}\n' > .agents/skills/skill-fixture-runner/EVALS.json
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
  --target .claude/skills/skill-fixture-runner
echo "exit=$?"
mv /tmp/skill-fixture-runner-EVALS.json .agents/skills/skill-fixture-runner/EVALS.json
```

**期待結果**:

- 正常系: 全 validator（EVALS 含む）が PASS で `exit=0`
- エラー系: EVALS validator の FAIL が全体 FAIL（`exit≠0`）に伝播する
- run-all-validations.js の出力に `validate-evals` が含まれる

---

### MT-007: SKILL.md の手順通りに実行できること

**手順**:

```bash
# SKILL.md に記載された実行手順を確認
cat .claude/skills/skill-fixture-runner/SKILL.md | grep -A 20 "validate-evals"

# SKILL.md 記載の手順通りに実行
# （SKILL.md に記載のコマンドをここに転記して実行）
```

**期待結果**:

- SKILL.md に `validate-evals.js` の実行手順が明記されている
- SKILL.md 記載のコマンドがそのまま動作する
- fixture 除外 allowlist の説明が SKILL.md に存在する
- `exit=0`（正常系手順の場合）

---

## 3層評価

| 評価層   | 内容                                                                      | 結果               |
| -------- | ------------------------------------------------------------------------- | ------------------ |
| Semantic | validator の exit code / エラーメッセージが L1/L2/L3 契約通りで誤検出なし | {{Phase 11で記録}} |
| Visual   | NON_VISUAL タスクのため N/A（UI/UX 変更なし）                             | N/A                |
| AI UX    | エラーメッセージの phase/key/path が運用者にとって読みやすい              | {{Phase 11で記録}} |

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`

`outputs/phase-11/screenshots/` ディレクトリは作成しない（作成する場合は `.gitkeep` のみとし、no-op 根拠を `manual-test-result.md` に明記する）。

---

## Preload API / 型定義テスト

NON_VISUAL タスクのため該当なし。Renderer 側 API / Preload / 型定義への変更は行っていない。

---

## 発見した HIGH 問題の処理

Phase 11 で HIGH 問題が発見された場合は、`docs/30-workflows/unassigned-task/` に指示書を作成し、Phase 12 の `unassigned-task-detection.md` から参照する。EVALS validator 関連の HIGH 問題は遡及修正タスクではなく、**validator 自体の bugfix** として登録する。

---

## 統合テスト連携

- Phase 2 の CLI 契約を正本として再現コマンドを実行する
- Phase 5 / 6 / 7 / 8 / 9 の成果物を手動再検証のチェック対象に含める
- Phase 12 は本 Phase の `manual-test-result.md` を primary evidence として参照する

## 成果物

- `outputs/phase-11/manual-test-result.md`: MT-001〜MT-007 の実行結果（stdout / stderr / exit code・観測値・期待値の対比）

---

## 完了条件

- [ ] MT-001〜MT-007 のすべてが CLI 実行され、結果が `manual-test-result.md` に記録されている
- [ ] AC-001〜AC-007 のすべてが PASS / N-A 判定されている
- [ ] HIGH 問題が存在しないか、存在する場合は `unassigned-task/` に記録されている
- [ ] `## 視覚証跡` セクションに「UI/UX変更なしのため Phase 11 スクリーンショット不要」が明記されている
- [ ] fixture 除外確認（MT-005）と SKILL.md 手順確認（MT-007）の結果が記録されている
- [ ] `run-all-validations.js` 統合実行（MT-006）の PASS/FAIL 寄与が記録されている

---

## タスク100%実行確認【必須】

- [ ] 検証環境セットアップ完了（validator パス / 6 スキル EVALS.json 確認）
- [ ] MT-001（正常系 / 6スキル全件 exit 0）確認完了
- [ ] MT-002（L1 破損 JSON / exit 1）確認完了
- [ ] MT-003（L2 必須キー欠落 / exit 1）確認完了
- [ ] MT-004（L3 dual root ドリフト / exit 1）確認完了
- [ ] MT-005（fixture 除外 allowlist 動作）確認完了
- [ ] MT-006（run-all-validations.js 統合実行）確認完了
- [ ] MT-007（SKILL.md 手順通り実行）確認完了
- [ ] `manual-test-result.md` 出力完了

---

## 次Phase

Phase 12（ドキュメント更新）へ進む。
