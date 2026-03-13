# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 3                                            |
| Phase名    | 設計レビュー                                 |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）         |
| 後続Phase  | Phase 4（テスト作成）                        |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | ai-runtime-authmode-foundation               |

## 目的

後続タスクが同じ基盤設計を参照できる状態になっているかをゲートで確認する。

## 実行タスク

- レビュー実施: レビュー観点に沿って PASS、MINOR、MAJOR の判定根拠を整理する

## レビュー観点

- 全 AI surface が inventory に含まれているか
- resolver を通らない direct key read が残っていないか
- integrated runtime と terminal surface が同じ error envelope / guidance contract を共有しつつ、同じ実行 lane に誤統合されていないか
- Task02 以降へ渡す契約と rollout 順序が明記されているか
- `legacy authMode migration` と `providerId/modelId` 解決順が競合していないか
- terminal surface が `user-operated` のままで、`auto send / hidden prompt injection / hidden retry` が禁止されているか
- sender 検証、PermissionResolver、guidance 表示、launcher 表示の責務境界が崩れていないか
- Phase 12 の system spec sync 先と未タスク化条件が明記されているか

## レビューゲート

設計レビュー の判定基準は .claude/skills/task-specification-creator/references/review-gate-criteria.md に従う。

| 判定  | 条件                     | 次のアクション         |
| ----- | ------------------------ | ---------------------- |
| PASS  | 重大な問題がない         | Phase 4 に進む         |
| MINOR | 軽微な指摘がある         | 指摘を記録して次へ進む |
| MAJOR | 戻り先が必要な問題がある | 下表の戻り先へ戻す     |

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

## 参照資料

| 参照資料                    | パス                                                             | 内容                                                                 |
| --------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                        | 依存する前提成果物を確認する                                         |
| Phase 2（設計）             | `phase-2-design.md`                                              | 依存する前提成果物を確認する                                         |
| AuthModeService             | `apps/desktop/src/main/services/auth/AuthModeService.ts`         | legacy authMode の移行レイヤを確認する                               |
| authModeSlice               | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`        | renderer の legacy state と changed event 受信点を確認する           |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | renderer preflight が access capability を誤判定していないか確認する |
| chatEditHandlers            | `apps/desktop/src/main/handlers/chatEditHandlers.ts`             | Workspace Chat Edit の runtime 入口と stub 経路を確認する            |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | Skill Docs の queryFn DI と provider 接続点を確認する                |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | API キー直読みに依存する経路を確認する                               |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`          | agent 実行の runtime 入口を確認する                                  |
| LLMAdapterFactory           | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`        | LLM adapter の認証解決点を確認する                                   |
| ChatPanel                   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`        | placeholder 導線と real AI chat 結線点を確認する                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| interfaces-auth                                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | auth-mode 公開契約と error code 正本                               |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT、auth key、selected config の IPC 正本                     |
| api-ipc-agent                                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                   | Workspace Chat Edit / Skill Docs 周辺の IPC 正本                   |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | Workspace Chat / LLM surface 契約の正本                            |
| llm-ipc-types                                   | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                   | provider/model 解決順の正本                                        |
| llm-workspace-chat-edit                         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                         | Workspace Chat Edit 詳細契約                                       |
| interfaces-agent-sdk-executor                   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                   | SkillExecutor / PermissionResolver / auth key DI の正本            |
| interfaces-agent-sdk-skill                      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                      | SkillService / ChatPanel / SkillDocGenerator 契約の正本            |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | sender 検証、secret masking、error envelope                        |
| security-skill-execution                        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                        | 実行権限と危険ツール境界の正本                                     |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access card / launcher / guidance の表示契約                       |
| ui-ux-navigation                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                | settings bypass と lifecycle 導線の正本                            |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Chat / Workspace / Skill surface 構成の正本                        |
| architecture-overview                           | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                           | 全体責務境界の正本                                                 |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | integrated runtime の selected config と auth key ルール           |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | access card / selected config / terminal availability state の正本 |
| task-workflow                                   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                   | 完了タスク / 未タスク / 証跡の正本                                 |
| lessons-learned                                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                 | DI ドリフト / spec sync 教訓の正本                                 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、全 AI surface の access matrix foundation の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計レビュー の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

runtime resolver、capability evaluation、terminal boundary、IPC、cache invalidation の設計が Phase 1 と Phase 2 に整合するかをレビューする。

## 成果物

| 成果物           | パス                                      | 内容                                    |
| ---------------- | ----------------------------------------- | --------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | PASS、MINOR、MAJOR の判定根拠を記録する |

## 完了条件

- [ ] MAJOR 指摘 0 件
- [ ] selected config、permission、error envelope の責務境界が矛盾なく説明されている
- [ ] Task02 以降に handoff できる設計粒度になっている

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
