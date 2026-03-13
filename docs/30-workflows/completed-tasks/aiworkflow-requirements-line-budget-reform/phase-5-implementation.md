# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 |
| Phase      | 5                                                       |
| Phase名    | 実装                                                    |
| ステータス | completed                                               |
| 前提Phase  | Phase 4                                                 |
| 後続Phase  | Phase 6                                                 |

## 目的

manual docs 34 件を lane A-C で family-wave 実装し、Lane V で mirror、generated index、分割後の依存契約を計測する。

## 実行タスク

- タスク1: Lane A で F1 / F2 を reform する
- タスク2: Lane B で F3 / F6 を reform する
- タスク3: Lane C で F4 / F5 を reform し、Lane V で再生成・依存契約を計測する

## 参照資料

| 参照資料        | パス                                                                                                                         | 説明         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------ |
| test scenarios  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-4/test-scenarios.md`             | 実装前提     |
| split plan      | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/responsibility-split-plan.md`  | target shape |
| lane plan       | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/subagent-lane-plan.md`         | wave plan    |
| validation plan | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | command set  |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                             | 内容                               |
| ---------------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| split guidelines | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` | split pattern の正本               |
| update agent     | `.claude/skills/aiworkflow-requirements/agents/update-spec.md`                   | generate-index と topic-map の扱い |
| cross-skill      | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      | `.claude` 正本 / `.agents` mirror  |

## 実行手順

### ステップ1: Wave 1 を実装する

Lane A で F1、Lane B で F3、Lane C で F4 を処理する。各 agent は 3 ファイル以下の sub-batch に制限する。child shard を追加した family は同じ wave で parent file、history / archive companion、discovery entry も更新する。

### ステップ2: Wave 2 を実装する

Lane A で F2、Lane B で F6、Lane C で F5 を処理する。Wave 1 と同様に family 内の依存契約を同一 wave で閉じる。

### ステップ3: Lane V を実行する

`generate-index.js`、`diff -qr`、`wc -l indexes/topic-map.md` を実行し、manual docs 完了、G0 状態、orphan shard / discovery 欠落の有無を確定する。

## 実装時の注意事項（既知のPitfall対策）

- `topic-map.md` を hand-edit しない
- `.claude` 更新前に `.agents` を触らない
- 1 agent あたり 3 ファイル超を同時に持たない
- Wave 1 の Lane V 完了前に Wave 2 へ進まない
- child shard だけを先行作成し、parent / history companion / discovery index の入口更新を後回しにしない

## 統合テスト連携

| 観点                 | 連携内容                                |
| -------------------- | --------------------------------------- |
| wave gate            | Phase 6 と Phase 9 の回帰起点になる     |
| mirror sync          | Phase 12 final sync へ渡す              |
| generated index      | Phase 10 の blocker 判定へ渡す          |
| dependency integrity | Phase 6、9、10、11、12 の確認観点へ渡す |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                          | 仕様参照先                                                                                                                                               |
| -------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                              | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | family parent file を持つため必須 | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | 実実装なので必須                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物           | パス                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| lane-a-summary   | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/lane-a-summary.md`   |
| lane-b-summary   | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/lane-b-summary.md`   |
| lane-c-summary   | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/lane-c-summary.md`   |
| verifier-summary | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/verifier-summary.md` |

## 完了条件

- [x] manual docs 34 件の reform が wave 単位で完了している
- [x] `.claude` / `.agents` mirror sync が完了している
- [x] G0 の resolved / blocked が記録されている
- [x] parent / child / history / archive / discovery / mirror dependency の first validation が PASS している

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 6: テスト拡充
