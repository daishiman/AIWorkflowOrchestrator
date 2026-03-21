# Phase 12: ドキュメント更新 - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 12                           |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

実装結果を task-specification-creator と aiworkflow-requirements の正本へ整合させる。実装ガイド、必要時のみ行う system spec 同期、未タスク検出、skill フィードバック、最終準拠チェックを完了し、Phase 13 の承認ゲートへ渡す。

## 実行タスク

| #   | タスク名                                | 目的                                                    |
| --- | --------------------------------------- | ------------------------------------------------------- |
| 1   | 実装ガイド作成                          | Part 1 と Part 2 の2パートで slide UI 実装を説明する    |
| 2   | system spec update summary 作成         | Step 1 実績と Step 2 判定を slide task 固有に記録する   |
| 3   | documentation changelog 作成            | 更新ファイル、validator 結果、artifacts 同期を記録する  |
| 4   | 未タスク検出                            | Phase 3 / 10 / 11 と TODO 群から残課題を formalize する |
| 5   | skill feedback report 作成              | template / workflow / script の改善点を記録する         |
| 6   | phase12-task-spec-compliance-check 作成 | Task 1-5 完了後に Phase 12 準拠を最終確認する           |

- ドキュメント更新: 実装ガイド、条件付き spec sync、changelog、未タスク、feedback、compliance-check を閉じる。

## 参照資料

| 資料                                                                                            | 用途                                              |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `phase-1-requirements.md`                                                                       | 受入基準、4領域 UI、SlideUIStatus 定義の再確認    |
| `phase-2-design.md`                                                                             | 型、selector、SlideWorkspace 再構成方針の再確認   |
| `phase-5-implementation.md`                                                                     | 実装差分の再確認                                  |
| `phase-6-test-expansion.md`                                                                     | テスト拡充の再確認                                |
| `phase-7-coverage-check.md`                                                                     | カバレッジの前提確認                              |
| `phase-8-refactoring.md`                                                                        | リファクタリング結果の再確認                      |
| `phase-9-quality-assurance.md`                                                                  | 品質結果の再確認                                  |
| `phase-10-final-review.md`                                                                      | 最終レビュー指摘の再確認                          |
| `phase-11-manual-test.md`                                                                       | 手動テスト結果と discovered issues の再確認       |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`          | Phase 12 の必須成果物と完了条件                   |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                  | Step 1 / Step 2 の system spec 更新手順           |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md`         | Slide Workspace 4領域 UI の正本                   |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                      | slide IPC / SyncStatus / SlideUIStatus 契約       |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md`          | handoffGuidance / selector / stale state 契約     |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | runtime / auth-mode / terminal handoff の背景仕様 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                    | 新規未タスク登録先の確認                          |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                  | 既存 follow-up 台帳との整合確認                   |
| `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/`     | task-09 の設計・Phase 11/12 実績の参照            |

## 実行手順

### Task 1: 実装ガイド作成

1. `outputs/phase-12/implementation-guide.md` を 2 パート構成で作成する。
2. Part 1 は中学生レベルで記述する。
   - `たとえば` を明示し、4領域 UI を「掲示板 + 見張り番 + 案内板」のような日常例で説明する
   - なぜ 4領域が必要かを先に説明し、専門用語は使ってもすぐ言い換える
3. Part 2 は開発者向けに記述する。
   - `SlideUIStatus`, `SyncStatus`, `SyncDirection`, `handoffGuidance`, `terminalCommand` の型と責務境界
   - `deriveSlideUIStatus()` のシグネチャと使用例
   - selector の使い分け、`SlideWatchStatus` / `SlideGuidanceBlock` / `TerminalLauncher` の表示条件
   - エッジケース: legacy drift、`idle` / `error` / handoff の優先順位、terminal fallback
4. 作成後に `validate-phase12-implementation-guide.js` を実行し、要件漏れをなくす。

### Task 2: system spec update summary 作成

1. `outputs/phase-12/system-spec-update-summary.md` に Step 1 実績を記録する。
   - 実装で確認した slide UI 差分
   - 更新した canonical file 一覧、または「今回の実装では canonical spec 更新なし」の判定
   - root / mirror / artifacts の同期結果
2. Step 2 の判定を行う。
   - `ui-ux-feature-components-details.md` の表現を実装完了へ更新する必要があるか
   - `api-ipc-system-core.md` / `arch-state-management-reference.md` に新規インターフェースや derived rule を追記する必要があるか
   - `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` に follow-up を登録する必要があるか
3. 条件付き更新の原則:
   - 新規 interface / 型 / API 契約変更がない場合は Step 2 を `該当なし` と記録し、不要な skill / LOGS / topic-map 更新を行わない
   - 正本更新が必要な場合だけ canonical file を更新し、mirror と index を同一 wave で同期する

### Task 3: documentation changelog 作成

1. `outputs/phase-12/documentation-changelog.md` を作成し、以下を記録する。
   - 更新した workflow file と canonical file
   - `verify-all-specs`, `validate-phase-output`, `validate-phase12-implementation-guide` の結果
   - `artifacts.json` と `outputs/artifacts.json` の同期結果
   - Step 2 が `該当なし` だった場合はその理由
2. `更新予定` / `計画済み` / `PR マージ後に対応` のような future wording を残さない。

### Task 4: 未タスク検出

1. 検出ソース:
   - Phase 3 の review result
   - Phase 10 の MINOR 指摘
   - Phase 11 の手動テスト結果
   - 実装コードの `TODO` / `FIXME` / `HACK`
2. 1件以上ある場合は `docs/30-workflows/unassigned-task/` に formalize し、関連する `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` と正本仕様へリンクを張る。
3. 0件でも `outputs/phase-12/unassigned-task-detection.md` を作成し、0件判定の根拠を残す。

### Task 5: skill feedback report 作成

1. `outputs/phase-12/skill-feedback-report.md` に以下を記録する。
   - Phase 4-7 の見出し規約 drift のようなテンプレート改善点
   - Slide UI 4状態と legacy store 語彙のズレを扱う際の workflow 改善点
   - 改善点がない場合は `なし` と判断理由を書く

### Task 6: phase12-task-spec-compliance-check 作成

1. Task 1-5 の成果物が揃ってから `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する。
2. 以下を PASS/FAIL で確認する。
   - 実装ガイド 2パート構成
   - system spec update summary の Step 1 / Step 2 判定
   - documentation changelog の validator 記録
   - 未タスク 0件または `outputs/phase-12/unassigned-task-detection.md` の formalize path
   - skill feedback report の有無
   - Phase 13 が user approval なしでは `blocked` のままであること
