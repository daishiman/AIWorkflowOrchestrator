# Phase 12: スキルフィードバックレポート

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 12                                      |
| 作成日   | 2026-03-19                              |

---

## 概要

今回の再監査では、単に feedback を列挙するだけでなく、再発防止に直結するものは同ターンでスキルへ反映した。対象は `task-specification-creator` の Phase 11/12 ガード、`skill-creator` の Phase 12 retrospective 導線、`aiworkflow-requirements` の primary system spec 群である。

## 1. 反映した改善

| ID        | 対象スキル                 | 内容                                                                                                | 反映先                                                                                         | 状態     |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- |
| FB-TSC-01 | task-specification-creator | `spec_created` でも system spec / LOGS / artifacts / unassigned task を実更新するルール             | `SKILL.md`, `references/phase-11-12-guide.md`, `references/spec-update-workflow.md`            | 反映済み |
| FB-TSC-02 | task-specification-creator | screenshot fallback 時に harness / static review board / metadata / failure reason を残すルール     | `references/phase-11-12-guide.md`                                                              | 反映済み |
| FB-TSC-03 | task-specification-creator | generic な推測ではなく primary target を特定してから spec sync するルール、mirror parity 確認ルール | `SKILL.md`, `references/spec-update-workflow.md`                                               | 反映済み |
| FB-SC-01  | skill-creator              | `update` モードで Phase 12 retrospective を扱う手順、lane 分割、検証チェーンを追加                  | `SKILL.md`, `references/update-process.md`                                                     | 反映済み |
| FB-SC-02  | skill-creator              | docs-heavy 再監査で優先抽出する改善候補と screenshot fallback template を追加                       | `references/self-improvement-cycle.md`, `assets/phase12-system-spec-retrospective-template.md` | 反映済み |
| FB-AWR-01 | aiworkflow-requirements    | task 09 の runtime/auth-mode 整流内容を primary target 10 ファイルへ反映                            | `references/*.md`, `LOGS.md`                                                                   | 反映済み |
| FB-AWR-02 | aiworkflow-requirements    | backlog / lessons learned / task workflow 導線の同期                                                | `task-workflow*.md`, `lessons-learned*.md`                                                     | 反映済み |

## 2. task-specification-creator に対する知見

### FB-TSC-01: 設計タスクでも「実更新」が必要

今回もっとも大きかった漏れは、Phase 12 の narrative が「計画記録」のまま残っていたことだった。これに対して、skill 側へ以下を反映した。

- `spec_created` / docs-heavy task でも `.claude/skills/` への実書き込みを先送りしない
- `outputs/artifacts.json` を root `artifacts.json` と同ターンで同期する
- `documentation-changelog.md` は全 Step 完了後に事後記録で閉じる

### FB-TSC-02: screenshot fallback を first-class に扱う

今回は `esbuild` バイナリ不一致により preview / Electron 撮影が成立しなかったため、専用 harness と static review board で代替した。再監査で同じ論点が出たときに迷わないよう、以下を明文化した。

- build failure の絶対原因を `manual-test-result.md` と metadata に残す
- same-day evidence と current workflow capture の関係を明記する
- representative screenshot でも TC と png を 1:1 で紐付ける

### FB-TSC-03: primary target を推測で選ばない

今回、generic なファイル名ではなく、実際の責務分割に沿った primary target を再特定する必要があった。そこで、spec sync 前に以下を強制する方針へ寄せた。

- 正本 skill root を明示する
- primary target を具体的な file path で列挙する
- `.claude` 更新後に `.agents` mirror parity を取る

## 3. aiworkflow-requirements に対する知見

`aiworkflow-requirements` は「構造が足りない」のではなく、「今回の feature の追補が未反映」だった。したがって、スキル自体の大規模な再設計は不要で、今回必要だったのは domain spec 本文の同期だった。

| 観点                        | 対応                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| IPC / security / state / UI | 各 primary target へ drift と target contract を追記                                         |
| workflow ledger             | completed / backlog / lessons learned を同期                                                 |
| feature-level index         | `workflow-ai-runtime-authmode-unification.md` に artifact inventory と primary target を追記 |

## 4. skill-creator に対する知見

今回の再監査では、「feedback をどう書くか」よりも「同種案件を次回どう短く閉じるか」の整理が不足していた。そこで `skill-creator` には、Phase 12 retrospective を update モードの一種として扱う導線を追加した。

| 観点               | 対応                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 入口               | `SKILL.md` に Phase 12 再監査ショートカットを追加し、`task-specification-creator` の guide を先に読む導線を固定          |
| 実行手順           | `references/update-process.md` に primary target 固定 → lane 分割 → 実更新 → validator → LOGS の順序を追加               |
| 再利用テンプレート | `assets/phase12-system-spec-retrospective-template.md` に screenshot fallback の実ファイル path と `validate_all` を追加 |
| 改善抽出           | `references/self-improvement-cycle.md` に docs-heavy Phase 12 で優先抽出する改善候補を追加                               |

## 5. 今回は提案に留めた項目

| ID        | 内容                                                                  | 優先度 | 理由                                                                        |
| --------- | --------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| FB-TSC-04 | Phase 1 に RuntimeResolver / HandoffGuidance 再利用チェックを定型追加 | MEDIUM | 今回の再監査には直接必要なかったため、次回 template 改修候補として残した    |
| FB-TSC-05 | Phase 2 に「廃止モジュール影響分析テーブル」をテンプレート化          | LOW    | task 固有 docs では有効だったが、既存 template への反映は別件として分離した |

## 6. 更新実施記録

| 更新対象                           | 実施状況 | 備考                                                  |
| ---------------------------------- | -------- | ----------------------------------------------------- |
| `task-specification-creator`       | 実施済み | guide / workflow / SKILL / LOGS を更新                |
| `skill-creator`                    | 実施済み | SKILL / update process / template / LOGS を更新       |
| `aiworkflow-requirements`          | 実施済み | primary system spec / backlog / lessons / LOGS を更新 |
| `aiworkflow-requirements/SKILL.md` | no diff  | 今回は skill 本文ではなく reference 本文追補で充足    |

今回の結論は、「feedback を残した」ではなく「skill の再発防止ルールまで反映した」である。
