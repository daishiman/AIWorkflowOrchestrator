# Phase 2: 設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify の contract matrix、実装レーン、sibling boundary、validation path を設計する。

## 実行タスク

- Layer 3 / Layer 4 contract matrix を設計する
- shared types / IPC / preload / facade / renderer の更新順を設計する
- Task07 / Task08 への delegated item を decision record 化する
- validation と manual walkthrough の証跡順を設計する

## 設計一次結論

| 項目                       | 結論                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| 真の論点                   | deeper verify をどの field set で貫通させるかが主題であり、UI の見た目設計は二次的である              |
| 依存関係・責務境界の問題点 | DTO 設計より先に renderer を広げると governance / session との境界が崩れやすい                        |
| 価値とコストの不均衡       | shared type を先に固定すると IPC / preload / renderer の drift を小さく抑えられる                     |
| 改善優先順位               | 1. shared DTO 2. bridge contract 3. renderer section 4. re-verify action 5. docs / manual evidence    |
| 4条件評価                  | owner 維持と delegated item 明記を前提にすれば、implementation 前の contract-first 設計として成立する |

## 参照資料

| 資料名              | パス                                                                                                              | 説明                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件        | `phase-1-requirements.md`                                                                                         | acceptance と boundary   |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md`                                                                          | source と current anchor |
| Task06 matrix       | `../../step-04-par-task-06-verify-and-improve-lifecycle-surface/outputs/phase-2/verify-improve-surface-matrix.md` | Layer 1 / 2 baseline     |
| Task06 validation   | `../../step-04-par-task-06-verify-and-improve-lifecycle-surface/outputs/phase-2/validation-matrix.md`             | baseline test pattern    |

### システム仕様（aiworkflow-requirements）

| 参照資料                    | パス                                                                                                              | 内容                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| created skill usage journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`       | post action / CTA 導線の接続前提     |
| agent execution core        | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`                                 | Manual Boundary と handoff surface   |
| reference bundle            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | shared type / preload 同期時の基本形 |

## 実行手順

### ステップ1: 5 層 contract matrix を定義する

- shared types: Layer 3 / 4 evidence DTO、re-verify metadata、delegated note を定義する。
- IPC / preload: DTO shape を崩さず renderer へ渡す invoke surface を定義する。
- facade / engine: owner を engine、bridge を facade に保つ。
- renderer: section host、action host、side guidance slot を分ける。

### ステップ2: delegated item を decision record 化する

- Task07 owner: approval / disclosure / manual boundary / route authority。
- Task08 owner: persistence / checkpoint / resume invalidation / stale session。
- 本 task owner: deeper verify section / field set / action wiring / docs evidence。

### ステップ3: validation と close-out 順を定義する

- unit -> integration -> docs QA -> manual walkthrough -> Phase 12 close-out の順にする。
- `verify-all-specs`、`validate-phase-output`、`verify-unassigned-links` の実行条件を Phase 2 で先に固定する。

## 統合テスト連携

- Phase 4 へ shared type / IPC / preload / facade / renderer ごとの suite を渡す。
- Phase 7 で concern coverage と delegated boundary coverage を監査する。
- Phase 11 で non-visual evidence と screenshot plan の扱いを決める。

## 成果物

| 成果物                    | パス                                           | 説明                              |
| ------------------------- | ---------------------------------------------- | --------------------------------- |
| 設計書                    | `phase-2-design.md`                            | contract-first 設計の正本         |
| layer34 contract matrix   | `outputs/phase-2/layer34-contract-matrix.md`   | 5 層 field set と concern 対応表  |
| sibling boundary decision | `outputs/phase-2/sibling-boundary-decision.md` | delegated / owned / non-goal 決定 |

## 完了条件

- [ ] 5 層 contract matrix が定義されている
- [ ] Task07 / Task08 への delegated item が明記されている
- [ ] validation path と close-out path が定義されている
- [ ] renderer host と owner の分離が説明できる
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. 5 層 contract matrix の設計
3. sibling boundary decision の記録
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 4 へ渡す test scope が固定されている
