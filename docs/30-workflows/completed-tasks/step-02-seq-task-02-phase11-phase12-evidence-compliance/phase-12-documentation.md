# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 12                                                         |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

`TASK-SDK-02` の Phase 12 成果物を、task-specification-creator の必須要件に沿って current workflow 上で閉じる。

## 実行タスク

- Task 12-1: implementation guide を Part 1 / Part 2 で書き直す
- Task 12-2: system spec update summary に Step 1-A / 1-B / 1-C / Step 2 判定を記録する
- Task 12-3: documentation changelog を書く
- Task 12-4: unassigned task detection を書く
- Task 12-5: skill feedback report を書く
- Task 12-6: phase12 compliance check を書く

## 参照資料

| 資料名                 | パス                                                                                                    | 説明             |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ---------------- |
| 親 Phase 12            | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-12-documentation.md` | 是正対象         |
| 親 outputs phase-12    | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-12/`         | 現行 docs 成果物 |
| Phase 11 結果          | `outputs/phase-11/manual-test-result.md`                                                                | 前提証跡         |
| Phase 2 lane plan      | `outputs/phase-2/remediation-lane-plan.md`                                                              | 更新順           |
| Phase 5 change plan    | `outputs/phase-5/change-plan.md`                                                                        | 実更新順         |
| Phase 6 rerun plan     | `outputs/phase-6/validator-rerun-plan.md`                                                               | 再検証順         |
| Phase 7 coverage audit | `outputs/phase-7/coverage-audit.md`                                                                     | AC 対応          |
| Phase 8 normalization  | `outputs/phase-8/content-normalization-plan.md`                                                         | wording 整理     |
| Phase 9 QA             | `outputs/phase-9/qa-gate-report.md`                                                                     | quality gate     |
| Phase 10 review        | `outputs/phase-10/final-review-summary.md`                                                              | 最終レビュー     |

### システム仕様（aiworkflow-requirements）

| 参照資料                                   | パス                                                                                              | 内容             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------- |
| api-ipc-system-core                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                        | 親機能の契約確認 |
| task-workflow-completed                    | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | 完了記録との整合 |
| lessons-learned-phase12-workflow-lifecycle | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | Phase 12 教訓    |

## 6成果物の役割

| 成果物                                  | 役割                       | PASS 条件                            |
| --------------------------------------- | -------------------------- | ------------------------------------ |
| `implementation-guide.md`               | 利用者向け説明             | Part 1 / Part 2 必須要件を満たす     |
| `system-spec-update-summary.md`         | same-wave 更新要否の記録   | 更新対象または不要理由が明記される   |
| `documentation-changelog.md`            | 今回更新した docs のみ記録 | 「確認のみ」と「更新」を混同しない   |
| `unassigned-task-detection.md`          | follow-up 候補の整理       | 0件でも出力する                      |
| `skill-feedback-report.md`              | skill 改善提案             | next action または「なし理由」がある |
| `phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の完了確認 | 存在確認ではなく内容確認を行う       |

## Task 12-2: system spec update summary の設計

### Step 1-A: 完了記録

- 完了タスク記録、関連ドキュメントリンク、変更履歴を記録する
- `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の更新要否を記録する
- `task-workflow-completed.md`、必要な `lessons-learned*.md`、`SKILL.md` / `LOGS.md` の更新対象を canonical path で列挙する
- `topic-map.md` 再生成や index 再生成の要否を判定し、実施有無と理由を残す

### Step 1-B: 実装状況テーブル更新

- 親タスク `TASK-SDK-02` と今回 corrective workflow の status を分離して記録する
- 仕様書作成のみなら `spec_created`、実更新完了なら `completed` とし、混同しない

### Step 1-C: 関連タスクテーブル更新

- 親 workflow、未タスク、follow-up 候補の status 変更有無を記録する
- `docs/30-workflows/unassigned-task/` の canonical path を使い、workflow 個別 path を増やさない
- `skill-creator` まで波及する改善がある場合のみ、関連する template / reference / `LOGS.md` の更新要否を追記する

### Step 2: domain spec sync（条件付き）

- 新規 interface / API / state / security / UI contract 変更がある場合のみ実施する
- 今回は docs contract hardening が主対象のため、no-op の可能性が高い
- no-op の場合も `system-spec-update-summary.md` と `documentation-changelog.md` に根拠を残す

## 実装ガイド要件

### Part 1: 初学者向け

- なぜ必要かを先に書く
- 日常の例え話を入れる
- 専門用語を使う場合は直後に説明する

### Part 2: 技術者向け

- TypeScript 型定義を載せる
- APIシグネチャを載せる
- 使用例を載せる
- エラーハンドリングを載せる
- エッジケースを載せる
- 設定項目と定数一覧を載せる

## Task 12-4: unassigned task detection の検出ソース

| ソース                      | 確認内容                            |
| --------------------------- | ----------------------------------- |
| 元タスク仕様書              | スコープ外として明示された項目      |
| Phase 3 / Phase 10 レビュー | MINOR / deferred / blocker 候補     |
| Phase 11 manual test        | non-visual 例外、証跡不足、改善提案 |
| outputs / コメント          | TODO / FIXME / HACK / XXX           |

## compliance check 設計

`phase12-task-spec-compliance-check.md` は次を個別判定する。

- Task 12-1: implementation guide 内容完了
- Task 12-2: system spec update summary 内容完了
- Task 12-3: documentation changelog 内容完了
- Task 12-4: unassigned detection 内容完了
- Task 12-5: skill feedback 内容完了

`present` のみで PASS にしない。各項目に証跡パスとレビュー結果を添える。

## 4条件による最終ゲート

| 条件   | Phase 12 での確認内容                                                              |
| ------ | ---------------------------------------------------------------------------------- |
| 価値性 | implementation guide と changelog が利用者と reviewer の判断コストを下げるか       |
| 実現性 | Step 2 no-op / 実更新の判定根拠が書かれているか                                    |
| 整合性 | 6成果物、`index.md`、`artifacts.json`、`outputs/artifacts.json` が同じ状態を示すか |
| 運用性 | 将来時制の未完了文言がなく、Task 12-1〜12-5 の再監査が可能か                       |

## 実行手順

1. implementation guide を全文更新する。
2. Step 1-A / 1-B / 1-C を整理し、same-wave 更新対象の有無を `system-spec-update-summary.md` に残す。
3. Step 2 が不要な場合は no-op 根拠を記録し、Step 2 が必要な場合は primary target file list を明記する。
4. changelog / unassigned / feedback を更新する。
5. 最後に compliance check を更新する。

## 統合テスト連携

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-phase11-phase12-evidence-compliance --json
```

## 成果物

| 成果物                     | パス                                                     | 説明                 |
| -------------------------- | -------------------------------------------------------- | -------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2      |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | same-wave 要否       |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 今回更新記録         |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 検出       |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善提案       |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 判定 |

## 完了条件

- [ ] implementation guide の Part 1 / Part 2 要件を明記した
- [ ] 6成果物の役割差分を明記した
- [ ] Step 1-A / 1-B / 1-C と Step 2 判定の記録先を明記した
- [ ] same-wave 更新対象または不要理由の記録先を明記した
- [ ] compliance check を内容完了ベースで判定する設計にした
- [ ] **本Phase内の全タスクを100%実行完了**
