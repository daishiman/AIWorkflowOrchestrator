# Phase 12: ドキュメント整備

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 12                                                       |
| Phase名    | ドキュメント整備                                         |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 11: 手動テスト                                     |
| 次Phase    | Phase 13: PR準備（blocked）                              |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

task-specification-creator の Phase 12 必須成果物を canonical filename で揃え、`onOpenSkillWizard` の interface 追加を含む更新を同一 wave で閉じる。SkillLifecyclePanel の変更については、中学生レベルの概念説明 + 技術詳細の 2 部構成で実装ガイドを作成し、system spec / changelog / unassigned / feedback / compliance を同時に整える。

## 実行原則

- Task 12-1〜12-5 は並列化できる。Task 12-6 は全結果を統合する直列 gate とする
- 正本は `.claude/skills/...` とし、`.agents/skills/...` は mirror として扱う
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` は同一 wave で同期する
- planned wording（`仕様策定のみ` / `実行予定` / `保留として記録` / `TODO`）を残さない
- 0件の未タスクでも summary を必ず残す
- `onOpenSkillWizard` の追加により `aiworkflow-requirements` の Step 2 は必須
- Phase 13 は user 承認があるまで blocked を維持する

## 実行タスク

| Task      | 内容                               | 主成果物                                                 | 並列性 |
| --------- | ---------------------------------- | -------------------------------------------------------- | ------ |
| Task 12-1 | 実装ガイド作成                     | `outputs/phase-12/implementation-guide.md`               | 可     |
| Task 12-2 | system spec update summary         | `outputs/phase-12/system-spec-update-summary.md`         | 可     |
| Task 12-3 | documentation changelog            | `outputs/phase-12/documentation-changelog.md`            | 可     |
| Task 12-4 | unassigned-task detection          | `outputs/phase-12/unassigned-task-detection.md`          | 可     |
| Task 12-5 | skill feedback report              | `outputs/phase-12/skill-feedback-report.md`              | 可     |
| Task 12-6 | phase12-task-spec-compliance-check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 直列   |

## SubAgent分担

| SubAgent | 担当      | 並列性 | 主な責務                                                 |
| -------- | --------- | ------ | -------------------------------------------------------- |
| A        | Task 12-1 | 可     | Part 1 / Part 2 を分離して実装ガイドを作る               |
| B        | Task 12-2 | 可     | Step 1 / Step 2 の実更新と no-op 判定を記録する          |
| C        | Task 12-3 | 可     | current / baseline と validator 結果を整理する           |
| D        | Task 12-4 | 可     | 0件でも未タスク summary を残す                           |
| E        | Task 12-5 | 可     | skill 改善提案の有無を明記する                           |
| F        | Task 12-6 | 直列   | 6成果物・artifact parity・planned wording を最終確認する |

## Task 12-1: 実装ガイド作成【必須・2パート構成】

`outputs/phase-12/implementation-guide.md` に Part 1 / Part 2 を作成する。

**Part 1: 中学生レベルの概念説明**

- 日常生活の比喩を必ず使い、`たとえば` を最低 1 回明示する
- 専門用語は使わない。使う場合はその場で説明する
- 「なぜ必要か」を先に説明し、そのあとに「何をするか」を書く
- 変更前 / 変更後 / 例え の 3 点を分けて説明する

**Part 2: 技術詳細**

- 削除したコード要素の一覧と削除理由
- 追加したセクション・ボタンの仕様
- Props インターフェースの変更内容（before/after）
- 呼び出し元への影響と対応方法
- 変更最小化原則の適用内容
- current contract と target delta の切り分け
- data-testid の変更一覧（削除3件・追加1件）
- TypeScript の型定義、API シグネチャ、使用例、エッジケース、設定値の一覧

## Task 12-2: system spec update summary【必須】

- Step 1-A〜1-G を実施し、完了結果を `system-spec-update-summary.md` に記録する
- Step 2 は `onOpenSkillWizard: () => void` の追加により必須
- `artifacts.json` と `outputs/artifacts.json` の parity、`diff -qr` の結果、root / mirror の役割分担を記録する
- 仕様更新の primary target file list は実在ファイルから先に確定し、generic な推測ファイル名で閉じない
- `task-workflow.md`、`LOGS.md`、`SKILL.md`、関連 domain spec の更新が必要なら同一 wave で記録する

### Step 1 の記録粒度

| Step   | 記録内容                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------ |
| 1-A    | `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の完了記録                   |
| 1-B    | 関連仕様書の更新有無と実更新結果                                                                       |
| 1-C    | `task-workflow.md` / backlog / completed-tasks の整合                                                  |
| 1-D    | `generate-index.js` 再実行結果                                                                         |
| 1-E    | `artifacts.json` / `outputs/artifacts.json` parity                                                     |
| 1-F    | `verify-unassigned-links.js` の結果                                                                    |
| 1-G    | `validate-phase-output.js` / `verify-all-specs.js` / `validate-phase12-implementation-guide.js` の結果 |
| Step 2 | `onOpenSkillWizard` 追加に伴う interface / UI contract 更新、または no-op 理由                         |

