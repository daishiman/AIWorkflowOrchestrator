# slide-ai-runtime-alignment - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001             |
| タスク名     | slide-ai-runtime-alignment                          |
| 分類         | 設計                                                |
| 対象機能     | Slide / Modifier / Legacy Agent 経路の runtime 整流 |
| 優先度       | 高                                                  |
| 見積もり規模 | 中規模                                              |
| ステータス   | spec_created                                        |
| 作成日       | 2026-03-13                                          |
| 更新日       | 2026-03-19                                          |

## タスク概要

### 目的

`slide/skill-executor.ts`、`slide/agent-client.ts`、`modifier-skill.ts`、`sync-manager.ts`、`SlideWorkspace.tsx` を `Integrated API Runtime` と manual fallback 契約へ寄せ、reverse-sync、watcher、streaming feedback、guidance を維持したまま整流する。

### 背景

現状の slide 系 AI 経路は direct Anthropic SDK、electron-store 直読みによる API key fallback、simulated 実行、reverse-sync 専用 IPC が混在している。slide 系を integrated runtime へ寄せつつ、manual 作業が必要な場合だけ terminal guidance へ落とす設計が必要である。

### 最終ゴール

slide workspace、modifier、legacy agent が integrated runtime policy を使い、direct SDK read や silent fallback を残さず、reverse-sync 状態と manual fallback guidance を UI へ一貫して返す設計を確定する。

### 成果物一覧

