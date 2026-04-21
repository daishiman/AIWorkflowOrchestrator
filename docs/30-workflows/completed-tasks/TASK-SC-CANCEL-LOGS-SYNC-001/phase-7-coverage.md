---
phase: 7
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
status: pending
created_date: 2026-04-20
---

# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 7                                    |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001         |
| タスク種別 | NON_VISUAL（ドキュメント追記タスク） |
| 前Phase    | phase-6-test-expansion.md            |
| 次Phase    | phase-8-refactoring.md               |
| 作成日     | 2026-04-20                           |

---

## 目的

本タスクは **コード変更を含まない docs-sync wave** であるため、
従来の code coverage は対象外。代わりに **ドキュメント追記カバレッジ** を、
Issue #2313 「未実施」6項目チェックリスト と AC-1〜AC-5 の対応で検証する。

Phase 5 / Phase 6 で完了した追記が、6項目すべての要求を網羅しているかを
**項目単位で grep 検証**し、追記漏れ・対応漏れを構造的に検出する。

---

## 実行タスク

| Task | 内容                                                          | 主成果物                             |
| ---- | ------------------------------------------------------------- | ------------------------------------ |
| 1    | Issue #2313 の未実施項目と AC-1〜AC-5 の対応を 1 表へ集約する | `outputs/phase-7/coverage-report.md` |
| 2    | 追記漏れ、重複、scope 外混入を grep と目視で再確認する        | `outputs/phase-7/coverage-report.md` |
| 3    | 次 phase へ残すべき改善論点と blocker 有無を確定する          | `outputs/phase-7/coverage-report.md` |

- Task 1: 未実施項目と AC-1〜AC-5 の対応を集約する
- Task 2: 追記漏れ、重複、scope 外混入を再確認する
- Task 3: 次 phase に残す改善論点と blocker を確定する

---

## カバレッジ観点

| 観点                    | 基準                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| docs-sync coverage      | Issue #2313 「未実施」6項目すべてに対応する追記が存在する                          |
| acceptance criteria cov | AC-1〜AC-5 すべてが Phase 5 の追記によって満たされている                           |
| spec coverage           | Phase 1〜13 の必須成果物すべてが `artifacts.json` に登録されている                 |
| close-out coverage      | Phase 11 / Phase 12 の証跡導線（grep スナップショット → manual-test-result）切れず |

> code coverage（vitest 等）は本タスクの対象外。代わりに上記 4 観点で網羅性を担保する。

---

## 6項目チェックリスト【必須】

Issue #2313 本文の「未実施」 6項目それぞれに対応する追記が完了しているかを、
**grep 検証コマンド**と**期待結果**のペアで確認する。

