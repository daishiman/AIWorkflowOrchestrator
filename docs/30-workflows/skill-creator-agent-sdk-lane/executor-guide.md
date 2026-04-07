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

## 実装前に確認すべき既存コード

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
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

## P0 是正タスク 完了状態（2026-04-07 更新）

全 P0 是正タスクは実装完了・`completed-tasks/` に移動済み。

| タスクID   | ステータス   | 実装内容                                     | 仕様書パス                                                                           |
| ---------- | ------------ | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| TASK-P0-01 | ✅ completed | SkillCreatorVerificationEngine 実装完了      | `../completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12`          |
| TASK-P0-02 | ✅ completed | recordVerifyPass / requestReverify 実装完了  | `../completed-tasks/step-10-seq-task-p0-02-verify-improve-reverify-closed-loop`      |
| TASK-P0-03 | ✅ completed | workflow-manifest.json production 配置完了   | `../completed-tasks/step-09-par-task-p0-03-workflow-manifest-production-placement`   |
| TASK-P0-04 | ✅ completed | hasDynamicResourcePipeline 実装完了          | `../completed-tasks/step-10-seq-task-p0-04-manifest-loader-default-activation`       |
| TASK-P0-05 | ✅ completed | \_executeInternal + SkillFileWriter 統合完了 | `../completed-tasks/step-09-par-task-p0-05-execute-skill-file-writer-integration`    |
| TASK-P0-06 | ✅ completed | ConversationalInterview.tsx 実装完了         | `../completed-tasks/step-09-par-task-p0-06-conversational-interview-ui`              |
| TASK-P0-07 | ✅ completed | 動的エージェント名解決実装完了               | `../completed-tasks/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution` |
| TASK-P0-08 | ✅ completed | SessionResumePrompt + IPC handlers 実装完了  | `../completed-tasks/step-10-seq-task-p0-08-session-resume-renderer-integration`      |
| TASK-P0-09 | ✅ completed | governance/ ディレクトリ実装完了             | `../completed-tasks/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance`   |

## 公式照合の最低ライン

仕様の判断で迷ったら、少なくとも次を再確認する。

- Agent SDK overview
- Agent SDK TypeScript
- permissions
- sessions
- Client SDKs

URL は [root-workflow-pack/phase-1-requirements.md](./root-workflow-pack/phase-1-requirements.md) に集約している。
