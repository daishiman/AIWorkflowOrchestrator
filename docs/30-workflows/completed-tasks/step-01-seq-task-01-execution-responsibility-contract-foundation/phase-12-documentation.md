# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 12                                                        |
| Phase 名   | ドキュメント                                              |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 11                                                  |
| 後続 Phase | Phase 13（PR作成）                                        |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

SKILL.md Phase 12 準拠で、execution responsibility / access capability 契約基盤の実装ガイド、system spec 同期、same-wave close-out、未タスク formalization を完了させる。Task 数は 5 だが、成果物は 6 件 + compliance check を必須とする。

## 実行タスク

### Task 1: 実装ガイド作成

- Part 1（中学生レベル）: 「お店の入口が1つになる」の例え話で execution responsibility を説明する
  - capability = 「お店で何ができるか」（AI を直接呼べる / ターミナルで実行できる / 両方 / 何もできない）
  - state = 「お店が今開いているか」（ready / blocked / unavailable）
  - CTA = 「入口の案内板」（AI実行 / ターミナルで実行 / 利用不可）
  - silent fallback = 「案内板なしで勝手に別の入口に誘導すること」（禁止）
- Part 2（技術者レベル）: 既存 canonical capability 語彙（`AccessCapability` と `AuthModeStatus`）と Task01 契約の対応、RuntimePolicyResolver API、contract-matrix の使い方、禁止事項（silent fallback / auto-send / hidden prompt injection）の enforcement 方法

### Task 2: システム仕様書更新

- Step 1-A: タスク完了記録
  - current canonical workflow entrypoint（`workflow-ai-runtime-execution-responsibility-realignment.md`）を基点に required spec set を確定する
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned*.md` / `.claude/skills/aiworkflow-requirements/LOGS.md` / `.claude/skills/aiworkflow-requirements/SKILL.md` への same-wave 影響を確認し、必要な更新を行う
  - parent pack / standalone Task01 / compatibility bridge の canonical 導線を current vocabulary へ揃える
  - LOGS.md を **aiworkflow-requirements と task-specification-creator の 2 ファイル両方**更新する（P1/P25対策: 片方だけでは不完全）
  - SKILL.md を **aiworkflow-requirements と task-specification-creator の 2 ファイル両方**更新要否まで確認し、更新した場合は summary に明記する
  - topic-map.md を `node scripts/generate-index.js` で再生成する（P2対策: セクション変更があれば常に再生成）
- Step 1-B: 実装状況テーブル
  - 本タスクは設計のみ（プロダクションコードなし）のため、実装状況テーブルのステータスを `spec_created` で更新する
- Step 1-C: 関連タスクテーブル
  - `grep -rn "TASK-IMP-EXECUTION-RESPONSIBILITY" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索する
  - 見つかった仕様書の関連タスクテーブルのステータスを更新する
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の completed / backlog 導線を更新する
- Step 1-D: 差分確認
  - `.claude/skills/aiworkflow-requirements/` と `.agents/skills/aiworkflow-requirements/` の mirror 差分を `diff -qr` で確認する
  - `.claude/skills/task-specification-creator/` と `.agents/skills/task-specification-creator/` の mirror 差分を `diff -qr` で確認する
- Step 1-E: validator / index 再生成
  - `generate-index` / validation script 実行結果を記録する
- Step 1-F: cross-skill / workflow 要約
  - 今回の task で得た lessons、下流タスクへの handoff、same-wave sync 内容を summary に整理する
- Step 1-G: formalization close-out
  - `spec_created` のままでも backlog / completed / lessons / unassigned の扱いに矛盾がないことを確認する
- Step 2: システム仕様更新（新規 interface 追加時のみ必須）
  - `interfaces-auth*` / `api-ipc-system*` / `arch-state-management*` / `security-*` の semantic delta を判定し、必要な場合のみ更新する
  - 既存 canonical capability 語彙で表現可能なら **新規型追加は行わない**
  - current task が workflow / governance / extraction drift の是正だけで閉じる場合は、domain spec は「確認のみ・更新不要」と明記する

