# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 12                                               |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | NON_VISUAL / docs-only                           |
| ステータス | completed                                        |
| 前提Phase  | Phase 11                                         |
| 後続Phase  | Phase 13                                         |
| 作成日     | 2026-04-21                                       |

## 目的

Phase 12 の必須 6 成果物を定義し、workflow-local close-out と system spec sync を same-wave で記録する。

## 実行タスク

### Task 1: implementation-guide 作成

- `outputs/phase-12/implementation-guide.md` を作成する
- Part 1 は中学生レベル説明、Part 2 は型定義、使用例、エラーハンドリング、エッジケース、設定項目を書く
- `## 視覚証跡` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を書く

### Task 2: system-spec-update-summary 作成

- `outputs/phase-12/system-spec-update-summary.md` を作成する
- `実施した同期` と `未実施同期・理由` を分けて書く
- `LOGS.md`、`topic-map.md`、`keywords.json`、`resource-map.md` の same-wave sync 判定を個別に入れる

### Task 3: documentation-changelog 作成

- `outputs/phase-12/documentation-changelog.md` を作成する
- local 更新、global sync 判定、Phase 10 MINOR 追跡を書く

### Task 4: unassigned-task-detection 作成

- `outputs/phase-12/unassigned-task-detection.md` を作成する
- 0件でも出力する
- 配置先判定と link 検証結果を書く

### Task 5: skill-feedback-report 作成

- `outputs/phase-12/skill-feedback-report.md` を作成する
- 改善点なしでも出力する

### Task 6: phase12-task-spec-compliance-check 作成

- `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する
- 6成果物、Step 1-A〜1-C / Step 2、`artifacts.json` / `outputs/artifacts.json` parity、future wording 不在、Phase 10 MINOR 追跡を確認する

## 参照資料

| 資料名               | パス                                                                             | 用途                  |
| -------------------- | -------------------------------------------------------------------------------- | --------------------- |
| task-spec skill      | `.agents/skills/task-specification-creator/SKILL.md`                             | Phase 12 基準         |
| phase12 template     | `.agents/skills/task-specification-creator/references/phase-template-phase12.md` | 必須事項              |
| spec update workflow | `.agents/skills/task-specification-creator/references/spec-update-workflow.md`   | Step 1 / Step 2       |
| aiworkflow skill     | `.agents/skills/aiworkflow-requirements/SKILL.md`                                | system spec sync 判断 |
| workflow artifacts   | `artifacts.json` / `outputs/artifacts.json`                                      | parity                |

## 実行手順

1. Phase 11 の結果を読む
2. 必須 6 成果物を順に定義する
3. `verify/validate/links/skill validation` の結果を記録する
4. `artifacts.json` と `outputs/artifacts.json` の parity を確認する
5. workflow-local close-out と global sync 判定を分けて書く

## 統合テスト連携

- screenshot は不要
- `rg`、`diff -qr`、link 検証、skill validation の結果を Phase 12 記録へ反映する
- canonical N 成果物は Phase 12 へコピーせず参照に留める

## 多角的チェック観点

- **MECE**: 6成果物に漏れや重複がないか
- **システム思考**: workflow-local、system spec、mirror sync の 3層が揃っているか
- **KJ法**: findings を parity、close-out、backlog、skill feedback に束ねられているか

## サブタスク管理

| サブタスクID | 内容                                    | ステータス |
| ------------ | --------------------------------------- | ---------- |
| ST-12-01     | implementation-guide 作成               | pending    |
| ST-12-02     | system-spec-update-summary 作成         | pending    |
| ST-12-03     | documentation-changelog 作成            | pending    |
| ST-12-04     | unassigned-task-detection 作成          | pending    |
| ST-12-05     | skill-feedback-report 作成              | pending    |
| ST-12-06     | phase12-task-spec-compliance-check 作成 | pending    |

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 完了条件

- [ ] 必須 6 成果物を全て定義している
- [ ] `verify/validate/links/skill validation` の結果を記録する方針がある
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity を確認する方針がある
- [ ] same-wave sync の対象を明記している

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 必須 6 成果物を全て定義
- [ ] 実施した同期と未実施同期・理由を分離

## 次Phase

Phase 13（PR 作成）へ進む。user 承認が無い間は blocked のまま維持する。
