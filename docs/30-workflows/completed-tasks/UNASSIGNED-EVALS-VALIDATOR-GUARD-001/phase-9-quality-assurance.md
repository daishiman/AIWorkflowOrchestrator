# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 9                                    |
| タスクID   | UNASSIGNED-EVALS-VALIDATOR-GUARD-001 |
| ステータス | pending                              |
| 作成日     | 2026-04-21                           |
| 前Phase    | 8: リファクタリング                  |
| 次Phase    | 10: 最終レビュー                     |

---

## 目的

line budget / リンク / mirror parity の一括判定を行い、`validate-evals.js` を含むスクリプト群が
品質基準を全て満たしていることを保証する。後続タスク向けの JSON 出力インターフェースの安定性も確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### Step 1: コードライン数の確認（validate-evals.js が肥大化していないか）

**目的**: `validate-evals.js` のコード行数が許容範囲内であることを確認し、肥大化していれば分割を検討する

**実行手順**:

1. 以下のコマンドでスクリプト群のライン数を確認する

```bash
wc -l .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
       .claude/skills/skill-fixture-runner/scripts/validate-schemas.js \
       .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js \
       .claude/skills/skill-fixture-runner/scripts/validate-agent-spec.js \
       .claude/skills/skill-fixture-runner/scripts/validate-skill-frontmatter.js \
       .claude/skills/skill-fixture-runner/scripts/run-all-validations.js
```

2. 以下の基準で評価する

| スクリプト名                    | ライン数上限 | 実測値 | 判定 |
| ------------------------------- | ------------ | ------ | ---- |
| `validate-evals.js`             | 200行以内    |        |      |
| `validate-schemas.js`           | 200行以内    |        |      |
| `validate-skill-structure.js`   | 200行以内    |        |      |
| `validate-agent-spec.js`        | 200行以内    |        |      |
| `validate-skill-frontmatter.js` | 200行以内    |        |      |
| `run-all-validations.js`        | 100行以内    |        |      |

3. 上限を超えている場合は分割または共通化を検討し、対応方針を記録する

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の line budget セクション

---

### Step 2: SKILL.md のリンク確認（追記した実行手順のリンク切れなし）

**目的**: `validate-evals.js` の実行手順を追記した SKILL.md 内のリンクが全て有効であることを確認する

**実行手順**:

1. `skill-fixture-runner` の SKILL.md を読み、`validate-evals.js` に関連する追記箇所を特定する
2. SKILL.md 内に記載されているファイルパス・スクリプトパスが実際に存在することを確認する

```bash
# パス参照の実在確認（例）
ls .claude/skills/skill-fixture-runner/scripts/validate-evals.js
ls .agents/skills/skill-fixture-runner/scripts/validate-evals.js
```

3. 外部リンク（URL 形式）がある場合は到達可能かを確認する
4. リンク切れが見つかった場合は SKILL.md を修正する

**リンク確認表**:

| 確認対象                        | パス / URL                                  | 存在確認 |
| ------------------------------- | ------------------------------------------- | -------- |
| validate-evals.js（.claude 側） | `.claude/skills/.../validate-evals.js`      |          |
| validate-evals.js（.agents 側） | `.agents/skills/.../validate-evals.js`      |          |
| run-all-validations.js          | `.claude/skills/.../run-all-validations.js` |          |
| （SKILL.md に記載のその他パス） |                                             |          |

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のリンク確認セクション
- 修正済み SKILL.md（リンク切れがあった場合のみ）

---

### Step 3: `.claude/` vs `.agents/` の mirror parity 確認（`diff -u` でゼロ差分）

**目的**: `.claude/` と `.agents/` のスクリプト群がバイト単位で一致しており、ゼロ差分であることを確認する

**実行手順**:

1. 以下の diff コマンドを実行し、出力を確認する