### Task 3: documentation-changelog.md

- Step 1-A〜Step 2 の全結果を**事後記録**する（P4/P51対策: 実行前に「完了」と書かない）
- 各 Step の完了結果を詳細に記録し、「該当なし」も明記する
- 全 Task 完了後に1つのエージェントが統合作成する（P59対策: 並列エージェント間で情報断絶が起きないよう最後にまとめて記録）

### Task 4: 未タスク検出レポート

- `outputs/phase-12/unassigned-task-detection.md` を出力する（0件でも必須）
- 検出時の3ステップ（P3/P38/P58対策: 例外なし）:
  1. 指示書を `docs/30-workflows/unassigned-task/` 配下に作成する
  2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` に登録する
  3. 関連仕様書に参照リンクを追加する
- 再評価クローズ時は `gh issue close <number> --comment "再評価クローズ: ..."` で GitHub Issue も同時 Close する（P56対策）

### Task 5: スキルフィードバックレポート

- `outputs/phase-12/skill-feedback-report.md` を出力する（改善点なしでも必須）
- 本タスクで発見したワークフロー改善点（落とし穴・効率化案）を記録する
- 改善点がない場合は「改善点なし」として理由を記述する

## 参照資料

| 参照資料                                                 | パス                                                                                                          | 確認する内容                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 親パック index                                           | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート                                        |
| Task index                                               | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md                   | 対象 task のメタ情報と受入基準（AC-1〜AC-4）                        |
| Phase 1                                                  | phase-1-requirements.md                                                                                       | 要件定義の確定内容（AC 基準）                                       |
| Phase 2                                                  | phase-2-design.md                                                                                             | 設計内容と contract-matrix（実装ガイド Part 2 の根拠）              |
| Phase 3                                                  | phase-3-design-review.md                                                                                      | gate-decision の PASS 判定（Phase 12 scope 確定）                   |
| Phase 5 outputs                                          | outputs/phase-5/implementation-plan.md / outputs/phase-5/file-change-scope.md                                 | 実装順序・変更境界の handoff                                        |
| Phase 6 outputs                                          | outputs/phase-6/regression-expansion-plan.md / outputs/phase-6/edge-case-matrix.md                            | fail path / edge case の記録                                        |
| Phase 7 outputs                                          | outputs/phase-7/coverage-targets.md / outputs/phase-7/integration-gate.md                                     | coverage / walkthrough gate の要約                                  |
| Phase 8 outputs                                          | outputs/phase-8/refactor-boundaries.md / outputs/phase-8/simplification-candidates.md                         | refactor 境界と simplification 判定                                 |
| Phase 9 outputs                                          | outputs/phase-9/quality-checklist.md / outputs/phase-9/risk-register.md                                       | release readiness と residual risk                                  |
| Phase 10                                                 | phase-10-final-review.md                                                                                      | final-gate-decision（MINOR 指摘の未タスク化対象）                   |
| Phase 11                                                 | phase-11-manual-test.md                                                                                       | walkthrough 結果（未タスク化候補の発見事項）                        |
| ui-ux-navigation                                         | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                         | `settings` public shell / `ViewType` / `renderView()` 影響          |
| ui-ux-settings-core                                      | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                      | settings bypass / timeout fallback の同期先                         |
| workflow-execution-responsibility                        | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | execution responsibility 再配線の canonical workflow                |
| workflow-authmode                                        | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | 旧 authmode foundation から current capability 契約への移行根拠     |
| interfaces-auth                                          | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                          | auth / capability family の親入口                                   |
| arch-state-management-core                               | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | selector 境界と既存 capability 語彙の同期先                         |
| api-ipc-system                                           | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                           | IPC family の親入口                                                 |
| interfaces-auth-core                                     | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                                     | transport DTO / capability 契約の同期先                             |
| llm-ipc-types                                            | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                            | `llm:check-health` / selected-config / legacy health route の型契約 |
| arch-state-management                                    | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                    | タスク完了記録の追加先                                              |
| api-ipc-system-core                                      | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                                      | タスク完了記録の追加先                                              |
| security-electron-ipc-core                               | .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md                               | AuthModeStatusResponse と Preload / IPC security boundary           |
| task-workflow                                            | .claude/skills/aiworkflow-requirements/references/task-workflow.md                                            | completed family / backlog family の親入口                          |
| task-workflow-backlog                                    | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                                    | follow-up formalization の同期先                                    |
| task-workflow-completed                                  | .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md                                  | completed 化の同期先                                                |
| lessons-learned                                          | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                                          | lessons family の親入口                                             |
| lessons-learned-current                                  | .claude/skills/aiworkflow-requirements/references/lessons-learned-current.md                                  | same-wave sync の確認先                                             |
| lessons-learned-viewtype-electron-ui                     | .claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md                     | route drift 再発防止                                                |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | .claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md | auth/timeout 再発防止                                               |
| SKILL.md（task-spec）                                    | .claude/skills/task-specification-creator/SKILL.md                                                            | Phase 12 準拠チェックの基準                                         |

## 実行手順

### ステップ1: Phase 10 の final-gate-decision を読み Phase 12 scope を確定する

`outputs/phase-10/final-gate-decision.md` を読む。MINOR 指摘がある場合は全て未タスク仕様書（Task 4）に変換する対象として記録する。

### ステップ2: Task 1〜5 を順番に実施する

Task 1（実装ガイド）→ Task 2（仕様書更新）→ Task 3（changelog） → Task 4（未タスク検出）→ Task 5（スキルフィードバック）の順で実施する。サブエージェントに委譲する場合は 3 ファイル以下/エージェントに分割する（P43対策: 7ファイル以上を1エージェントに任せると rate limit で中断する）。

### ステップ3: documentation-changelog.md を全 Task 完了後に一括作成する

Task 1〜5 の全成果物が揃ってから documentation-changelog.md を作成する（P51対策）。changelog 作成前に `git diff --stat -- .claude/skills/` で実際の変更ファイル数を確認する。

### ステップ4: Phase 12 SKILL.md 準拠チェックを実施する

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、SKILL.md の Phase 12 チェックリスト（Task 1-5）の全項目が完了していることを確認する。

## 統合テスト連携

Phase 12 は統合テスト実行なし。Phase 11 の walkthrough 結果（discovered-issues.md）を参照し、未タスク化が必要な発見事項を Task 4 で処理する。

## 落とし穴対策チェックリスト

Phase 12 実行時に以下の落とし穴を避ける:

| Pitfall ID | 対策                                                                                       | 確認タイミング  |
| ---------- | ------------------------------------------------------------------------------------------ | --------------- |
| P1/P25     | LOGS.md を aiworkflow-requirements + task-specification-creator の 2 ファイル両方更新する  | Step 1-A 実行後 |
| P1bis      | SKILL.md を aiworkflow-requirements + task-specification-creator の 2 ファイル両方確認する | Step 1-A 実行後 |
| P2         | topic-map.md を `node scripts/generate-index.js` で再生成する                              | Step 1-A 実行後 |
| P3/P38/P58 | 未タスク指示書を `docs/30-workflows/unassigned-task/` 配下に作成し、3ステップを完了する    | Task 4 実行後   |
| P4/P51     | documentation-changelog は全 Task 完了後に事後記録する                                     | Task 3 作成前   |
| P43        | サブエージェントへの委譲は 3 ファイル以下/エージェントに分割する                           | Task 2 実行時   |
| P56        | 再評価クローズ時は `gh issue close` を実行する                                             | Task 4 実行後   |
| P57        | 新規 interface が必要な場合のみ Phase 12 完了時点で `.claude/skills/` を実更新する         | Step 2 実行後   |
| P59        | documentation-changelog は最後に 1 エージェントが統合作成する                              | Task 3 作成前   |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                                                                     | 仕様参照先                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| UI/UX                  | 実装ガイドに capability 状態別の UI 説明が含まれる場合                                                       | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 既存 capability 語彙 / transport DTO の再利用方針が architecture 仕様に影響する場合                          | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | interfaces-auth-core.md の型変更が IPC 契約に影響する場合                                                    | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | LOGS.md / `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / topic-map.md を更新する場合 | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 10 final-gate-decision の確認と Phase 12 scope 確定
2. Task 1: 実装ガイド作成（Part 1 + Part 2）
3. Task 2-Step1-A: タスク完了記録（interfaces-auth-core / arch-state-management / api-ipc-system-core）
4. Task 2-Step1-A: LOGS.md 2ファイル更新（P1/P25対策）
5. Task 2-Step1-A: topic-map.md 再生成（P2対策）
6. Task 2-Step1-B: 実装状況テーブル更新
7. Task 2-Step1-C: 関連タスクテーブル更新
8. Task 2-Step2: 新規 interface が必要な場合は interfaces-auth-core.md または対応する正本へ反映（P57対策）
9. Task 4: 未タスク検出レポート（unassigned-task-detection.md）
10. Task 5: スキルフィードバックレポート（skill-feedback-report.md）
11. Task 3: documentation-changelog.md（全Task完了後に事後記録）
12. Phase 12 SKILL.md 準拠チェック（phase12-task-spec-compliance-check.md）
13. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物               | パス                                                   | 内容                                                 |
| -------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md               | Part 1（中学生レベル）+ Part 2（技術者レベル）       |
| 仕様同期サマリー     | outputs/phase-12/system-spec-update-summary.md         | Step 1-A〜Step 2、same-wave close-out の更新サマリー |
| 更新履歴             | outputs/phase-12/documentation-changelog.md            | 全 Step の事後記録（P4/P51対策）                     |
| 未タスク検出         | outputs/phase-12/unassigned-task-detection.md          | 未タスク検出結果（0件でも出力必須）                  |
| スキルフィードバック | outputs/phase-12/skill-feedback-report.md              | スキル改善提案（改善点なしでも出力必須）             |
| Phase12 準拠チェック | outputs/phase-12/phase12-task-spec-compliance-check.md | SKILL.md Phase 12 準拠チェック全項目                 |

