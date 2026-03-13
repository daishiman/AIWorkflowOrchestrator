# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| Phase      | 6                                                          |
| Phase名    | テスト拡充                                                 |
| ステータス | completed                                                  |
| 前提Phase  | Phase 5                                                    |
| 後続Phase  | Phase 7                                                    |

## 目的

first validation の不足を埋め、line budget、mirror parity、dependency integrity の回帰検出力を上げる。

## 実行タスク

- タスク1: command matrix の不足ケースを追加する
- タスク2: archive navigation、direct link、parent→child dependency の回帰 check を追加する
- タスク3: mirror parity、new file count、orphan file 検出の確認を追加する

## 参照資料

| 参照資料           | パス                                                                                                                            | 説明                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| implementation log | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-5/implementation-log.md`         | first validation の結果 |
| validation plan    | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | command matrix          |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                  |
| -------------------- | --------------------------------------------------------------------------------- | --------------------- |
| skill process        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md` | validate と refs link |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | docs quality          |

## 実行手順

### ステップ1:不足ケースを列挙する

Phase 5 の fail または manual check を command 単位で列挙する。

### ステップ2:再検証 command を追加する

`rg` と `diff -qr` と `quick_validate.js` の補助コマンドを加え、child file の孤立と archive link 欠落を再検知できるようにする。

### ステップ3:結果を保存する

拡充した command set と expected result を markdown へ保存する。

## 統合テスト連携

| 観点                 | 連携内容                                  |
| -------------------- | ----------------------------------------- |
| line budget          | Phase 7 の report 入力へ渡す              |
| link audit           | Phase 9 quality report の入力へ渡す       |
| mirror parity        | Phase 12 final sync の入力へ渡す          |
| dependency integrity | Phase 9 と Phase 10 の blocker 判定へ渡す |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                        | 仕様参照先                                                                                                                                                              |
| ------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                            | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                            | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | regression check に含むため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物               | パス                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| expanded-test-matrix | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-6/expanded-test-matrix.md` |
| regression-checks    | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-6/regression-checks.md`    |

## 完了条件

- [x] 補助 command を含む test matrix が作成されている
- [x] archive navigation と direct link の回帰 check が追加されている
- [x] mirror parity の再検証手順が追加されている
- [x] dependency integrity の再検証手順が追加されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 7: テストカバレッジ確認
