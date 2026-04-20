# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | Phase 11 完了                             |
| 後続Phase  | Phase 13                                  |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

実装完了に伴い、Phase 11 の手動テスト結果を起点に、実装ガイド・システム仕様更新サマリ・更新履歴・未タスク検出・スキルフィードバック・コンプライアンスチェックを canonical 名で作成し、`task-workflow` / `artifacts.json` 系の同期と両 skill 教訓還流まで閉じる。

**自己適用（dogfooding）の重要性**: 本タスクは close-out parity guard 自身の実装タスクであるため、Phase 12 close-out 時に自身の `validate-closeout-parity.js` を本 workflow ディレクトリへ走らせ、`PARITY_OK` を実測値として記録する。これにより「guard が guard 自身の close-out を保証できる」ことを構造的に証明する。

## タスク種別

**NON_VISUAL タスク**: UI/UX 変更なし。`## 視覚証跡` で screenshot 不要を明記し、`outputs/phase-11/screenshots/` の不在 / `.gitkeep` の no-op 根拠を `system-spec-update-summary.md` に残す。

## 必須タスク（6タスク - 全て完了必須）

| Task | 名称                                                         | 必須 |
| ---- | ------------------------------------------------------------ | ---- |
| 1    | 実装ガイド作成（2パート構成）                                | 必須 |
| 2    | システム仕様更新サマリー作成（Step 1-A〜1-D + 条件付Step 2） | 必須 |
| 3    | ドキュメント更新履歴作成                                     | 必須 |
| 4    | 未タスク検出レポート作成                                     | 必須 |
| 5    | スキルフィードバックレポート作成                             | 必須 |
| 6    | phase12-task-spec-compliance-check 作成                      | 必須 |

## 実行タスク

1. Task 1〜6 の成果物名を canonical 名で固定する
2. `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` / `LOGS.md`（両 skill）/ `SKILL.md`（両 skill）/ root `artifacts.json` / `outputs/artifacts.json` の同期要否を判定する
3. `aiworkflow-requirements` の domain spec sync（`error-handling.md` / `quality-requirements.md`）が必要か no-op かを明記する
4. `NON_VISUAL` close-out として screenshot 不要判断と `screenshots/.gitkeep` の扱いを記録する
5. **自己適用（dogfooding）**: 本 workflow に対し `validate-closeout-parity.js` を Phase 12 中に最低 1 回実行し、`PARITY_OK` を `documentation-changelog.md` と `phase12-task-spec-compliance-check.md` の両方へ実測値として記録する
6. compliance-check で blocked 要因が残る限り `PASS` にしない

## SubAgent チーム編成

| SubAgent | 主担当                                                           | 並列可否              |
| -------- | ---------------------------------------------------------------- | --------------------- |
| A        | Task 1 実装ガイド（Part 1 / Part 2）                             | Task 2 と並列開始可   |
| B        | Task 2 システム仕様更新サマリー / Task 3 documentation-changelog | Task 1 と並列開始可   |
| C        | Task 4 未タスク検出 / Task 5 スキルフィードバック                | Task 2 完了後に並列可 |
| D        | Task 6 compliance-check / 自己適用 validator 実行 / 統合監査     | 全成果物完成後に実施  |

## 実行順序と並列可能性

1. Task 1 と Task 2 を並列開始する。
2. Task 3 は Task 1 / Task 2 の確定結果を受けて実施する。
3. Task 4 と Task 5 は Task 2 確定後に並列実行する。
4. Task 6 は全成果物 + 自己適用 validator 結果が揃ってから実施する。

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
- **日常の例え（必須）**: 「3 冊の出席簿を同じにそろえる係」モチーフを使う。学級委員（`complete-phase.js`）が 3 冊（`index.md` / root `artifacts.json` / `outputs/artifacts.json`）と本人の連絡帳（`phase-N-*.md` 本文 frontmatter）を同時に書き換え、最後に「見回り係（`validate-closeout-parity.js`）」が 4 つ全部の出席状態が揃っているかを照合する、という構図で説明する
- 作成後に `validate-phase12-implementation-guide.js` で内容要件を確認する

### Part 2: 開発者向け技術詳細

**必須要件**:

- 見出しは `## Part 2` を使う
- 以下のサブ見出しを順番通りに含める:
  - `### 型定義`（`ParityReport` TypeScript 型を含む）
  - `### CLI シグネチャ`（`validate-closeout-parity.js --workflow <dir> [--json]`、`complete-phase.js --workflow <dir> --phase <N>`、`verify-all-specs.js`）
  - `### 使用例`（正常系 / drift / 欠損 / 不正値の 4 ケース）
  - `### エラーハンドリング`（exit code 0/1/2/3 と JSON `code` の対応表、rollback 条件）
  - `### エッジケース`（S1 の `-` 表記、phase 数が 13 未満の workflow、phase frontmatter 欠落）
  - `### 設定項目と定数一覧`（許可 status 列挙、parity bypass 用フラグを導入しない運用）
  - `### 責務境界マトリクス`（Phase 2 設計の表を再掲）
- TypeScript の型定義（`ParityReport` および入出力スキーマ）を含める
- 各 CLI のシグネチャと使用例を記載する
- エラーハンドリング（rollback 起動条件・atomic 書き込み順序）を説明する
- 設定可能なパラメータと定数一覧を記載する

### 視覚証跡（Task 1 配下）

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`implementation-guide.md` 末尾に「UI/UX変更なしのため Phase 11 スクリーンショット不要」を明記する。

### 参照

- Phase 11 の `outputs/phase-11/manual-test-result.md`
- `manual-test-result.md` では `NON_VISUAL` 判定理由と CLI 実行ログを明記する

---

## Task 2: システム仕様更新サマリー作成（Step 1-A〜1-G + 条件付 Step 2）

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

### Step 1-A: 完了記録の同一 wave 同期

以下を **同一 wave で** 更新する:

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（current facts に close-out parity guard を追加）
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`（completed ledger 追加）
- `.claude/skills/aiworkflow-requirements/LOGS.md`（sync 記録）
- `.claude/skills/aiworkflow-requirements/SKILL.md`（変更履歴に本タスクのバージョン追記）
- `.claude/skills/task-specification-creator/LOGS.md`（current facts 記録）
- `.claude/skills/task-specification-creator/SKILL.md`（変更履歴に本タスクのバージョン追記）
- `.claude/skills/aiworkflow-requirements/references/topic-map.md`（後述 Step 1-D の再生成結果反映）

### Step 1-B: 実装状況テーブル更新

- 仕様書内・両 skill 内の本タスク実装状況を `spec_created` に更新する
- docs-only workflow では `spec_created` を使い、`completed` と混在させない
- 関連スクリプト（`validate-closeout-parity.js` / `complete-phase.js` 拡張 / `verify-all-specs.js` 拡張）の存在 / 役割 / 責務境界を記載する

### Step 1-C: 関連タスクテーブル更新

- 仕様書内の関連タスク / 未タスク候補の状態を更新する
- 親 unassigned-task `docs/30-workflows/unassigned-task/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001.md` の状態を `completed` または `archived` に同期する
- 既存完了 workflow（drift baseline 対象）への遡及修正タスクは「別タスク化（AC-7）」として明示し、新規 unassigned へ昇格しない

### Step 1-D: topic-map / index 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/aiworkflow-requirements/scripts/build-topic-map.js  # 存在する場合
```

- 更新対象がある場合は `keywords.json` / `topic-map.md` を再生成する
- close-out parity guard の anchor / keyword（`close-out parity` / `validate-closeout-parity` / `PARITY_OK` / `L-CLOSEOUT-PARITY-001`）が両 skill から検索可能であることを確認する

### Step 1-E: artifacts parity（自己適用 dogfooding）

- root `artifacts.json` と `outputs/artifacts.json` の整合を `validate-closeout-parity.js --workflow .` で実測する
- phase artifact 名と status を同値に保つ
- **`validate-closeout-parity.js` を本 workflow に対し最低 1 回実行し、`PARITY_OK` を取得する**（取得できない場合は Phase 12 PASS にしない）

### Step 1-F: mirror parity

- `.claude/skills/...` と `.agents/skills/...` の mirror parity を確認する
- 必要がある場合のみ mirror 側も同一 wave で更新する
- 両 skill の `SKILL.md` 変更履歴 / `LOGS.md` / 該当 reference のミラーすべてを照合する

### Step 1-G: final validation

- `verify-unassigned-links.js`
- `audit-unassigned-tasks.js --json --diff-from HEAD`
- `verify-all-specs.js`（parity gate を含む統合実行）
- 計画系文言（「予定」「TBD」「計画中」「次のフェーズで」「後で対応」）が `outputs/phase-12/*.md` に残っていないことを確認する

### Step 2: domain spec sync（条件付・必要時のみ）

更新対象の例:

