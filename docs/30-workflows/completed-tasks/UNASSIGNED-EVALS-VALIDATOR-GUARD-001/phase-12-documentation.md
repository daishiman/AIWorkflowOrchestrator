# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 12                                               |
| 機能名       | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名     | skill-fixture-runner EVALS.json スキーマ検証追加 |
| タスク種別   | docs-only / NON_VISUAL（UI/UX 変更なし）         |
| 前提Phase    | Phase 11 完了                                    |
| 後続Phase    | Phase 13                                         |
| 作成日       | 2026-04-21                                       |
| ステータス   | completed                                        |
| GitHub Issue | #2325（CLOSED）                                  |

---

## 目的

実装完了に伴い、Phase 11 の手動テスト結果を起点に、実装ガイド・システム仕様更新サマリ・更新履歴・未タスク検出・スキルフィードバック・コンプライアンスチェックを canonical 名で作成し、`task-workflow` / `artifacts.json` 系の同期と両 skill 教訓還流まで閉じる。

**NON_VISUAL 宣言**: 本タスクは UI/UX 変更なし。`## 視覚証跡` で screenshot 不要を明記し、代替証跡として `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md` を使用する。

---

## 実行タスク

### 必須タスク一覧（Task 1〜6 - 全て完了必須）

| Task | 名称                                                            | 必須 |
| ---- | --------------------------------------------------------------- | ---- |
| 1    | 実装ガイド作成（Part 1: 中学生レベル + Part 2: 技術者レベル）   | 必須 |
| 2    | システム仕様更新サマリー作成（Step 1-A〜1-G + 条件付き Step 2） | 必須 |
| 3    | ドキュメント更新履歴作成                                        | 必須 |
| 4    | 未タスク検出レポート作成（0件でも必須）                         | 必須 |
| 5    | スキルフィードバックレポート作成（改善点なしでも必須）          | 必須 |
| 6    | Phase 12 準拠チェック（phase12-task-spec-compliance-check）     | 必須 |

---

## Task 1: 実装ガイド作成（2パート構成）

**成果物**: `outputs/phase-12/implementation-guide.md`

### Part 1: 中学生レベル説明

**必須要件**:

- 見出しは `## Part 1` を使う
- 以下の 4 サブ見出しを順番通りに含める:
  - `### なぜ必要か`
  - `### 何をするか`
  - `### 日常の例え`
  - `### 今回作ったもの`
- 専門用語禁止（やむを得ず使う場合は即座に 1 行で説明）
- 「なぜ必要か」→「何をするか」の順序固定
- `たとえば` を最低 1 回含める
- **日常の例え（必須）**: 以下のモチーフを使う:
  - EVALS.json の品質チェック係を「レストランの食材チェックリスト」に例える
  - `validate-evals.js` = 食材検査員（品質チェック係）
  - validator が 0 件 = 「品質検査員が 0 人のレストラン」に相当（食材の品質が保証されない）
  - dual root（`.claude` と `.agents/` の 2 箇所に同じ EVALS.json がある構造）= 「2 つの倉庫が同じ在庫リストを持つ」こと
  - `たとえば、レストランで食材チェックリストを毎日確認する係員がいないと、古い食材が使われてしまうかもしれません。同じように、EVALS.json の中身を検証する係（validator）がいないと、スキル仕様書に壊れたデータや欠けた情報が混入したまま気づかれない可能性があります。`
- Part 1 末尾に視覚証跡セクションを明記する（下記参照）

**Part 1 構成例**:

```markdown
## Part 1

### なぜ必要か

（validator が 0 件だと何が困るか、中学生でも分かるように説明）

### 何をするか

（validate-evals.js が何を検査するか、3 段階（L1/L2/L3）を簡単に説明）

### 日常の例え

（レストランの食材チェックリスト / 2 つの倉庫の在庫リストの例え）
たとえば、...

### 今回作ったもの

（validate-evals.js / run-all-validations.js への統合 / fixture 除外の 3 点を列挙）
```

### Part 2: 技術者向け詳細

