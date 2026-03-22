# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 12                                         |
| Phase 名   | ドキュメント                               |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 11                                   |
| 後続 Phase | Phase 13（PR作成）                         |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 更新日     | 2026-03-21                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

設計タスクとして確定した centralization 仕様を、Phase 12 の必須成果物と system spec 台帳へ実績同期する。
この Phase の完了意味は workflow root を `implementation_ready` に正規化し、完了台帳では `spec_created` として扱うことであり、runtime policy centralization の production code / test 実装完了を意味しない。
最終再監査では docs だけでなく current code も確認し、未実装の consumer / test gap を follow-up task として formalize する。

## 実行タスク

### Task 1: implementation-guide.md の検証・維持

- Part 1（中学生レベル概念説明）に日常アナロジーが含まれていることを確認する
- Part 2（開発者向け実装詳細）に DD-1〜DD-6、M-1、M-2、後続実装順序が含まれていることを確認する

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

- Step 1-A: `LOGS.md` 2ファイル + `SKILL.md` 2ファイルを更新する
- Step 1-B: 設計タスクの status 表現を `implementation_ready` / `spec_created` に正規化する
- Step 1-C: backlog / completed / workflow / lessons の関連台帳を同一ターンで更新する
- Step 1-D: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic map を再生成する

### Task 3: documentation-changelog.md の作成

- 全 Task 実行後の事後記録として作成する
- 更新した workflow / system spec / unassigned task の実績だけを記録する

### Task 4: 未タスク検出と formalize

- `outputs/phase-12/unassigned-task-detection.md` を必ず作成する
- 既存の 3件に加え、実コード再監査で判明した centralization implementation closure task を追加する
- 各未タスクで 3ステップを完了する
  1. `docs/30-workflows/unassigned-task/` に指示書を作成
  2. `task-workflow-backlog.md` に登録
  3. workflow 正本または lessons へ参照リンクを追加

### Task 5: skill-feedback-report.md の作成

- Phase 12 テンプレートと運用上の漏れを整理し、改善提案を残す
- 改善点がない場合でも空レポートではなく判断結果を記録する

### Mirror Sync: `.claude/` → `.agents/`

- `rsync -avz --checksum .claude/skills/ .agents/skills/` を実行する
- `diff -qr .claude/skills/ .agents/skills/` で 0 差分を確認する

## 参照資料

| 参照資料                | パス                                                                                                          | 内容                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 親パック index          | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート           |
| Task index              | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                  | Task02 の現行メタ情報                  |
| Phase 11                | phase-11-manual-test.md                                                                                       | 発見事項と screenshot plan             |
| Phase 2 成果物          | outputs/phase-2/contract-matrix.md                                                                            | policy contract / ownership table      |
| Phase 5 成果物          | outputs/phase-5/implementation-plan.md                                                                        | downstream 実装順序                    |
| Phase 6 成果物          | outputs/phase-6/regression-expansion-plan.md                                                                  | 回帰観点                               |
| Phase 7 成果物          | outputs/phase-7/integration-gate.md                                                                           | 統合ゲート                             |
| Phase 8 成果物          | outputs/phase-8/refactor-boundaries.md                                                                        | refactor 境界                          |
| Phase 9 成果物          | outputs/phase-9/quality-checklist.md                                                                          | quality gate                           |
| Phase 10 成果物         | outputs/phase-10/final-review-report.md                                                                       | final review 判定根拠                  |
| implementation guide    | outputs/phase-12/implementation-guide.md                                                                      | 後続実装 handoff                       |
| current workflow 正本   | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | canonical workflow / follow-up backlog |
| task-workflow backlog   | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                                    | 未タスク台帳                           |
| task-workflow completed | .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md                                  | 完了台帳                               |
| spec update workflow    | .claude/skills/task-specification-creator/references/spec-update-workflow.md                                  | Phase 12 Step 1/2 判断基準             |

## 実行手順

### ステップ1: Phase 11 と current code を確認する

`outputs/phase-11/manual-test-plan.md`、`outputs/phase-11/discovered-issues.md`、および current code の consumer 実装を確認し、設計成果物と実装実体の差分を固定する。

### ステップ2: Task 1 を確認する

`outputs/phase-12/implementation-guide.md` が 2パート構成を満たしていることを確認する。