| #   | チェック項目                                                                                                                     | 検証コマンド                                                                                                               | 期待結果       | 対応 AC |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- |
| 1   | `task-specification-creator/LOGS.md` に親タスクの wave 記録が追記されている                                                      | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md`                       | 1 件以上ヒット | AC-1    |
| 2   | `aiworkflow-requirements/LOGS.md` に親タスクの close-out 記録が追記されている                                                    | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md`                          | 1 件以上ヒット | AC-2    |
| 3   | `aiworkflow-requirements/references/task-workflow.md`（および active / completed 系）に親タスクの完了記録が追加されている        | `grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/`                     | 1 件以上ヒット | AC-3    |
| 4   | `lessons-learned-current-2026-04.md`（または同等）に 3 知見（NON_VISUAL 代替証跡 / scope 境界明確化 / repo-wide sync）が反映済み | `grep -rn "NON_VISUAL\|scope.*境界\|repo-wide sync" .claude/skills/aiworkflow-requirements/references/lessons-learned*.md` | 3 件以上ヒット | AC-4    |
| 5   | 親タスク `index.md` の Phase 12 ステータスが `completed` になっている                                                            | `grep -n "Phase 12.*completed\|status.*completed" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`       | 該当行が存在   | AC-5    |
| 6   | 親タスク `index.md` のフロントマター `status` が完了状態（`completed` / `pending_pr` 等）に更新されている                        | `head -20 docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の `status:` 行を Read で目視確認             | 完了系の値     | AC-5    |

> **all-must-pass**。1件でも FAIL なら Phase 5（追記漏れ）または Phase 6（形式回帰）へ差し戻す。

---

## 追記漏れ検出手順【必須】

### Step 1: 6項目 grep 一括実行

`outputs/phase-7/coverage-report.md` に **6項目すべての grep 出力**を貼り付ける。
ヒット 0 件の項目があれば「追記漏れ」として該当 Phase に差し戻す。

### Step 2: AC-1〜AC-5 マッピング検証

| AC   | 対応チェック項目 # | 検証                                  |
| ---- | ------------------ | ------------------------------------- |
| AC-1 | 1                  | PASS / FAIL                           |
| AC-2 | 2                  | PASS / FAIL                           |
| AC-3 | 3                  | PASS / FAIL                           |
| AC-4 | 4                  | PASS / FAIL                           |
| AC-5 | 5, 6               | PASS / FAIL（両方 PASS で AC-5 PASS） |

### Step 3: spec coverage 検証

`artifacts.json` と `outputs/phase-*/` 配下の実ファイルの parity を確認する。

```bash
# 各 phase の成果物が artifacts.json に登録されているか
ls docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/outputs/phase-*/
# artifacts.json の path 列と突合
```

| 確認対象                    | 期待                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 1〜10 の outputs パス | `artifacts.json` に全エントリが存在                                                         |
| Phase 11 の outputs パス    | `manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` の 3 ファイル |
| Phase 12 の outputs パス    | mandatory 5 + `phase12-task-spec-compliance-check.md` の 6 ファイル                         |
| Phase 13                    | blocked のため `pr-info.md` は本タスク内で生成しない                                        |

### Step 4: close-out coverage 検証

| 確認対象                                                      | 期待                                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| Phase 11 grep スナップショット → `manual-test-result.md` 反映 | TC-01〜TC-05 すべてに grep 出力が貼られている                   |
| Phase 12 self-close-out → 両 LOGS への本タスク完了記録追記    | Phase 12 完了時点で本タスクIDが両 LOGS に存在する               |
| 親 `index.md` Phase 12 完了宣言 → 本タスクから逆参照          | 親 `index.md` から本タスクへの follow-up リンクまたは記述が残る |

---

## カバレッジ判定基準

| 判定             | 条件                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| FULL COVERAGE    | 6項目チェックリスト all PASS + AC-1〜AC-5 all PASS + spec coverage PASS |
| PARTIAL COVERAGE | 1〜2 項目 FAIL（追記漏れ局所的） → Phase 5 該当 lane に差し戻し         |
| INSUFFICIENT     | 3 項目以上 FAIL（設計レベル漏れ） → Phase 2（設計）へ差し戻し           |

> Phase 8 進行は FULL COVERAGE 確定後とする。

---

## 参照資料

| 資料                                                   | 用途                         |
| ------------------------------------------------------ | ---------------------------- |
| [phase-1-requirements.md](phase-1-requirements.md)     | AC と scope 境界の正本       |
| [phase-5-implementation.md](phase-5-implementation.md) | 実施した更新対象の確認       |
| [phase-6-test-expansion.md](phase-6-test-expansion.md) | 形式回帰と日付回帰の結果確認 |
| `outputs/phase-5/sync-execution-log.md`                | Lane 別の更新実績            |

---

## 成果物

| 成果物          | パス                                 | 説明                                                           |
| --------------- | ------------------------------------ | -------------------------------------------------------------- |
| coverage report | `outputs/phase-7/coverage-report.md` | 6項目チェックリスト結果 + AC マッピング + spec coverage の記録 |

---

## 統合テスト連携【必須】

本タスクは code 変更なしのため、ユニットテスト / 結合テストは対象外。
代替として以下の整合性検証を本 Phase で実施する。

| 判定項目                               | 基準                               | 結果        |
| -------------------------------------- | ---------------------------------- | ----------- |
| Issue #2313 「未実施」6項目への対応    | 6/6 全件対応                       | PASS / FAIL |
| AC-1〜AC-5 マッピング                  | 全 AC が PASS                      | PASS / FAIL |
| spec coverage（artifacts.json parity） | path 列と outputs/ 実体が一致      | PASS / FAIL |
| close-out coverage                     | TC-01〜TC-05 grep 証跡導線が切れず | PASS / FAIL |

---

## 完了条件

- [ ] 6項目チェックリスト all PASS（`coverage-report.md` に grep 出力を貼付）
- [ ] AC-1〜AC-5 マッピング all PASS
- [ ] spec coverage（artifacts.json parity）が記録されている
- [ ] close-out coverage（Phase 11 / 12 / 13 証跡導線）が記録されている
- [ ] カバレッジ判定（FULL / PARTIAL / INSUFFICIENT）が確定している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次Phase

phase-8-refactoring.md — 追記内容の重複・冗長削減と既存エントリ形式整合性の整理
