# Phase 9: 品質保証（Lint・構造検証・全体整合性確認） - タスク仕様書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| Phase        | 9                                         |
| Phase名      | 品質保証（構造検証・整合性確認）          |
| 機能名       | ut-imp-aiworkflow-spec-reference-sync-001 |
| タスクID     | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 |
| 種別         | 改善（仕様書修正のみ）                    |
| GitHub Issue | #903                                      |
| 前提Phase    | Phase 8（リファクタリング）               |
| 後続Phase    | Phase 10（最終レビュー）                  |
| ステータス   | 未実施                                    |
| 作成日       | 2026-02-25                                |

## 目的

更新した仕様書群の Markdown 構造検証・リンク健全性検証・索引整合性確認・SKILL 構造検証・全体整合性確認を総合実行し、品質ゲートの全基準を満たすことを確認する。本タスクはコード変更を伴わないため、Lint・型チェック・テスト実行の代わりに仕様書固有の品質検証を実施する。

## 背景

Phase 8 でリファクタリング（曖昧表現排除・重複排除・書式統一）を実施した仕様書群に対し、構造的整合性と参照健全性を品質ゲートとして検証する。Phase 5 の更新内容が全体の仕様書体系と矛盾していないことを確認する最後の機械検証フェーズである。

## 実行タスク

### タスク1: Markdown 構造検証

**目的**: 全更新ファイルの見出しレベル・セクション順序が仕様書構造基準に準拠していることを確認する

**実行手順**:

