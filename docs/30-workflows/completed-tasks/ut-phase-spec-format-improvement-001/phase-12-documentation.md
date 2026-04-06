# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 12                                                                |
| Phase名    | ドキュメント更新                                                  |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 11: 手動テスト                                              |
| 次Phase    | Phase 13: PR 作成                                                 |
| ステータス | completed                                                         |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

Task/Step の分離を維持しつつ、docs-only / spec_created workflow の same-wave sync、root evidence、artifact parity を完了する。

## 重要: Task と Step の分離

> **このセクションは「計画（plan）」です。**
> 実行結果・判定根拠は `outputs/phase-12/` 配下の成果物ファイルに記録してください。
> `phase12-task-spec-compliance-check.md` を root evidence として同波で作成し、Task / Step / validator / artifacts.json / current-baseline を 1 ファイルに集約してください。
> 本セクションに実行ログを直接記述しないこと。

## 実行タスク（計画）

### Task 12-1: 実装ガイドの作成（2パート構成）

**Part 1（初学者・中学生レベル）**:

- 日常生活での例え話で「Phase 仕様書のルール」を説明する
- 「計画（plan）」と「実行結果（current fact）」の違いを平易に説明する
- NON_VISUAL / VISUAL の違いを身近な例で説明する
- `たとえば` を最低1回明示する
- 作成後に `validate-phase12-implementation-guide.js` で要件を確認する

**Part 2（開発者・技術者レベル）**:

- Task/Step 分離ガイドラインの技術的詳細
- Handlebars 条件分岐の構文説明と使用例
- NON_VISUAL evidence ルールの適用方法
- 型定義・配置ルール・使用例を明記する

**記録先**: `outputs/phase-12/implementation-guide.md`

### Task 12-2: システム仕様書の更新（4サブステップ）

#### Step 1-A: タスク完了記録

以下のファイルを同一ターンで更新する:

| 更新先                                                                          | 内容                                          |
| ------------------------------------------------------------------------------- | --------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`  | 完了タスク追加                                |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`    | `spec_created` 登録 / 残課題状態更新          |
| `.claude/skills/task-specification-creator/LOGS.md`                             | 変更履歴追記                                  |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                | 変更履歴追記                                  |
| `.claude/skills/task-specification-creator/SKILL.md`                            | 変更履歴追記                                  |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                               | 変更履歴追記                                  |
| `docs/30-workflows/ut-phase-spec-format-improvement-001/index.md`               | Phase 12 root evidence / same-wave 同期の反映 |
| `docs/30-workflows/ut-phase-spec-format-improvement-001/artifacts.json`         | 成果物レジストリ同期                          |
| `docs/30-workflows/ut-phase-spec-format-improvement-001/outputs/artifacts.json` | artifacts mirror 同期                         |

#### Step 1-B: 実装状況テーブルの更新

`task-workflow-backlog.md` のステータスを更新する:

- `UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001`: `未実施` → `spec_created`

#### Step 1-C: 関連タスクテーブルの更新

`ut-phase-spec-format-improvement-001.md`（unassigned-task 指示書）のメタ情報 `ステータス` を `spec_created` に更新する。

#### Step 1-D: 索引再生成（topic-map / keywords）

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 \
  --regenerate
```

**記録**: topic-map / keywords の更新有無と差分概要

#### Step 1-E: 未タスク参照リンク検証 + 差分監査

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

**記録**: `current` / `baseline` の分離結果

#### Step 1-F: DevOps 更新（該当時のみ）

DevOps / CI / release 変更がない場合は **N/A** と明記する。

#### Step 1-G: 検証コマンド順次実行（必須）

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-phase-spec-format-improvement-001
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 \
  --json
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

**記録**: 実行コマンド・結果・PASS/FAIL

#### Step 2: システム仕様更新（条件付き）

本タスクはテンプレートファイルの編集のみで、新規インターフェース/型の追加がないため、**Step 2 は N/A**。

**記録先**: `outputs/phase-12/system-spec-update-summary.md`

### Phase 10 MINOR 追跡テーブル（必須）

Phase 10 で MINOR 判定された指摘がある場合、Phase 12 で追跡結果を記録する。

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス        |
| -------- | -------- | ------------- | ------------- | -------- | ----------------- |
| ...      | ...      | Phase 5/8/12  | Phase 10/12   | ...      | 解決済/未タスク化 |

**記録先**: `outputs/phase-12/documentation-changelog.md`

### Task 12-3: ドキュメント更新履歴の作成

Phase 1〜12 の全ステップ（Step 1-A〜1-G / Step 2）の結果を個別に明記する。「該当なし」の場合もその旨を記録する。

```bash
# documentation-changelog 生成スクリプトがある場合
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 \
  --output outputs/phase-12/documentation-changelog.md