## 完了条件

- [ ] implementation-guide.md に Part 1（中学生レベル）と Part 2（技術者レベル）が含まれている
- [ ] LOGS.md が aiworkflow-requirements と task-specification-creator の 2 ファイル両方更新対象として system-spec-update-summary.md に明記されている（P1/P25対策）
- [ ] SKILL.md の 2 ファイル確認結果が system-spec-update-summary.md に明記されている
- [ ] topic-map.md 再生成の実行ログが system-spec-update-summary.md に記録されている（P2対策）
- [ ] documentation-changelog.md が全 Step（1-A/1-B/1-C/Step 2）の事後記録で構成されている（P4対策）
- [ ] unassigned-task-detection.md が存在する（0件でも「未タスクなし」として出力）
- [ ] skill-feedback-report.md が存在する（改善点なしでも「改善点なし」として出力）
- [ ] 未タスク検出時の 3 ステップ（①`docs/30-workflows/unassigned-task/` へ指示書作成 → ②残課題テーブル登録 → ③関連仕様書リンク追加）が完了している（P3/P38/P58対策）
- [ ] 新規 interface が必要だった場合のみ、その更新結果が system-spec-update-summary.md に記録されている（P57対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-12/` と一致している
- [ ] `git diff --stat -- .claude/skills/` で変更ファイル数が予定通りであることを確認済み
- [ ] 前Phaseの gate 条件（Phase 11 完了）を満たした前提で実行済み
- [ ] Phase 12 SKILL.md 準拠チェック（phase12-task-spec-compliance-check.md）が完了している

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)
