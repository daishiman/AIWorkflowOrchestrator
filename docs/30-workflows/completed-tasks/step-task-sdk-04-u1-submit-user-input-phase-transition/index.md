# TASK-SDK-04-U1: submitUserInput の phase transition semantics を実装へ反映する

## 概要

`SkillCreatorWorkflowEngine.submitUserInput()` の phase transition semantics を engine owner に集約し、`plan_review` / `verification_review` の回答が canonical snapshot に反映されるようにする実装タスク仕様書である。

主問題は「質問を閉じる transport はあるが、回答の意味論が workflow state に閉じていないこと」であり、renderer が補完解釈を持たずに済む current contract を固定する。

## メタ情報

| 項目         | 値                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------- |
| タスクID     | `TASK-SDK-04-U1`                                                                                |
| タスク名     | submitUserInput の phase transition semantics を実装へ反映する                                  |
| タスク種別   | 実装改善                                                                                        |
| ステータス   | `spec_created`                                                                                  |
| 優先度       | 高                                                                                              |
| 見積もり規模 | 中規模                                                                                          |
| 親 workflow  | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/`   |
| 入力 task    | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-user-input-transition-semantics-001.md` |
| 関連 Issue   | #1672                                                                                           |
| Issue確認日  | 2026-03-28                                                                                      |
| 作成日       | 2026-03-27                                                                                      |
| 更新日       | 2026-03-28                                                                                      |
| 作業 branch  | `task/sdk-04-u1-submit-user-input-phase-transition`                                             |

## 目的

1. `plan_review` と `verification_review` の回答意味論を engine に固定する
2. facade / IPC / preload / renderer が snapshot consumer に留まる責務境界を維持する
3. テストで AC-1〜AC-7 を固定し、Task05 以降が no-op 前提で実装されない状態にする
4. Phase 12 close-out 時に same-wave sync で更新すべき ledger / spec / logs を明確化する

## この workflow で固定すること

- `submitUserInput()` の reason 主導 phase transition
- `currentPhase` と `verifyResult.nextAction` の canonical owner
- `phase_transition` artifact の最小記録単位
- facade / IPC / preload の no-extra-logic 原則
- `spec_created` のままでも Phase 4〜13 の実行計画が欠落しない文書構成

## 非対象

- Task05 以降の詳細 review UI 拡張
- persistence / resume token の仕様拡張
- 新規 IPC チャンネル追加
- commit、PR作成、push

## 依存関係

| 種別        | 参照先                                                                                                | 役割                                     |
| ----------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| predecessor | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md` | `submitUserInput` public bridge の設計親 |
| predecessor | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-04-phase12-canonical-path-resync-001/index.md`     | current canonical path と follow-up 整理 |
| canonical   | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                            | `skill-creator:submit-user-input` 契約   |
| canonical   | `.agents/skills/aiworkflow-requirements/references/arch-electron-services.md`                         | engine / facade の責務境界               |
| canonical   | `.agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                          | open follow-up の current fact           |
| canonical   | `.agents/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`     | Phase 12 same-wave close-out ルール      |
| sibling     | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-plan-execute-canonical-binding-001.md`        | `TASK-SDK-04-U2` の責務分離              |

## Current Canonical Facts

- `SkillCreatorWorkflowEngine` が `currentPhase` / `awaitingUserInput` / `verifyResult` の owner である
- `RuntimeSkillCreatorFacade.submitUserInput()` は engine へ委譲して snapshot を返す
- `skill-creator:submit-user-input` handler は state-changed event を push できる
- 現状の gap は「回答後に質問は消えるが、phase semantics が十分反映されない」点である
- 本 workflow は実装 task だが、現時点では docs 先行のためステータスは `spec_created` を維持する

## 要件レビュー一次結論

| 観点                 | 結論                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- |
| 真の論点             | UI ではなく engine owner に意味論が閉じていないこと                                          |
| 依存関係・責務境界   | engine が判断、facade / IPC / preload は転送、renderer は表示に限定する                      |
| 価値とコストの不均衡 | 新規 IPC や UI redesign を混ぜると肥大化するため、本 wave は transition semantics に限定する |
| 改善優先順位         | 1) transition table 2) engine 実装 3) artifact 記録 4) engine / IPC test 5) Phase 12 sync    |
| 4条件評価            | 価値性・実現性・整合性・運用性を満たす最小差分は「engine へ意味論を戻す」構成                |

## 30種思考法レビュー要約

| カテゴリ     | 適用した思考法                                                       | 本 task での結論                                                                                  |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | 症状は `awaitingUserInput` クリアではなく state semantics 欠落で説明できる                        |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | engine / transport / consumer を分離し、reason と option の2軸で遷移表を固定する                  |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | 「質問応答機能」ではなく「workflow owner の意味論管理」と定義し直す                               |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | renderer 側再計算や新規 channel 追加案は捨て、郵便物の仕分けに似た owner 集約へ絞る               |
| システム系   | システム思考、因果関係分析、因果ループ                               | semantics 欠落は downstream Task05/06/07/08 に誤前提を増幅するため早期封じが必要                  |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | engine 集約は UI 側複雑性を減らしつつ test 固定を強めるため価値対コストが最良                     |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 根本原因は owner 不在ではなく owner 未実装。よって全面破棄ではなく骨格活用 + close-out 補完が妥当 |

## 破棄判断

全面再構成は不要と判断する。理由は、現行 `outputs/phase-1`〜`phase-10` が論点、遷移表、AC をすでに保持しており、欠陥の中心が「root phase 文書・Phase 11/12 補助成果物・same-wave sync 記述の不足」に集中しているためである。最小複雑性で最大準拠を得るには、既存骨格を残しつつ task-specification-creator 準拠の実行面を補完する方がエレガントである。

## current canonical set

| 区分             | 対象                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow local   | `index.md`, `phase-*.md`, `artifacts.json`, `outputs/artifacts.json`, `outputs/verification-report.md`, `outputs/phase-1/*`〜`outputs/phase-13/*`           |
| parent workflow  | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/`                                                               |
| ledger / lessons | `.agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md`, `task-workflow-completed.md`, `lessons-learned-phase12-workflow-lifecycle.md` |
| input source     | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-user-input-transition-semantics-001.md`                                                             |

## 完了イメージ

- `plan_review` / `verification_review` の回答が engine snapshot に反映される
- facade / IPC / preload が追加判断を持たない
- engine / IPC test が AC-1〜AC-7 を固定する
- Phase 11 は `NON_VISUAL` 判定根拠つきで閉じる
- Phase 12 は implementation guide、spec sync、unassigned detection、feedback、compliance check の 6 成果物で閉じる

## ディレクトリ構成

```text
step-task-sdk-04-u1-submit-user-input-phase-transition/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/
    ├── phase-2/
    ├── phase-3/
    ├── phase-4/
    ├── phase-5/
    ├── phase-6/
    ├── phase-7/
    ├── phase-8/
    ├── phase-9/
    ├── phase-10/
    ├── phase-11/
    ├── phase-12/
    └── phase-13/
```

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
