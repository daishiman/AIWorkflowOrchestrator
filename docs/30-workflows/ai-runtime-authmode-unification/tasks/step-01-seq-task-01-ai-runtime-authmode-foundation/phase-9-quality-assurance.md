# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 9                                            |
| Phase名    | 品質検証                                     |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| 前提Phase  | Phase 5（実装）                              |
| 後続Phase  | Phase 10（最終レビュー）                     |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | ai-runtime-authmode-foundation               |

## 目的

全 AI surface の access matrix foundation の品質を横断観点で確認する。

## 実行タスク

- security 確認: secret masking、sender 検証、error envelope の整合を確認する
- UX 確認: Settings 表示契約と実行結果の文言整合を確認する

## 参照資料

| 参照資料          | パス                                                      | 内容                                   |
| ----------------- | --------------------------------------------------------- | -------------------------------------- |
| Phase 5（実装）   | `phase-5-implementation.md`                               | 依存する前提成果物を確認する           |
| AuthModeService   | `apps/desktop/src/main/services/auth/AuthModeService.ts`  | legacy authMode の移行レイヤを確認する |
| SkillExecutor     | `apps/desktop/src/main/services/skill/SkillExecutor.ts`   | API キー直読みに依存する経路を確認する |
| AgentExecutor     | `apps/desktop/src/main/services/agent/AgentExecutor.ts`   | agent 実行の runtime 入口を確認する    |
| LLMAdapterFactory | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | LLM adapter の認証解決点を確認する     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| interfaces-auth                                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | auth-mode 公開契約と error code 正本                               |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT、auth key、selected config の IPC 正本                     |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | sender 検証、secret masking、error envelope                        |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access card / launcher / guidance の表示契約                       |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | integrated runtime の selected config と auth key ルール           |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | access card / selected config / terminal availability state の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、全 AI surface の access matrix foundation の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

品質検証 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

runtime resolver、credential validation、IPC、cache invalidation の品質観点を横断確認する。

## 成果物

| 成果物             | パス                              | 内容                                           |
| ------------------ | --------------------------------- | ---------------------------------------------- |
| 品質チェックリスト | `outputs/phase-9/qa-checklist.md` | セキュリティ、UX、契約整合の確認項目をまとめる |

## 完了条件

- [ ] 品質 blocker 0 件

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
