# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 12                                                           |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 11                                                     |
| 後続Phase  | Phase 13                                                     |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

実装内容をドキュメント化し、システム仕様書との整合を取り、未タスクを検出・記録する。

## 参照資料

| 資料名                  | パス                                                                                                                                                              | 説明                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 要件定義書              | `outputs/phase-1/requirements-definition.md`                                                                                                                      | Phase 1 成果物         |
| 受け入れ基準            | `outputs/phase-1/acceptance-criteria.md`                                                                                                                          | Phase 1 成果物         |
| 実装サマリー            | `outputs/phase-5/implementation-summary.md`                                                                                                                       | Phase 5 成果物         |
| 品質レポート            | `outputs/phase-9/quality-report.md`                                                                                                                               | Phase 9 成果物         |
| 最終レビュー結果        | `outputs/phase-10/final-review-result.md`                                                                                                                         | Phase 10 成果物        |
| 手動テスト結果          | `outputs/phase-11/manual-test-result.md`                                                                                                                          | Phase 11 成果物        |
| Phase 12 テンプレート   | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`                                                                                  | Task 12-6 の準拠基準   |
| task-workflow / lessons | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` | current facts と教訓   |
| unassigned-task 原本    | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-verification-review-single-select-001.md`                                                                 | 背景・リスク・分離方針 |

## 事前チェック【必須】

Phase 12 実行前に以下を確認する:

- P1: LOGS.md 2ファイル更新漏れ（aiworkflow-requirements + task-specification-creator）
- P2: topic-map.md 再生成忘れ
- P29: SKILL.md 変更履歴更新漏れ

## 実行タスク

| Task      | 内容                                   | 主成果物                                                 |
| --------- | -------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成） | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新               | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成               | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（残課題の検出と記録）     | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成       | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | タスク仕様準拠チェック作成             | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成
- Task 12-6: タスク仕様準拠チェック作成

---

## サブタスク管理

- Lane A: Task 12-1 を実施する
- Lane B: Task 12-2 を実施する
- Lane C: Task 12-3〜5 を A/B の証跡が揃った後に実施する
- Lane D: Task 12-6 を C の証跡を受けて実施する
- A/B は並列、C は直列、D は C 完了後に直列

---

### Task 1: 実装ガイド作成【必須】

**2パート構成**:

#### Part 1（初学者・中学生レベル）

「verification review の選択肢がなぜ表示されなかったのか」を日常例えで説明する。

例え話のポイント:

- 「受付の人に『どうしますか？』と聞かれているのに、回答用紙が自由記述になっていた」
- 今回の修正は「回答用紙を選択式（3択）に変えた」

#### Part 2（開発者・技術者レベル）

- `SkillCreatorUserInputRequest` 型の `kind` フィールドの変更内容
- `SkillCreatorUserInputOption` の options 配列定義
- `createVerificationReviewRequest()` の Before/After コードスニペット
- `validateUserInputSubmission` の selectedOptionId バリデーション挙動

---

### Task 2: システムドキュメント更新【必須】

本件は既存の `single_select` 契約を再利用する内部修正であり、Step 2 の domain spec sync は原則不要である。
Step 2 は既存契約の再確認のみを行う no-op とし、`interfaces-agent-sdk-skill.md` の更新は行わない。

#### Step 1-A: タスク完了記録

- [ ] `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-history.md` に完了タスクセクション追加
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` に完了タスク記録を追加
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` の該当行を完了移管または取り消し線化
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須**）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル更新

```bash
# 関連仕様書の検索
grep -rn "TASK-SDK-04-U1-F1" .claude/skills/aiworkflow-requirements/references/task-workflow*.md
```

#### Step 1-C: 関連タスクテーブル更新

- `task-workflow-completed.md` に TASK-SDK-04-U1-F1 の completed record を追加
- `task-workflow-backlog.md` の TASK-SDK-04-U1-F1 行を completed / strike-through に更新
- `unassigned-task/task-imp-task-sdk-04-verification-review-single-select-001.md` のステータスを `completed` に更新

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 2: システム仕様更新の要否判定

| 更新対象                        | 要否判断 | 理由                                                                                      |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `interfaces-agent-sdk-skill.md` | 不要     | 既存の `single_select` / `selectedOptionId` 契約を再利用するだけで新規 interface 追加なし |
| `api-ipc-agent.md`              | 不要     | IPC チャンネル変更なし                                                                    |
| `architecture-overview.md`      | 不要     | アーキテクチャ変更なし                                                                    |

---

### Task 3: ドキュメント更新履歴作成【必須】

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select
```