3. `outputs/phase-12/*.md` に future wording が残っていないことを確認する。

## 統合テスト連携

- Phase 12 で新規テストは作成しない
- Phase 9 の品質結果と Phase 11 の手動テスト結果を、Task 1-3 の成果物へ引用する
- validator 再実行結果を changelog と compliance-check の両方に記録する

## 多角的チェック観点

| 観点                | チェック内容                                                        |
| ------------------- | ------------------------------------------------------------------- |
| skill 準拠          | Phase 12 成果物が 6 本揃い、Task 12-6 まで閉じている                |
| 正本参照            | slide UI / IPC / state / runtime の正本参照が過不足なく絞られている |
| 条件分岐            | system spec 更新が「必須」「条件付き」「該当なし」で整理されている  |
| future wording 排除 | outputs/phase-12 に予定表現が残っていない                           |
| artifacts 整合      | `artifacts.json` と `outputs/artifacts.json` が一致している         |
| 依存関係整合        | task-09 の設計成果物と UT-SLIDE-IMPL-001 の境界が明確               |

## 成果物

| ファイル                                                 | 説明                          |
| -------------------------------------------------------- | ----------------------------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド（Part 1 + Part 2） |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1 実績 + Step 2 判定     |
| `outputs/phase-12/documentation-changelog.md`            | 更新履歴 + validator 結果     |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果              |
| `outputs/phase-12/skill-feedback-report.md`              | workflow / template 改善点    |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 最終準拠チェック     |

## 完了条件

- [ ] `implementation-guide.md` が Part 1 / Part 2 の2パート構成で作成されている
- [ ] `system-spec-update-summary.md` に Step 1 実績と Step 2 判定が記録されている
- [ ] `documentation-changelog.md` に validator 結果と artifacts 同期結果が記録されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が 0件でも作成されている
- [ ] `skill-feedback-report.md` が「改善点あり / なし」のどちらかで記録されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が Task 1-5 完了後に作成されている
- [ ] `outputs/phase-12/*.md` に future wording が残っていない
- [ ] `artifacts.json` と `outputs/artifacts.json` が一致している
- [ ] user approval 未取得時の Phase 13 が `blocked` と明記されている

## サブタスク管理

- [ ] Task 1: 実装ガイド作成
- [ ] Task 2: system spec update summary 作成
- [ ] Task 3: documentation changelog 作成
- [ ] Task 4: 未タスク検出
- [ ] Task 5: skill feedback report 作成
- [ ] Task 6: phase12-task-spec-compliance-check 作成
- [ ] validator 再実行
- [ ] artifacts 同期確認

## タスク 100% 実行確認

- [ ] 全サブタスクが完了している
- [ ] 成果物 6 本が `outputs/phase-12/` に存在する
- [ ] 完了条件の全項目にチェックが入っている
- [ ] future wording 検索で `outputs/phase-12/*.md` の該当件数が 0 件である

## 次の Phase

Phase 13: PR作成（`phase-13-pr-creation.md`）
