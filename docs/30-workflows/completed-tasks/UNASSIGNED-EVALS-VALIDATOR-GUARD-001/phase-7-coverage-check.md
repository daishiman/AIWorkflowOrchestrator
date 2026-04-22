# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 7                                    |
| タスクID   | UNASSIGNED-EVALS-VALIDATOR-GUARD-001 |
| ステータス | pending                              |
| 作成日     | 2026-04-21                           |
| 前Phase    | 6: テスト拡充                        |
| 次Phase    | 8: リファクタリング                  |

---

## 目的

`validate-evals.js` が実施する L1/L2/L3 の3層検証について、各層のカバレッジと依存エッジを可視化する。
6スキル全件の実際の EVALS.json を対象に validator を実行し、全件 PASS であることを確認するとともに、
意図的なドリフト検出テストにより L3 guard が機能していることを証明する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### Step 1: L1/L2/L3 それぞれのカバレッジ確認

**目的**: 各検証レイヤーがカバーしているロジックの範囲を特定し、未カバー経路がないかを確認する

**実行手順**:

1. `validate-evals.js` のソースコードを読み、L1（JSON パース）・L2（必須キー検証）・L3（dual root 一致）に対応する処理ブロックをそれぞれ特定する
2. 各レイヤーでカバーしているケース（正常系・異常系）を一覧化する
3. 以下の観点でカバレッジの漏れがないかを確認する
   - L1: 不正JSON・空ファイル・文字コードエラー
   - L2: 必須キー欠損・両方言（`evaluations` / `evals`）の許容
   - L3: `.claude/` と `.agents/` の 6 スキル全件でのルート一致

**カバレッジ一覧表（記入例）**:

| レイヤー | ケース                          | カバー済み | 備考               |
| -------- | ------------------------------- | ---------- | ------------------ |
| L1       | 正常JSON パース                 |            |                    |
| L1       | 不正JSON（構文エラー）          |            |                    |
| L1       | 空ファイル                      |            |                    |
| L2       | 必須キー全揃い                  |            |                    |
| L2       | `evaluations` キー欠損          |            |                    |
| L2       | `evals` キー（別方言）で許容    |            |                    |
| L3       | `.claude/` vs `.agents/` 一致   |            | 6スキル全件        |
| L3       | `.claude/` vs `.agents/` 不一致 |            | ドリフト検出ケース |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の L1/L2/L3 カバレッジセクション

---

### Step 2: 6スキル全件の EVALS.json に対して validator を実行し全件 PASS を確認

**目的**: 現在の 6 スキルの EVALS.json が validator の要件を満たしていることを実証する

**実行手順**:

1. 以下のコマンドで validator を実行する

```bash
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js
```

2. 各スキルの検証結果（PASS / FAIL）を記録する
3. 1 件でも FAIL がある場合は原因を特定し、EVALS.json の修正または validator の許容ロジック修正を判断する

**全件 PASS 確認表（記入例）**:

| スキル名                   | L1  | L2  | L3  | 総合判定 |
| -------------------------- | --- | --- | --- | -------- |
| skill-fixture-runner       |     |     |     |          |
| skill-creator              |     |     |     |          |
| task-specification-creator |     |     |     |          |
| github-issue-manager       |     |     |     |          |
| aiworkflow-requirements    |     |     |     |          |
| claude-agent-sdk           |     |     |     |          |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の全件 PASS 確認セクション

---

### Step 3: 意図的にドリフトを作成し L3 で検出できるか確認

**目的**: `.agents/` 側の EVALS.json を一時的に改変し、L3 guard がドリフトを正しく検出することを確認する

**実行手順**:

1. 任意の 1 スキル（例: `skill-fixture-runner`）の `.agents/` 側 EVALS.json に意図的な差分を追加する
   - 例: エントリを 1 件追加、または既存エントリのキーを変更する
2. validator を再実行し、当該スキルの L3 チェックが FAIL することを確認する

```bash
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js
```

3. エラーメッセージの内容（スキル名・差分の説明）が適切であることを確認する
4. 改変を元に戻し（`git restore`）、再実行して全件 PASS に戻ることを確認する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の L3 ドリフト検出テストセクション

---

### Step 4: fixture EVALS が除外されていることの最終確認

**目的**: `__fixtures__/` ディレクトリ配下のサンプル EVALS.json が validator の対象から除外されていることを確認する

