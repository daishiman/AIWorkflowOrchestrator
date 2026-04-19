# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 12                                                                          |
| 機能名     | TASK-SC-08                                                                  |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 11                                                                    |
| 後続Phase  | Phase 13                                                                    |
| 作成日     | 2026-04-19                                                                  |
| ステータス | 完了                                                                        |

## 目的

Phase 12 の正本を 6 成果物へ集約し、workflow 本文・artifacts・system spec・ledger の同一 wave 同期を完了させる。成果物本文は output に置き、この phase spec 自体には要件と判定基準だけを残す。

## 実行タスク

- Task 12-1: `implementation-guide.md` を Part 1 / Part 2 の 2 部構成で作成する
- Task 12-2: `system-spec-update-summary.md` に Step 1-A〜1-G と Step 2 判定を統合記録する
- Task 12-3: `documentation-changelog.md` に更新ファイル・validator 実測値・artifacts parity を記録する
- Task 12-4: `unassigned-task-detection.md` を 0 件でも出力する
- Task 12-5: `skill-feedback-report.md` を改善点なしでも出力する
- Task 12-6: `phase12-task-spec-compliance-check.md` に Task 1〜5 の完了根拠を集約する

## canonical 成果物

| Task | canonical 名                                             | 用途                             |
| ---- | -------------------------------------------------------- | -------------------------------- |
| 12-1 | `outputs/phase-12/implementation-guide.md`               | 実装ガイド                       |
| 12-2 | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 / same-wave sync |
| 12-3 | `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validator 実測値      |
| 12-4 | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出                     |
| 12-5 | `outputs/phase-12/skill-feedback-report.md`              | スキル改善記録                   |
| 12-6 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終準拠確認                     |

## Task 12-1 要件

- Part 1 は中学生レベルの説明とし、`たとえば` を含む日常例から始める
- Part 2 は型定義、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定可能項目を省略しない
- UI task のため `## 視覚証跡` セクションを設け、Phase 11 の screenshot references と capture metadata を明記する
- `implementation-guide.md` 本文に中学生向け説明を書く。phase spec 本文には埋め込まない

## Task 12-2 要件

`system-spec-update-summary.md` には次を同一 wave で記録する。

| 項目          | 必須     | 内容                                                                                          |
| ------------- | -------- | --------------------------------------------------------------------------------------------- |
| Step 1-A      | ✅       | workflow 完了記録、関連リンク、`LOGS.md` x2、`SKILL.md` history x2、必要なら topic-map 再生成 |
| Step 1-B      | ✅       | 実装状況テーブル更新。今回は実装タスクなので `completed` 判定を前提に確認する                 |
| Step 1-C      | ✅       | 関連タスク / 未タスク候補 / 残課題テーブル同期                                                |
| Step 1-D〜1-G | ✅       | index 再生成、未タスク判定、補助同期、validator 実測値                                        |
| Step 2        | 条件付き | public IPC / preload / state semantics / UI contract の変更有無を判定する                     |

Step 2 は「payload 形状が不変でも、state semantics や phase meaning が変わるなら更新対象」として扱う。

## same-wave sync 対象

`system-spec-update-summary.md` と `phase12-task-spec-compliance-check.md` では、少なくとも以下を同じ事実で揃える。

1. `task-workflow.md`
2. `task-workflow-completed.md`
3. `lane/index.md` または N/A 理由
4. `artifacts.json`
5. `outputs/artifacts.json`

## 参照資料

| 参照資料                   | パス                                                 | 説明                 |
| -------------------------- | ---------------------------------------------------- | -------------------- |
| Phase 11 結果              | `outputs/phase-11/manual-test-result.md`             | 手動検証の正本       |
| Phase 11 checklist         | `outputs/phase-11/manual-test-checklist.md`          | preflight と実施確認 |
| Phase 11 issues            | `outputs/phase-11/discovered-issues.md`              | blocker / note       |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`         | Phase 1 成果物       |
| テスト戦略                 | `outputs/phase-2/test-strategy.md`                   | Phase 2 成果物       |
| 実装サマリー               | `outputs/phase-5/implementation-summary.md`          | Phase 5 成果物       |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` | 準拠基準             |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`    | system spec 正本     |

## 実行手順

1. `artifacts.json` と `outputs/artifacts.json` の parity を初手で確認する。
2. canonical 6 成果物の骨格を用意し、Task 12-1 から 12-5 を埋める。
3. Step 1-A〜1-G / Step 2 の結果を `system-spec-update-summary.md` へ統合する。
4. validator 実測値と未確定表現 0 件確認を `documentation-changelog.md` と `phase12-task-spec-compliance-check.md` へ転記する。

## 成果物

| 成果物                   | パス                                                     | 説明                    |
| ------------------------ | -------------------------------------------------------- | ----------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2         |
| system spec 更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2         |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 0 件でも必須            |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも必須      |
| 準拠最終確認             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 close-out 根拠 |

## 完了条件

- [x] canonical 6 成果物が全て存在する
- [x] `system-spec-update-summary.md` に Step 1-A〜1-G / Step 2 / same-wave sync が記録されている
- [x] `documentation-changelog.md` に validator 実測値と artifacts parity が記録されている
- [x] `phase12-task-spec-compliance-check.md` に未確定表現 0 件確認が記録されている
- [x] `artifacts.json` と `outputs/artifacts.json` が一致している

## 次のPhase

Phase 13: PR作成（user approval 取得まで blocked）