```

**記録先**: `outputs/phase-12/documentation-changelog.md`

### Task 12-4: 未タスク検出レポートの作成（0件でも作成必須）

以下のソースから未タスクを検出する:

| ソース                  | 確認項目                           |
| ----------------------- | ---------------------------------- |
| 元タスク仕様書          | 「スコープ外」として明示された項目 |
| Phase 3/10 レビュー結果 | MINOR 判定の指摘事項               |
| Phase 11 手動テスト     | FAIL テスト / Blocker / Note       |
| 発見課題                | 重要度「高」の課題                 |
| アクセシビリティ        | WCAG 違反                          |
| コードコメント          | TODO/FIXME/HACK/XXX                |

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan .claude/skills/task-specification-creator/assets \
  --output outputs/phase-12/unassigned-candidates.json
```

**記録先**: `outputs/phase-12/unassigned-task-detection.md`

### Task 12-5: スキルフィードバックレポートの作成（改善点なしでも作成必須）

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | 本タスクで実施した改善の有効性         |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

**記録先**: `outputs/phase-12/skill-feedback-report.md`

### Task 12-6: phase12-task-spec-compliance-check【必須】

| 項目     | 内容                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| 記録先   | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                          |
| 集約内容 | Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 / validator / artifacts.json / outputs/artifacts.json / current-baseline |

- Task 12-1〜12-5 の成果物存在確認を 1 ファイルに集約する
- Step 1-A〜1-G の更新有無と `spec_created` 判定を 1 ファイルに集約する
- `artifacts.json` と `outputs/artifacts.json` の parity を 1 ファイルに集約する
- `manual-test-checklist.md` と `manual-test-result.md` の TC-ID ↔ evidence を 1 ファイルに集約する
- root evidence は自己申告 PASS で閉じず、validator 実測値・artifact existence・current/baseline の差分を明記する

**最低限含めるべき検証ログ**:

- `verify-all-specs` / `validate-phase-output`
- `validate-phase12-implementation-guide`
- `verify-unassigned-links`
- `audit-unassigned-tasks --json --diff-from HEAD`（current/baseline 分離）
- `quick_validate.js`（3スキル）

---

## Phase 12 検証ログ記録先（current fact）

> 各タスクの実行結果は以下のファイルに記録する（本セクションには記述しない）。

| Task   | 記録先ファイル                                           | 記述形式       |
| ------ | -------------------------------------------------------- | -------------- |
| Task 1 | `outputs/phase-12/implementation-guide.md`               | 過去形・完了形 |
| Task 2 | `outputs/phase-12/system-spec-update-summary.md`         | 過去形・完了形 |
| Task 3 | `outputs/phase-12/documentation-changelog.md`            | 過去形・完了形 |
| Task 4 | `outputs/phase-12/unassigned-task-detection.md`          | 過去形・完了形 |
| Task 5 | `outputs/phase-12/skill-feedback-report.md`              | 過去形・完了形 |
| Task 6 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 過去形・完了形 |

---

## 参照資料

| 資料名                  | パス                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| spec-update-workflow.md | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                  |
| Phase 12 tasks guide    | `.claude/skills/task-specification-creator/references/phase-12-tasks-guide.md`                  |
| Phase 11 成果物         | `outputs/phase-11/manual-test-result.md`                                                        |
| Phase 11 補助成果物     | `outputs/phase-11/manual-test-checklist.md`                                                     |
| Step 1-G 検証コマンド   | `.claude/skills/task-specification-creator/references/spec-update-step1-validation-commands.md` |

## 成果物

| 成果物                       | パス                                                     |
| ---------------------------- | -------------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              |
| 仕様準拠チェック             | `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| artifacts mirror             | `outputs/artifacts.json`                                 |

## 統合テスト連携

- Phase 13 の PR 作成前チェックリストで、本 Phase の validator / parity 結果を再確認する。
- Phase 11 で作成した manual-test-result.md と manual-test-checklist.md を root evidence へ集約する。

## 完了条件

- [ ] `implementation-guide.md` が作成されている（Part 1 + Part 2）
- [ ] `system-spec-update-summary.md` が作成されている（Step 1-A〜1-C / Step 2=N/A）
- [ ] `documentation-changelog.md` が作成されている（全 Step の結果明記）
- [ ] `unassigned-task-detection.md` が作成されている（0件でも可）
- [ ] `skill-feedback-report.md` が作成されている
- [ ] `phase12-task-spec-compliance-check.md` が作成されている
- [ ] `outputs/artifacts.json` が `artifacts.json` と同期されている
- [ ] LOGS.md が 2 ファイル（task-specification-creator / aiworkflow-requirements）更新されている
- [ ] SKILL.md が 2 ファイル（task-specification-creator / aiworkflow-requirements）更新されている
- [ ] `task-workflow-completed.md` に完了記録が追加されている
- [ ] `topic-map.md` が更新されている
- [ ] `manual-test-checklist.md` が Phase 11 で作成されている
- [ ] `verify-unassigned-links.js` を実行して `ALL_LINKS_EXIST` を確認した
- [ ] `quick_validate.js` を 3 スキルで実行し、結果を記録した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] outputs/artifacts.json が更新されている

## 次Phase

→ [Phase 13: PR 作成](./phase-13-pr-creation.md)
