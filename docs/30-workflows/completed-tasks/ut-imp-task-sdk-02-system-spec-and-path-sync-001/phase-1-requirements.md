# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 1                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

`TASK-SDK-02` の docs-only remediation に必要な current canonical set、完了条件、非対象、検証観点を固定する。

## 実行タスク

- 真の論点を 1 文で固定する
- same-wave で同期すべき canonical docs 群を棚卸しする
- workflow local で是正すべき path / inventory / parentWorkflow を特定する
- 未完了表現と pending memo を未完了扱いにする判定基準を明文化する
- follow-up 新設が不要な場合の no-op 根拠を定義する

## 要件レビュー一次結論

| 項目                       | 結論                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 真の論点                   | 主問題はコード未実装ではなく、current fact が canonical system spec と workflow inventory に閉じていないこと |
| 依存関係・責務境界の問題点 | workflow local 修正だけで閉じると ledger / lessons / index が stale のまま残り、same-wave が崩れる           |
| 価値とコストの不均衡       | 実装追加は不要で、docs 同期と path 正規化の方が再発防止価値が高い                                            |
| 改善優先順位               | 1. canonical target 固定 2. ledger / lessons 同期 3. workflow path 正規化 4. validator / grep 証跡化         |
| 4条件評価                  | 価値性: 高 / 実現性: 高 / 整合性: 高 / 運用性: 未完了表現 0 件を条件化すれば高                               |

## 参照資料

| 資料名      | パス                                                                                                     | 説明                         |
| ----------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 入力 task   | `../unassigned-task/task-imp-task-sdk-02-system-spec-and-path-sync-001.md`                               | 是正要求の原票               |
| 親 workflow | `../completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`                  | drift 発生源と対象 inventory |
| 親 Phase 12 | `../completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-12-documentation.md` | close-out で満たすべき責務   |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                                                    | 内容                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| completed ledger          | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                          | `TASK-SDK-02` current fact                            |
| runtime core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                              | workflow owner の current wording                     |
| lessons                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`       | same-wave / 未完了表現 / parity の教訓                |
| workflow integration spec | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md` | current canonical set と same-wave checklist の書き方 |

## 受入条件

- [ ] AC-1: current canonical set が system spec / ledger / lessons / index / workflow local の 5 群で明示されている
- [ ] AC-2: `SkillCreatorWorkflowEngine` current owner 化の反映先が特定されている
- [ ] AC-3: `task-workflow` / `lessons` / `topic-map` を同一 wave で閉じる前提が明示されている
- [ ] AC-4: `parentWorkflow`、旧相対 path、未完了表現を grep で検知する前提がある
- [ ] AC-5: 新規未タスクを作らない場合でも no-op 根拠を成果物へ残す方針がある
- [ ] AC-6: commit / PR / push を対象外として固定している

## 実行手順

### ステップ1: canonical target を固定する

- system spec、ledger、lessons、index、workflow local を 5 区分で表にする。
- `TASK-SDK-02` の current fact は `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` を基準値にする。

### ステップ2: drift 種別を分離する

- wording drift、ledger drift、path drift、artifact parity drift の 4 種に分ける。
- 各 drift に対して更新ファイルと検証コマンドを対応付ける。

### ステップ3: acceptance を検証可能にする

- `rg` で消すべき文字列を明記する。
- `verify-all-specs` と Phase 12 guide validator を必須証跡にする。

## 統合テスト連携

- docs-only remediation のため実装コード向け統合テストは追加せず、`outputs/phase-4/test-matrix.md` に定義した grep / validator / index 再生成を統合ゲートとして扱う。
- Phase 1 では `AC-1` から `AC-6` と検証コマンドの対応を確定し、後続Phaseで同じ判定軸を再利用する。

## 成果物

| 成果物              | パス                                     | 説明                       |
| ------------------- | ---------------------------------------- | -------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | remediation の要件固定     |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | drift 種別と更新先の対応表 |

## 完了条件

- [ ] current canonical set が 5 区分で定義されている
- [ ] drift 種別が wording / ledger / path / parity に分離されている
- [ ] AC-1 から AC-6 が検証可能な文面になっている
- [ ] Phase 2 へ渡す同期対象表が作れる状態である
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の定義
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 2 へ引き継ぐ前提と検証コマンドが固定されている
