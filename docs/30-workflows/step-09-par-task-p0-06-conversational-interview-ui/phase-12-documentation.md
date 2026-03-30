# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 12                          |
| 機能名 | conversational-interview-ui |
| 作成日 | 2026-03-29                  |

## 目的

spec_created workflow の close-out と監査可能性を確保するため、実装ガイド・仕様同期・変更履歴・未タスク・スキルフィードバック・準拠チェックを完了する。

## 実行タスク

- Task 12-1: 実装ガイド作成（Part 1/Part 2）
- Task 12-2: system spec update summary（Step 1-A〜1-C 必須、Step 2 条件付き）
- Task 12-3: documentation changelog 作成
- Task 12-4: unassigned-task detection（0件でも記録）
- Task 12-5: skill feedback report 作成
- Task 12-6: phase12-task-spec-compliance-check 作成（Task 12-1〜12-5 完了後）

## 参照資料

| 資料名                | パス                                                                                            | 説明                      |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 5 実装          | `phase-5-implementation.md`                                                                     | 実装内容                  |
| Phase 12 ガイド       | `../../../.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Phase 12 必須要件         |
| Phase 12 チェック定義 | `../../../.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | 実体確認と最低要件        |
| Spec 更新ワークフロー | `../../../.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2 の境界と判断基準 |

## 実行手順

### ステップ1: Task 12-1 実装ガイドを作成する

Part 1（中学生レベル）/ Part 2（技術者向け）を `outputs/phase-12/implementation-guide.md` に作成する。spec_created のため「current contract」と「target delta」を分離する。

### ステップ2: Task 12-2 system spec update summary を作成する

Step 1-A〜1-C は **必須**。Step 2 は interface/API/定数変更がある場合のみ実施し、不要な場合も判断根拠を `outputs/phase-12/system-spec-update-summary.md` に記録する。

### ステップ3: Task 12-3 documentation changelog を作成する

変更ファイル一覧、validator 結果、current/baseline の区別、4点同期結果を `outputs/phase-12/documentation-changelog.md` に記録する。

### ステップ4: Task 12-4 unassigned-task detection を作成する

0件でも summary を残し、必要な場合は formalize path を記録する。

### ステップ5: Task 12-5 skill feedback report を作成する

改善点がない場合も「改善点なし」と理由を記録する。

### ステップ6: Task 12-6 compliance check を作成する

Task 12-1〜12-5 完了後に `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する。planned wording 残存チェックと 4点同期を確認する。

### ステップ7: 最低要件チェックを確認する

`phase12-checklist-definition.md` の 19 項目と実ファイルを照合し、`implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の欠落がないことを確認する。

## spec_created close-out ルール

- Step 1-A〜1-C は必ず実行する（spec_created でも省略不可）
- Step 2 は条件付きだが、判断根拠の記録は必須
- planned wording（「計画」「予定」「保留」等）を残さない
- 4点同期（`index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json`）の整合を確認する

## 成果物

| 成果物                             | パス                                                     | 説明                       |
| ---------------------------------- | -------------------------------------------------------- | -------------------------- |
| implementation guide               | `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2 の実装ガイド |
| system spec update summary         | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 の記録            |
| documentation changelog            | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                   |
| unassigned-task detection          | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出               |
| skill feedback report              | `outputs/phase-12/skill-feedback-report.md`              | スキル改善検討結果         |
| phase12 task spec compliance check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の準拠確認 |

## 完了条件

- [ ] Task 12-1〜12-6 の成果物が全て `outputs/phase-12/` に存在する
- [ ] Step 1-A〜1-C を完了し、Step 2 の実施有無と判断根拠が記録されている
- [ ] planned wording が残っていない
- [ ] 4点同期（`index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json`）が一致している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR 作成