1. 以下の検証対象ファイルを順に確認する:
   - `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
   - `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
   - `.claude/skills/task-specification-creator/references/phase-templates.md`
   - `.claude/skills/aiworkflow-requirements/SKILL.md`
   - `.claude/skills/task-specification-creator/SKILL.md`
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/LOGS.md`
2. 各ファイルで以下を確認する:
   - H1 がファイル先頭に1つのみ存在する
   - 見出しレベルが H1 → H2 → H3 の順で階層構造を維持している（H2 を飛ばして H3 に直接遷移していない）
   - コードブロックの言語指定（`bash`、`markdown`、`gherkin`）が正しい

**完了判定**: 全ファイルで見出しレベルが正しい階層構造を維持している

---

### タスク2: リンク整合性検証

**目的**: 全仕様書内の参照リンクが有効であることを確認する

**実行手順**:

1. `verify-unassigned-links.js` を実行する
2. 参照切れ（リンク先が存在しないリンク）が 0 件であることを確認する
3. 完了済みタスクへの `unassigned-task/` 参照が残存していないことを確認する

**検証コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

**完了判定**: 参照切れ 0 件

---

### タスク3: 索引整合性検証

**目的**: `topic-map.md` / `keyword-map.md` / `resource-map.md` が最新の仕様書構造を反映していることを確認する

**実行手順**:

1. `generate-index.js` を `aiworkflow-requirements` と `task-specification-creator` の両方で実行する
2. 再生成後に `git diff` で差分を確認する
3. 差分がない場合: Phase 5/8 での再生成が正しく実施されていると判定する
4. 差分がある場合: Phase 5/8 での再生成漏れとしてフラグし、この Phase 内で再生成を確定する

**検証コマンド**:

```bash
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
cd .claude/skills/task-specification-creator && node scripts/generate-index.js
git diff --stat -- .claude/skills/*/references/topic-map.md
```

**完了判定**: 索引が最新状態であること（再生成後に差分なし、または差分を本 Phase 内で確定）

---

### タスク4: SKILL 構造検証

**目的**: `aiworkflow-requirements` と `task-specification-creator` の SKILL.md 構造が validator で有効判定を受けることを確認する

**実行手順**:

1. `quick_validate.py` を `aiworkflow-requirements` に対して実行する
2. `quick_validate.py` を `task-specification-creator` に対して実行する
3. 両方で `Skill is valid!` が出力されることを確認する

**検証コマンド**:

```bash
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/aiworkflow-requirements --verbose
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/task-specification-creator --verbose
```

**完了判定**: 2 スキル両方で有効判定（`Skill is valid!`）

---

### タスク5: 全体整合性確認

**目的**: 更新した仕様書と既存仕様書の間に矛盾がないことを確認する

**実行手順**:

1. Phase 5 で追加した同期ルールが、既存の `spec-update-workflow.md` Step 1-A 〜 Step 1-E の記述と矛盾していないことを確認する
2. Phase 5 で追加した baseline/current 判定ルールが、`unassigned-task-guidelines.md` の記述と矛盾していないことを確認する
3. Phase 5 で追加した3点同期チェックリストが、`05-task-execution.md` の Phase 12 チェックリストと矛盾していないことを確認する
4. `task-workflow.md` の残課題テーブルと `unassigned-task/` ディレクトリの整合（1:1 対応）を確認する

**完了判定**: 矛盾 0 件

## 品質ゲート

| 項目         | 基準                              | 検証方法                         |
| ------------ | --------------------------------- | -------------------------------- |
| Markdown構造 | 全ファイルで見出しレベルが正しい  | 目視確認                         |
| リンク検証   | 参照切れ 0 件                     | `verify-unassigned-links.js`     |
| 索引整合性   | 最新状態であること                | `generate-index.js` + `git diff` |
| SKILL検証    | 有効判定（2スキル両方）           | `quick_validate.py`              |
| 全体整合性   | 更新仕様書と既存仕様書の矛盾 0 件 | 目視確認                         |

## 参照資料

| 参照資料                   | パス                                                                                                                   | 内容                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 8 成果物             | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-8/refactoring-report.md`    | リファクタリング変更内容 |
| Phase 5 実装記録           | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-5/specification-updates.md` | 検証対象の変更一覧       |
| generate-index.js          | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                     | 索引再生成スクリプト     |
| verify-unassigned-links.js | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                         | リンク検証スクリプト     |
| spec-update-workflow.md    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                         | 検証対象ファイル         |
| task-workflow.md           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                   | 検証対象ファイル         |
| phase-11-12-guide.md       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                            | 検証対象ファイル         |
| phase-templates.md         | `.claude/skills/task-specification-creator/references/phase-templates.md`                                              | 検証対象ファイル         |
| baseline-current-template  | `outputs/phase-5/baseline-current-template.md`                                                                         | Phase 5 成果物           |
| design-deviation-record    | `outputs/phase-5/design-deviation-record.md`                                                                           | Phase 5 成果物           |
| operation-checklist        | `outputs/phase-5/operation-checklist.md`                                                                               | Phase 5 成果物           |

### システム仕様（aiworkflow-requirements + task-specification-creator）参照

| 仕様書                        | 参照セクション          | 参照理由                 |
| ----------------------------- | ----------------------- | ------------------------ |
| spec-update-workflow.md       | Step 1-A 〜 Step 1-E    | 整合性確認の比較対象     |
| unassigned-task-guidelines.md | 全体                    | baseline/current判定比較 |
| 05-task-execution.md          | Phase 12 チェックリスト | 3点同期ルール比較        |
| 02-code-quality.md            | 曖昧表現禁止規則        | 品質基準                 |

## 実行手順

### Step 1: Markdown 構造検証（タスク1）

1. 検証対象8ファイルの見出し構造を確認する
2. H1 → H2 → H3 の階層順序を検証する
3. コードブロック言語指定を検証する
4. 結果を品質レポートに記録する

### Step 2: リンク整合性検証（タスク2）

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

1. コマンドを実行する
2. 参照切れ件数を記録する
3. 完了済みタスクへの `unassigned-task/` 残存参照を確認する

### Step 3: 索引整合性検証（タスク3）

```bash
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
cd .claude/skills/task-specification-creator && node scripts/generate-index.js
git diff --stat -- .claude/skills/*/references/topic-map.md
```

1. 両スキルで `generate-index.js` を実行する
2. `git diff` で差分を確認する
3. 差分がある場合はこの Phase 内で確定する
4. 結果を品質レポートに記録する

### Step 4: SKILL 構造検証（タスク4）

```bash
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/aiworkflow-requirements --verbose
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/task-specification-creator --verbose
```

1. 2スキルに対して validator を実行する
2. `Skill is valid!` 出力を確認する
3. 結果を品質レポートに記録する

### Step 5: 全体整合性確認（タスク5）

1. `spec-update-workflow.md` の既存 Step 1-A 〜 Step 1-E と Phase 5 追加内容の整合を確認する
2. `unassigned-task-guidelines.md` と baseline/current 判定ルールの整合を確認する
3. `05-task-execution.md` Phase 12 チェックリストと3点同期チェックリストの整合を確認する
4. `task-workflow.md` 残課題テーブルと `unassigned-task/` ディレクトリの 1:1 対応を確認する
5. 矛盾箇所があれば記録する

### Step 6: 品質レポート作成

1. タスク1〜5の全結果を `outputs/phase-9/quality-report.md` に集約する
2. 品質ゲートの各項目に対して PASS/FAIL を記録する
3. FAIL 項目がある場合は原因と対応方針を記録する

## 統合テスト連携

全品質ゲートをクリアすることを確認する。Phase 11（手動テスト検証）では、本 Phase で実行した検証コマンドを再実行し、結果の再現性を確認する。

| 統合検証項目             | 検証コマンド                                                                                                                                                    | 期待結果             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 未タスク参照リンク整合   | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` | 参照切れ 0 件        |
| topic-map.md 索引最新化  | `cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js`                                                                                   | 差分なし（最新状態） |
| SKILL validator 有効判定 | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements --verbose`                              | `Skill is valid!`    |
| SKILL validator 有効判定 | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator --verbose`                           | `Skill is valid!`    |
| 全体整合性               | 目視確認（Step 5）                                                                                                                                              | 矛盾 0 件            |