**実行手順**:

1. `validate-evals.js` のファイルスキャン対象ロジックを確認し、fixture パスが除外リストに含まれているかを確認する
2. fixture ディレクトリに意図的に不正な EVALS.json を配置した場合でも validator が PASS となることを確認する
3. 除外確認の結果を記録する

**除外確認の観点**:

| 確認項目                                                | 期待結果           |
| ------------------------------------------------------- | ------------------ |
| `__fixtures__/` 配下は validator のスキャン対象外である | 除外されている     |
| fixture に不正 JSON があっても validator は PASS        | PASS               |
| 実スキルの EVALS.json は全件スキャン対象である          | スキャンされている |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の fixture 除外確認セクション

---

### Step 5: 既存スクリプト5本の回帰確認

**目的**: `validate-evals.js` の追加により、既存の 5 本の検証スクリプトが引き続き正常動作することを確認する

**実行手順**:

1. 統合実行スクリプトから全スクリプトを一括実行する

```bash
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js
```

2. 以下の既存スクリプトそれぞれが PASS することを確認する

| スクリプト名                    | 期待結果 | 実際の結果 |
| ------------------------------- | -------- | ---------- |
| `validate-schemas.js`           | PASS     |            |
| `validate-skill-structure.js`   | PASS     |            |
| `validate-agent-spec.js`        | PASS     |            |
| `validate-skill-frontmatter.js` | PASS     |            |
| `run-all-validations.js`        | PASS     |            |

3. FAIL があった場合は原因を特定し、回帰が発生しているか新規バグかを判別する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の回帰確認セクション

---

## カバレッジ確認観点テーブル

| 懸念事項                                           | 検証方法                                             | 期待結果                                  |
| -------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| L1 が空ファイルをパースしてクラッシュしないか      | 空の EVALS.json を用意して validator を実行          | L1 エラーとして報告され、クラッシュしない |
| L2 が両方言（`evaluations` / `evals`）を許容するか | 各方言でダミーEVALS.jsonを作成して L2 チェックを実行 | どちらも PASS                             |
| L3 がゼロ差分を正しく「一致」と判定するか          | 実スキルで validator 実行（Step 2）                  | 全件 PASS                                 |
| L3 が 1 エントリ差分でドリフトを検出できるか       | Step 3 のドリフト注入テスト                          | 当該スキルの L3 が FAIL                   |
| fixture パスが誤って検証対象になっていないか       | Step 4 の fixture 除外確認                           | fixture は PASS（または対象外と明示）     |
| 既存スクリプトが新 validator の追加で壊れないか    | Step 5 の回帰確認（run-all-validations.js 一括実行） | 全 5 本 PASS                              |

---

## 参照資料

| 参照資料                     | パス                                                                 | 内容                                 |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| validator スクリプト         | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`      | L1/L2/L3 検証ロジック本体            |
| 統合実行スクリプト           | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js` | 全スクリプト一括実行エントリポイント |
| agents ミラー                | `.agents/skills/skill-fixture-runner/scripts/validate-evals.js`      | dual root の対になるファイル         |
| 6スキル EVALS.json（claude） | `.claude/skills/*/EVALS.json`                                        | L3 確認対象（実データ）              |
| 6スキル EVALS.json（agents） | `.agents/skills/*/EVALS.json`                                        | L3 確認対象（ミラー）                |

---

## 統合テスト連携

- Phase 5 / Phase 6 の実装・追加テストを入力として AC ごとの到達性を確認する
- Phase 10 では本 Phase の traceability を acceptance criteria 判定の根拠にする

## 成果物

| 成果物             | パス                                 | 内容                                                                                  |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | L1/L2/L3 カバレッジ表・全件 PASS 確認・ドリフト検出テスト・fixture 除外確認・回帰確認 |

---

## 完了条件

- [ ] L1/L2/L3 それぞれのカバレッジ（正常系・異常系）が一覧化されている
- [ ] 6スキル全件の EVALS.json に対して validator を実行し全件 PASS を確認している
- [ ] 意図的なドリフト注入テストで L3 guard が FAIL を正しく報告することを確認している
- [ ] fixture EVALS が validator のスキャン対象から除外されていることを確認している
- [ ] 既存スクリプト 5 本の回帰確認が完了し全件 PASS していることを確認している
- [ ] `outputs/phase-7/coverage-report.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/phase-8-refactoring.md`
