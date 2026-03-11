# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 12                             |
| Phase名      | ドキュメント更新               |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 11                       |
| 後続Phase    | Phase 13                       |
| 担当SubAgent | SubAgent-A                     |

## 目的

058c の実装結果と検証結果を workflow と system spec へ同期し、再監査時に根拠を一箇所から追える状態を作る。

## 実行タスク

| Task | 名称             | 目的                                     |
| ---- | ---------------- | ---------------------------------------- |
| 12-1 | 実装ガイド作成   | 初学者向け説明と技術詳細を残す           |
| 12-2 | システム仕様更新 | Step 1-A / 1-B / 1-C / Step 2 を整理する |
| 12-3 | 変更履歴記録     | changelog を残す                         |
| 12-4 | 未タスク検出     | 0件でもレポートを出す                    |
| 12-5 | スキル改善記録   | skill feedback を残す                    |

- Task 12-1: 実装ガイドを 2 パート構成で作成する
- Task 12-2: system spec と task workflow への同期を行う
- Task 12-3: documentation changelog を記録する
- Task 12-4: unassigned task を検出し、0 件でもレポートを出す
- Task 12-5: skill feedback report を作成する

## 参照資料

| 参照資料        | パス                | 内容          |
| --------------- | ------------------- | ------------- |
| Phase 2 成果物  | `outputs/phase-2/`  | 設計根拠      |
| Phase 5 成果物  | `outputs/phase-5/`  | 実装内容      |
| Phase 6 成果物  | `outputs/phase-6/`  | 回帰試験拡充  |
| Phase 7 成果物  | `outputs/phase-7/`  | coverage 根拠 |
| Phase 8 成果物  | `outputs/phase-8/`  | refactor 結果 |
| Phase 9 成果物  | `outputs/phase-9/`  | QA 根拠       |
| Phase 10 成果物 | `outputs/phase-10/` | Gate 結果     |
| Phase 11 成果物 | `outputs/phase-11/` | 手動試験根拠  |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                            | 内容                                        |
| ------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| UI実装正本    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature catalog 同期先                      |
| 専用UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`   | 058c 専用 spec                              |
| 状態管理      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | `historySearchSlice` / `editorSlice` 同期先 |
| 画面一覧      | `.claude/skills/aiworkflow-requirements/references/master-design.md`            | `あなたの記録` 表示名同期先                 |
| API実装状況   | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`            | Step 1-B の status 判定先                   |
| IPC契約       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`           | Step 2 判断根拠                             |
| ナビ導線      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | `historySearch` view 導線確認               |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 完了タスクと未タスク同期先                  |
| lessons       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 苦戦箇所同期先                              |

## 実行手順

### ステップ1: 実装ガイドを作成

Part 1 では日常の例えを使って timeline、search、accordion の狙いを説明し、Part 2 では type、API、edge case、設定値を記載する。

### ステップ2: system spec 更新を判定して実施

`.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`、`.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`、`.claude/skills/aiworkflow-requirements/references/arch-state-management.md`、`.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`、`.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md` のどれに同期が必要かを表で判断する。

### ステップ2-補足: Task 12-2 の内訳

| Step | 必須     | 内容                                                                               |
| ---- | -------- | ---------------------------------------------------------------------------------- |
| 1-A  | 必須     | 完了タスク記録、関連ドキュメントリンク、LOGS / topic-map 更新対象を整理する        |
| 1-B  | 必須     | `api-endpoints.md` を含む実装状況表に `spec_created` を使うか判定する              |
| 1-C  | 必須     | 関連タスク / 未タスク候補テーブルの status 更新対象を grep で確認する              |
| 2    | 条件付き | 新規 interface / transport DTO / API 変更がある場合のみ system spec 本文を更新する |

### ステップ3: changelog と未タスクを記録

更新内容、未解決事項、再発防止策を成果物へ分離して出す。

### ステップ4: skill feedback を残す

task-specification-creator と aiworkflow-requirements の再利用時に改善したい点を 1 枚へまとめる。

## Phase実行記録

### 実行タスク

| タスク                     | 結果      | 備考                                  |
| -------------------------- | --------- | ------------------------------------- |
| Task 12-1 実装ガイド作成   | completed | `implementation-guide.md` に反映      |
| Task 12-2 システム仕様更新 | completed | `spec-update-summary.md` に反映       |
| Task 12-3 変更履歴記録     | completed | `documentation-changelog.md` に反映   |
| Task 12-4 未タスク検出     | completed | `unassigned-task-detection.md` に反映 |
| Task 12-5 スキル改善記録   | completed | `skill-feedback-report.md` に反映     |

### 発見事項

- 良かった点: 実装、検証、system spec 更新を 1 workflow に閉じられた
- 問題点: `.claude` 正本と `.agents` mirror の参照が workflow / outputs に混在していた
- 改善提案: generated workflow に対する canonical root verifier を標準化したい

### 次Phaseへの引き継ぎ事項

- Phase 13 はユーザー指示により未実施のまま保留する

## 成果物

| 成果物                    | パス                                                     | 説明                   |
| ------------------------- | -------------------------------------------------------- | ---------------------- |
| implementation guide      | `outputs/phase-12/implementation-guide.md`               | Part 1 + Part 2        |
| spec update summary       | `outputs/phase-12/spec-update-summary.md`                | 同期対象一覧           |
| documentation changelog   | `outputs/phase-12/documentation-changelog.md`            | 更新履歴               |
| unassigned task detection | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果       |
| skill feedback report     | `outputs/phase-12/skill-feedback-report.md`              | スキル改善メモ         |
| phase12 compliance check  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の確認 |

## 完了条件

- [x] implementation guide が 2 パート構成で定義されている
- [x] `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`、`.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`、`.claude/skills/aiworkflow-requirements/references/arch-state-management.md`、`.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md` の同期判断がある
- [x] documentation changelog と unassigned task detection が 0 件でも作成対象になっている
- [x] skill feedback report が成果物に含まれている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 13: PR作成へ進む。
