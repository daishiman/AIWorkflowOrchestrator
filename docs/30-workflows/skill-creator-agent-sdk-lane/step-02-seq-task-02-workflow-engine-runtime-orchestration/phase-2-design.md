# Phase 2: 設計

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

engine の phase 遷移、成果物受け渡し、resume envelope、facade の統一入口を設計し、実装段階で責務が再混在しない形へ落とす。

## 実行タスク

- `SkillCreatorWorkflowEngine` の state machine を設計する
- facade / engine / renderer の ownership matrix を設計する
- `execute()` を engine 経由へ置換する中間段階を設計する
- source provenance snapshot と manifest/resource input の受け渡しを設計する
- Task03 / Task04 / Task07 / Task08 へ渡す interface boundary を設計する

## 設計一次結論

| 項目                       | 結論                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点                   | engine を増やすこと自体ではなく、workflow state と route/public surface を別 owner に分けること                                                    |
| 依存関係・責務境界の問題点 | `ManifestLoader` が engine に吸収されると Task01 の authority non-delegation が破れるため、loader は入力供給、engine は phase/state 所有に限定する |
| 価値とコストの不均衡       | `execute()` の route snapshot 固定は初回価値が高いが、resource selection 最適化や verify surface 完成までを同時に抱えると設計が膨張する            |
| 改善優先順位               | 1. ownership matrix 2. state machine 3. migration path 4. downstream boundary                                                                      |
| 4条件評価                  | 価値性・実現性・整合性・運用性の 4 条件を、Task01 foundation 再利用 + public API 温存 + deferred item 切り出しで満たす                             |

## 参照資料

| 資料名         | パス                                     | 説明                           |
| -------------- | ---------------------------------------- | ------------------------------ |
| Phase 1 要件   | `phase-1-requirements.md`                | owner inventory と scope       |
| Phase 1 抽出表 | `outputs/phase-1/spec-extraction-map.md` | spec source / code anchor 対応 |
| 親 workflow    | `../root-workflow-pack/index.md`         | downstream dependency matrix   |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                                  | 内容                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Runtime public IPC 契約    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                            | handler / preload / shared types の正本         |
| RuntimePolicyResolver 契約 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`           | route 分岐と `RuntimeDecision`                  |
| execute handoff 完了記録   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md` | `RuntimeSkillCreatorExecuteResponse` の正本メモ |

### 現行コードアンカー

| ファイル                                                              | 設計観点                                     |
| --------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | facade に残す責務を特定する                  |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | public entrypoint の維持範囲を決める         |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | renderer surface の安定条件を決める          |
| `packages/shared/src/types/skillCreator.ts`                           | public contract と internal state を分離する |

## 実行手順

### ステップ1: ownership matrix を設計する

- `currentPhase` / `awaitingUserInput` / `verifyResult` / phase artifacts / `resumeTokenEnvelope` は engine owner とする。
- `authMode` 解決、`RuntimeDecision` 評価、`terminal_handoff` guidance / bundle 生成、public union payload 形成は facade owner とする。
- renderer は workflow state の source of truth を持たず、review decision と user input だけを返す。

### ステップ2: engine state machine を設計する

- phase を `plan` / `review` / `execute` / `verify` / `improve` / `handoff` に整理する。
- transition guard と artifact handoff を表形式で定義する。
- `resumeToken` は engine が envelope を作るが、互換性判定ロジックは Task08 へ送る。
- `ManifestLoader` は `workflow-manifest.json` を read / validate / normalize / cache する基盤に留め、phase 遷移判断や route decision を持たせない。
- engine は `resolvedSkillCreatorRoot`、`resourceDescriptorHash`、`sourceProvenance` を input snapshot として持てるが、探索アルゴリズム自体は Task03 に委譲する。

### ステップ3: migration path を設計する

- public API 名は `planSkill()` / `executePlan()` / `improveSkillWithFeedback()` を維持する。
- `execute()` は facade 直下の executor 呼び出しから、engine を経由して route snapshot と artifact ownership を確定する形へ移す。
- verify surface は Task06 で追加し、Task02 では `verifyResult` owner だけを固定する。

## 統合テスト連携

- Phase 4 で ownership matrix に対応する test matrix を出力する。
- `creatorHandlers.ts` / `skill-creator-api.ts` / `skillCreator.ts` の contract test は shared union 型を基準に書く。
- `RuntimeSkillCreatorFacade.execute()` の handoff / integrated 分岐は regression case として固定する。

## 成果物

| 成果物           | パス                                  | 説明                                           |
| ---------------- | ------------------------------------- | ---------------------------------------------- |
| 設計書           | `phase-2-design.md`                   | engine / facade / renderer の設計              |
| ownership matrix | `outputs/phase-2/ownership-matrix.md` | owner / mutation authority / visibility の一覧 |

## 完了条件

- [ ] engine と facade の責務が重複していない
- [ ] `execute()` 置換の中間段階が定義されている
- [ ] `resumeToken` envelope と invalidation semantics の境界が分離されている
- [ ] source provenance snapshot と discovery logic の境界が分離されている
- [ ] Task03 / Task04 / Task07 / Task08 へ渡す interface boundary が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