```bash
diff -u .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
       .agents/skills/skill-fixture-runner/scripts/validate-evals.js

diff -u .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js \
       .agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js

diff -u .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
       .agents/skills/skill-fixture-runner/scripts/run-all-validations.js
```

2. 差分が出力された場合は、`.claude/` 側を正本として `.agents/` 側を更新する
3. 更新後に再度 diff を取り、全ファイルでゼロ差分であることを確認する

**mirror parity 確認表**:

| スクリプト名                  | diff 結果           | 対応内容 |
| ----------------------------- | ------------------- | -------- |
| `validate-evals.js`           | ゼロ差分 / 差分あり |          |
| `validate-skill-structure.js` | ゼロ差分 / 差分あり |          |
| `run-all-validations.js`      | ゼロ差分 / 差分あり |          |

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の mirror parity セクション
- 更新済み `.agents/` スクリプト群（差分があった場合のみ）

---

### Step 4: `run-all-validations.js` からの統合実行 exit code 確認

**目的**: `run-all-validations.js` を実行したときに、全スクリプトが PASS した場合は exit code 0、
1 件でも FAIL した場合は exit code 1 が返されることを確認する

**実行手順**:

1. 正常系（全スクリプト PASS）での exit code を確認する

```bash
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js
echo "exit code: $?"
```

2. 異常系（いずれかのスクリプトが FAIL）での exit code を確認する
   - 任意のスキルの EVALS.json に意図的な不正を加えてから実行する
   - FAIL 時に exit code 1 が返されることを確認する
   - 確認後は元に戻す（`git restore`）

3. exit code の動作を記録する

| ケース                    | 期待 exit code | 実測 exit code | 判定 |
| ------------------------- | -------------- | -------------- | ---- |
| 全スクリプト PASS         | 0              |                |      |
| validate-evals.js が FAIL | 1              |                |      |
| 他スクリプトが FAIL       | 1              |                |      |

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の exit code 確認セクション

---

### Step 5: 後続タスク向け JSON 出力インターフェースの安定性確認

**目的**: `UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001` 等の後続タスクが依存する
`validate-evals.js` の JSON 出力インターフェースが安定していることを確認する

**実行手順**:

1. `validate-evals.js` が JSON 出力モード（`--json` フラグ等）を持つ場合、出力スキーマを確認する
2. 出力 JSON のキー名・型・必須フィールドを記録する

```bash
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --json 2>/dev/null | head -50
```

3. 出力スキーマが以下の安定性基準を満たすことを確認する
   - トップレベルキーが `results` / `summary` / `errors` 等の明確な名前を持つ
   - 各スキルの結果が配列またはオブジェクトで構造化されている
   - PASS / FAIL の判定フィールドが boolean または文字列で明示されている
4. JSON 出力モードがない場合は、その旨を記録し後続タスクへの影響を評価する

**JSON 出力スキーマ確認表（出力モードがある場合）**:

| フィールド名   | 型             | 必須 | 説明               |
| -------------- | -------------- | ---- | ------------------ |
| `results`      | array / object |      | 各スキルの検証結果 |
| `summary.pass` | number         |      | PASS 件数          |
| `summary.fail` | number         |      | FAIL 件数          |
| `errors`       | array          |      | エラー詳細一覧     |

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の JSON 出力インターフェース確認セクション

---

### Step 6: ドキュメント整合性確認（SKILL.md の手順が実際の動作と一致）

**目的**: SKILL.md に記載された実行手順が実際の `validate-evals.js` の動作と一致していることを確認する

**実行手順**:

1. SKILL.md に記載された `validate-evals.js` の実行コマンド例を抽出する
2. そのコマンドをそのまま実行し、期待どおりの動作をすることを確認する

```bash
# SKILL.md に記載されているコマンド例をそのまま実行
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js
```

3. SKILL.md の説明（オプション・出力形式・エラーメッセージ例）が実際の動作と乖離していないかを確認する
4. 乖離がある場合は SKILL.md を修正する

