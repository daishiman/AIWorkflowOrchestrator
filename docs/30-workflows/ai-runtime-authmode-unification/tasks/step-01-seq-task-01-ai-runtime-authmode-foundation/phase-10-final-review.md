# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 10                                                    |
| Phase名    | 最終レビュー                                          |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001          |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装） |
| 後続Phase  | Phase 11（手動テスト）                                |
| ステータス | not_started                                           |
| 作成日     | 2026-03-13                                            |
| 機能名     | ai-runtime-authmode-foundation                        |

## 目的

全 AI surface の access matrix foundation の release 可否を最終レビューする。

## 実行タスク

- 最終レビュー実施: release blocker と戻り先を判断する

## レビュー観点

- 未適用 surface が残っていないか
- 資格情報不足時に silent fallback しないか
- system spec 反映先が確定しているか

## レビューゲート

最終レビュー の判定基準は .claude/skills/task-specification-creator/references/review-gate-criteria.md に従う。

| 判定     | 条件                         | 次のアクション             |
| -------- | ---------------------------- | -------------------------- |
| PASS     | 重大な問題がない             | Phase 11 に進む            |
| MINOR    | 軽微な指摘がある             | 指摘を記録して次へ進む     |
| MAJOR    | 戻り先が必要な問題がある     | 下表の戻り先へ戻す         |
| CRITICAL | 要件再確認が必要な問題がある | Phase 1 へ戻して再確認する |

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| 品質の問題       | Phase 8（リファクタリング） |

## 参照資料

| 参照資料            | パス                                                      | 内容                                   |
| ------------------- | --------------------------------------------------------- | -------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                 | 依存する前提成果物を確認する           |
| Phase 2（設計）     | `phase-2-design.md`                                       | 依存する前提成果物を確認する           |
| Phase 5（実装）     | `phase-5-implementation.md`                               | 依存する前提成果物を確認する           |
| AuthModeService     | `apps/desktop/src/main/services/auth/AuthModeService.ts`  | legacy authMode の移行レイヤを確認する |
| SkillExecutor       | `apps/desktop/src/main/services/skill/SkillExecutor.ts`   | API キー直読みに依存する経路を確認する |
| AgentExecutor       | `apps/desktop/src/main/services/agent/AgentExecutor.ts`   | agent 実行の runtime 入口を確認する    |
| LLMAdapterFactory   | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | LLM adapter の認証解決点を確認する     |

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

最終レビュー の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

runtime resolver、credential validation、IPC、cache invalidation の release 可否を最終レビューする。

## 成果物

| 成果物           | パス                                      | 内容                               |
| ---------------- | ----------------------------------------- | ---------------------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | release blocker と戻り先を整理する |

## 完了条件

- [ ] release blocker 0 件

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
