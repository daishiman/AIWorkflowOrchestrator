# Phase 12: ドキュメント整備

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| Phase名    | ドキュメント整備                          |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 11: 手動テスト                      |
| 次Phase    | Phase 13: PRレビュー・マージ              |
| ステータス | completed                                 |
| 作成日     | 2026-04-07                                |

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 12 の 5成果物と compliance root evidence を揃え、CompleteStep 再設計の実装・仕様・未タスク・フィードバックを skill 定義に照合しながら記録する。

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件                        |
| -------- | --------------------------------------- | ------------------------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可                      |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可                      |
| C        | `system-spec-update-summary.md`         | Part 2 の更新対象確定後に並列可 |
| D        | `documentation-changelog.md`            | C と並列可                      |
| E        | `unassigned-task-detection.md`          | D と並列可                      |
| F        | `skill-feedback-report.md`              | E と並列可                      |
| G        | `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行            |

## 実行タスク

### Task 12-1: 実装ガイドの作成

`outputs/phase-12/implementation-guide.md` に Part 1 / Part 2 を作成する。

#### Part 1: 中学生レベルの概念説明

CompleteStep の再設計について、日常的な比喩を使って説明する。

たとえば、料理の「仕上げ」を考えてみてほしい。料理が完成したとき、「できあがり！」と言うだけでなく、「おいしかった？」と聞いたり、「次はこのレシピどうする？保存する？他の人に教える？」と提案したりする。CompleteStep の再設計はまさにこれと同じで、スキルが生成されたあとに「期待通りでしたか？」と聞いたり、次にやるべきことを 3 つのカードで提示したりする。もし「イメージと違う」なら、最初からやり直せるよう「リカバリーフロー」も用意している。

- `## Part 1` を含める
- `### なぜ必要か`
- `### 何をするか`
- `### 日常の例え`
- `### 今回作ったもの`
- `たとえば` を最低 1 回含めること
- 専門用語は使う場合でも、その場で言い換えること
- 「なぜ必要か」→「何をするか」の順で説明すること
- `references/phase12-checklist-definition.md` の20項目を満たすかを確認する
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/W1-par-02c-complete-step --json` を実行し PASS を記録する

#### Part 2: 技術詳細

次の見出しを必ず含める。

- `## Part 2` を含める
- `### 型定義`
- `### APIシグネチャ`
- `### 使用例`
- `### エラーハンドリング`
- `### エッジケース`
- `### 設定項目と定数一覧`
- `### テスト構成`

内容は `CompleteStepProps` を中心に、以下を明記する。

- `generatedSkill` を表示しない理由と、親コンテキストとして保持する理由
- `hasExternalIntegration` と `externalToolName` の表示条件
- `onQualityFeedback` / `onRetry` / `onExecuteNow` / `onOpenInEditor` / `onCreateAnother` の責務分担
- `onRetry` は Step 0 復帰トリガーのみで、前回入力のプリフィルは W2-seq-03a が担当すること
- `data-testid` とアクセシビリティ属性の対応

### Task 12-2: システム仕様更新サマリーの作成

`outputs/phase-12/system-spec-update-summary.md` に、CompleteStep 再設計に伴う system spec の更新結果を記録する。

#### 更新対象

- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-skill-analysis.md`

#### 記録必須項目

- CompleteStep の旧説明と新説明の before/after
- Props / UI 契約の変更理由
- Step 1-A〜1-C と Step 2 の実施結果
- 更新が必要なファイル名と、更新不要だったファイル名の根拠
- current / baseline の比較結果
- same-wave sync の対象と結果（必要に応じて `LOGS.md` 2ファイル / `SKILL.md` 2ファイル）
- `artifacts.json` / `outputs/artifacts.json` の title / type / status / phase artifact 名の parity を記録する
- `index.md` / `topic-map.md` の再生成有無と結果を記録する
- Phase 11 の evidence（`manual-test-result.md` + UI証跡）を参照し、未実施ならその旨を記録する

#### Step 2 の判断基準

- `CompleteStepProps` で UI 契約が変わるため、Step 2 は原則 `実施` 扱いにする
- bundle index の `ui-ux-feature-components-reference.md` には current contract 注記を追記し、詳細の CompleteStep 行は `ui-ux-feature-components-skill-analysis.md` に反映する
- もし追加の仕様更新が不要なら、その理由を `system-spec-update-summary.md` に明記する

### Task 12-3: ドキュメント更新履歴の作成

`outputs/phase-12/documentation-changelog.md` を作成し、Phase 12 で更新したドキュメントと system spec の変更履歴を残す。

- 更新対象ファイル一覧を網羅する
- validator / current-baseline / same-wave sync の結果を記録する
- Step 1-A〜1-C と Step 2 の結果を、同じ結論で転記する
- `index.md` / `artifacts.json` / `outputs/artifacts.json` / `indexes/topic-map.md` の同期結果を明記する
- build artifact の文字列監査は `rg -F` を優先し、0件判定は `rg -q` の exit code と文書上の 0件を対で残す
- `generate-index.js` 実行結果を記録し、planned wording が 0 件であることを明記する

### Task 12-4: 未タスク検出レポートの作成

`outputs/phase-12/unassigned-task-detection.md` を作成し、今回の CompleteStep 再設計でスコープ外として切り出すべき課題を formalize する。

- 0件でも必ず出力する
- 1件以上なら formalize path を記録し、raw memo で終わらせない
- `docs/30-workflows/unassigned-task/` への配置要否を明記する
- `SkillCreateWizard` 側に残る責務と、`CompleteStep` 側に残すべき責務を分ける
- Step 0 の前回入力プリフィルは W2-seq-03a の責務として扱う
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` の結果を記録する
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <対象>` を current 判定として記録する
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` を current 判定として記録する
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を baseline 判定として分離記録する
- baseline / current を分け、既存 remediation task は wider governance として混同しない
- same-wave で解消した follow-up は completed-tasks/unassigned-task へ移管し current fact として残す