### ステップ3: Task 2 を実施する

`LOGS.md` / `SKILL.md` / backlog / completed / workflow / lessons を same-wave で更新し、topic map を再生成する。

### ステップ4: Task 4 を実施する

既存 3件の未タスク導線を確認し、実装 gap を表す高優先度 task を 1件追加する。

### ステップ5: Task 5 と Task 3 を作成する

skill feedback を先に記録し、その結果を含めて documentation-changelog を事後記録として作成する。

### ステップ6: Mirror Sync と validator を実行する

mirror parity、spec validator、implementation-guide validator、unassigned link validator を通して Phase 12 を閉じる。

## 統合テスト連携（Phase 1〜11は必須）

- Phase 1〜11 の成果物整合は維持する
- Phase 12 では centralization 実装そのものを完了扱いせず、code/test gap を follow-up task に切り出す

## 多角的チェック観点（AIが判断）

| 観点     | 適用判断                                                        | 仕様参照先                                                                |
| -------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 論理整合 | status / ledger /成果物の意味が一致しているか                   | `task-workflow*`, `index.md`, `artifacts.json`                            |
| 構造整合 | workflow root / outputs / unassigned の責務分離が崩れていないか | `phase-12-documentation.md`, `outputs/phase-12/*`                         |
| 実装実体 | current code が summary と矛盾しないか                          | `apps/desktop/src/main/services/runtime/*`, `apps/desktop/src/main/ipc/*` |
| 依存関係 | downstream Task03-09 と cleanup task の順序が妥当か             | parent pack / backlog / workflow 正本                                     |

## サブタスク管理

1. Phase 11 成果物と current code の差分確認
2. implementation-guide 2パート要件確認
3. LOGS.md / SKILL.md 4ファイル更新
4. backlog / completed / workflow / lessons 更新
5. 未タスク 4件の formalize と link 確認
6. skill-feedback-report.md 作成
7. documentation-changelog.md 作成
8. outputs/phase-12/6成果物と `artifacts.json` 2系統を同期
9. Mirror Sync と validator 実行

## 成果物

| 成果物               | パス                                                   | 内容                             |
| -------------------- | ------------------------------------------------------ | -------------------------------- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md               | Part 1 + Part 2 の handoff       |
| 仕様同期サマリー     | outputs/phase-12/system-spec-update-summary.md         | 実更新した system spec の実績    |
| 更新履歴             | outputs/phase-12/documentation-changelog.md            | Phase 12 の事後記録              |
| 未タスク検出         | outputs/phase-12/unassigned-task-detection.md          | follow-up 4件の formalize 状況   |
| スキルフィードバック | outputs/phase-12/skill-feedback-report.md              | テンプレート / workflow 改善提案 |
| Phase12 準拠チェック | outputs/phase-12/phase12-task-spec-compliance-check.md | Task 1〜5 + validation 実行結果  |

## 完了条件

- [x] Task 1: implementation-guide.md が Part 1 / Part 2 の2部構成を満たしている
- [x] Task 2: `LOGS.md` が aiworkflow-requirements / task-specification-creator の2ファイル両方更新されている
- [x] Task 2: `SKILL.md` 変更履歴が2ファイル両方更新されている
- [x] Task 2: design task status を `implementation_ready` / `spec_created` に正規化している
- [x] Task 2: backlog / completed / workflow / lessons が same-wave sync されている
- [x] Task 3: documentation-changelog.md が事後記録として作成されている
- [x] Task 4: unassigned-task-detection.md が作成され、4件の follow-up が formalize されている
- [x] Task 5: skill-feedback-report.md が作成されている
- [x] Mirror Sync: `diff -qr .claude/skills/ .agents/skills/` で 0 差分を確認している
- [x] 本 Phase の必須タスクを 100% 実行完了している

## タスク100%実行確認【必須】

- [x] `outputs/phase-12/` の 6成果物が実在する
- [x] `artifacts.json` と `outputs/artifacts.json` が一致している
- [x] 設計タスク close-out を feature 実装完了と誤記していない
- [x] current code の centralization gap を高優先度 follow-up task として formalize している
- [x] documentation-changelog.md の未タスク件数が unassigned-task-detection.md と一致している

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)