- `.claude/skills/aiworkflow-requirements/references/error-handling.md`: エラー分類コード（`PARITY_DRIFT` / `MISSING_SOURCE` / `INVALID_STATUS_VALUE` / `PARITY_OK`）と exit code 対応表を追記
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`: Phase 12 close-out の必須品質ゲートとして parity validator 実行を追記
- `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`: Phase 12 close-out 契約に parity gate を追記

新しい interface / type / IPC contract が増えた場合のみ実施し、変更不要の場合は `system-spec-update-summary.md` に no-op の根拠を残す。本タスクは reference 追記が想定されるため、no-op ではなく **追記実施** をデフォルトとする。

### NON_VISUAL close-out 記録

- `implementation-guide.md` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を明記する
- `outputs/phase-11/screenshots/.gitkeep` は `NON_VISUAL` のため不要として扱い、残置する場合は no-op 根拠を残す
- mirror parity は `.claude` 正本側に変更がない場合でも `変更なし` と明示する

---

## Task 3: ドキュメント更新履歴作成

**成果物**: `outputs/phase-12/documentation-changelog.md`

### 必須記録

- 変更した file 一覧（両 skill の reference / LOGS / SKILL / `.agents/` ミラーを網羅）
- validator 実行結果（`validate-closeout-parity.js` / `verify-all-specs.js` / `verify-unassigned-links.js` / `audit-unassigned-tasks.js`）
- **自己適用（dogfooding）結果**: 本 workflow に対する `validate-closeout-parity.js --workflow . --json` の出力（`code: PARITY_OK`, `exitCode: 0`）を貼り付け
- current / baseline の区別
- root `artifacts.json` / `outputs/artifacts.json` の同期結果
- `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` の同期結果
- `system-spec-update-summary.md` で判断した更新要否

### 作成ルール

- `generate-documentation-changelog.js` の実行後に作成する
- 全 Step 完了前に「完了」と記載しない
- 更新なしでも理由を明記する

---

## Task 4: 未タスク検出レポート作成

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

### 検出観点

- Phase 9（quality）/ Phase 10（final review）/ Phase 11（manual test）の MINOR / blocker / follow-up
- `TODO` / `FIXME` / `HACK` / `XXX`
- `describe.skip` / `it.skip` の残存
- 仕様書間の不一致
- drift baseline に記録された既存 workflow の遡及修正候補（**ただし AC-7 により本タスクでは修正対象外**として扱い、別タスク化を提案する形で記載する）

### ルール

- 0 件でも必ず出力する
- 検出した follow-up は `docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001/unassigned-task/` または `docs/30-workflows/unassigned-task/` に formalize する
- `task-workflow.md` と `task-workflow-completed.md` の両方へ同一 wave で反映する

---

## Task 5: スキルフィードバックレポート作成

**成果物**: `outputs/phase-12/skill-feedback-report.md`

### 記録内容

- `task-specification-creator` への改善提案（特に `phase-12-completion-checklist.md` / `patterns-phase12-sync.md` の更新内容と、parity gate を template 化する余地）
- `aiworkflow-requirements` への改善提案（`error-handling.md` / `quality-requirements.md` への追記効果の検証）
- 必要な場合のみ `skill-creator` への波及提案（メタスキル側で parity guard 適用を新スキル生成 template に組込むか）

### ルール

- 改善点がなくても「なし」と理由を書く
- 実際に反映した変更は両 skill の `LOGS.md` へ追記する
- 「`L-CLOSEOUT-PARITY-001`」の lessons-learned ID を採番し `lessons-learned-current-2026-04.md` に追加する

---

## Task 6: phase12-task-spec-compliance-check 作成

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

### 最低限必要な内容（自己申告ではなく実測で記録）

- 6 成果物の存在確認（`ls -la outputs/phase-12/` の出力を貼り付け）
- Task 1〜5 の実質監査（各成果物の必須見出し / 必須要件の充足を実測）
- Step 1-A〜1-G の実更新確認（`git diff --stat` 等で実変更を観測）
- Step 2 の current fact / no-op / domain sync 確認
- validator 実測値:
  - `validate-closeout-parity.js --workflow . --json` → `code: PARITY_OK`, `exitCode: 0`（**自己適用 / 必須**）
  - `validate-phase12-implementation-guide.js` → PASS
  - `verify-all-specs.js` → PASS（parity gate を通過）
  - `verify-unassigned-links.js` → PASS
  - `audit-unassigned-tasks.js --json --diff-from HEAD` → drift 0 件
- artifacts parity（root と outputs の同値性）
- 計画系文言 0 件
- Phase 11 の `manual-test-result.md` 参照整合
- mirror parity（`.claude` ↔ `.agents/`）

### 判定ルール

- 1 つでも未充足があれば `PASS` にしない
- `PASS` は 6 成果物の実体と same-wave sync と **自己適用 PARITY_OK** が揃った後のみ
- 自己申告（テキスト主張のみ）は不可。必ず CLI 実行結果のコピーを貼り付ける

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`outputs/phase-11/screenshots/` ディレクトリは作成せず、作成済みの場合は `.gitkeep` のみとし no-op 根拠を `system-spec-update-summary.md` および `documentation-changelog.md` に残す。Phase 12 の成果物群（`implementation-guide.md` 等）にも同一文言を明記する。

## 参照資料

### 実装・コード

| 資料名                           | パス                                                                                    | 用途                                     |
| -------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 11 手動テスト結果          | `outputs/phase-11/manual-test-result.md`                                                | Phase 11 正本・NON_VISUAL 判定根拠       |
| Phase 11 チェックリスト          | `outputs/phase-11/manual-test-checklist.md`                                             | AC-1〜AC-7 トレース                      |
| validate-closeout-parity（新規） | `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js`         | 自己適用 dogfooding の対象               |
| complete-phase（拡張）           | `.claude/skills/task-specification-creator/scripts/complete-phase.js`                   | atomic / rollback 動作の原典             |
| verify-all-specs（拡張）         | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                 | parity gate 統合実行                     |
| Phase 12 ガイド                  | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Task 1〜6 の詳細                         |
| Phase 12 タスクガイド            | `.claude/skills/task-specification-creator/references/phase-12-tasks-guide.md`          | 実行順序と検証                           |
| Phase 12 完了チェックリスト      | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` | parity gate 文言の正本                   |
| Phase 12 sync パターン           | `.claude/skills/task-specification-creator/references/patterns-phase12-sync.md`         | パターン10（artifacts.json二重管理）正本 |
| spec-update-workflow             | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1 / Step 2 基準                     |
| Phase 11 テンプレート            | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`        | NON_VISUAL / manual-test-result 正本     |
| Phase 13 詳細                    | `.claude/skills/task-specification-creator/references/phase-template-phase13-detail.md` | PR 作成前の参照                          |
| タスク実行ルール                 | `.claude/rules/05-task-execution.md`                                                    | Phase 12 必須チェックリスト              |
| 既知の落とし穴                   | `.claude/rules/06-known-pitfalls.md`                                                    | 失敗パターン対策                         |
| 要件定義書                       | `outputs/phase-1/requirements.md`                                                       | Phase 1 成果物                           |
| 受け入れ基準 AC-1〜AC-7          | `outputs/phase-1/acceptance-criteria.md`                                                | Phase 1 成果物                           |
| drift baseline 実測              | `outputs/phase-1/drift-inventory.md`                                                    | Phase 1 成果物                           |
| parity判定アルゴリズム設計       | `outputs/phase-2/parity-algorithm-design.md`                                            | Phase 2 成果物                           |
| validator CLI/JSON契約           | `outputs/phase-2/validator-placement-design.md`                                         | Phase 2 成果物                           |
| complete-phase拡張設計           | `outputs/phase-2/complete-phase-extension-design.md`                                    | Phase 2 成果物                           |
| checklist gate設計               | `outputs/phase-2/checklist-gate-design.md`                                              | Phase 2 成果物                           |
| 実装サマリー                     | `outputs/phase-5/implementation-summary.md`                                             | Phase 5 成果物                           |
| 変更ファイル一覧                 | `outputs/phase-5/changed-files.md`                                                      | Phase 5 成果物                           |
| リファクタリング計画             | `outputs/phase-8/refactoring-plan.md`                                                   | Phase 8 成果物                           |
| リファクタリング結果             | `outputs/phase-8/refactoring-results.md`                                                | Phase 8 成果物                           |
| 品質保証レポート                 | `outputs/phase-9/quality-assurance-report.md`                                           | Phase 9 成果物                           |
| 最終レビュー結果                 | `outputs/phase-10/final-review-result.md`                                               | Phase 10 成果物                          |
| 出荷準備チェックリスト           | `outputs/phase-10/shipping-checklist.md`                                                | Phase 10 成果物                          |

### システム仕様（aiworkflow-requirements）

| 資料名                  | パス                                                                                   | 用途                                         |
| ----------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------- |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | Step 1-A 同期対象（current facts）           |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`         | Step 1-A 同期対象（completed ledger）        |
| task-workflow-phases    | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`            | Phase 12 close-out 契約への parity gate 追記 |
| topic-map               | `.claude/skills/aiworkflow-requirements/references/topic-map.md`                       | Step 1-D 再生成対象                          |
| keywords.json           | `.claude/skills/aiworkflow-requirements/references/keywords.json`                      | Step 1-D 再生成対象                          |
| LOGS.md                 | `.claude/skills/aiworkflow-requirements/LOGS.md`                                       | Step 1-A 同期対象                            |
| SKILL.md                | `.claude/skills/aiworkflow-requirements/SKILL.md`                                      | 変更履歴追記                                 |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                  | Step 2 候補（エラー分類コード追記）          |
| quality-requirements    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`            | Step 2 候補（parity gate 必須化）            |
| lessons-learned-current | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md` | L-CLOSEOUT-PARITY-001 追加先                 |

## 成果物

| 成果物                       | パス                                                     | 形式     |
| ---------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| コンプライアンスチェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

## 完了条件

- [ ] Task 1: 実装ガイドが完成している（Part 1 に「3 冊の出席簿」モチーフの日常の例えあり、`たとえば` を 1 回以上、Part 2 に型定義 / CLI シグネチャ / 使用例 / エラーハンドリング / エッジケース / 設定項目 / 責務境界マトリクスが揃う）
- [ ] Task 2: システム仕様更新サマリーが完成している（Step 1-A〜1-G + Step 2 の判断記録あり）
- [ ] Task 3: ドキュメント更新履歴が完成している（自己適用 PARITY_OK の貼り付けあり）
- [ ] Task 4: 未タスク検出レポートが完成している（0 件でも出力）
- [ ] Task 5: スキルフィードバックレポートが完成している（改善なしでも出力、`L-CLOSEOUT-PARITY-001` を採番）
- [ ] Task 6: コンプライアンスチェックが完成している（自己申告ではなく CLI 実測値で記録）
- [ ] `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` / 両 skill `LOGS.md` / 両 skill `SKILL.md` が同一 wave で同期されている
- [ ] root `artifacts.json` と `outputs/artifacts.json` の parity が validator で `PARITY_OK` を確認している（**自己適用 / dogfooding**）
- [ ] `manual-test-result.md` が Phase 11 の正本として参照されている
- [ ] `## 視覚証跡` セクションに「UI/UX変更なしのため Phase 11 スクリーンショット不要」が明記されている
- [ ] `.claude/skills/...` と `.agents/skills/...` の mirror parity が確認されている

