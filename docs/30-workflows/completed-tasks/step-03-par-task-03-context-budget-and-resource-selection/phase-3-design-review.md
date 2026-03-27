# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 3                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

source discovery、resource selection、budget / degrade 設計が Task03 の責務に収まっているかを review gate で判定する。

## 実行タスク

- fixed path 前提が残っていないかレビューする
- source discovery と governance / session の責務境界をレビューする
- downstream handoff が十分かレビューする
- current canonical contract を Task03 が再利用できているかレビューする

## 参照資料

| 資料名             | パス                                    | 説明     |
| ------------------ | --------------------------------------- | -------- |
| Phase 1 要件       | `phase-1-requirements.md`               | 要件確認 |
| Phase 2 設計       | `phase-2-design.md`                     | 設計本文 |
| design review gate | `outputs/phase-3/design-review-gate.md` | 判定結果 |

## 実行手順

### ステップ1: fixed path 前提を点検する

- 単一固定 path を唯一の正本とする記述がないか確認する。
- manifest / explicit / env / home / repo の候補列が明記されているか確認する。

### ステップ2: task 境界を点検する

- disclosure / trust boundary は Task07 に委譲しているか確認する。
- source snapshot compatibility は Task08 に委譲しているか確認する。

### ステップ3: canonical contract reuse を点検する

- `LoadedWorkflowManifest` の current canonical fields を別名 contract へ再定義していないか確認する。
- `WorkflowManifestPhase.resourceIds` が planner の一次根拠になっているか確認する。
- `ResourceLoader` を source authority へ肥大化させず、resolver / planner / reader の責務が分かれているか確認する。

## 判定

PASS

## Gate Summary

| Gate                          | 結果 | 根拠                                                                                                         |
| ----------------------------- | ---- | ------------------------------------------------------------------------------------------------------------ |
| G-01 no fixed root assumption | PASS | `manifest -> explicit -> env -> home -> repo` の候補列で単一固定 path を正本にしない                         |
| G-02 responsibility split     | PASS | source discovery は Task03、lane choice / disclosure は Task07、compatibility semantics は Task08 に分離した |
| G-03 provenance handoff       | PASS | Task04 / 05 / 06 / 08 へ渡す snapshot を定義した                                                             |
| G-04 scope control            | PASS | UI 詳細、verify 契約、session invalidation の最終意味論を task 外へ残した                                    |
| G-05 canonical contract reuse | PASS | Task01 foundation fields と Task03 extension fields の境界を分離した                                         |

## Minor Notes

| 項目                                         | 行き先          |
| -------------------------------------------- | --------------- |
| source provenance の UI 文言                 | Task04 / Task05 |
| custom root の disclosure rule               | Task07          |
| source snapshot に基づく resume invalidation | Task08          |

## 統合テスト連携

- Phase 4 の test matrix が `source discovery` / `budget` / `degrade` / `provenance` をカバーする前提を確認する。
- Phase 9 の QA で fixed path 前提と silent fallback を再点検する。

## 成果物

| 成果物                               | パス                                                      | 説明                                 |
| ------------------------------------ | --------------------------------------------------------- | ------------------------------------ |
| design review 本文                   | `phase-3-design-review.md`                                | gate 判定の本文                      |
| design review gate                   | `outputs/phase-3/design-review-gate.md`                   | gate summary                         |
| skill compliance and elegance review | `outputs/phase-3/skill-compliance-and-elegance-review.md` | 2 skill 準拠監査と 30 思考法レビュー |

## 完了条件

- [ ] fixed path 前提が gate で否定されている
- [ ] governance / session への責務委譲が明記されている
- [ ] downstream handoff が十分である
- [ ] current canonical facts と Task03 extension の境界が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
