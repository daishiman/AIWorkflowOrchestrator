# Spec Extraction Map

## 概要

Task02 で固定する契約を、system spec source、current code anchor、fixed owner、delegated gap の 4 軸で整理する。

## 一次結論

| 観点               | 結論                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| 真の論点           | facade が state owner を兼務している曖昧さを取り除くこと                                              |
| 依存関係・責務境界 | Task01 の `WorkflowManifest*` / `ManifestLoader` は foundation input、Task02 の engine は state owner |
| 価値とコスト       | owner 固定は高価値、verify / UI / resume semantics 完成まで同時に閉じるのは高コスト                   |
| 改善優先順位       | owner inventory → route baseline → downstream handoff → deferred item 固定                            |
| 4条件評価          | 価値性・実現性・整合性・運用性はいずれも、scope を Task02 の owner 固定へ絞ることで PASS 見込み       |

## 抽出表

| 論点                                 | system spec source                                  | current code anchor                                                       | fixed owner | delegated gap                                |
| ------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------- | ----------- | -------------------------------------------- |
| public runtime surface               | `api-ipc-system-core.md`                            | `creatorHandlers.ts`, `skill-creator-api.ts`, `skillCreator.ts`           | facade      | verify public surface は Task06              |
| route decision baseline              | `arch-electron-services-details-part2.md`           | `RuntimePolicyResolver.ts`, `RuntimeSkillCreatorFacade.ts`                | facade      | governance hardening は Task07               |
| workflow state envelope              | `requirements-draft.md`                             | 該当コードなし                                                            | engine      | engine 実装は Phase 5                        |
| `currentPhase`                       | `requirements-draft.md`                             | 該当コードなし                                                            | engine      | phase UI 接続は Task04                       |
| `awaitingUserInput`                  | `requirements-draft.md`                             | 該当コードなし                                                            | engine      | interaction bridge は Task04                 |
| `verifyResult`                       | `requirements-draft.md`                             | 該当コードなし                                                            | engine      | verify runner と surface は Task06           |
| phase artifacts                      | `requirements-draft.md`                             | executor 戻り値のみ存在                                                   | engine      | artifact schema の詳細は Task05 実装で閉じる |
| `resumeTokenEnvelope`                | `requirements-draft.md`                             | 該当コードなし                                                            | engine      | compatibility / invalidation は Task08       |
| `terminal_handoff` guidance / bundle | `arch-electron-services-details-part2.md`           | `RuntimeSkillCreatorFacade.plan()`, `RuntimeSkillCreatorFacade.improve()` | facade      | disclosure hardening は Task07               |
| execute response union               | `task-workflow-completed-skill-lifecycle-design.md` | `RuntimeSkillCreatorFacade.execute()` が `void decision;` を残す          | facade      | implementation drift は Phase 5 で閉じる     |

## Task02 で閉じる判断

- facade は route decision と public response を持つ。
- engine は workflow state と artifact ownership を持つ。
- renderer は user decision と draft input を返すだけで、workflow state の正本にならない。

## 補助分析

### 因果ループ

- 強化ループ: facade が state を持つほど public surface と internal state の drift が増え、downstream handoff が不安定になる。
- バランスループ: engine owner を固定すると facade の変更点が route/public response に縮み、Task03 / Task04 / Task08 の設計自由度が上がる。

### 戦略仮説

- Task01 の manifest foundation を再利用し、Task02 は owner 分離のみに集中した方が最小複雑性で最大の downstream 安定性を得られる。
