# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 13                                                   |
| Phase名    | PR作成                                               |
| ステータス | blocked                                              |
| 前提Phase  | Phase 12                                             |
| 後続Phase  | なし                                                 |

## 目的

将来の commit / PR 条件だけを記録する。ただし本依頼では実行しない。

## 実行タスク

- タスク1: ユーザー承認があるまで commit / push / PR を禁止する
- タスク2: 承認後のみ guard 導入分の PR 計画を起こす

## 参照資料

| 参照資料               | パス                                                                                                | 説明                        |
| ---------------------- | --------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 12 documentation | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/phase-12-documentation.md` | 完了前提                    |
| Phase 2 成果物         | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/`          | screenshot / audit 設計     |
| Phase 5 成果物         | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/`          | 実装差分                    |
| Phase 6 成果物         | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-6/`          | 拡張テスト結果              |
| Phase 7 成果物         | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-7/`          | coverage                    |
| Phase 8 成果物         | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-8/`          | refactoring 結果            |
| Phase 9 成果物         | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-9/`          | quality gate 結果           |
| Phase 10 成果物        | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-10/`         | 最終レビュー結果            |
| Phase 11 成果物        | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/`         | 手動テスト結果              |
| Phase 12 成果物        | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/`         | system spec sync / feedback |
| User policy            | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/index.md`                  | commit / PR 禁止ルール      |
| execute workflow       | `.claude/skills/task-specification-creator/references/execute-workflow.md`                          | 将来の Phase 13 手順        |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                   | 内容             |
| --------------- | ---------------------------------------------------------------------- | ---------------- |
| task-workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了後の記録先   |
| lessons-learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 再発防止の同期先 |

## 実行手順

### ステップ1: blocked 条件を維持する

1. ユーザー承認がない限り commit / push / PR をしない
2. blocked 理由を workflow / artifacts に残す
3. future execution でのみこの Phase を開放する

### ステップ2: 承認後の PR 計画を準備する

1. changed files / test / screenshot / system spec sync の一覧を作る
2. PR 本文の evidence section を組み立てる
3. 未解消の unassigned task を添付する

## ユーザー承認ゲート

| 項目   | ルール           |
| ------ | ---------------- |
| commit | 明示承認まで禁止 |
| push   | 明示承認まで禁止 |
| PR     | 明示承認まで禁止 |

## 統合テスト連携

| 観点            | 連携内容                                         |
| --------------- | ------------------------------------------------ |
| Evidence bundle | Phase 11 / 12 の結果を PR 本文へ移送する         |
| Backlog bridge  | 未解消項目を unassigned task として添付する      |
| Skill feedback  | 2 skill の改善点が PR 外でも追跡できるようにする |

## 多角的チェック観点

| 観点       | 適用内容                                           | 仕様参照先                                                                                                                                   |
| ---------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 承認フロー | ユーザー明示承認前に phase が開いていないか        | user policy                                                                                                                                  |
| 証跡品質   | screenshot / spec sync / unassigned が揃っているか | Phase 11 / 12 outputs                                                                                                                        |
| 再発防止   | lessons / task-workflow への同期が済んでいるか     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物  | パス                                                                                                  | 説明             |
| ------- | ----------------------------------------------------------------------------------------------------- | ---------------- |
| pr-plan | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-13/pr-plan.md` | future PR の骨子 |

## 完了条件

- [ ] commit / PR 禁止方針が残っている
- [ ] blocked 理由が明文化されている
- [ ] 承認後に必要な evidence 一覧が明記されている

## サブタスク管理

1. blocked 条件を確認する
2. 承認後の evidence 一覧を整理する
3. future PR の骨子を定義する
4. pr-plan の planned path を確定する

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物の planned path を確定
- [ ] `artifacts.json` の Phase 13 登録を更新
- [ ] blocked 理由と解除条件を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 13
```

## 次Phase

なし
