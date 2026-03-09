# Phase 12: ドキュメント - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | TASK-10A-G                |
| Phase    | 12 - ドキュメント         |
| 前Phase  | `phase-11-manual-test.md` |
| 次Phase  | Phase 13（完了）          |

## 目的

Phase 12 必須5成果物を揃え、system spec・skill docs・workflow本文の三層を同時に同期する。

## Task 1: 実装ガイド

**成果物**: `outputs/phase-12/implementation-guide.md`

- Part 1: 中学生向けに「既存テストを補強する意味」を日常例えで説明
- Part 2: 型定義、APIシグネチャ、使用例、エラーハンドリング、エッジケース、設定一覧を整理

## Task 2: 仕様更新

**成果物**: `outputs/phase-12/spec-update-summary.md`

更新対象:

- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/references/execute-workflow.md`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.agents/skills/...` 同等ファイル

## Task 3: documentation-changelog

**成果物**: `outputs/phase-12/documentation-changelog.md`

記録対象:

- preflight / typecheck / targeted suite の結果
- screenshot TC-11-01〜09 の証跡
- ドキュメント同期対象と変更内容

## Task 4: 未タスク検出

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

ルール:

- 既存 open backlog `TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION` は継続利用する
- 新規未タスクは既存 backlog に吸収できない課題のみ起票する

## Task 5: スキル改善レポート

**成果物**: `outputs/phase-12/skill-feedback-report.md`

最低限書くこと:

- screenshot 要求時に non-visual 固定へ逃げない運用
- validator 前提（Part 1/2、TC-ID、証跡列）の先行固定
- no-PR 指示を Phase 13 に強制反映する運用

## 参照資料

| 参照資料           | パス                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| 依存Phase 1        | `phase-1-requirements.md`                                                            |
| 依存Phase 2        | `phase-2-design.md`                                                                  |
| 依存Phase 5        | `phase-5-implementation.md`                                                          |
| 依存Phase 6        | `phase-6-test-expansion.md`                                                          |
| 依存Phase 7        | `phase-7-coverage-check.md`                                                          |
| 依存Phase 8        | `phase-8-refactoring.md`                                                             |
| 依存Phase 9        | `phase-9-quality-assurance.md`                                                       |
| 依存Phase 10       | `phase-10-final-review.md`                                                           |
| 依存Phase 11       | `phase-11-manual-test.md`                                                            |
| 仕様更新フロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       |
| 未タスクガイド     | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` |
| Phase 11/12 ガイド | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          |
| execute-workflow   | `.claude/skills/task-specification-creator/references/execute-workflow.md`           |

## 完了条件

- [x] 5成果物の出力先が全て埋まっている
- [x] 既存 open backlog の重複起票がない
- [x] skill 側の改善点が具体的に記録されている

## テンプレート準拠追補

## 実行タスク

- T1: Phase 12 必須5成果物を生成し、内容を実績ベースに更新する
- T2: Step 1-A / 1-B / 1-C / Step 2 を `spec-update-summary` に記録する
- T3: skill 改善点と未タスク判定を成果物へ反映する

## 実行手順

1. Task 1-5 の成果物を作成・更新する
2. system spec / skill docs の変更を実体ファイルへ反映する
3. validator を再実行し、結果を changelog へ記録する

## 統合テスト連携

| 連携面   | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| Phase 11 | manual-test-result / discovered-issues を受け取る                          |
| Phase 12 | implementation-guide / summary / changelog / backlog / feedback を生成する |
| Phase 13 | no-PR handoff に必要な成果物だけを渡す                                     |

## 多角的チェック観点

| 観点         | 適用 | 確認内容                                                     |
| ------------ | ---- | ------------------------------------------------------------ |
| ドキュメント | ✅   | 5成果物が欠けていないか                                      |
| 要件抽出     | ✅   | aiworkflow / task-spec 両 skill の改善点が具体化されているか |
| スコープ管理 | ✅   | backlog 重複起票がないか                                     |
| 運用制約     | ✅   | no-PR を Phase 13 に継承しているか                           |

## 成果物

| 成果物             | パス                                            | 説明                               |
| ------------------ | ----------------------------------------------- | ---------------------------------- |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`      | Part 1 / Part 2                    |
| 仕様更新要約       | `outputs/phase-12/spec-update-summary.md`       | Step 1-A / 1-B / 1-C / Step 2 判定 |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`   | 実施内容と結果                     |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md` | backlog 整理結果                   |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`     | skill 改善点                       |

## サブタスク管理

1. Task 1 実装ガイド
2. Task 2 仕様更新判定
3. Task 3 changelog
4. Task 4 backlog 検出
5. Task 5 skill feedback

## タスク100%実行確認

- [x] 必須5成果物を出力した
- [x] Step 1-A / 1-B / 1-C / Step 2 判定を明記した
- [x] no-PR と backlog 非重複を引き継いだ

## 次のPhase

Phase 13（完了）