## 多角的チェック観点

| 観点               | 確認内容                                                           | 判定基準                                     |
| ------------------ | ------------------------------------------------------------------ | -------------------------------------------- |
| Markdown構造       | 見出しレベルの階層整合性                                           | H1→H2→H3 の順序が全ファイルで維持されている  |
| リンク健全性       | 全参照リンクの実在性                                               | `verify-unassigned-links.js` で参照切れ 0 件 |
| 索引同期           | topic-map.md が最新状態                                            | `generate-index.js` 再実行後に差分なし       |
| SKILL有効性        | SKILL.md の構造が validator 基準に準拠                             | 2スキル両方で `Skill is valid!`              |
| 全体整合性         | 更新仕様書と既存仕様書の間に矛盾がない                             | 矛盾検出 0 件                                |
| 残課題ディレクトリ | `task-workflow.md` 残課題テーブルと `unassigned-task/` が 1:1 対応 | 不一致 0 件                                  |

## 成果物

| 成果物       | パス                                | 内容                                                  |
| ------------ | ----------------------------------- | ----------------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 構造・リンク・索引・SKILL・整合性の検証結果と判定記録 |

## 完了条件

- [ ] 全更新ファイル（8ファイル）が Markdown 構造基準を満たしている（見出しレベル正しい）
- [ ] `verify-unassigned-links.js` の実行結果でリンク参照切れが 0 件である
- [ ] `generate-index.js` の実行が成功し、topic-map.md が最新状態である（差分なし）
- [ ] `quick_validate.py` で `aiworkflow-requirements` が有効判定（`Skill is valid!`）を受けている
- [ ] `quick_validate.py` で `task-specification-creator` が有効判定（`Skill is valid!`）を受けている
- [ ] 更新仕様書と既存仕様書の間に矛盾が 0 件である
- [ ] `task-workflow.md` 残課題テーブルと `unassigned-task/` ディレクトリが 1:1 対応している
- [ ] 検証コマンドの実行結果が `outputs/phase-9/quality-report.md` に記録されている
- [ ] 品質ゲート全項目の PASS/FAIL 判定が記録されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜5 + 品質レポート作成）を100%実行完了
- [ ] 各タスクの完了を明記
- [ ] 成果物（quality-report.md）が生成されていることを確認
- [ ] `artifacts.json` の Phase 9 ステータスを `completed` に更新

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/phase-10-final-review.md`