**ドキュメント整合性確認表**:

| 確認項目                    | SKILL.md の記載 | 実際の動作 | 一致 |
| --------------------------- | --------------- | ---------- | ---- |
| 基本実行コマンド            |                 |            |      |
| 統合実行コマンド            |                 |            |      |
| dual root diff 確認コマンド |                 |            |      |
| エラー発生時の出力形式      |                 |            |      |

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のドキュメント整合性確認セクション
- 修正済み SKILL.md（乖離があった場合のみ）

---

## 品質チェック一覧テーブル

| チェック項目                       | 確認方法                               | 合格基準                     | ステータス |
| ---------------------------------- | -------------------------------------- | ---------------------------- | ---------- |
| validate-evals.js のライン数       | `wc -l` で計測                         | 200行以内                    |            |
| run-all-validations.js のライン数  | `wc -l` で計測                         | 100行以内                    |            |
| SKILL.md のリンク切れなし          | 各パスの `ls` 確認                     | 全パスが存在する             |            |
| .claude/ vs .agents/ mirror parity | `diff -u` でゼロ差分確認               | 全スクリプトでゼロ差分       |            |
| 統合実行 exit code（正常系）       | `run-all-validations.js` 実行後の `$?` | exit code 0                  |            |
| 統合実行 exit code（異常系）       | 意図的な FAIL を注入して確認           | exit code 1                  |            |
| JSON 出力インターフェースの安定性  | `--json` フラグでの出力スキーマ確認    | 必須フィールドが全て存在する |            |
| SKILL.md と実動作の一致            | SKILL.md 記載コマンドをそのまま実行    | 説明どおりの動作をする       |            |

---

## 統合テスト連携

- Phase 10 は本 Phase の品質チェック表を最終判定の根拠として使う
- Phase 12 は validator 実行記録を close-out 文書へ転記する際、本 Phase の実測値だけを根拠にする

## 参照資料

| 参照資料               | パス                                                                 | 内容                           |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------ |
| Phase 8 成果物         | `outputs/phase-8/refactoring-log.md`                                 | リファクタリング結果           |
| validate-evals.js      | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`      | 品質確認対象スクリプト（正本） |
| run-all-validations.js | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js` | 統合実行スクリプト（正本）     |
| SKILL.md               | `.claude/skills/skill-fixture-runner/SKILL.md`                       | ドキュメント整合性確認対象     |
| agents ミラー群        | `.agents/skills/skill-fixture-runner/scripts/`                       | mirror parity 確認対象         |

---

## 成果物

| 成果物            | パス                                                                   | 内容                                                                                       |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 品質チェック結果  | `outputs/phase-9/quality-check-result.md`                              | line budget・リンク確認・mirror parity・exit code・JSON IF・ドキュメント整合性の全結果集約 |
| 修正済み SKILL.md | `.claude/skills/skill-fixture-runner/SKILL.md`（差異があった場合のみ） | リンク修正・ドキュメント整合性修正済み                                                     |
| 更新済みミラー群  | `.agents/skills/skill-fixture-runner/scripts/`（差分があった場合のみ） | mirror parity 修正済み                                                                     |

---

## 完了条件

- [ ] 全スクリプトのライン数が許容範囲内であることを確認している
- [ ] SKILL.md のリンクが全て有効であることを確認している（リンク切れがあれば修正済み）
- [ ] `.claude/` vs `.agents/` の全スクリプトでゼロ差分であることを確認している（差分があれば同期済み）
- [ ] `run-all-validations.js` の exit code が正常系で 0、異常系で 1 であることを確認している
- [ ] 後続タスク向けの JSON 出力インターフェースが安定していることを確認している（または出力モードなしと記録）
- [ ] SKILL.md の手順が実際の動作と一致していることを確認している（乖離があれば修正済み）
- [ ] `outputs/phase-9/quality-check-result.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/phase-10-final-review.md`