## タスク100%実行確認【必須】

- [ ] 6 成果物がすべて存在する
- [ ] `implementation-guide.md` Part 1 に「3 冊の出席簿」日常の例えと `たとえば` が含まれる
- [ ] `implementation-guide.md` Part 2 に型定義 / CLI シグネチャ / 使用例 / エラーハンドリング / エッジケース / 設定項目 / 責務境界マトリクスが揃う
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-G / Step 2 の記録がある
- [ ] `documentation-changelog.md` に current / baseline と validator 結果がある
- [ ] **`documentation-changelog.md` および `phase12-task-spec-compliance-check.md` に自己適用 `validate-closeout-parity.js --workflow . --json` の出力（`code: PARITY_OK`, `exitCode: 0`）が貼り付けられている（dogfooding 必須）**
- [ ] `unassigned-task-detection.md` が 0 件でも出力されている
- [ ] `skill-feedback-report.md` が改善なしでも出力されている
- [ ] `skill-feedback-report.md` に `L-CLOSEOUT-PARITY-001` の lessons-learned ID が採番されている
- [ ] `phase12-task-spec-compliance-check.md` が最終ゲートとして完了している
- [ ] `task-workflow.md` / `task-workflow-completed.md` / `topic-map.md` / root `artifacts.json` / `outputs/artifacts.json` が同期されている
- [ ] 両 skill `SKILL.md` 変更履歴に本タスクのバージョンが追記されている
- [ ] 両 skill `LOGS.md` に sync 記録が追記されている
- [ ] `.agents/skills/` ミラーが正本と一致する
- [ ] 計画系文言が `outputs/phase-12/*.md` に残っていない
- [ ] `verify-all-specs.js`（parity gate 含む統合実行）が PASS

## 次Phase

Phase 13（PR作成）へ進む。**ユーザーの明示的な承認後のみ実施する。**