## Task 12-3: documentation changelog

- 変更した file 一覧を canonical path で記録する
- validator 実行結果を current / baseline と分けて記録する
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4 点同期を明記する
- future wording を残さない
- Step 1-A で更新した `LOGS.md` / `SKILL.md` の履歴更新も changelog に含める

## Task 12-4: unassigned-task detection

- `audit-unassigned-tasks.js --target-file` を基準にする
- 0件でも summary を残し、0件理由を明記する
- 1件以上なら formalize path を記録し、`docs/30-workflows/unassigned-task/` か `docs/30-workflows/completed-tasks/unassigned-task/` のどちらかに振り分ける
- baseline 既知ドリフトは今回差分と分けて記録する
- `verify-unassigned-links.js` で task-workflow とのリンク整合を確認する

## Task 12-5: skill feedback report

- `task-specification-creator` と `aiworkflow-requirements` の改善点を、あれば next action 付きで書く
- 改善点がない場合も「なし」と理由を明記する
- 30思考法の適用結果から、次回の再利用ルールとして昇格できるものがあれば残す

## Task 12-6: phase12-task-spec-compliance-check

- Task 12-1〜12-5 がすべて完了してから作成する。早期完了記載は禁止
- `phase12-task-spec-compliance-check.md` では、6成果物の存在、artifact parity、root / mirror parity、validator 結果を根拠付きでまとめる
- `rg -n "計画|予定|TODO|will be|を予定|仕様策定のみ|保留として記録" outputs/phase-12/*.md` の 0 件確認を含める
- Phase 13 は user 承認がない限り blocked のまま維持する

## 参照資料

| 資料名                  | パス                                                                                    | 説明                                 |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| 手動テスト結果          | `outputs/phase-11/manual-test-result.md`                                                | 直前成果物                           |
| 手動テストチェック      | `outputs/phase-11/manual-test-checklist.md`                                             | TC-ID / MT-ID の対応表               |
| 手動テストレポート      | `outputs/phase-11/manual-test-report.md`                                                | 実施概要と結論                       |
| 視覚レビュー            | `outputs/phase-11/ui-sanity-visual-review.md`                                           | 視覚品質確認                         |
| 発見課題                | `outputs/phase-11/discovered-issues.md`                                                 | blocker / note                       |
| 撮影計画                | `outputs/phase-11/screenshot-plan.json`                                                 | 撮影対象の正本                       |
| 画面カバレッジ          | `outputs/phase-11/screenshot-coverage.md`                                               | 画面カバレッジ結果                   |
| キャプチャメタデータ    | `outputs/phase-11/phase11-capture-metadata.json`                                        | capture 証跡メタデータ               |
| 実装記録                | `outputs/phase-5/implementation-record.md`                                              | 変更内容の参照                       |
| 設計書                  | `outputs/phase-2/design.md`                                                             | 設計の参照                           |
| 最終レビュー            | `outputs/phase-10/final-review-result.md`                                               | 品質確認結果                         |
| Phase 11/12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | manual test と Phase 12 の共通ガイド |
| Phase 12 チェックリスト | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | 実装ガイド検証                       |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1 / Step 2 の順序               |
| 検証マトリクス          | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator と PASS 条件               |

## 成果物

| 成果物                       | パス                                                     | 説明                         |
| ---------------------------- | -------------------------------------------------------- | ---------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | 概念説明 + 技術詳細          |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 / parity     |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更ファイルと検証結果       |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件 summary / formalize path |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点と next action         |
| 仕様準拠確認                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence と最終 gate    |

## 完了条件

- [ ] implementation-guide.md が Part 1（概念説明）と Part 2（技術詳細）の 2 部構成で作成されている
- [ ] Part 1 に `たとえば` が最低 1 回含まれている
- [ ] 変更サマリ（before/after 一覧）が含まれている
- [ ] 削除した handleCreate / handlePrepare の削除行が明記されている
- [ ] Props インターフェース変更記録が含まれている
- [ ] `system-spec-update-summary.md` が作成されている
- [ ] `documentation-changelog.md` が canonical path で記録されている
- [ ] `unassigned-task-detection.md` が 0件でも summary を残している
- [ ] `skill-feedback-report.md` に改善点または no-op 理由が記録されている
- [ ] `phase12-task-spec-compliance-check.md` が 6成果物の根拠をまとめている
- [ ] artifacts.json / outputs/artifacts.json の parity が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末尾で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR準備（blocked）](./phase-13-pr.md)
