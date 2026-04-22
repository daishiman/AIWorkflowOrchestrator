# Phase 1: 要件定義 — UNASSIGNED-EVALS-VALIDATOR-GUARD-001

## メタ情報

| 項目                | 値                                               |
| ------------------- | ------------------------------------------------ |
| Phase               | 1 / 要件定義                                     |
| タスクID            | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名            | skill-fixture-runner EVALS.json スキーマ検証追加 |
| GitHub Issue        | #2325（CLOSED）                                  |
| ステータス          | pending                                          |
| 作成日              | 2026-04-21                                       |
| 分類                | 改善 / NON_VISUAL（UI変更なし）                  |
| implementation_mode | new                                              |

---

## 目的

現状、`.claude/skills/skill-fixture-runner/scripts/` 配下のバリデーションスクリプト群において **validator=0 件状態**（EVALS.json を一切検証していない状態）が継続しており、スキーマ変更時の手動検証のみに依存している。

Phase 1 では以下を実施する。

1. 既存スクリプトの責務を棚卸しし、validator=0 件状態の全体像を把握する
2. 検証対象となる EVALS.json を 6 スキル × dual root の 12 件として正確に列挙する
3. fixture EVALS（TC-004 契約固定）の境界を確認し、除外方針の前提を固める
4. camelCase/snake_case の 2 方言によるフィールド並立状況を確認する
5. 動的パス consumer 13 件の実態を把握し、glob 不可の理由を確認する

---

## P50 チェック（upstream 確認）

> Phase 実行前に以下の upstream 状態を確認し、作業重複・競合を防ぐ。

### Step 0: P50 チェック

#### 0-1. git log 確認（EVALS 関連コミット）

```bash
git log --oneline --all | grep -i evals | head -30
git log --oneline --all | grep -i validator | head -30
git log --oneline --all | grep -i "schema-dialect" | head -10
```

確認観点:

- `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` の着手・完了状態
- `TASK-EVALS-CONSUMER-AUDIT-001` の完了コミットが存在するか
- 本タスク対象ファイル（`validate-evals.js`）が既に存在していないか

#### 0-2. 既存 validate-\*.js ファイル確認

```bash
ls -la .claude/skills/skill-fixture-runner/scripts/
ls -la .agents/skills/skill-fixture-runner/scripts/
```

確認観点:

- `validate-evals.js` が未存在であること（existence guard）
- 両 root のスクリプト一覧が一致しているか（ミラー同期状態）

#### 0-3. upstream ブロッカー判定

| 先行タスク                                      | 状態           | ブロック有無                           |
| ----------------------------------------------- | -------------- | -------------------------------------- |
| UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 | 未実施（推奨） | ブロックなし（両方言許容モードで吸収） |
| TASK-EVALS-CONSUMER-AUDIT-001                   | 完了済み       | ブロックなし                           |

---

## 実行タスク

### Step 1: 現状スクリプト棚卸し

`.claude/skills/skill-fixture-runner/scripts/` 配下の既存スクリプト 5 件の責務を確認し、`outputs/phase-1/script-inventory.md` にまとめる。

| スクリプト名                               | 確認コマンド                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `validate-skill-structure.js`              | `head -50 .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js` |
| `validate-evals-format.js`（存在する場合） | 同上                                                                               |
| `run-all-validations.js`                   | `head -50 .claude/skills/skill-fixture-runner/scripts/run-all-validations.js`      |
| その他スクリプト                           | `ls` で全件確認後、各 `head -30`                                                   |

確認する観点:

- 各スクリプトが EVALS.json を読んでいるか（読んでいなければ validator=0 の原因）
- `run-all-validations.js` が呼び出しているサブルーティンの一覧
- `validate-skill-structure.js` が EVALS.json のフォーマット検証を行っているか

### Step 2: 検証対象 EVALS.json の列挙（6 スキル × dual root = 12 件）

対象スキル 6 件を dual root（`.claude/skills/` と `.agents/skills/`）でそれぞれ確認し、12 件の EVALS.json パスを列挙する。

```bash
# 対象スキル一覧
SKILLS=(
  aiworkflow-requirements
  github-issue-manager
  int-test-skill
  skill-creator
  skill-fixture-runner
  task-specification-creator
)

# dual root 存在確認
for skill in "${SKILLS[@]}"; do
  echo "=== $skill ==="
  ls -la .claude/skills/$skill/EVALS.json 2>/dev/null || echo "MISSING: .claude"
  ls -la .agents/skills/$skill/EVALS.json 2>/dev/null || echo "MISSING: .agents"
done
```

確認する観点:

- 12 件全ての EVALS.json が存在するか
- ファイルサイズ・更新日時の乖離がないか（ミラー同期の確認）
- 欠損がある場合はその理由をメモする

### Step 3: fixture EVALS の境界確認（TC-004 の扱い）

除外対象の fixture EVALS.json のパスと内容を確認し、TC-004 test 契約の固定内容を記録する。

```bash
# fixture EVALS の存在確認
ls -la apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json

# TC-004 の内容確認（先頭部のみ）
head -30 apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json
```

確認する観点:

- fixture EVALS.json のスキル名・フィールド構造（6 スキルの EVALS.json と異なる点）
- TC-004 がどのテストファイルで参照されているか（grep で確認）
- allowlist ベース除外が適切な理由の根拠

```bash
grep -r "complete-skill/EVALS" apps/ --include="*.ts" --include="*.js" | head -20
```

### Step 4: 方言フィールド確認（camelCase/snake_case 3 組 6 フィールド）