| 種別                 | 成果物                                                                                                                                                                                                                                                                                                                                                             | 配置先                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 仕様書               | index.md / phase-1〜13 / artifacts.json                                                                                                                                                                                                                                                                                                                            | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment`                                                                          |
| 設計成果物           | outputs/phase-_/_.md                                                                                                                                                                                                                                                                                                                                               | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-*/`                                                         |
| system spec 抽出元   | workflow-ai-runtime-authmode-unification.md / interfaces-auth.md / llm-ipc-types.md / task-workflow.md / lessons-learned.md / ui-ux-feature-components.md / llm-workspace-chat-edit.md / api-ipc-agent-core.md / security-electron-ipc-core.md / arch-state-management-reference.md / arch-electron-services-details-part2.md / legacy-ordinal-family-register.md  | `/.claude/skills/aiworkflow-requirements/references/`                                                                                                       |
| system spec 同期先   | workflow-ai-runtime-authmode-unification.md / api-ipc-system-core.md / interfaces-agent-sdk-skill-advanced.md / arch-electron-services-details-part2.md / ui-ux-feature-components-details.md / arch-state-management-advanced.md / security-electron-ipc-core.md / task-workflow-completed.md / task-workflow-backlog.md / lessons-learned-ipc-preload-runtime.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                                                       |
| follow-up / 命名互換 | task-ut-slide-impl-001.md / task-ut-slide-ui-001.md / task-ut-slide-p31-001.md / task-ut-slide-handoff-dup-001.md / legacy-ordinal-family-register.md                                                                                                                                                                                                              | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` / `/.claude/skills/aiworkflow-requirements/references/` |

## 参照ファイル

| 参照資料                             | パス                                                                                                                                                   | 内容                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| pack parent index                    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                                                           | 実行順序、依存グラフ、共通方針の正本を確認する                                    |
| pack design audit                    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                                                             | 多角的監査の結論、禁止事項、依存整合を確認する                                    |
| pack UI/UX 図解                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                                                                  | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                 |
| pack UI/UX 正本                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                                                               | 全 surface 共通の状態、CTA、microcopy 契約を確認する                              |
| Task01 foundation investigation      | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md`                                               | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承する |
| Task01 settings review investigation | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md`                                               | 設定画面レビュー結果（TC-11-00 相当）を設計へ反映する                             |
| workflow ai-runtime/authmode         | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`                                                        | current canonical set、artifact inventory、Task03 完了同期を確認する              |
| interfaces-auth                      | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                                                                 | capability / auth-mode DTO / status transport の正本                              |
| llm-ipc-types                        | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                                                                   | runtime health / auth-mode transport DTO の正本                                   |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                   | 完了台帳、関連タスク、未タスク候補の正本                                          |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                                 | 苦戦箇所と再発防止の正本                                                          |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                                        | guidance / error / CTA の user-facing surface 契約                                |
| slide skill-executor                 | `apps/desktop/src/main/slide/skill-executor.ts`                                                                                                        | slide skill execute の current path を確認する                                    |
| slide agent-client                   | `apps/desktop/src/main/slide/agent-client.ts`                                                                                                          | legacy agent client の current path を確認する                                    |
| modifier-skill                       | `apps/desktop/src/main/slide/modifier-skill.ts`                                                                                                        | reverse-sync modifier の current path を確認する                                  |
| slide IPC handlers                   | `apps/desktop/src/main/slide/ipc-handlers.ts`                                                                                                          | reverse-sync / watch IPC の current path を確認する                               |
| sync-manager                         | `apps/desktop/src/main/slide/sync-manager.ts`                                                                                                          | watcher と sync status の authority を確認する                                    |
| SlideWorkspace                       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`                                                                                                   | slide renderer surface と reverse-sync 導線を確認する                             |
| api-ipc-system                       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                                                                  | slide reverse-sync / watch IPC の正本                                             |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                      | slide sync / modifier 契約正本                                                    |
| interfaces-agent-sdk-executor        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                   | execute 契約と error code 正本                                                    |
| interfaces-agent-sdk-integration     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`                                                                | Claude CLI / Agent SDK 統合の正本                                                 |
| ui-ux-settings                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                                                                  | slide settings / directory / auth surface の正本                                  |
| security-api-electron                | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                           | slide IPC / preload security の正本                                               |
| arch-claude-cli                      | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                                                                                 | Claude CLI / terminal architecture の正本                                         |
| llm-workspace-chat-edit              | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                                                                         | RuntimeResolver / integrated-handoff / guidance DTO の再利用元                    |
| api-ipc-agent-core                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                                                                              | handoff / guidance / AUTHENTICATION_ERROR transport の正本                        |
| security-electron-ipc-core           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                                                                      | validateIpcSender 先頭実行、secret 非中継、auth-mode IPC 境界の正本               |
| arch-state-management-reference      | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md`                                                                 | handoffGuidance / stale state 防止 / dismiss 契約の正本                           |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                                                            | RuntimeResolver / handoff builder / DI 注入順の正本                               |
| legacy-ordinal-family-register       | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`                                                                  | 旧 filename 互換、artifact 名ドリフト確認                                         |
| runtime test separation follow-up    | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md` | runtime 契約テストと UI/hand-off テストの責務分離 follow-up を確認する            |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名    | 責務                                                               | 依存 |
| ---- | ---------- | --------------- | ------------------------------------------------------------------ | ---- |
| T-01 | Phase 1    | 要件整理        | slide workspace、modifier、legacy agent の current path を整理する | -    |
| T-02 | Phase 2    | 設計確定        | shared runtime policy と reverse-sync role を設計する              | T-01 |
| T-03 | Phase 3    | レビューゲート  | trust と UI 責務の破綻がないかを判定する                           | T-02 |
| T-04 | Phase 4-7  | テスト仕様化    | reverse-sync / watcher / guidance のテスト仕様を定義する           | T-03 |
| T-05 | Phase 8-13 | 文書化とhandoff | spec sync と rollout 説明を整理する                                | T-04 |

## 実行フロー

1. Phase 1-3 で前提、設計、レビューゲートを固める。
2. Phase 4-7 でテスト仕様と coverage 目標を固める。
3. Phase 8-13 で実装順序、文書同期、handoff を固める。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | completed  |

## 統合テスト連携（Phase 1〜11で必須）

- integrated runtime、manual fallback、IPC、state handoff の接続点を各 Phase で必ず扱う。
- 本タスクでは reverse-sync、watch-start/stop、sync status/progress/error、legacy agent client、terminal guidance を統合テスト観点の中心に置く。

## 主要論点

- Runtime / Auth: Direct SDK / electron-store / env fallback を排除し、`RuntimeResolver` + `IAuthKeyService` に統一する。詳細は [phase-1-requirements.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110233-wt-3/docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/phase-1-requirements.md) と [phase-2-design.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110233-wt-3/docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/phase-2-design.md) を正本とする。
- IPC / Security: 現行 4 チャネルの rename、`validateIpcSender`、P42 3段バリデーション、path guard を共通設計で閉じる。詳細は [phase-2-design.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110233-wt-3/docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/phase-2-design.md) と [phase-4-test-creation.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110233-wt-3/docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/phase-4-test-creation.md) を参照する。
- State / UI: `slideSlice` の authority、degraded / guidance / sync の 4 領域 UI、terminal handoff を user-facing surface として固定する。詳細は [phase-2-design.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110233-wt-3/docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/phase-2-design.md) と [phase-11-manual-test.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110233-wt-3/docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/phase-11-manual-test.md) を参照する。
- Ledger / Spec Sync: 台帳同期、未タスク検出、spec sync、artifact 名整合は Phase 12/13 に集約する。詳細は [phase-12-documentation.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110233-wt-3/docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/phase-12-documentation.md) と [phase-13-pr-creation.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260319-110233-wt-3/docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/phase-13-pr-creation.md) を参照する。

## Acceptance Criteria

| ID   | 内容                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------- |
| AC-1 | runtime と auth-mode の現状経路が slide reverse-sync / modifier / legacy agent / file-watcher まで整理されている |
| AC-2 | 維持すべき reverse-sync / watcher / guidance 契約が IPC チャネル単位で抜き出されている                           |
| AC-3 | Direct SDK import / electron-store 直読み / env fallback の排除設計が完了している                                |
| AC-4 | IPC チャネル名が正本仕様に統一されている（4 チャネルの rename 方針確定）                                         |
| AC-5 | 全 slide IPC ハンドラに validateIpcSender + P42 3段バリデーション + パストラバーサル検出が設計されている         |
| AC-6 | slide sync / degraded / manual fallback の UI 状態が 4 領域で定義されている                                      |

## Canonical Set 運用

- 完全な canonical set は本 `index.md` を正本入口とする
- 各 Phase では Progressive Disclosure を守り、その Phase で閉じる論点だけを再掲する
- runtime/auth-mode foundation と RuntimeResolver/handoff 再利用元は `index.md` から辿り、Phase 側で重複台帳化しない

## AC トレーサビリティ

| AC   | 主に閉じる Phase        | 主な確認ポイント                                                     |
| ---- | ----------------------- | -------------------------------------------------------------------- |
| AC-1 | Phase 1, 2, 10          | 現状経路棚卸し、runtime routing 設計、最終レビュー                   |
| AC-2 | Phase 1, 2, 4, 6, 10    | IPC 契約抽出、authority 設計、テスト設計、回帰 guard、最終レビュー   |
| AC-3 | Phase 1, 2, 5, 9, 10    | 排除対象特定、排除設計、実装計画、品質確認、最終レビュー             |
| AC-4 | Phase 1, 2, 4, 9, 10    | channel rename 差分、統一設計、テスト設計、品質確認、最終レビュー    |
| AC-5 | Phase 1, 2, 4, 5, 9, 10 | security 要件抽出、IPC guard 設計、実装計画、品質確認、最終レビュー  |
| AC-6 | Phase 2, 4, 6, 11, 12   | UI 4領域設計、テスト設計、回帰観点、docs-only walkthrough、spec sync |

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
