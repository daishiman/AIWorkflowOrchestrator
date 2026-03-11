# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| Phase        | 12                                |
| Phase名      | ドキュメント更新                  |
| 前提Phase    | Phase 1, 2, 5, 6, 7, 8, 9, 10, 11 |
| 後続Phase    | Phase 13                          |
| ステータス   | completed                         |
| 作成日       | 2026-03-11                        |
| 担当SubAgent | SubAgent-D                        |

## 目的

ホーム画面変更の実装後に必要となる Phase 12 必須 5 タスクを、
`spec_created` 運用と system spec 同期の両面で漏れなく定義する。

## 実行タスク

- Task 1: 実装ガイド作成
- Task 2: システム仕様更新
- Task 3: 更新履歴作成
- Task 4: 未タスク検出
- Task 5: スキルフィードバック

## 参照資料

| 参照資料     | パス                                                                                 | 内容           |
| ------------ | ------------------------------------------------------------------------------------ | -------------- |
| Phase 1要件  | `phase-1-requirements.md`                                                            | 要件根拠       |
| Phase 2設計  | `phase-2-design.md`                                                                  | 実装ガイド根拠 |
| Phase 5仕様  | `phase-5-implementation.md`                                                          | 実装対象       |
| Phase 6仕様  | `phase-6-test-expansion.md`                                                          | 回帰ケース根拠 |
| Phase 7仕様  | `phase-7-coverage-check.md`                                                          | カバレッジ根拠 |
| Phase 8仕様  | `phase-8-refactoring.md`                                                             | 共通化判断根拠 |
| Phase 9仕様  | `phase-9-quality-assurance.md`                                                       | 品質観点根拠   |
| Phase 10仕様 | `phase-10-final-review.md`                                                           | Gate 判定根拠  |
| Phase 11仕様 | `phase-11-manual-test.md`                                                            | 証跡前提       |
| 未タスク運用 | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク起票   |

## システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                            | 内容                                |
| --------------------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| task workflow         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | `spec_created` / completed の更新先 |
| lessons learned       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 苦戦箇所と再発防止                  |
| UI feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Dashboard/Home の反映先候補         |
| UI components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | 新 component の登録候補             |
| spec update workflow  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`  | Step 1-A〜2                         |

## 実行手順

### ステップ1: 実装ガイドを作る

- Part 1 は中学生向けに「ホーム画面は玄関」の比喩を使う
- Part 2 は component 構成、props、route contract、helper を記載する

### ステップ2: システム仕様を同期する

- 実装のみなら `completed`、仕様書作成のみなら `spec_created` を使い分ける
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` と必要な UI 正本を更新候補にする
- repo 内に `.agents/skills/...` のミラーがある場合は、完了前に同内容へ同期し path drift を残さない

### ステップ3: 変更履歴・未タスク・フィードバックを残す

- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`

## 成果物

| 成果物               | パス                                            | 内容        |
| -------------------- | ----------------------------------------------- | ----------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 2部構成     |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | 更新先一覧  |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | changelog   |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 0件でも作成 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善点      |

## 多角的チェック観点

| 観点               | 適用判断                                            | 仕様参照先                                    |
| ------------------ | --------------------------------------------------- | --------------------------------------------- |
| UI/UX              | Home/Dashboard の正本反映確認で適用                 | `aiworkflow-requirements: ui-ux-*.md`         |
| アーキテクチャ     | component / selector の正本化確認で適用             | `aiworkflow-requirements: architecture-*.md`  |
| テスタビリティ     | Phase 11 / coverage 証跡の同期確認で適用            | `aiworkflow-requirements: testing-*.md`       |
| セキュリティ       | 新規 IPC / Preload 追加なしの判断記録を残すため適用 | `aiworkflow-requirements: security-*.md`      |
| エラーハンドリング | fallback 仕様と証跡の同期確認で適用                 | `aiworkflow-requirements: error-handling.md`  |
| lessons learned    | 苦戦箇所の再利用化で適用                            | `aiworkflow-requirements: lessons-learned.md` |

## 完了条件

- [x] Phase 12 必須 5 タスクが明記されている
- [x] `spec_created` と `completed` の使い分けが明記されている
- [x] system spec の更新候補が列挙されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 実装ガイド作成
3. system spec 更新先整理
4. 未タスク / フィードバック整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Task 12-1〜12-5 が明記されている
- [x] `spec_created` と `completed` の使い分けが明記されている
- [x] `artifacts.json` の Phase 12 記述と整合している

## 次のPhase

Phase 13: PR作成
