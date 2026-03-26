# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 1                                                                        |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                       |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001                       |
| 前提Phase  | なし                                                                     |
| 後続Phase  | Phase 2                                                                  |
| ステータス | 完了                                                                     |
| 作成日     | 2026-03-26                                                               |
| Issue      | [#1652](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1652) |

## 目的

failure path でも `verify_result` artifact を append 正本へ記録するための機能要件、非機能要件、受入基準を固定する。

## 要件レビュー一次結論

| 観点               | 結論                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点           | failure path だけ artifact ledger が欠落し、履歴ベース consumer が失敗の verify 結果を再構成できない                                        |
| 依存関係・責務境界 | write owner は `SkillCreatorWorkflowEngine`、read bridge は `RuntimeSkillCreatorFacade`、`TASK-SDK-02` は append 正本前提の継承元として扱う |
| 価値とコスト       | コード変更量は小さいが、failure 監査可能性と resume/read consistency の価値は高い                                                           |
| 改善優先順位       | 1. source of truth 固定 2. engine/facade regression 固定 3. Phase 12 ledger 判断                                                            |
| 4条件評価          | 価値性: failure 可視性を守る、実現性: engine/test 限定で閉じる、整合性: state/artifact 同値で閉じる、運用性: ledger 更新要否を明示できる    |

## 因果と境界

| 項目           | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 強化ループ     | append 漏れ -> failure 可視性低下 -> test 信頼低下 -> manual check 増加 -> 仕様曖昧化 -> append 漏れ再発 |
| バランスループ | append 正本固定 -> engine/facade test 固定 -> drift 早期検出 -> manual check 依存減少                    |
| 状態所有権     | `state.verifyResult` は latest snapshot、`phaseArtifacts.verify_result` は履歴正本                       |
| why now        | parent task が failure lifecycle 契約を固めた直後で、局所修正として最も閉じやすいタイミング              |

## 実行タスク

- Issue 1652 の Why/What/How を requirements へ分解する
- parent task と TASK-SDK-02 から今回スコープの境界を切り出す
- `state.verifyResult` と `phaseArtifacts` の source of truth 関係を明文化する
- AC を failure append、test coverage、spec parity の3軸で定義する

## 参照資料

| 参照資料                   | パス                                                                                                                              | 内容                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 元未タスク指示書           | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-imp-runtime-workflow-verify-artifact-append-001.md`                    | Why/What/How の正本                        |
| 親未タスク                 | `docs/30-workflows/unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md`                                     | failure lifecycle 親論点                   |
| TASK-SDK-02                | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`                            | append 正本と Phase 12 compliance の継承元 |
| 親 workflow index          | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`                            | owner と artifact 正本の背景               |
| Phase 2 ownership          | `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md` | append 正本前提                            |
| aiworkflow resource-map    | `.agents/skills/aiworkflow-requirements/indexes/resource-map.md`                                                                  | runtime workflow bugfix の起点索引         |
| aiworkflow quick-reference | `.agents/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                               | runtime workflow engine orchestration 導線 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                        | 内容                         |
| ----------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| IPC public contract     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | runtime public response 正本 |
| runtime service details | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | facade / engine 責務境界     |
| workflow ledger         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | spec_created 運用            |
| lessons current         | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`              | drift 再発防止               |

## 統合テスト連携

| 観点            | 連携内容                               |
| --------------- | -------------------------------------- |
| AC 連携         | Phase 4 の test matrix へ AC を渡す    |
| source of truth | state と artifact の両確認を必須化する |

## 受入基準

| ID    | 受入基準                                                                       | 検証Phase      |
| ----- | ------------------------------------------------------------------------------ | -------------- |
| AC-01 | failure path でも `verify_result` artifact が append される                    | Phase 4, 6     |
| AC-02 | `state.verifyResult` と `phaseArtifacts.verify_result` の payload が同値である | Phase 2, 4, 6  |
| AC-03 | engine test と facade test の双方で failure artifact 正本が確認される          | Phase 4, 6, 7  |
| AC-04 | public IPC / preload / shared contract を変更せずに修正が閉じる                | Phase 5, 9, 10 |

## 成果物

| 成果物         | パス                                     | 説明                              |
| -------------- | ---------------------------------------- | --------------------------------- |
| 要件抽出マップ | `outputs/phase-1/spec-extraction-map.md` | system spec と code anchor の対応 |

## 完了条件

- [ ] failure path で `verify_result` を append する要件が明文化されている
- [ ] `state.verifyResult` と artifact の二重管理ではなく append 正本で整理されている
- [ ] engine test と facade test の両方が受入基準へ入っている
- [ ] 親タスクとの差分スコープが明記されている
