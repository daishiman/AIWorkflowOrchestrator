# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 12                                  |
| 機能名 | session-resume-renderer-integration |
| 作成日 | 2026-03-29                          |

## 目的

実装に伴うドキュメント更新を完了し、Phase 12 の必須成果物と検証根拠を揃える。

## 実行タスク

### Task 12-1: 実装ガイド作成（Part 1/Part 2）

- Part 1: 中学生レベルの概念説明（例え、理由先行）
- Part 2: 型定義、APIシグネチャ、使用例、エラーハンドリング、エッジケース、設定項目

### Task 12-2: system spec update summary

- Step 1-A/B/C/D の実施結果記録
- Step 2 の判定と更新内容の記録

### Task 12-3: documentation changelog

- 変更ファイル一覧
- validator 実行結果
- current / baseline の区別
- artifacts 同期結果

### Task 12-4: unassigned-task detection

- 0件でも記録を残す
- 1件以上は指示書とリンク同期まで完了

### Task 12-5: skill feedback

- 改善点があれば next action を記録
- 改善点なしでも理由を記録

### Task 12-6: phase12-task-spec-compliance-check

- Task 12-1〜12-5 の完了確認
- 実測値と実体ファイルで根拠を紐付ける

## 参照資料

| 資料名           | パス                                          | 説明               |
| ---------------- | --------------------------------------------- | ------------------ |
| ガイド           | `references/phase-12-documentation-guide.md`  | Phase 12 詳細      |
| チェックリスト   | `references/phase-12-completion-checklist.md` | 完了基準           |
| 実行ワークフロー | `references/spec-update-workflow.md`          | Step 1/2 の手順    |
| 実体確認定義     | `references/phase12-checklist-definition.md`  | 6 成果物の最低要件 |
| Phase 5 実装     | `phase-5-implementation.md`                   | 実装内容           |

## 実行手順

### ステップ1: Task 12-1 を完了する

- `outputs/phase-12/implementation-guide.md` を作成
- `validate-phase12-implementation-guide.js` で検証

### ステップ2: Task 12-2 を完了する（Step 1-A/B/C/D）

- Step 1-A: 完了タスク記録 + 関連リンク + `aiworkflow-requirements` / `task-specification-creator` の LOGS.md 2ファイル + SKILL.md 2ファイル更新
- Step 1-B: 実装状況テーブル更新
- Step 1-C: 関連タスクテーブル更新
- Step 1-D: topic-map 再生成

### ステップ3: Step 2 の判定と反映

- 新規インターフェース/型/定数/IPC 変更の有無を判断
- 更新が必要な場合は `.claude/skills/aiworkflow-requirements/` を実更新
- `spec_created` のため、更新の有無と current/target delta を同一ターンで記録する

### ステップ4: Task 12-3/12-4/12-5 を完了する

- `documentation-changelog.md` に Step 結果と validator 実行結果を記録
- `unassigned-task-detection.md` に検出結果を記録
- `skill-feedback-report.md` を記録

### ステップ5: Task 12-6 で完了確認

- `phase12-task-spec-compliance-check.md` に Task 1〜5 の結果を記録
- 先送り表現が残らないことを確認する

## Phase 10 MINOR 追跡（必要時）

Phase 3 で MINOR が残っている場合は、`system-spec-update-summary.md` と `documentation-changelog.md` に同値で記録する。

## 成果物

| 成果物                     | パス                                                     | 説明          |
| -------------------------- | -------------------------------------------------------- | ------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1/2      |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 結果 |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴      |
| unassigned-task detection  | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出  |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | 改善点        |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了確認      |

## 完了条件

- [ ] Task 12-1〜12-6 が完了している
- [ ] Step 1-A/B/C/D の実施結果が記録されている
- [ ] Step 2 の判定と更新が記録されている
- [ ] 6 成果物が `outputs/phase-12/` に揃っている
- [ ] 先送り表現が残っていない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR 作成