### Task 12-5: スキルフィードバックレポートの作成

`outputs/phase-12/skill-feedback-report.md` を作成し、今回の改善で得られた学びを記録する。

- 改善点が 0 件でも必ず出力する
- `generatedSkill` を保持する理由と、表示しない理由を明記する
- `onQualityFeedback` と `onRetry` の境界を明記する
- canonical filename への寄せ方を、次回再利用可能な形で残す
- 改善点がある場合は next action を明記し、ない場合は「なし」と理由を記録する

### Task 12-6: Phase 12 タスク仕様準拠チェックの作成

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 が task-specification-creator と aiworkflow-requirements の両方に対して準拠しているかを最終確認する。

- `SubAgent分担` テーブルを含め、どの分析をどの lane が担当したかを残す
- 30種の思考法をカテゴリ別に適用した観点を記録する
- `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の存在確認
- 見出しの不足、canonical filename の不一致、参照漏れの確認
- PASS / FAIL と不足点の記録
- `validate-phase12-implementation-guide.js` / `verify-unassigned-links.js` / `audit-unassigned-tasks.js` の実測結果を記録する
- `artifacts.json` / `outputs/artifacts.json` の parity、`index.md` / `topic-map.md` の再生成結果を記録する
- Phase 11 evidence（`manual-test-result.md` / スクリーンショット群）を確認し、未実施なら FAIL 判定にする
- planned wording（`計画` / `予定` / `TODO` など）が 0 件であることを明記する

## 参照資料

| 資料名             | パス                                                                                                                                     | 説明             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`                                                                                                 | 直前成果物       |
| 実装記録           | `outputs/phase-5/implementation-record.md`                                                                                               | 変更内容の参照   |
| 設計書             | `outputs/phase-2/design.md`                                                                                                              | 設計の参照       |
| 最終レビュー       | `outputs/phase-10/final-review-result.md`                                                                                                | 品質確認結果     |
| task-spec 正本     | `.claude/skills/task-specification-creator/SKILL.md`                                                                                     | Phase 12 の基準  |
| system spec 正本   | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                                                        | 更新対象の基準   |
| Phase 12 checklist | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`                                                   | 実体確認チェック |
| CompleteStep 参照  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md` / `ui-ux-feature-components-skill-analysis.md` | 更新対象ファイル |

## 成果物

| 成果物                   | パス                                                     | 説明                               |
| ------------------------ | -------------------------------------------------------- | ---------------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 / テスト構成       |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C / Step 2 の記録      |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴               |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成）            |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）              |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 5成果物 + root evidence の整合確認 |

## 完了条件

- [x] implementation-guide.md が Part 1（概念説明）と Part 2（技術詳細）の 2 部構成で作成されている
- [x] Part 1 に `たとえば` が最低 1 回含まれている
- [x] Part 2 に `型定義` / `APIシグネチャ` / `使用例` / `エラーハンドリング` / `エッジケース` / `設定項目と定数一覧` / `テスト構成` が含まれている
- [x] `validate-phase12-implementation-guide.js` が PASS である
- [x] system-spec-update-summary.md で `ui-ux-feature-components-reference.md` の CompleteStep 行更新が記録されている
- [x] documentation-changelog.md に更新ファイル・validator 結果・current/baseline が記録されている
- [x] unassigned-task-detection.md が 0件でも出力されている
- [x] skill-feedback-report.md が 0件でも出力されている
- [x] phase12-task-spec-compliance-check.md が PASS である
- [x] `artifacts.json` / `outputs/artifacts.json` が同期されている
- [x] `index.md` / `indexes/topic-map.md` の再生成結果が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PRレビュー・マージ](./phase-13-pr.md)
