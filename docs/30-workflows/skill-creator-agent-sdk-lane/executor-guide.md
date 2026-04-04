# Skill Creator Agent SDK Lane 実行ガイド

## 目的

この文書は、task spec を受け取った実装者が

- どの順番で読むか
- 自分が着手すべき task はどれか
- どのコード面を主に触る想定か
- どこから先は別 task の責務か

を短時間で判断できるようにするための実行ガイドである。

前提:

- 背景と制約は `requirements-draft.md`
- 依存順と gate は `root-workflow-pack/`
- このガイドは、その前提の上で「どの task を持つべきか」を決める補助文書である
- 全 task 共通で、`skill-creator` の固定ディレクトリ前提を持ち込まない

## 最初の読順

1. [requirements-draft.md](./requirements-draft.md)
2. [root-workflow-pack/index.md](./root-workflow-pack/index.md)
3. この `executor-guide.md`
4. 担当 task の `index.md`
5. 担当 task の `phase-1` / `phase-2` / `phase-5`
6. 必要に応じて担当 task の `phase-9` / `phase-10`

## task の選び方

| task        | 向いている作業                                               | 先行依存                    | 主な変更面                                                              |
| ----------- | ------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------------------- |
| TASK-SDK-01 | manifest 契約、schema、loader 境界                           | root Phase 1-3              | Main runtime, shared types, 新規 manifest 定義                          |
| TASK-SDK-02 | engine / facade / state owner                                | TASK-SDK-01                 | `RuntimeSkillCreatorFacade`, IPC, shared contract                       |
| TASK-SDK-03 | selective loading, dynamic source resolution, context budget | TASK-SDK-01, 02             | runtime loader, resource selection, prompt loading                      |
| TASK-SDK-04 | question-driven UI, interaction bridge                       | TASK-SDK-01, 02             | preload, IPC, renderer UI, interaction state                            |
| TASK-SDK-05 | create 主導線の一本化                                        | TASK-SDK-03, 04             | `SkillLifecyclePanel`, `SkillCreateWizard`, navigation                  |
| TASK-SDK-06 | verify / improve surface                                     | TASK-SDK-03, 04             | improve UI, runtime improve/verify, shared result type                  |
| TASK-SDK-07 | governance / handoff / approval の hardening                 | TASK-SDK-02, 03, 04, 05, 06 | `RuntimePolicyResolver`, `TerminalHandoffBuilder`, approval, disclosure |
| TASK-SDK-08 | session / resume / checkpoint の互換性契約                   | TASK-SDK-02, 07             | session service, storage, `PersistedSession`, shared session contract   |

## 並列実行の基本

- `TASK-SDK-01` と `TASK-SDK-02` は直列前提
- `TASK-SDK-03` と `TASK-SDK-04` は並列可能
- `TASK-SDK-05` と `TASK-SDK-06` は、Task02 の state owner 表と Task04 の interaction contract を同期済みにしてから並列可能
- `TASK-SDK-07` と `TASK-SDK-08` は後段で直列寄りに扱う

並列実行時の注意:

- 同じ shared type を同時に広く触らない
- 同じ renderer component を跨いで大改修しない
- `RuntimeSkillCreatorFacade` を触る task は state owner 表を先に合わせる
- `re-verify` / `再入場導線` / `主導線統合` は shared lifecycle state contract を先に合わせる

## 完了の見方

実装者は少なくとも次を満たしたら「task spec を理解した」とみなせる。

- 担当 task の `目的` を 1 文で言える
- `想定変更ポイント` を 3 つ以内で言える
- `非対象` を言える
- どの task と競合しやすいか言える
- `Phase 9` の品質観点を読んで完了判定ができる

## よくある誤解

- `root-workflow-pack` は実装 task ではない
- `Phase 13` は自動 PR 実行ではなく、ユーザー承認後の最終段階
- `verify` は初回から重い別エンジンを作る task ではない
- `handoff` は primary lane ではなく secondary lane
- `session` は保存すること自体が目的ではなく、互換性境界を明示することが目的
- `Task07` は lane contract の初定義ではなく、foundation で固定した baseline を適用・hardening する task
- `Task08` は chat history の再設計ではなく、workflow session を既存 persistence にどう載せるかの契約整理が主目的
- 全 task で `DEFAULT_SKILL_CREATOR_PATH` 相当の単一 root を唯一の正本とみなさない
- manifest / explicit path / env / home / repo bundle の複数候補と、解決後の source provenance を意識する

## ⚠️ 着手前の必須確認（2026-04-01 追記）

### step0 は全タスクの前提

`TASK-FIX-ENV-STRIPPING`（`fix-step0-seq-env-stripping/`）が未完了の場合、Agent SDK の `query()` が全て ENOENT で失敗する。コード修正は並行可能だが、**統合検証（手動テスト・E2E）は step0 完了後に実施すること**。

### step2 実行中の関係者への重要事実

`TASK-FIX-AUTH-IPC-001`（fix-step2）は別タスクで実行中。以下の事実を参照すること：

| 事実                      | 正しい値                                                                | 誤りやすい値                                               |
| ------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `auth:login` タイムアウト | **500ms**（`CHANNEL_TIMEOUTS["auth:login"] = 500`、PR#1823 で設定済み） | ~~5000ms~~（デフォルト値、auth:login には適用されない）    |
| `ipc-utils.ts` のパス     | **`apps/desktop/src/preload/ipc-utils.ts`**                             | ~~`apps/desktop/src/main/ipc/ipc-utils.ts`~~（存在しない） |

## 実装前に確認すべき既存コード

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（**step0 修正対象**: env オプション:861）
- `apps/desktop/src/main/ipc/authHandlers.ts`（step2 修正対象: auth:login ハンドラー）
- `apps/desktop/src/preload/ipc-utils.ts`（CHANNEL_TIMEOUTS 定義: auth:login=500ms, execute-plan 未登録）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（step5 修正対象: setWorkflowError 無条件クリア:539）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`
- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`
- `apps/desktop/src/main/services/runtime/ManifestLoader.ts`
- `apps/desktop/src/main/services/skill/constants.ts`
- `apps/desktop/src/main/services/skill/ResourceLoader.ts`
- `apps/desktop/src/main/services/session/SessionPersistenceService.ts`
- `packages/shared/src/types/agent.ts`
- `packages/shared/src/types/skillCreator.ts`

## 公式照合の最低ライン

仕様の判断で迷ったら、少なくとも次を再確認する。

- Agent SDK overview
- Agent SDK TypeScript
- permissions
- sessions
- Client SDKs

URL は [root-workflow-pack/phase-1-requirements.md](./root-workflow-pack/phase-1-requirements.md) に集約している。
