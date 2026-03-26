# Phase 2: 設計

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

same-wave 更新順、編集レーン、validator と grep の運用順を設計し、docs-only remediation を partial update なしで実行できる形にする。

## 実行タスク

- canonical sync lane を設計する
- ledger / lessons lane を設計する
- workflow path / artifact lane を設計する
- validation lane を設計する
- `.claude` canonical と `.agents` mirror の parity 方針を設計する

## 設計一次結論

| 項目                       | 結論                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| 真の論点                   | 実更新順が崩れると correct files があっても completed false positive になるため、編集順の設計が主題 |
| 依存関係・責務境界の問題点 | canonical spec 更新前に workflow local だけ直すと current fact の基準が曖昧になる                   |
| 価値とコストの不均衡       | index 再生成と grep は低コストで drift 再発防止に効くため、後回しにしない                           |
| 改善優先順位               | 1. canonical sync 2. ledger / lessons 3. workflow local path 4. validators 5. mirror parity         |
| 4条件評価                  | docs-only でも Phase 12 相当の closure を設計することで 4 条件を満たす                              |

## 参照資料

| 資料名                | パス                                                                                          | 説明                            |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件          | `phase-1-requirements.md`                                                                     | acceptance と drift 分類        |
| spec extraction map   | `outputs/phase-1/spec-extraction-map.md`                                                      | 更新対象の一覧                  |
| 親 workflow artifacts | `../completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/artifacts.json` | stale `parentWorkflow` の発生源 |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                                                    | 内容                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| completed ledger          | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                          | current fact の基準                                |
| lessons                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`       | same-wave / parity / 未完了表現                    |
| workflow integration spec | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md` | current canonical set と artifact inventory の構成 |

## 実行手順

### ステップ1: 4 レーンを定義する

- Lane A: system spec 更新
- Lane B: ledger / lessons / index 更新
- Lane C: workflow local path / artifacts 正規化
- Lane D: validator / grep / changelog 記録

### ステップ2: 編集順を固定する

- current fact を system spec と ledger に先に反映する。
- その後で workflow local の path と inventory を正規化する。
- 最後に validator と grep の結果を成果物へ反映する。

### ステップ3: parity を固定する

- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` を同一ターンで同期する。
- `.claude` と `.agents` に mirror 差分が出る場合は同ターンで閉じる。

## 統合テスト連携

- Phase 2 では `outputs/phase-4/test-matrix.md` に渡すべき validator / grep / parity 確認の骨格を固定する。
- docs-only remediation のためコード結合試験は対象外とし、same-wave 順序に従った文書検証を統合ゲートにする。

## 成果物

| 成果物                       | パス                                              | 説明                   |
| ---------------------------- | ------------------------------------------------- | ---------------------- |
| 設計書                       | `phase-2-design.md`                               | remediation lane 設計  |
| canonical sync target matrix | `outputs/phase-2/canonical-sync-target-matrix.md` | レーン別更新対象と順番 |

## 完了条件

- [ ] 4 レーンが定義されている
- [ ] system spec → ledger/lessons → workflow local → validation の順番が明記されている
- [ ] `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4 点同期が完了条件に入っている
- [ ] mirror parity の方針が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. レーン設計と更新順序の固定
3. 統合テスト連携の設計
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 4 へ引き継ぐ validation lane が固定されている
