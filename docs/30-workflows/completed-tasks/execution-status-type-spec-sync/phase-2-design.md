# Phase 2: 設計 - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 機能名 | execution-status-type-spec-sync |
| 作成日 | 2026-03-20                      |

## 目的

`ready` / `blocked` の両分岐を持つ docs-only workflow として、責務分離、更新順序、検証マトリクスを設計する。

## 実行タスク

- lane 設計: concern を分離して SubAgent lane を定義する
- 更新順序設計: ready/blocked の手順差分を固定する
- validation matrix 設計: 実行コマンドと pass 条件を定義する
- 分岐設計: blocked path / ready path の進め方を明文化する

### タスク1: concern 分離と lane 設計

### タスク2: 更新順序の設計

### タスク3: validation matrix の設計

### タスク4: blocked path / ready path の分岐設計

## 参照資料

| 資料名             | パス                                                                                                  | 説明                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- | --------------------- |
| Phase 1 要件       | `outputs/phase-1/requirements.md`                                                                     | readiness 判定        |
| Phase 1 参照箇所   | `outputs/phase-1/reference-locations.md`                                                              | canonical path        |
| Task12 一次情報    | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md` | 3状態追加根拠         |
| Task12 UI 一次情報 | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`     | UI / selector 影響    |
| interfaces         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`               | 更新候補              |
| state management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                     | 更新候補              |
| task ledger        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | backlog / status 同期 |

## 実行手順

### ステップ1: SubAgent lane を設計する

| Lane | 関心ごと                 | 主担当ファイル                                                                                                 | 完了条件                                    |
| ---- | ------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| A    | readiness / source audit | `packages/shared/src/types/skill.ts`, `task-workflow-completed-skill-lifecycle-design.md`                      | `ready` / `blocked` が確定                  |
| B    | canonical spec sync      | `interfaces-agent-sdk-integration.md`, `arch-state-management-core.md`, `task-workflow.md`                     | ready 時の更新内容が確定                    |
| C    | docs-only validation     | `topic-map.md`, `resource-map.md`, `task-workflow-completed-skill-lifecycle-ui.md`, workflow docs, mirror root | blocked/ready のどちらでも validator が回る |

### ステップ2: 更新順序を設計する

| 順序 | 対象                | ready 時                          | blocked 時                            |
| ---- | ------------------- | --------------------------------- | ------------------------------------- |
| 1    | `skill.ts` 現物確認 | 実値を記録                        | 実値を記録                            |
| 2    | 一次情報照合        | Task12 設計と差分比較             | blocker 根拠を確定                    |
| 3    | canonical spec      | 2ファイルを同一 change set で更新 | 更新しない                            |
| 4    | indexes / mirror    | 再生成と parity 確認              | references 未更新なら parity のみ確認 |
| 5    | Phase 11-13 docs    | 実施記録を作成                    | blocked 記録を作成                    |

### ステップ3: validation matrix を定義する

| 検証               | コマンド                                                                                                                                         | pass 条件                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| 参照探索           | `search-spec.js "SkillExecutionStatus"`                                                                                                          | 一次情報と更新候補に到達        |
| refs grep          | `grep -rn "SkillExecutionStatus" .claude/skills/aiworkflow-requirements/references/`                                                             | 更新対象 / 確認対象が列挙できる |
| workflow validator | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/execution-status-type-spec-sync --json` | error 0                         |
| phase validator    | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase N`    | error 0                         |
| root parity        | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                   | diff 0                          |

## 統合テスト連携（Phase 2）

| 検証項目          | 方法                           | 期待結果                   |
| ----------------- | ------------------------------ | -------------------------- |
| lane 分離         | Lane 表を作成                  | 関心ごとが重複しない       |
| 更新順序          | step 表を作成                  | ready/blocked の分岐が明確 |
| validation matrix | command ごとに pass 条件を持つ | Phase 4 で再利用できる     |

## 多角的チェック観点

| 観点              | 適用判断                     | 仕様参照先                                                                           |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| アーキテクチャ    | 状態配置更新が対象のため適用 | `aiworkflow-requirements: arch-state-management-core.md`                             |
| IPC / mirror 運用 | dual root 検証が必要         | `task-specification-creator: spec-update-validation-matrix.md`                       |
| ドキュメント運用  | docs-only 分岐があるため適用 | `task-specification-creator: phase-template-phase11.md`, `phase-template-phase12.md` |

## 成果物

| 成果物   | パス                                 | 説明                         |
| -------- | ------------------------------------ | ---------------------------- |
| 設計書   | `outputs/phase-2/design.md`          | lane / update order          |
| 影響分析 | `outputs/phase-2/impact-analysis.md` | ready/blocked 分岐と影響範囲 |

## 完了条件

- [ ] lane / topology が定義されている
- [ ] ready/blocked の更新順序が定義されている
- [ ] validation matrix が記録されている
- [ ] Phase 4 以降で使う canonical refs が確定している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. lane 設計
3. 更新順序設計
4. validation matrix 設計
5. 成果物作成
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase 2
```

## 次のPhase

Phase 3: 設計レビュー
