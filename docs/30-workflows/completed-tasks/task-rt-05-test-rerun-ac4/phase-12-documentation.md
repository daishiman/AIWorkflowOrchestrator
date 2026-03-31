# Phase 12: 完了ドキュメント

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 12                        |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提Phase  | Phase 11                  |
| 後続Phase  | Phase 13                  |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

TASK-RT-05-TEST-RERUN の完了ドキュメントを作成し、関連システム仕様書を同期する。Task 1〜5 の 5 タスクを全て完了させる。

## Phase 12 前提チェック

Phase 12 着手前に `outputs/artifacts.json` と phase spec の artifact 名が一致することを確認する（Feedback 2 対応）。

```bash
cat docs/30-workflows/task-rt-05-test-rerun-ac4/artifacts.json | jq '.phases | keys[]'
ls docs/30-workflows/task-rt-05-test-rerun-ac4/
```

## 実行タスク

- Task 1〜5 を箇条書きで分解し、`outputs/phase-12/` 配下の必須6成果物を揃える
- `.claude` を canonical root、`.agents` を mirror として spec sync 対象を固定する
- Phase 2/5/6/7/8/11 の成果物を入力として close-out の根拠を記録する
- `artifacts.json` と `outputs/artifacts.json` を同期し、Phase 13 は `blocked` を維持する

### Task 1: 実装ガイド作成（2 パート構成）

**目的**: TASK-RT-05-TEST-RERUN の実装ガイドを Part 1（中学生レベル）と Part 2（開発者レベル）の 2 パートで作成する

**Part 1（中学生レベル）の必須要件**:

- 日常生活での例え話を含める
- 「なぜ必要か」を先に説明してから「何をするか」を説明

例え話: 「引っ越し後に電気がつかなかった（環境問題）が、電力会社が修理してくれた（UT-RT-06）ので、電気が必要な家電（テスト）を改めて動かして正常動作を確認した」

**Part 2（技術者レベル）の必須要件**:

- esbuild platform mismatch の発生原因と解消手順
- テスト実行コマンドの詳細
- 更新したドキュメントのパスと変更内容

**出力先**: `outputs/phase-12/implementation-guide.md`

---

### Task 2: システム仕様書更新（Step 1-A〜1-C + 条件付き Step 2）

**Step 1-A: タスク完了記録**

以下の canonical / mirror ファイルを更新し、内容変更が不要なファイルは review/no-op として記録する:

- canonical:
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/task-specification-creator/LOGS.md`
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/task-specification-creator/SKILL.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`
  - `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-create-multi-select-kind.md`
  - `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- mirror:
  - `.agents/skills/aiworkflow-requirements/LOGS.md`
  - `.agents/skills/task-specification-creator/LOGS.md`
  - `.agents/skills/aiworkflow-requirements/SKILL.md`
  - `.agents/skills/task-specification-creator/SKILL.md`
  - `.agents/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md`
  - `.agents/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`
  - `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-create-multi-select-kind.md`
  - `.agents/skills/aiworkflow-requirements/indexes/topic-map.md`

**Step 1-B: 実装状況テーブル更新**

`.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md` と `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md` の TASK-RT-05 周辺エントリに `TASK-RT-05-TEST-RERUN` の完了と rerun close-out を記録し、`.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-create-multi-select-kind.md` に再実行教訓を追記する。

**Step 1-C: 関連タスクテーブル更新**

`docs/30-workflows/unassigned-task/task-rt-05-test-rerun-ac4.md` のステータスを `完了` に更新する。

**Step 2 判定**: 新規インターフェース追加なし（テスト実行・ドキュメント更新のみ）→ Step 2 は N/A

**出力先**: `outputs/phase-12/system-spec-update-summary.md`

---

### Task 3: ドキュメント更新履歴作成

**出力先**: `outputs/phase-12/documentation-changelog.md`

**記録内容**:

- Step 1-A（タスク完了記録）の結果
- Step 1-B（実装状況テーブル更新）の結果
- Step 1-C（関連タスクテーブル更新）の結果
- Step 2（N/A と判定した根拠）

---

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

以下のソースを確認する:

- 元タスク仕様書のスコープ外項目
- Phase 3/10 のレビュー指摘
- Phase 11 の確認結果
- コードコメント（TODO/FIXME）

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

---

### Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

**確認観点**:

- テンプレートの改善余地
- ワークフローの改善余地
- ドキュメントの改善余地

**出力先**: `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 資料名                   | パス                                                                                                  | 内容               |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                                             | AC と scope の固定 |
| Phase 2 設計             | `phase-2-design.md`                                                                                   | rerun と sync 計画 |
| Phase 5 実装             | `phase-5-implementation.md`                                                                           | 環境再構築の根拠   |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                                                                           | AC-3 事前確認      |
| Phase 7 カバレッジ       | `phase-7-coverage-check.md`                                                                           | AC 対応表          |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                                                              | N/A 根拠           |
| Phase 11 手動テスト      | `outputs/phase-11/manual-test-result.md`                                                              | close-out 入力     |
| Phase 9 テスト結果       | `outputs/phase-9/quality-report.md`                                                                   | Task 1/2 の根拠    |
| Phase 10 更新結果        | `outputs/phase-10/doc-update-result.md`                                                               | Task 1/2 の根拠    |
| completed ledger         | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`     | Task 2 の手順      |
| lessons learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-create-multi-select-kind.md` | Task 2 の手順      |
| Phase 12 guide           | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                | 苦戦防止           |

## 成果物

| 成果物                       | パス                                                     | 必須 |
| ---------------------------- | -------------------------------------------------------- | ---- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | 必須 |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | 必須 |
| ドキュメント変更履歴         | `outputs/phase-12/documentation-changelog.md`            | 必須 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 必須 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 必須 |
| Phase12準拠確認              | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 |

## 完了条件

- [ ] Task 1: `implementation-guide.md` が Part 1/2 を含む
- [ ] Task 2: Step 1-A〜1-C の結果が記録されている（Step 2 は N/A と根拠付き）
- [ ] Task 3: `documentation-changelog.md` が全 Step の結果を含む
- [ ] Task 4: `unassigned-task-detection.md` が出力されている（0件でも）
- [ ] Task 5: `skill-feedback-report.md` が出力されている（改善点なしでも）
- [ ] canonical / mirror の LOGS.md、SKILL.md review/no-op、`task-workflow-completed-skill-lifecycle*.md`、`lessons-learned-skill-create-multi-select-kind.md`、`topic-map.md` が同期されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が一致している
- [ ] Phase 13 が `blocked` のまま維持されている
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- 上記 6 成果物を全て `outputs/phase-12/` に作成する
- `artifacts.json` の Phase 12 ステータスを `completed` に更新する
