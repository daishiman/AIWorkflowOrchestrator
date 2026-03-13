# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001                |
| Phase      | 10                                                                     |
| Phase名    | 最終レビューゲート                                                     |
| ステータス | completed                                                              |
| 前提Phase  | Phase 1、Phase 2、Phase 3、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9 |
| 後続Phase  | Phase 11                                                               |

## 目的

manual docs reform と dependency integrity が完了しているか、generated index の扱いが隠蔽されていないかを最終判定する。

## 判定基準

| 判定  | 条件                                                                                                                                              | 対応                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| PASS  | manual docs 34 件の over-limit が 0、mirror と discovery と dependency integrity が PASS、G0 が resolved または blocked dependency として記録済み | Phase 11 へ進行                               |
| MINOR | 実体は妥当だがレポートや changelog の不足がある                                                                                                   | Phase 8 または Phase 9 の成果物を補正して進行 |
| MAJOR | manual docs が未解消、G0 が黙殺、mirror drift、discovery 断線、dependency break のいずれかがある                                                  | Phase 5、8、9 の該当 phase へ戻る             |

## 戻り先決定基準

| 問題の種類                                     | 戻り先  |
| ---------------------------------------------- | ------- |
| manual docs split 不足                         | Phase 5 |
| naming / discovery drift                       | Phase 8 |
| validation / mirror / generated index 記録不足 | Phase 9 |
| dependency integrity の誤り                    | Phase 9 |

## 実行タスク

- タスク1: manual docs reform と dependency integrity 完了を review する
- タスク2: generated index policy の適用結果を review する
- タスク3: documentation へ進む前提を確定する

## 参照資料

| 参照資料        | パス                                                                                                                   | 説明                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/`                        | inventory baseline      |
| Phase 2 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/`                        | split と lane 設計      |
| Phase 5 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/`                        | 実装結果                |
| Phase 9 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-9/`                        | quality gate 結果       |
| Phase 8 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-8/`                        | naming / discovery 整理 |
| design review   | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-3/design-review-result.md` | 元設計の正本            |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容                    |
| -------------------- | --------------------------------------------------------------------------- | ----------------------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | quality gate            |
| task rules           | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  | review 基準             |
| lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | hidden blocker 再発防止 |

## 実行手順

推奨コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --mode exec \
  --task-file docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/phase-10-final-review.md \
  --output-prompt docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-10/review-prompt.txt
```

manual docs reform と generated index policy の判定根拠が不足している場合は、差分確認を補助的に追加する:

```bash
codex review --uncommitted "docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-10/review-prompt.txt の指示に従って現在差分をレビューしてください。"
```

### ステップ1: manual docs 完了を確認する

34 manual docs に over-limit が残っていないかを確認し、parent / child / history / archive / discovery の依存経路が閉じているかを確認する。

### ステップ2: G0 の扱いを確認する

`topic-map.md` が resolved か blocked か、その理由と証跡が残っているかを確認する。

### ステップ3: next phase 前提を確定する

Phase 11 と Phase 12 が blocker を見落とさず進める状態かを確認する。dependency integrity の判定結果が次 phase に渡る形で記録されていることも確認する。

## 統合テスト連携

| 観点                   | 連携内容                             |
| ---------------------- | ------------------------------------ |
| final review           | PASS のみを Phase 11 へ渡す          |
| blocker clarity        | Phase 12 changelog に必須で反映する  |
| manual docs completion | Phase 13 blocked 解除の前提になる    |
| dependency integrity   | Phase 11 / 12 で再確認する前提になる |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断            | 仕様参照先                                                                                                                                               |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | final review で必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 判定基準と戻り先の確認
4. 多角的チェック観点の確認
5. 完了条件の確認

## 成果物

| 成果物               | パス                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| final-review-summary | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-10/final-review-summary.md` |
| blocker-disposition  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-10/blocker-disposition.md`  |
| review-prompt        | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-10/review-prompt.txt`       |

## 完了条件

- [x] manual docs reform が review 済みである
- [x] G0 の resolved / blocked が review 済みである
- [x] Phase 11 と 12 へ渡す前提が明文化されている
- [x] dependency integrity が review 済みである

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] review 判定と戻り先が記録済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 11: 手動テスト検証