**必須要件**:

- 見出しは `## Part 2` を使う
- 以下のサブ見出しを順番通りに含める:
  - `### インターフェース定義`
  - `### L1/L2/L3 検証ロジック詳細`
  - `### 方言許容モードと strict モード`
  - `### fixture 除外 allowlist の仕組み`
  - `### run-all-validations.js への統合パターン`
  - `### exit code 一覧`
  - `### エッジケース`
- **インターフェース定義（必須）**: `validate-evals.js` の CLI シグネチャを記載
  - 引数: `--path <file>` / `--all-skills` / `--skill <name>` / `--check-dual-root` / `--strict` / `--verbose`
  - 戻り値: exit code（0=PASS / 1=L1/L2/L3 エラー）
  - 標準出力形式: 人間可読サマリ（`--json` 指定時は JSON 形式）
- **L1/L2/L3 検証ロジック（必須)**:
  - L1: JSON.parse による構文検証。破損 JSON は即 exit 1
  - L2: 必須キー（`evaluations[]`、各 eval の `id` / `input` / `expected` 等）の存在確認。方言許容モードでは代替キー名を許容
  - L3: `.claude/skills/<name>/EVALS.json` と `.agents/skills/<name>/EVALS.json` のバイト一致検証。差分があれば `diff -u` 相当の出力を行い exit 1
- **方言許容モード（必須）**: `--strict` なし時は方言許容、`--strict` 付き時は完全一致のみ許容
- **fixture 除外 allowlist（必須）**: `__tests__/fixtures/` 配下の EVALS.json は自動除外。allowlist は `validate-evals.js` 内の定数として定義し SKILL.md にも明記
- **統合パターン（必須）**: `run-all-validations.js` から `validate-evals.js` を子プロセス起動する実装パターン

### 視覚証跡（Task 1 配下）

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`implementation-guide.md` 末尾に以下を明記する:

```
## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`
```

---

## Task 2: システム仕様更新サマリー作成（Step 1-A〜1-G + 条件付き Step 2）

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

### Step 1-A: 完了記録の同一 wave 同期

以下を **同一 wave で** 更新する:

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（current facts に EVALS validator 追加を記録）
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`（completed ledger 追加）
- `.claude/skills/aiworkflow-requirements/LOGS.md`（sync 記録）
- `.claude/skills/aiworkflow-requirements/SKILL.md`（変更履歴に本タスクのバージョン追記）
- `.claude/skills/skill-fixture-runner/LOGS.md`（current facts 記録）
- `.claude/skills/skill-fixture-runner/SKILL.md`（変更履歴に本タスクのバージョン追記）
- `.claude/skills/aiworkflow-requirements/references/topic-map.md`（Step 1-D 再生成結果反映）

### Step 1-B: 実装状況テーブル更新

- 仕様書内・両 skill 内の本タスク実装状況を `spec_created` に更新する
- docs-only workflow では `spec_created` を使い、`completed` と混在させない
- 関連スクリプト（`validate-evals.js` / `run-all-validations.js` 拡張）の存在 / 役割 / 責務境界を記載する

### Step 1-C: 関連タスクテーブル更新

- 仕様書内の関連タスク / 未タスク候補の状態を更新する
- 後続タスク `UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001`（スキルコンテンツ検証）への参照を記載する
- 後続タスク `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001`（方言統一）への参照を記載する
- Issue #2325（CLOSED）の状態を維持し、再オープンしないことを明記する

