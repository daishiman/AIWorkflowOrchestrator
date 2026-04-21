# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 12                                   |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 11                             |
| 後続Phase  | Phase 13                             |
| 作成日     | 2026-04-20                           |
| ステータス | completed                            |

## 目的

Phase 12 の canonical 6成果物を作成し、workflow-local close-out と global spec sync 判定を分離して same-wave で記録する。

## 実行タスク

### Task 12-1: 実装ガイド作成

- Part 1: 中学生レベルの説明
- Part 2: 技術者レベルの説明
- `## 視覚証跡` に固定文言を記載する

### Task 12-2: システム仕様更新サマリー

- Step 1-A: workflow-local 完了記録
- Step 1-B: status / artifacts parity 記録
- Step 1-C: 関連 task と baseline drift の扱い記録
- Step 2: global spec sync の要否判定

### Task 12-3: ドキュメント更新履歴

- local 変更
- global sync 判定
- validator / parity 結果

### Task 12-4: 未タスク検出

- current 0件を記録する
- wider governance は baseline として分離する

### Task 12-5: スキルフィードバック

- 改善点の有無を記録する

### Task 12-6: Phase 12 準拠チェック

- 6成果物 existence
- Step 1-A〜1-C / Step 2 記録
- `artifacts.json` / `outputs/artifacts.json` parity
- future wording 0件

## 参照資料

| 資料                 | パス                                                                                   | 用途             |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------- |
| skill 基準           | `.agents/skills/task-specification-creator/SKILL.md`                                   | Phase 12 ルール  |
| guide                | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | NON_VISUAL 証跡  |
| spec update workflow | `.agents/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2  |
| 正本仕様 skill       | `.agents/skills/aiworkflow-requirements/SKILL.md`                                      | global sync 判断 |

## 成果物

| 成果物                       | パス                                                     | 説明               |
| ---------------------------- | -------------------------------------------------------- | ------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2    |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | local / global     |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも必須 |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence      |

## 完了条件

- [x] 6成果物を全て定義した
- [x] Step 1-A〜1-C / Step 2 を明文化した
- [x] NON_VISUAL 固定文言を入れた
- [x] `phase12-task-spec-compliance-check.md` を root evidence とした
- [x] `artifacts.json` / `outputs/artifacts.json` parity を確認した
- [x] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次のPhase

Phase 13: PR作成