---

### Task 4: 未タスク検出【必須・0件でも出力】

確認ソース:

- Phase 3 レビュー結果の MINOR 指摘
- Phase 10 レビュー結果の MINOR 指摘
- Phase 11 発見課題
- issue #1693 の「8. リスクと対策」（free_text 入力消失リスク）

リスク「free_text 入力が使えなくなる」への対応は本タスクスコープ外の可能性があるため、
未タスク候補として検討すること。

---

### Task 5: スキルフィードバックレポート【必須・改善点なしでも出力】

| セクション         | 記載内容                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見した改善提案                                                                      |
| 技術的教訓         | 実装中に得られた知見                                                                                |
| スキル改善提案     | `task-specification-creator` / `aiworkflow-requirements` の原文と適用した思考法を根拠として明示する |
| 新規 Pitfall 候補  | 06-known-pitfalls.md に追加すべき教訓                                                               |

### Task 12-6: タスク仕様準拠チェック【必須】

- Task 12-1〜12-5 の成果物が揃っていることを確認する
- Phase 12 の構成が `phase-template-phase12.md` と一致していることを確認する
- planned wording が残っていないことを確認する
- `artifacts.json` と Phase 12/13 の成果物が整合していることを確認する
- `phase12-task-spec-compliance-check.md` に上記結果を記録する

## 多角的チェック観点（AIが判断）

| 観点         | 確認内容                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------- |
| 準拠性       | Task 12-1〜12-6 の成果物名・内容がテンプレートと一致しているか                                |
| 証跡整合     | `interfaces-agent-sdk-skill-history.md` / `task-workflow-completed.md` / backlog が一致するか |
| 省略防止     | planned wording が残っていないか                                                              |
| 変更範囲抑制 | `interfaces-agent-sdk-skill.md` / `architecture-overview.md` など不要ファイルを更新しないか   |
| 依存整合     | completed / backlog / history / logs / artifacts が相互参照で矛盾しないか                     |

---

## 成果物

| 成果物                       | パス                                                     | 必須 | 説明                        |
| ---------------------------- | -------------------------------------------------------- | ---- | --------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | ✅   | Part 1/Part 2 構成          |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | Step 1-A〜1-D + Step 2 結果 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | ✅   | 更新履歴（全 Step の結果）  |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | 0件でも出力必須             |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 改善点なしでも出力必須      |
| タスク仕様準拠チェック       | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | Task 12-1〜12-6 の整合確認  |

## 完了条件

- [ ] 実装ガイド（Part 1: 初学者向け）が作成されている
- [ ] 実装ガイド（Part 2: 技術者向け）が作成されている
- [ ] **interfaces-agent-sdk-skill-history.md** に完了タスクセクションを追加した
- [ ] **task-workflow-completed.md** に完了タスク記録を追加した
- [ ] **task-workflow-backlog.md** の該当行を更新した
- [ ] **aiworkflow-requirements/LOGS.md** にタスク完了エントリを追加した
- [ ] **task-specification-creator/LOGS.md** にタスク完了記録を追加した（2ファイル両方）
- [ ] **aiworkflow-requirements/SKILL.md** 変更履歴を更新した
- [ ] **task-specification-creator/SKILL.md** 変更履歴を更新した
- [ ] topic-map.md を再生成した（`generate-index.js` 実行）
- [ ] Step 2 の更新要否を判断し `documentation-changelog.md` に記録した
- [ ] 未タスク検出レポートが出力されている（0件でも）
- [ ] スキルフィードバックレポートが出力されている（改善点なしでも）
- [ ] タスク仕様準拠チェックが出力されている
- [ ] `artifacts.json` が更新されている（全 Phase 1-12 が completed）
- [ ] `unassigned-task/task-imp-task-sdk-04-verification-review-single-select-001.md` のステータスを更新した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 12
```

## 次のPhase

Phase 13: PR作成