6 スキルの EVALS.json から camelCase/snake_case の並立フィールドを確認し、`outputs/phase-1/dialect-field-map.md` にまとめる。

```bash
# 代表スキルの EVALS.json 全体確認
cat .claude/skills/skill-creator/EVALS.json | python3 -m json.tool | head -50
cat .claude/skills/aiworkflow-requirements/EVALS.json | python3 -m json.tool | head -50
```

確認する観点:

- `skill_name` / `skillName` の並立状況
- `timestamp` / 他方言形式の有無
- その他 camelCase/snake_case が並立している 3 組を特定
- どのスキルがどちらの方言を使用しているか（方言マップの作成）

### Step 5: 動的パス consumer 13 件の確認

TASK-EVALS-CONSUMER-AUDIT-001 の成果を参照し、動的パスで EVALS.json を読み込んでいる 13 件の consumer を確認する。

```bash
# 動的パス consumer の確認
grep -r "EVALS.json" .claude/skills/ --include="*.js" --include="*.ts" | grep -v "node_modules"
grep -r "EVALS.json" .agents/skills/ --include="*.js" --include="*.ts" | grep -v "node_modules"

# 動的パス（変数埋め込み）パターンの確認
grep -r "EVALS" .claude/skills/ --include="*.js" | grep -E '\$\{|\+|concat' | head -20
```

確認する観点:

- なぜ単純な glob 不可なのか（動的パス生成の具体的なコード）
- スキル ID allowlist ベース列挙が必要な理由の裏付け
- 13 件の consumer のファイルパスと役割

---

## 参照資料

| 資料名                             | パス / URL                                                      |
| ---------------------------------- | --------------------------------------------------------------- |
| GitHub Issue #2325                 | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2325 |
| TASK-EVALS-CONSUMER-AUDIT-001 成果 | `docs/30-workflows/completed-tasks/` 以下を検索                 |
| schema-change-guide §7             | `references/` 以下を検索                                        |
| skill-fixture-runner スキル仕様    | `.claude/skills/skill-fixture-runner/SKILL.md`                  |

---

## 成果物（outputs/phase-1/）

Phase 1 完了時に以下のファイルを `docs/30-workflows/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/outputs/phase-1/` に作成する。

### `script-inventory.md`

既存スクリプト 5 件の一覧と各責務を記載する。

| スクリプト名              | 主責務 | EVALS.json を読むか | 備考 |
| ------------------------- | ------ | ------------------- | ---- |
| （Step 1 で確認後に記入） |        |                     |      |

### `evals-target-list.md`

検証対象 EVALS.json 12 件（6 スキル × dual root）の一覧を記載する。

| スキル名                   | .claude/skills/ パス | .agents/skills/ パス | 存在確認 |
| -------------------------- | -------------------- | -------------------- | -------- |
| aiworkflow-requirements    |                      |                      |          |
| github-issue-manager       |                      |                      |          |
| int-test-skill             |                      |                      |          |
| skill-creator              |                      |                      |          |
| skill-fixture-runner       |                      |                      |          |
| task-specification-creator |                      |                      |          |

### `dialect-field-map.md`

camelCase/snake_case 3 組 6 フィールドの対応表を記載する。

| camelCase フィールド                  | snake_case フィールド | 使用スキル（camelCase） | 使用スキル（snake_case） |
| ------------------------------------- | --------------------- | ----------------------- | ------------------------ |
| `skillName`                           | `skill_name`          |                         |                          |
| （残り 2 組は Step 4 で確認後に記入） |                       |                         |                          |

---

## 完了条件チェックリスト

- [ ] Step 0: P50 チェック完了（upstream ブロッカーなしを確認）
- [ ] Step 1: 既存スクリプト 5 件の責務確認完了、`script-inventory.md` 作成
- [ ] Step 2: 検証対象 EVALS.json 12 件の存在確認完了、`evals-target-list.md` 作成
- [ ] Step 3: fixture EVALS（TC-004）の境界確認完了、除外根拠を記録
- [ ] Step 4: 方言フィールド 3 組 6 フィールドを特定、`dialect-field-map.md` 作成
- [ ] Step 5: 動的パス consumer 13 件のファイルパスと役割を確認
- [ ] `outputs/phase-1/` 配下に 3 成果物（`script-inventory.md`, `evals-target-list.md`, `dialect-field-map.md`）が存在する

---

## 統合テスト連携

- Phase 2 は本 Phase の `script-inventory.md` / `evals-target-list.md` / `dialect-field-map.md` を入力として扱う
- Phase 4 以降で追加する CLI テストケースは、本 Phase で固定した対象 12 件と fixture 除外境界を逸脱しない
- Phase 11 では本 Phase の実測 inventory を再実行し、仕様と実装の対象集合が一致することを確認する

---

## タスク 100% 実行確認【必須】

Phase 1 の全 Step を実行したことを、以下の形式で記録すること。

```
Step 0: [完了/スキップ理由]
Step 1: [完了/スキップ理由]
Step 2: [完了/スキップ理由]
Step 3: [完了/スキップ理由]
Step 4: [完了/スキップ理由]
Step 5: [完了/スキップ理由]
outputs/phase-1/ 成果物: [作成済/未作成と理由]
```

スキップした Step がある場合は必ず理由を記載し、Phase Gate を通過できるかを自己評価すること。

---

## 次 Phase

Phase 1 完了後、`outputs/phase-1/` の 3 成果物を入力として **Phase 2: 設計** に進む。

- 入力: `script-inventory.md`, `evals-target-list.md`, `dialect-field-map.md`
- 出力先: `outputs/phase-2/`
- 次 Phase ファイル: `phase-2-design.md`