### Step 1-D: topic-map / index 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/aiworkflow-requirements/scripts/build-topic-map.js  # 存在する場合
```

- 更新対象がある場合は `keywords.json` / `topic-map.md` を再生成する
- EVALS validator の anchor / keyword（`validate-evals` / `EVALS.json` / `dual-root` / `L-EVALS-VALIDATOR-001`）が両 skill から検索可能であることを確認する

### Step 1-E: artifacts parity

- root `artifacts.json` と `outputs/artifacts.json` の整合を確認する
- phase artifact 名と status を同値に保つ
- parity 検証ツールが利用可能な場合は実行し、結果を記録する

### Step 1-F: mirror parity

- `.claude/skills/skill-fixture-runner/` と `.agents/skills/skill-fixture-runner/` の mirror parity を確認する
- 必要がある場合のみ mirror 側も同一 wave で更新する
- 両 skill の `SKILL.md` 変更履歴 / `LOGS.md` / 該当 reference のミラーすべてを照合する

### Step 1-G: final validation

```bash
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js
```

- 計画系文言（「予定」「TBD」「計画中」「次のフェーズで」「後で対応」）が `outputs/phase-12/*.md` に残っていないことを確認する

### Step 2: domain spec sync（条件付き・必要時のみ）

**判定基準**: 本タスクでは `validate-evals.js` の新規 CLI インターフェースが追加されるため、Step 2 実施が必要な可能性が高い。以下を確認し、変更が必要な場合は実施する:

更新対象の例:

- `.claude/skills/aiworkflow-requirements/references/error-handling.md`: L1/L2/L3 エラー分類と exit code 対応表を追記（L1=JSON パースエラー / L2=必須キー欠落 / L3=dual root ドリフト）
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`: EVALS.json 検証を quality gate として追記
- `.claude/skills/skill-fixture-runner/SKILL.md`: `validate-evals.js` の CLI インターフェースと fixture 除外 allowlist を記載

新しい interface / type が追加されたため、no-op ではなく **追記実施** をデフォルトとする。変更不要の場合は `system-spec-update-summary.md` に no-op の根拠を残す。

### NON_VISUAL close-out 記録

- `implementation-guide.md` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を明記する
- `outputs/phase-11/screenshots/.gitkeep` は `NON_VISUAL` のため不要として扱う
- mirror parity は `.claude` 正本側に変更がない場合でも `変更なし` と明示する

---

## Task 3: ドキュメント更新履歴作成

**成果物**: `outputs/phase-12/documentation-changelog.md`

### 必須記録

- 変更した file 一覧（両 skill の reference / LOGS / SKILL / `.agents/` ミラーを網羅）
- validator 実行結果（`validate-evals.js --all-skills` / `run-all-validations.js` の exit code）
- current / baseline の区別
- root `artifacts.json` / `outputs/artifacts.json` の同期結果
- `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` の同期結果
- `system-spec-update-summary.md` で判断した更新要否（Step 2 の判断含む）

### 作成ルール

- 全 Step 完了前に「完了」と記載しない
- 更新なしでも理由を明記する

---

## Task 4: 未タスク検出レポート作成（0件でも必須）

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

### 検出観点

- Phase 9（quality）/ Phase 10（final review）/ Phase 11（manual test）の MINOR / blocker / follow-up
- `TODO` / `FIXME` / `HACK` / `XXX`
- `describe.skip` / `it.skip` の残存
- 仕様書間の不一致
- EVALS.json の方言不統一に関する後続タスク候補

### 後続タスク参照（既知の候補）

以下は本タスクのスコープ外として検出された後続タスク候補であり、別タスクとして追跡する:

| タスクID候補                                        | 概要                                                          | 優先度 |
| --------------------------------------------------- | ------------------------------------------------------------- | ------ |
| UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 | スキルコンテンツ（EVALS.json の評価内容）の品質検証スキャナー | 中     |
| UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001     | 6 スキル間の EVALS.json 方言（キー名の揺れ）統一              | 低     |

### ルール

- 0 件でも必ず出力する
- 検出した follow-up は `docs/30-workflows/unassigned-task/` に formalize する
- `task-workflow.md` と `task-workflow-completed.md` の両方へ同一 wave で反映する

---

## Task 5: スキルフィードバックレポート作成（改善点なしでも必須）

**成果物**: `outputs/phase-12/skill-feedback-report.md`

### 記録内容

- `skill-fixture-runner` への改善提案（`validate-evals.js` の registry 統合、fixture 除外 allowlist の設定化、CLI 契約の単一正本化）
- `aiworkflow-requirements` への改善提案（`error-handling.md` への EVALS エラー分類追記の効果）
- `task-specification-creator` への波及提案（必要な場合のみ: EVALS 検証を新スキル生成 template に組み込むか）

### ルール

- 改善点がなくても「なし」と理由を書く
- 実際に反映した変更は両 skill の `LOGS.md` へ追記する
- 「`L-EVALS-VALIDATOR-001`」の lessons-learned ID を採番し lessons-learned ファイルに追加する

---

## Task 6: Phase 12 準拠チェック

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

### 最低限必要な内容（自己申告ではなく実測で記録）

- 6 成果物の存在確認（`ls -la outputs/phase-12/` の出力を貼り付け）
- Task 1〜5 の実質監査（各成果物の必須見出し / 必須要件の充足を実測）
- Step 1-A〜1-G の実更新確認（`git diff --stat` 等で実変更を観測）
- Step 2 の current fact / no-op / domain sync 確認
- validator 実測値:
  - `validate-evals.js --all-skills` → PASS / `exit=0`
  - `run-all-validations.js` → PASS（validate-evals を通過）
- artifacts parity（root と outputs の同値性）
- 計画系文言 0 件
- Phase 11 の `manual-test-result.md` 参照整合
- mirror parity（`.claude` ↔ `.agents/`）

### 判定ルール

- 1 つでも未充足があれば `PASS` にしない
- `PASS` は 6 成果物の実体と same-wave sync が揃った後のみ
- 自己申告（テキスト主張のみ）は不可。必ず CLI 実行結果のコピーを貼り付ける

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`outputs/phase-11/screenshots/` ディレクトリは作成せず、作成済みの場合は `.gitkeep` のみとし no-op 根拠を `system-spec-update-summary.md` および `documentation-changelog.md` に残す。Phase 12 の成果物群（`implementation-guide.md` 等）にも同一文言を明記する。

代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`

---

## 参照資料

### 実装・コード

| 資料名                         | パス                                                                                                                    | 用途                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 11 手動テスト結果        | `outputs/phase-11/manual-test-result.md`                                                                                | Phase 11 正本・NON_VISUAL 判定根拠       |
| validate-evals.js（新規）      | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`                                                         | 実装ガイド Part 2 のインターフェース源泉 |
| run-all-validations.js（拡張） | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`                                                    | 統合パターン記載の源泉                   |
| SKILL.md                       | `.claude/skills/skill-fixture-runner/SKILL.md`                                                                          | fixture 除外 allowlist の記載確認        |
| Phase 12 ガイド                | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                                  | Task 1〜6 の詳細                         |
| Phase 12 完了チェックリスト    | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`                                 | 準拠チェックの正本                       |
| Phase 12 sync パターン         | `.claude/skills/task-specification-creator/references/patterns-phase12-sync.md`                                         | Step 1 / Step 2 実行パターン             |
| spec-update-workflow           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                          | Step 1 / Step 2 基準                     |
| タスク実行ルール               | `.claude/rules/05-task-execution.md`                                                                                    | Phase 12 必須チェックリスト              |
| 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                                                                    | 失敗パターン対策                         |
| Phase 1 成果物一覧             | `outputs/phase-1/script-inventory.md` / `outputs/phase-1/evals-target-list.md` / `outputs/phase-1/dialect-field-map.md` | Phase 1 成果物                           |
| 最終レビュー結果               | `outputs/phase-10/final-review-result.md`                                                                               | Phase 10 成果物                          |

### システム仕様（aiworkflow-requirements）

| 資料名                  | パス                                                                           | 用途                                            |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | Step 1-A 同期対象（current facts）              |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | Step 1-A 同期対象（completed ledger）           |
| topic-map               | `.claude/skills/aiworkflow-requirements/topic-map.md`                          | Step 1-D 再生成対象                             |
| keywords.json           | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                 | Step 1-D 再生成対象                             |
| LOGS.md                 | `.claude/skills/aiworkflow-requirements/LOGS.md`                               | Step 1-A 同期対象                               |
| SKILL.md                | `.claude/skills/aiworkflow-requirements/SKILL.md`                              | 変更履歴追記                                    |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | Step 2 候補（L1/L2/L3 エラー分類追記）          |
| quality-requirements    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | Step 2 候補（EVALS 検証の quality gate 必須化） |

---

## 成果物一覧

| 成果物                       | パス                                                     | 形式     |
| ---------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| コンプライアンスチェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件

- [ ] Task 1: 実装ガイドが完成している（Part 1 に「レストランの食材チェックリスト / 2 つの倉庫」例え・`たとえば` 1 回以上あり、Part 2 にインターフェース定義 / L1/L2/L3 詳細 / 方言許容モード / fixture 除外 allowlist / 統合パターン / exit code 一覧 / エッジケースが揃う）
- [ ] Task 2: システム仕様更新サマリーが完成している（Step 1-A〜1-G + Step 2 の判断記録あり）
- [ ] Task 3: ドキュメント更新履歴が完成している（validator 実行結果の記録あり）
- [ ] Task 4: 未タスク検出レポートが完成している（0 件でも出力、後続タスク 2 件への参照あり）
- [ ] Task 5: スキルフィードバックレポートが完成している（改善なしでも出力、`L-EVALS-VALIDATOR-001` を採番）
- [ ] Task 6: コンプライアンスチェックが完成している（自己申告ではなく CLI 実測値で記録）
- [ ] `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` / 両 skill `LOGS.md` / 両 skill `SKILL.md` が同一 wave で同期されている
- [ ] `manual-test-result.md` が Phase 11 の正本として参照されている
- [ ] `## 視覚証跡` セクションに「UI/UX変更なしのため Phase 11 スクリーンショット不要」が明記されている
- [ ] `.claude/skills/skill-fixture-runner/` と `.agents/skills/skill-fixture-runner/` の mirror parity が確認されている

---

## タスク100%実行確認【必須】

- [ ] 6 成果物がすべて存在する
- [ ] `implementation-guide.md` Part 1 に「レストランの食材チェックリスト」日常の例えと `たとえば` が含まれる
- [ ] `implementation-guide.md` Part 1 に validator=0 件 = 「品質検査員が 0 人」の説明が含まれる
- [ ] `implementation-guide.md` Part 1 に dual root = 「2 つの倉庫が同じ在庫リストを持つ」の説明が含まれる
- [ ] `implementation-guide.md` Part 2 にインターフェース定義 / L1/L2/L3 詳細 / 方言許容モード / fixture 除外 allowlist / 統合パターンが揃う
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-G / Step 2 の記録がある
- [ ] `system-spec-update-summary.md` に Step 2 必要性の判断（新規 CLI インターフェース追加のため要実施）が記録されている
- [ ] `documentation-changelog.md` に current / baseline と validator 実行結果がある
- [ ] `unassigned-task-detection.md` が 0 件でも出力されている
- [ ] `unassigned-task-detection.md` に UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 への参照がある
- [ ] `unassigned-task-detection.md` に UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 への参照がある
- [ ] `skill-feedback-report.md` が改善なしでも出力されている
- [ ] `skill-feedback-report.md` に `L-EVALS-VALIDATOR-001` の lessons-learned ID が採番されている
- [ ] `phase12-task-spec-compliance-check.md` が最終ゲートとして完了している
- [ ] `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` / root `artifacts.json` / `outputs/artifacts.json` が同期されている
- [ ] 両 skill `SKILL.md` 変更履歴に本タスクのバージョンが追記されている
- [ ] 両 skill `LOGS.md` に sync 記録が追記されている
- [ ] `.agents/skills/` ミラーが正本と一致する
- [ ] 計画系文言が `outputs/phase-12/*.md` に残っていない
- [ ] `run-all-validations.js`（validate-evals 含む統合実行）が PASS

---

## 次Phase

Phase 13（PR作成）へ進む。**ユーザーの明示的な承認後のみ実施する。**
