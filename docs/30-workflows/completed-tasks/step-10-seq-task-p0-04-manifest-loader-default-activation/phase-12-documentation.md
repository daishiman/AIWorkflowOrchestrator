# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 12                                            |
| Phase名    | ドキュメント更新                              |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 11: 手動テスト                          |
| 次Phase    | Phase 13: PR作成                              |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

task-specification-creator の Phase 12 必須6成果物を canonical filename で揃え、実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細）を作成する。

## 実行タスク

### Task 12-1: 実装ガイド

- `implementation-guide.md` に Part 1 / Part 2 を作成する
- Part 1: 中学生レベルの概念説明
  - 「dynamic resource pipeline とは何か」を日常の例えで説明する
  - 「なぜデフォルトで有効にするのか」を説明する
  - 「fallback とは何か」を説明する
  - 専門用語は避け、使う場合はすぐにかみ砕いて言い換える
  - `たとえば` を最低1回明示し、図表より文章を優先する
- Part 2: 技術詳細
  - 自動インスタンス化の仕組みと DI override パターン
  - manifest 自動発見のアルゴリズム
  - fallback chain の遷移条件
  - ipc wiring との統合ポイント
  - TypeScript 型定義、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定可能パラメータ / 定数を省略しない
- 作成後に `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/step-10-seq-task-p0-04-manifest-loader-default-activation --json` で内容要件を確認する

### Task 12-2: 仕様更新サマリ

- `system-spec-update-summary.md` に参照した正本仕様と no-op / update 判定を記録する
- `artifacts.json` と `outputs/artifacts.json` の同期状態を記録する
- Step 1-A で完了タスク記録、関連ドキュメント、変更履歴、`.claude/skills/aiworkflow-requirements/LOGS.md`、`.claude/skills/task-specification-creator/LOGS.md`、`.claude/skills/aiworkflow-requirements/SKILL.md`、`.claude/skills/task-specification-creator/SKILL.md` を更新する
- Step 1-B で実装状況テーブルを更新する
- Step 1-C で関連タスク / 未タスク候補テーブルを更新する
- 必要な場合のみ Step 2 で domain spec を更新する
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/step-10-seq-task-p0-04-manifest-loader-default-activation --regenerate` を実行して topic-map / index を再生成する

### Task 12-3: 変更履歴

- `documentation-changelog.md` に今回整えたファイルを列挙する
- `node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/step-10-seq-task-p0-04-manifest-loader-default-activation` の実行結果を反映する
- `artifacts.json` と `outputs/artifacts.json` の同期結果を列挙する
- current / baseline を分けて記録する

### Task 12-4: 未タスク検出

- `unassigned-task-detection.md` に残課題の有無を記録する（0件でも結論を残す）
- `outputs/phase-11/discovered-issues.md` を入力に含め、0件でも current / baseline を分けて記録する
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` を使い、current と baseline を分離して監査する

### Task 12-5: スキルフィードバック

- `skill-feedback-report.md` に改善観点を残す
- 改善点がない場合も「改善点なし」と明記する

### Task 12-6: 準拠チェック

- `phase12-task-spec-compliance-check.md` で6成果物の存在と validator 結果を束ねる
- `phase12-task-spec-compliance-check.md` で `artifacts.json` / `outputs/artifacts.json` / 計画系文言の除去結果も束ねる
- `validate-phase12-implementation-guide.js` と `audit-unassigned-tasks.js` の結果を最終根拠として残す

## 参照資料

| 資料名               | パス                                       | 説明                    |
| -------------------- | ------------------------------------------ | ----------------------- |
| 設計書               | `outputs/phase-2/design-document.md`       | 30思考法の記録          |
| 実装記録             | `outputs/phase-5/implementation-record.md` | current contract の根拠 |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`  | 境界ケース              |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | AC 対応表               |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`    | 最小複雑性の判断        |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`        | 準拠根拠                |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`  | 総合判定                |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`   | evidence の一次入力     |
| 手動テスト発見事項   | `outputs/phase-11/discovered-issues.md`    | Phase 11 の入力         |

## 成果物

| 成果物                | パス                                                     | 説明               |
| --------------------- | -------------------------------------------------------- | ------------------ |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| 仕様更新サマリ        | `outputs/phase-12/system-spec-update-summary.md`         | 参照仕様と同期判定 |
| ドキュメント変更履歴  | `outputs/phase-12/documentation-changelog.md`            | 変更一覧           |
| 未タスク検出          | `outputs/phase-12/unassigned-task-detection.md`          | 残課題有無         |
| スキルフィードバック  | `outputs/phase-12/skill-feedback-report.md`              | skill 改善案       |
| Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物確認        |

## 完了条件

- [ ] 必須6成果物が揃っている
- [ ] Part 1 が中学生レベルで理解可能である
- [ ] Part 2 に技術詳細が記載されている
- [ ] `validate-phase12-implementation-guide.js` が PASS である
- [ ] `LOGS.md` 2ファイルと `SKILL.md` 2ファイルが更新されている
- [ ] `topic-map.md` が再生成されている
- [ ] 計画系文言が除去されている
- [ ] skill 準拠結果が記録されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が同一内容である
- [ ] `outputs/phase-11/discovered-issues.md` を Phase 12 の入力として参照している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
