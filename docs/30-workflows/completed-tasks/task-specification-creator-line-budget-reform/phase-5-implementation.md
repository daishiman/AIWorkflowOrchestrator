# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| Phase      | 5                                                          |
| Phase名    | 実装                                                       |
| ステータス | completed                                                  |
| 前提Phase  | Phase 4                                                    |
| 後続Phase  | Phase 6                                                    |

## 目的

設計済み topology に従い、`.claude` 正本の doc split と `.agents` mirror sync を concern 単位で実装し、分割後の依存契約を壊さない。

## 実行タスク

- タスク1: Lane A で `SKILL.md` と `LOGS.md` を再編する
- タスク2: Lane B で pattern と template family を再編する
- タスク3: Lane C で workflow guide family を再編し、Lane V で mirror parity と dependency integrity を確定する

## 参照資料

| 参照資料       | パス                                                                                                                           | 説明          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| test scenarios | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-4/test-scenarios.md`            | 実装前 gate   |
| split plan     | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/responsibility-split-plan.md` | target shape  |
| lane plan      | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/subagent-lane-plan.md`        | lane topology |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                                | 内容                              |
| --------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| skill structure | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | target file role                  |
| skill resources | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | refs split と直リンク             |
| cross-skill     | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`         | `.claude` 正本 / `.agents` mirror |

## 実行手順

### ステップ1: `.claude` 正本を実装する

Lane A-C の順序で concern family を分割し、新規 ref を flat path で追加する。child file を追加した concern では必ず parent/index 側の入口も同じ wave で更新する。

### ステップ2: `.agents` mirror を同期する

`.claude` 側の file set を mirror 側へ同期し、欠落 file を残さない。mirror 先でも parent / child / archive の同名構造を維持する。

### ステップ3: first validation を実行する

Phase 4 で定義した line budget、direct link、dependency contract check を lane 完了ごとに実行する。

## 実装時の注意事項（既知のPitfall対策）

- `.claude` 正本を先に更新し、`.agents` mirror だけを先行更新しない
- new ref を追加したら同じ turn で `SKILL.md` 直リンクを更新する
- child ref を追加したら、親 index または guide からの到達経路を同じ turn で追加する
- Lane V は Lane A-C 完了後にのみ実行する

## 統合テスト連携

| 観点                 | 連携内容                                                                |
| -------------------- | ----------------------------------------------------------------------- |
| Lane A               | `SKILL.md` と `LOGS.md` の line budget と archive navigation を確認する |
| Lane B               | pattern family と template family の直リンクを確認する                  |
| Lane C               | workflow guide family と validation matrix の直リンクを確認する         |
| dependency integrity | parent / child / archive / mirror の到達経路を確認する                  |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断         | 仕様参照先                                                                                                                                                              |
| ------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須             | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須             | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | 実実装なので必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物             | パス                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| updated skill docs | `.claude/skills/task-specification-creator/`                                                                            |
| mirror skill docs  | `.agents/skills/task-specification-creator/`                                                                            |
| implementation-log | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-5/implementation-log.md` |

## 完了条件

- [x] `.claude` 正本の target files が更新されている
- [x] `.agents` mirror が同期されている
- [x] line budget と direct link の first validation が PASS している
- [x] parent / child / archive / mirror dependency の first validation が PASS している

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 6: テスト拡充
