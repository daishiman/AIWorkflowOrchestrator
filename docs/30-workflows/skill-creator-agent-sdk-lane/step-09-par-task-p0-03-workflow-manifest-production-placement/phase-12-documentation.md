# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 12                                     |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

workflow-manifest.json の本番配置に関するドキュメントを作成し、実装の経緯と技術詳細を記録する。

## 実行タスク

- Task 12-1: `implementation-guide.md` を Part 1（中学生レベル概念説明）/ Part 2（技術詳細）で作成する
- Task 12-2: `system-spec-update-summary.md` で manifest 配置の影響範囲を記録する
- Task 12-3: `documentation-changelog.md` に更新履歴を記録する
- Task 12-4: `unassigned-task-detection.md` で未タスク確認を行う
- Task 12-5: `skill-feedback-report.md` にスキル改善メモを記録する
- Task 12-6: `phase12-task-spec-compliance-check.md` で Task 12-1 から 12-5 の完了を確認する

## 参照資料

| 資料名                    | パス                                                                                   | 説明               |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| phase-1 requirements      | `phase-1-requirements.md`                                                              | AC                 |
| phase-2 design            | `phase-2-design.md`                                                                    | 設計               |
| phase-5 implementation    | `phase-5-implementation.md`                                                            | 実装結果           |
| phase-9 quality assurance | `phase-9-quality-assurance.md`                                                         | 品質確認結果       |
| phase-10 final review     | `phase-10-final-review.md`                                                             | gate 判定          |
| phase-11 manual test      | `phase-11-manual-test.md`                                                              | 手動テスト結果     |
| phase-12 guide            | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | outputs と wording |
| spec update workflow      | `.agents/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2    |

## 実行手順

### ステップ1: implementation-guide.md を作成する

#### Part 1: 中学生レベル概念説明

- workflow-manifest.json とは何か
- なぜ本番パスに配置する必要があるのか
- manifest の中身（phases, resources, hooks）を日常の例えで説明
- ManifestLoader がどう使うのか

#### Part 2: 技術詳細

- manifest の JSON 構造と各フィールドの意味
- ManifestLoader.loadManifest() の検証フロー
- resource descriptor と skill-creator ディレクトリのマッピング
- phase 定義と workflow lifecycle の対応
- entry/exit hooks の役割と command の意味
- TASK-P0-04 への引き継ぎ事項

### ステップ2: system-spec-update-summary.md を作成する

manifest 配置による影響範囲を Step 1（task-workflow 系）/ Step 2（domain spec 系）で整理する。

### ステップ3: documentation-changelog.md を作成する

本タスクで作成・変更したファイルの一覧と変更理由を記録する。

## 統合テスト連携

| 観点            | 実施内容                            |
| --------------- | ----------------------------------- |
| Part 1 / Part 2 | implementation guide の必須構造確認 |
| Step 1 / Step 2 | summary と changelog の主張一致確認 |
| compliance      | Task 12-1 から 12-6 の完了確認      |

## 多角的チェック観点

| 観点       | この Phase で確認する内容                       |
| ---------- | ----------------------------------------------- |
| 可読性     | Part 1 が中学生でも理解できる説明になっているか |
| 技術正確性 | Part 2 が実装と一致しているか                   |
| 証跡性     | changelog に全変更が記録されているか            |

## サブタスク管理

1. implementation-guide.md 作成（Part 1 + Part 2）
2. system-spec-update-summary.md 作成
3. documentation-changelog.md 作成
4. unassigned-task-detection.md 作成
5. skill-feedback-report.md 作成
6. phase12-task-spec-compliance-check.md 作成

## 成果物

| 成果物                     | パス                                                     | 説明               |
| -------------------------- | -------------------------------------------------------- | ------------------ |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | 影響範囲記録       |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 更新履歴           |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク確認       |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | スキル改善メモ     |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須タスク完了確認 |

## 完了条件

- [ ] Task 12-1 から Task 12-6 の成果物が揃っている
- [ ] Part 1 が中学生レベルの説明になっている
- [ ] Part 2 が技術詳細を正確に記述している
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 2 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 9 を参照した
- [ ] Phase 10 を参照した
- [ ] Phase 11 を参照した
- [ ] implementation-guide.md を Part 1 / Part 2 で作成した

## 次のPhase

Phase 13: PR作成
