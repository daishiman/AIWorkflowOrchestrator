# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 12                                     |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

workflow-manifest.json の本番配置に関するドキュメントを作成し、実装の経緯と技術詳細を記録する。`spec_created` / docs-heavy close-out ルールを守り、Step 1-A〜1-C、`artifacts.json` 同期、canonical/mirror 判定を同一 wave で閉じる。

## 実行タスク

- Task 12-1: `implementation-guide.md` を Part 1（中学生レベル概念説明）/ Part 2（技術詳細）で作成する
- Task 12-2: `system-spec-update-summary.md` で Step 1-A〜1-C / Step 2 判定 / canonical-mirror policy を記録する
- Task 12-3: `documentation-changelog.md` に更新履歴を記録する
- Task 12-4: `unassigned-task-detection.md` で current と baseline を分離して未タスク確認を行う
- Task 12-5: `skill-feedback-report.md` にスキル改善メモを記録する
- Task 12-6: `phase12-task-spec-compliance-check.md` で Task 12-1 から 12-5 の完了を確認する

## 参照資料

| 資料名                    | パス                                                                                   | 説明                |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------------- |
| phase-1 requirements      | `phase-1-requirements.md`                                                              | AC                  |
| phase-2 design            | `phase-2-design.md`                                                                    | 設計                |
| phase-5 implementation    | `phase-5-implementation.md`                                                            | 実装結果            |
| phase-9 quality assurance | `phase-9-quality-assurance.md`                                                         | 品質確認結果        |
| phase-10 final review     | `phase-10-final-review.md`                                                             | gate 判定           |
| phase-11 manual test      | `phase-11-manual-test.md`                                                              | 手動テスト結果      |
| phase-12 guide            | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | outputs と wording  |
| spec update workflow      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2     |
| aiworkflow quick refs     | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                    | canonical root 確認 |
| aiworkflow topic map      | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                          | same-wave sync 対象 |

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
- current contract と target delta を分離し、`spec_created` task を completed と誤記しない

### ステップ2: system-spec-update-summary.md を作成する

manifest 配置による影響範囲を Step 1（task-workflow 系）/ Step 2（domain spec 系）で整理する。`.claude/skills/...` を canonical root、`.agents/skills/...` を mirror として扱い、LOGS.md / SKILL.md / topic-map / quick-reference / resource-map の same-wave sync 要否を明記する。

### ステップ3: documentation-changelog.md を作成する

本タスクで作成・変更したファイルの一覧と変更理由を記録する。`index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の4点同期結果、将来表現の非残存、Phase 11 NON_VISUAL evidence の有無も記録する。

### ステップ4: unassigned / feedback / compliance を閉じる

current diff 起因の未タスクと baseline 既知ドリフトを分離し、Task 12-4〜12-6 を後追いではなく同一 wave で閉じる。Phase 13 は user approval 未取得のため `blocked` 維持を明記する。

## 統合テスト連携

| 観点            | 実施内容                                                |
| --------------- | ------------------------------------------------------- |
| Part 1 / Part 2 | implementation guide の必須構造確認                     |
| Step 1 / Step 2 | summary と changelog の主張一致確認                     |
| artifacts sync  | `artifacts.json` と `outputs/artifacts.json` の同値確認 |
| compliance      | Task 12-1 から 12-6 の完了確認                          |

## 多角的チェック観点

| 観点       | この Phase で確認する内容                                           |
| ---------- | ------------------------------------------------------------------- |
| 可読性     | Part 1 が中学生でも理解できる説明になっているか                     |
| 技術正確性 | Part 2 が実装と一致しているか                                       |
| 証跡性     | changelog に全変更と no-op 判定理由が記録されているか               |
| 境界意識   | runtime 配置 path と spec sync の canonical root を混同していないか |

## サブタスク管理

1. implementation-guide.md 作成（Part 1 + Part 2）
2. system-spec-update-summary.md 作成
3. documentation-changelog.md 作成
4. unassigned-task-detection.md 作成
5. skill-feedback-report.md 作成
6. phase12-task-spec-compliance-check.md 作成
7. `artifacts.json` / `outputs/artifacts.json` 同期確認

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
- [ ] Step 1-A〜1-C と Step 2 判定結果が `system-spec-update-summary.md` と `documentation-changelog.md` に同値で記録されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が同期している
- [ ] `outputs/phase-12/*.md` に将来表現が残っていない
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 2 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 9 を参照した
- [ ] Phase 10 を参照した
- [ ] Phase 11 を参照した
- [ ] implementation-guide.md を Part 1 / Part 2 で作成した
- [ ] canonical root と mirror policy を確認した
- [ ] `outputs/artifacts.json` を同期した

## 次のPhase

Phase 13: PR作成
